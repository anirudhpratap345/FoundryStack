"""
Runway Agent
Calculates expected runway and burn rate guidance.
"""

import os
import json
import logging
from typing import Dict, Any
import google.generativeai as genai

from .base_agent import BaseAgent
from utils.prompt_templates import PromptTemplates

logger = logging.getLogger(__name__)


class RunwayAgent(BaseAgent):
    """
    Estimates runway based on:
    - Raise amount
    - Team size
    - Industry costs
    - Revenue (if any)
    """
    
    def __init__(self, api_key: str = None):
        super().__init__()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY not found in environment")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        logger.info(f"[INIT] {self.name} ready")
    
    def get_description(self) -> str:
        return "Calculates runway and provides burn rate management guidance"
    
    def run(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate runway and burn rate.
        
        Requires context["raise_amount"].
        """
        logger.info(f"[RUN] {self.name} processing...")
        
        try:
            raise_amount = context.get("raise_amount", {}).get("optimal_amount", "$500K")
            
            prompt = PromptTemplates.runway_agent(input_data, raise_amount)
            
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "max_output_tokens": 1536,
                }
            )
            
            result = self._parse_response(response.text)
            self.log_output(result)
            return result
            
        except Exception as e:
            logger.error(f"[ERROR] {self.name} failed: {str(e)}")
            return self._get_fallback_output(input_data, context)
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and validate response."""
        clean_text = response_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text.replace("```json", "").replace("```", "").strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text.replace("```", "").strip()
        
        parsed = json.loads(clean_text)
        
        required_fields = ["estimated_runway_months", "monthly_burn_rate"]
        for field in required_fields:
            if field not in parsed:
                raise ValueError(f"Missing required field: {field}")
        
        return parsed
    
    def _get_fallback_output(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback runway calculation."""
        team_size = input_data.get("teamSize", 3)
        monthly_revenue = input_data.get("monthlyRevenue", 0)
        
        # Simple burn calculation: $10K/person + $20K overhead
        estimated_burn = (team_size * 10000) + 20000
        net_burn = max(estimated_burn - monthly_revenue, 5000)
        
        # Assume raise of $500K default
        raise_str = context.get("raise_amount", {}).get("optimal_amount", "$500K")
        # Extract number (rough)
        import re
        amounts = re.findall(r'\$?([\d,]+)K', raise_str)
        raise_k = float(amounts[0].replace(',', '')) if amounts else 500
        raise_amount = raise_k * 1000
        
        runway_months = int(raise_amount / net_burn)
        
        return {
            "estimated_runway_months": f"{runway_months}-{runway_months+3}",
            "monthly_burn_rate": f"${int(net_burn/1000)}K",
            "assumptions": {
                "team_costs": f"${team_size * 10}K",
                "operational_expenses": "$20K",
                "growth_investments": "Variable"
            },
            "revenue_impact": f"${int(monthly_revenue)} MRR offsets burn",
            "key_milestones": ["Achieve product-market fit", "Reach next funding stage"],
            "burn_rate_guidance": "Monitor closely, optimize hiring pace"
        }

