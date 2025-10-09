"""
Unified Pipeline API

Single FastAPI service that loads .env.local once and runs the multi-agent
pipeline in-process: Retriever -> Writer -> Reviewer -> Exporter.

Endpoints:
- GET /health
- POST /generate { query: str, options?: { export_formats?: ["json","markdown","html","pdf"] } }

Environment:
- GEMINI_API_KEY or GOOGLE_API_KEY in .env.local (preferred) or .env
- RETRIEVER_HOST/PORT optional if you call retriever over HTTP (not needed here)
"""

from __future__ import annotations

import os
import json
from typing import Any, Dict, List, Optional
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load env once (prefer .env.local) - skip if there are encoding issues
try:
    from pathlib import Path
    
    # Load .env from this file's directory (data-pipeline/)
    env_path = Path(__file__).parent / '.env'
    env_local_path = Path(__file__).parent / '.env.local'
    
    if env_local_path.exists():
        load_dotenv(dotenv_path=env_local_path)
    elif env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()  # Try current directory as fallback
except Exception as e:
    pass  # Silently continue if .env loading fails

# Local imports
from retriever_agent import RetrieverAgent
from writer_agent import WriterAgent
from reviewer_agent import ReviewerAgent
from exporter_agent import ExporterAgent


class GenerateOptions(BaseModel):
    export_formats: Optional[List[str]] = ["json", "markdown", "html"]


class GenerateRequest(BaseModel):
    query: str
    options: Optional[GenerateOptions] = None


class GenerateResponse(BaseModel):
    draft: Dict[str, Any]
    review: Dict[str, Any]
    files: Dict[str, str]
    timestamp: str


app = FastAPI(title="FoundryStack Unified Pipeline API", version="1.0.0")

# Allow local frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents once per process
writer_agent: Optional[WriterAgent] = None
reviewer_agent: Optional[ReviewerAgent] = None
exporter_agent: Optional[ExporterAgent] = None
retriever_agent: Optional[RetrieverAgent] = None
retriever_ok: bool = False


def init_agents() -> None:
    global writer_agent, reviewer_agent, exporter_agent, retriever_agent, retriever_ok
    if writer_agent and reviewer_agent and exporter_agent and retriever_agent:
        return

    # Validate key early
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY is required in .env.local/.env")

    # Initialize retriever; if it fails, keep service up and proceed with empty context
    try:
        retriever_agent = RetrieverAgent()
        retriever_ok = True
        print("[OK] Retriever Agent initialized successfully")
    except Exception as e:
        retriever_agent = None
        retriever_ok = False
        print(f"[ERROR] Retriever Agent failed to initialize: {e}")
        print("[WARNING] Pipeline will run WITHOUT contextual data!")
        print("[WARNING] All generated blueprints will be generic and similar.")
        print("[WARNING] See DIAGNOSTIC_REPORT.md and data-pipeline/QUICK_FIX.md for solutions.")
    writer_agent = WriterAgent()
    reviewer_agent = ReviewerAgent()
    exporter_agent = ExporterAgent()


@app.on_event("startup")
def on_startup() -> None:
    init_agents()


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "gemini": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")),
        "agents": {
            "retriever": retriever_ok,
            "writer": writer_agent is not None,
            "reviewer": reviewer_agent is not None,
            "exporter": exporter_agent is not None,
        },
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    try:
        init_agents()
        if not req.query or not isinstance(req.query, str) or not req.query.strip():
            raise HTTPException(status_code=400, detail="'query' is required and must be a non-empty string")

        # Retrieve context
        contexts: List[Dict[str, Any]] = []
        if retriever_agent is not None:
            try:
                context = retriever_agent.retrieve_context(req.query, limit=5, score_threshold=0.2)
                contexts = [
                    {"content": d.content, "source": d.source, "score": d.relevance_score}
                    for d in context.retrieved_documents
                ]
                print(f"[OK] Retrieved {len(contexts)} context chunks for query: '{req.query[:50]}...'")
            except Exception as e:
                # Fall back to empty context
                print(f"[ERROR] Context retrieval failed: {e}")
                contexts = []
        else:
            print("[WARNING] No retriever available - generating without context")

        if not contexts:
            print(f"[WARNING] ZERO context retrieved for query: '{req.query}'")
            print("   LLM will generate generic content without real-world data.")
            print("   Result may be similar to other blueprints.")

        # Write draft
        draft = writer_agent.write(req.query, contexts)

        # Review draft
        review = reviewer_agent.review(draft.get("draft", {}))

        # Export
        title = draft.get("draft", {}).get("title", "Startup_Blueprint")
        formats = (req.options.export_formats if req.options else ["json", "markdown", "html"]) or ["json"]
        files = exporter_agent.export_all(review, formats, title)

        return GenerateResponse(
            draft=draft,
            review=review,
            files=files,
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("PIPELINE_HOST", "0.0.0.0")
    port = int(os.getenv("PIPELINE_PORT", os.getenv("PORT", "8015")))
    uvicorn.run(app, host=host, port=port)


