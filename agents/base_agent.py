"""
Base Agent Class
All financial agents inherit from this base class.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all financial agents.
    
    Each agent must implement:
    - name: Agent's identifier
    - description: What this agent does
    - run(): Main execution logic
    """
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.description = self.get_description()
        logger.info(f"[INIT] {self.name} initialized")
    
    @abstractmethod
    def get_description(self) -> str:
        """Return a description of what this agent does."""
        pass
    
    @abstractmethod
    def run(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main logic.
        
        Args:
            input_data: Raw startup input from frontend
            context: Shared context with outputs from previous agents
            
        Returns:
            Dict with this agent's output
        """
        pass
    
    def log_output(self, output: Dict[str, Any]) -> None:
        """Log agent output for debugging."""
        logger.info(f"[OUTPUT] {self.name} → {output}")

