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
except Exception:  # pragma: no cover - imports validated in smoke tests
    ChatPromptTemplate = None
    StrOutputParser = None
    ChatOpenAI = None
    ChatAnthropic = None


load_dotenv()
logger = logging.getLogger(__name__)


DEFAULT_OPENAI_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
DEFAULT_ANTHROPIC_MODEL = os.getenv("LLM_MODEL", "claude-3-5-haiku-latest")


@dataclass
class WriterAgentConfig:
    provider: str
    model: str
    temperature: float = 0.2
    max_tokens: int = 2000


class WriterAgent:
    def __init__(self, config: Optional[WriterAgentConfig] = None):
        provider = (os.getenv("LLM_PROVIDER") or "").strip().lower()
        openai_key = os.getenv("OPENAI_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        # Choose provider automatically if not set
        if not provider:
            if openai_key:
                provider = "openai"
            elif anthropic_key:
                provider = "anthropic"
            else:
                raise RuntimeError("No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.")

        if config is None:
            if provider == "openai":
                model = DEFAULT_OPENAI_MODEL
            else:
                model = DEFAULT_ANTHROPIC_MODEL
            config = WriterAgentConfig(provider=provider, model=model)

        self.config = config

        # Initialize model
        if self.config.provider == "openai":
            if ChatOpenAI is None:
                raise RuntimeError("langchain_openai not installed. Add it to requirements.txt")
            self.llm = ChatOpenAI(model=self.config.model, temperature=self.config.temperature)
        elif self.config.provider == "anthropic":
            if ChatAnthropic is None:
                raise RuntimeError("langchain_anthropic not installed. Add it to requirements.txt")
            self.llm = ChatAnthropic(model=self.config.model, temperature=self.config.temperature)
        else:
            raise ValueError(f"Unsupported LLM provider: {self.config.provider}")

        if ChatPromptTemplate is None or StrOutputParser is None:
            raise RuntimeError("langchain core packages missing. Add langchain-core and dependencies.")

        self.prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are a precise technical writer. Write a coherent, factual draft using only the provided context. "
             "Include inline references like [source: DOMAIN] where appropriate. Output strictly valid JSON matching the schema."),
            ("human",
             "Query: {query}\n\n"
             "Context items (JSON array):\n{contexts_json}\n\n"
             "Generate a JSON with keys: draft.title, draft.summary, draft.sections[], draft.references[].\n"
             "Sections should be well structured (Overview, Architecture, Usage, Examples, Limitations) when possible.")
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
        # Minimal normalization
        draft = data.setdefault("draft", {})
        draft.setdefault("title", "Draft")
        draft.setdefault("summary", "")
        draft.setdefault("sections", [])
        draft.setdefault("references", [])
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


