"""
Writer Agent

Turns retrieved context into a structured draft analysis using an LLM.

Environment variables:
- OPENAI_API_KEY or ANTHROPIC_API_KEY (one is required)
- LLM_PROVIDER=openai|anthropic (optional, default: openai if OPENAI_API_KEY present)
- LLM_MODEL (optional; defaults: gpt-4o-mini or claude-3-5-haiku-latest)

Input schema (simplified):
{
  "query": str,
  "contexts": [ { "content": str, "source": str, "score": float } ]
}

Output schema:
{
  "draft": {
    "title": str,
    "summary": str,
    "sections": [ { "heading": str, "content": str } ],
    "references": [ { "source": str, "note": str } ]
  }
}
"""

from __future__ import annotations

import os
import json
import logging
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

# LangChain core and chat models
try:
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    from langchain_openai import ChatOpenAI
    from langchain_anthropic import ChatAnthropic
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception:  # pragma: no cover - imports validated in smoke tests
    ChatPromptTemplate = None
    StrOutputParser = None
    ChatOpenAI = None
    ChatAnthropic = None
    ChatGoogleGenerativeAI = None


# Load environment variables, prioritizing .env.local
load_dotenv('.env.local')
load_dotenv()
logger = logging.getLogger(__name__)


DEFAULT_OPENAI_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
DEFAULT_ANTHROPIC_MODEL = os.getenv("LLM_MODEL", "claude-3-5-haiku-latest")
DEFAULT_GEMINI_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-pro")


@dataclass
class WriterAgentConfig:
    provider: str
    model: str
    temperature: float = 0.4  # Increased for more creative and comprehensive outputs
    max_tokens: int = 4000  # Increased for more detailed content


class WriterAgent:
    def __init__(self, config: Optional[WriterAgentConfig] = None):
        provider = (os.getenv("LLM_PROVIDER") or "").strip().lower()
        openai_key = os.getenv("OPENAI_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        # Force Gemini as the only provider
        provider = "gemini"
        if not gemini_key:
            raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required.")

        if config is None:
            config = WriterAgentConfig(provider=provider, model=DEFAULT_GEMINI_MODEL)

        self.config = config

        # Initialize Gemini model only
        if ChatGoogleGenerativeAI is None:
            raise RuntimeError("langchain-google-genai not installed. Add it to requirements.txt")
        
        google_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required for Gemini provider")
        
        self.llm = ChatGoogleGenerativeAI(
            model=self.config.model, 
            temperature=self.config.temperature,
            google_api_key=google_api_key
        )

        if ChatPromptTemplate is None or StrOutputParser is None:
            raise RuntimeError("langchain core packages missing. Add langchain-core and dependencies.")

        self.prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are an expert startup consultant and technical architect. Create comprehensive, detailed startup blueprints that include:\n"
             "1. Executive Summary with clear value proposition\n"
             "2. Technical Architecture with specific technologies and versions\n"
             "3. Market Analysis and competitive positioning\n"
             "4. Business Model and monetization strategy\n"
             "5. Implementation roadmap with realistic timelines\n"
             "6. Risk assessment and mitigation strategies\n"
             "7. Financial projections and funding requirements\n"
             "8. Team structure and hiring plan\n"
             "9. Go-to-market strategy\n"
             "10. Success metrics and KPIs\n\n"
             "Use only the provided context for factual information. Include inline references like [source: DOMAIN]. "
             "Be specific, actionable, and comprehensive. Output strictly valid JSON matching the schema."),
            ("human",
             "Create a comprehensive startup blueprint for: {query}\n\n"
             "Context items (JSON array):\n{contexts_json}\n\n"
             "Generate a detailed JSON with keys: draft.title, draft.summary, draft.sections[], draft.references[].\n"
             "Sections should include: Executive Summary, Technical Architecture, Market Analysis, Business Model, "
             "Implementation Roadmap, Risk Assessment, Financial Projections, Team Structure, Go-to-Market Strategy, Success Metrics.\n"
             "Each section should be detailed, specific, and actionable with concrete examples and recommendations.")
        ])

        self.output_parser = StrOutputParser()

    def _build_contexts_json(self, contexts: List[Dict[str, Any]]) -> str:
        safe_contexts = []
        for item in contexts[:50]:
            safe_contexts.append({
                "content": item.get("content") or item.get("text") or "",
                "source": item.get("source") or item.get("url") or "",
                "score": float(item.get("score", 0.0))
            })
        return json.dumps(safe_contexts, ensure_ascii=False)

    def _coerce_json(self, text: str) -> Dict[str, Any]:
        text = text.strip()
        # Allow fenced code blocks with json
        if text.startswith("```"):
            try:
                text = text.strip("`\n").split('\n', 1)[1]
            except Exception:
                pass
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            # Best-effort fallback: wrap as summary
            data = {
                "draft": {
                    "title": "Draft",
                    "summary": text[:800],
                    "sections": [],
                    "references": []
                }
            }
        # Enhanced normalization for startup blueprints
        draft = data.setdefault("draft", {})
        draft.setdefault("title", "Startup Blueprint")
        draft.setdefault("summary", "")
        draft.setdefault("sections", [])
        draft.setdefault("references", [])
        
        # Ensure we have comprehensive sections for startup blueprints
        sections = draft.get("sections", [])
        if len(sections) < 5:  # If we don't have enough sections, add placeholders
            required_sections = [
                "Executive Summary",
                "Technical Architecture", 
                "Market Analysis",
                "Business Model",
                "Implementation Roadmap",
                "Risk Assessment",
                "Financial Projections",
                "Team Structure",
                "Go-to-Market Strategy",
                "Success Metrics"
            ]
            
            existing_headings = [s.get("heading", "").lower() for s in sections]
            for heading in required_sections:
                if heading.lower() not in existing_headings:
                    sections.append({
                        "heading": heading,
                        "content": f"Detailed {heading.lower()} section to be developed based on context and requirements."
                    })
            draft["sections"] = sections
        
        return data

    def write(self, query: str, contexts: List[Dict[str, Any]]) -> Dict[str, Any]:
        contexts_json = self._build_contexts_json(contexts)
        chain = self.prompt | self.llm | self.output_parser
        raw = chain.invoke({"query": query, "contexts_json": contexts_json})
        return self._coerce_json(raw)

    async def awrite(self, query: str, contexts: List[Dict[str, Any]]) -> Dict[str, Any]:
        contexts_json = self._build_contexts_json(contexts)
        chain = self.prompt | self.llm | self.output_parser
        raw = await chain.ainvoke({"query": query, "contexts_json": contexts_json})
        return self._coerce_json(raw)


if __name__ == "__main__":
    # Simple smoke test (requires an API key)
    logging.basicConfig(level=logging.INFO)
    sample_contexts = [
        {
            "content": "Edge Functions are Deno-based serverless functions deployed to the edge.",
            "source": "https://supabase.com/docs/edge-functions",
            "score": 0.9
        }
    ]
    agent = WriterAgent()
    out = agent.write("Explain Supabase Edge Functions", sample_contexts)
    print(json.dumps(out, indent=2))


