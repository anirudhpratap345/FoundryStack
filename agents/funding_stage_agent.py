"""
Funding Stage Agent
Determines the appropriate funding stage for a startup.
"""

import os
import json
import logging
from typing import Dict, Any
import google.generativeai as genai

from .base_agent import BaseAgent
from utils.prompt_templates import PromptTemplates

logger = logging.getLogger(__name__)


class FundingStageAgent(BaseAgent):
    """
    Analyzes startup profile to determine funding stage.
    
    Stages: Idea, Pre-Seed, Seed, Series A, Series B+, Bootstrapped/Profitable
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize the FundingStageAgent.
        
        Args:
            api_key: Gemini API key (falls back to env var)
        """
        super().__init__()
        
        # Get API key from parameter or environment
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY not found in environment. Check .env or .env.local file.")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Using faster model
        
        logger.info(f"[INIT] {self.name} ready with Gemini 2.0 Flash")
    
    def get_description(self) -> str:
        return "Analyzes startup metrics to determine appropriate funding stage"
    
    def run(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute funding stage analysis.
        
        Args:
            input_data: Validated startup input
            context: Shared context (empty for first agent)
            
        Returns:
            {
                "funding_stage": str,
                "confidence": str,
                "rationale": str,
                "stage_characteristics": str
            }
        """
        logger.info(f"[RUN] {self.name} processing startup: {input_data.get('startupName')}")
        
        try:
            # Generate prompt
            prompt = PromptTemplates.funding_stage_agent(input_data)
            
            # Call Gemini API
            logger.info(f"[API] Calling Gemini API...")
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,  # Lower temperature for more consistent output
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 1024,
                }
            )
            
            # Parse response
            result = self._parse_response(response.text)
            
            # Log output
            self.log_output(result)
            
            return result
            
        except Exception as e:
            logger.error(f"[ERROR] {self.name} failed: {str(e)}")
            # Return safe fallback
            return self._get_fallback_output(input_data)
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse and validate Gemini response.
        
        Args:
            response_text: Raw text from Gemini
            
        Returns:
            Parsed JSON dict
        """
        try:
            # Remove markdown code blocks if present
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text.replace("```json", "").replace("```", "").strip()
            elif clean_text.startswith("```"):
                clean_text = clean_text.replace("```", "").strip()
            
            # Parse JSON
            parsed = json.loads(clean_text)
            
            # Validate required fields
            required_fields = ["funding_stage", "confidence", "rationale"]
            for field in required_fields:
                if field not in parsed:
                    raise ValueError(f"Missing required field: {field}")
            
            return parsed
            
        except json.JSONDecodeError as e:
            logger.error(f"[PARSE ERROR] Invalid JSON: {response_text[:200]}")
            raise ValueError(f"Failed to parse AI response: {str(e)}")
    
    def _get_fallback_output(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Provide a safe fallback based on simple heuristics.
        
        Args:
            input_data: Startup input data
            
        Returns:
            Fallback funding stage recommendation
        """
        product_stage = input_data.get("productStage", "Idea")
        monthly_revenue = input_data.get("monthlyRevenue", 0)
        
        # Simple heuristic logic
        if product_stage == "Idea":
            stage = "Pre-Seed"
        elif product_stage == "MVP" and monthly_revenue < 1000:
            stage = "Pre-Seed"
        elif product_stage == "Beta" or (product_stage == "Revenue" and monthly_revenue < 10000):
            stage = "Seed"
        elif monthly_revenue > 50000:
            stage = "Series A"
        else:
            stage = "Seed"
        
        return {
            "funding_stage": stage,
            "confidence": "low",
            "rationale": "Fallback recommendation based on product stage and revenue (AI analysis unavailable)",
            "stage_characteristics": "Basic heuristic applied"
        }

