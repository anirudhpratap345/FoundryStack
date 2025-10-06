"""
Reviewer Agent

Reviews and refines Writer Agent drafts for accuracy, clarity, and completeness using Gemini.

Environment variables:
- GEMINI_API_KEY or GOOGLE_API_KEY (required)
- LLM_PROVIDER=gemini (optional, default: gemini)
- LLM_MODEL (optional; default: gemini-2.5-pro)

Input schema (Writer Agent output):
{
  "draft": {
    "title": str,
    "summary": str,
    "sections": [ { "heading": str, "content": str } ],
    "references": [ { "source": str, "note": str } ]
  }
}

Output schema:
{
  "review": {
    "accuracy_score": float,
    "clarity_score": float,
    "completeness_score": float,
    "suggestions": [str],
    "final_recommendation": str,
    "reviewed_draft": {
      "title": str,
      "summary": str,
      "sections": [ { "heading": str, "content": str } ],
      "references": [ { "source": str, "note": str } ]
    }
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
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception:  # pragma: no cover - imports validated in smoke tests
    ChatPromptTemplate = None
    StrOutputParser = None
    ChatGoogleGenerativeAI = None


# Load environment variables, prioritizing .env.local
load_dotenv('.env.local')
load_dotenv()
logger = logging.getLogger(__name__)


DEFAULT_GEMINI_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-pro")


@dataclass
class ReviewerAgentConfig:
    provider: str
    model: str
    temperature: float = 0.2  # Slightly higher for more thorough analysis
    max_tokens: int = 4000  # Increased for more detailed reviews


class ReviewerAgent:
    def __init__(self, config: Optional[ReviewerAgentConfig] = None):
        # Force Gemini as the only provider
        provider = "gemini"
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        
        if not gemini_key:
            raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required.")

        if config is None:
            config = ReviewerAgentConfig(provider=provider, model=DEFAULT_GEMINI_MODEL)

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
             "You are an expert startup consultant and technical reviewer. Evaluate startup blueprints for:\n"
             "1. ACCURACY (0-10): Factual correctness, realistic assumptions, proper technical details\n"
             "2. CLARITY (0-10): Clear value proposition, understandable language, logical structure\n"
             "3. COMPLETENESS (0-10): All essential sections present, detailed implementation plans, comprehensive coverage\n\n"
             "Look for:\n"
             "- Clear value proposition and problem-solution fit\n"
             "- Specific technology stack with versions and justifications\n"
             "- Detailed market analysis with size, competition, and positioning\n"
             "- Concrete business model with revenue streams and pricing\n"
             "- Realistic implementation timeline with milestones\n"
             "- Comprehensive risk assessment with mitigation strategies\n"
             "- Detailed financial projections with assumptions\n"
             "- Clear team structure and hiring plan\n"
             "- Specific go-to-market strategy with channels and tactics\n"
             "- Measurable success metrics and KPIs\n\n"
             "Provide specific, actionable feedback. Output strictly valid JSON matching the schema."),
            ("human",
             "Review this startup blueprint:\n\n{draft_json}\n\n"
             "Evaluate comprehensively and provide:\n"
             "1. Accuracy score (0-10) - factual correctness and realistic assumptions\n"
             "2. Clarity score (0-10) - clear communication and logical structure\n"
             "3. Completeness score (0-10) - comprehensive coverage of all essential elements\n"
             "4. Specific suggestions for improvement (be detailed and actionable)\n"
             "5. Final recommendation (Approve, Approve with minor edits, Needs major revision, Reject)\n"
             "6. Improved version of the draft with corrections and enhancements applied\n\n"
             "Output JSON with keys: review.accuracy_score, review.clarity_score, review.completeness_score, "
             "review.suggestions[], review.final_recommendation, review.reviewed_draft (same structure as input).")
        ])

        self.output_parser = StrOutputParser()

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
            # Best-effort fallback: create minimal review
            data = {
                "review": {
                    "accuracy_score": 5.0,
                    "clarity_score": 5.0,
                    "completeness_score": 5.0,
                    "suggestions": ["Unable to parse review response"],
                    "final_recommendation": "Needs major revision",
                    "reviewed_draft": {
                        "title": "Draft",
                        "summary": text[:500],
                        "sections": [],
                        "references": []
                    }
                }
            }
        
        # Normalize structure
        review = data.setdefault("review", {})
        review.setdefault("accuracy_score", 5.0)
        review.setdefault("clarity_score", 5.0)
        review.setdefault("completeness_score", 5.0)
        review.setdefault("suggestions", [])
        review.setdefault("final_recommendation", "Needs major revision")
        
        reviewed_draft = review.setdefault("reviewed_draft", {})
        reviewed_draft.setdefault("title", "Draft")
        reviewed_draft.setdefault("summary", "")
        reviewed_draft.setdefault("sections", [])
        reviewed_draft.setdefault("references", [])
        
        return data

    def review(self, draft: Dict[str, Any]) -> Dict[str, Any]:
        """Review a draft and provide feedback."""
        draft_json = json.dumps(draft, ensure_ascii=False, indent=2)
        chain = self.prompt | self.llm | self.output_parser
        raw = chain.invoke({"draft_json": draft_json})
        return self._coerce_json(raw)

    async def areview(self, draft: Dict[str, Any]) -> Dict[str, Any]:
        """Async review a draft and provide feedback."""
        draft_json = json.dumps(draft, ensure_ascii=False, indent=2)
        chain = self.prompt | self.llm | self.output_parser
        raw = await chain.ainvoke({"draft_json": draft_json})
        return self._coerce_json(raw)


if __name__ == "__main__":
    # Simple smoke test (requires an API key)
    logging.basicConfig(level=logging.INFO)
    sample_draft = {
        "title": "Understanding Supabase Edge Functions",
        "summary": "Edge Functions are Deno-based serverless functions deployed to the edge.",
        "sections": [
            {
                "heading": "Overview",
                "content": "Edge Functions enable serverless execution close to users for better performance."
            }
        ],
        "references": [
            {
                "source": "https://supabase.com/docs/edge-functions",
                "note": "Official documentation"
            }
        ]
    }
    agent = ReviewerAgent()
    out = agent.review(sample_draft)
    print(json.dumps(out, indent=2))
