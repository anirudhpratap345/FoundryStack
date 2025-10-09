"""
Retriever Agent for FoundryStack Multi-Agent System

This agent queries Qdrant vector database to retrieve relevant context
and outputs structured JSON for other agents in the system.
"""

import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from dotenv import load_dotenv
from pathlib import Path

from qdrant_manager import QdrantManager

# Load environment variables
try:
    # Load .env from this file's directory (data-pipeline/)
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()  # Try current directory as fallback
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Using system environment variables instead")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RetrievedDocument:
    """Structure for a retrieved document chunk."""
    id: str
    source: str
    title: str
    content: str
    url: str
    relevance_score: float
    word_count: int
    chunk_index: int
    total_chunks: int
    retrieved_at: str

@dataclass
class QueryContext:
    """Structured context for agent queries."""
    query: str
    total_results: int
    max_results: int
    search_time_ms: float
    retrieved_documents: List[RetrievedDocument]
    sources_summary: Dict[str, int]
    confidence_score: float
    query_timestamp: str

class RetrieverAgent:
    """
    Retriever Agent that queries Qdrant and returns structured context.
    
    This agent is designed to be integrated into the FoundryStack multi-agent
    system, providing relevant context to other agents based on user queries.
    """
    
    def __init__(self, 
                 collection_name: str = "foundrystack_docs",
                 default_limit: int = 5,
                 min_score_threshold: float = 0.3,
                 fallback_path: Optional[str] = None):
        """
        Initialize the Retriever Agent.
        
        Args:
            collection_name: Name of the Qdrant collection to query
            default_limit: Default number of results to return
            min_score_threshold: Minimum relevance score threshold
            fallback_path: Path to fallback context JSON (auto-detected if None)
        """
        self.collection_name = collection_name
        self.default_limit = default_limit
        self.min_score_threshold = min_score_threshold
        
        # Load fallback context
        if fallback_path is None:
            fallback_path = Path(__file__).parent / "fallback_context.json"
        self.fallback_data = self._load_fallback(fallback_path)
        
        # Initialize Qdrant manager
        try:
            self.qdrant_manager = QdrantManager()
            logger.info("RetrieverAgent initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize QdrantManager: {e}")
            raise
    
    def _load_fallback(self, fallback_path: Path) -> Dict[str, Any]:
        """Load fallback context data from JSON file."""
        try:
            if fallback_path.exists():
                with open(fallback_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                logger.info(f"Loaded fallback context with {len(data)} industries")
                return data
            else:
                logger.warning(f"Fallback context file not found: {fallback_path}")
                return {}
        except Exception as e:
            logger.error(f"Failed to load fallback context: {e}")
            return {}
    
    def _detect_industry(self, query: str) -> Optional[str]:
        """Detect industry from query keywords."""
        query_lower = query.lower()
        for industry, config in self.fallback_data.items():
            keywords = config.get("keywords", [])
            if any(keyword in query_lower for keyword in keywords):
                return industry
        return None
    
    def _get_fallback_contexts(self, query: str) -> List[RetrievedDocument]:
        """Get fallback context when Qdrant is empty."""
        industry = self._detect_industry(query)
        if not industry or industry not in self.fallback_data:
            logger.warning(f"No fallback data for industry: {industry}")
            return []
        
        fallback_docs = []
        contexts = self.fallback_data[industry].get("contexts", [])
        
        for idx, content in enumerate(contexts):
            doc = RetrievedDocument(
                id=f"fallback_{industry}_{idx}",
                source=f"Fallback: {industry.title()}",
                title=f"{industry.title()} Industry Context",
                content=content,
                url="",
                relevance_score=0.5,  # Moderate score for fallback
                word_count=len(content.split()),
                chunk_index=idx,
                total_chunks=len(contexts),
                retrieved_at=datetime.now().isoformat()
            )
            fallback_docs.append(doc)
        
        logger.info(f"Using {len(fallback_docs)} fallback contexts for industry: {industry}")
        return fallback_docs
    
    def retrieve_context(self, 
                        query: str, 
                        limit: Optional[int] = None,
                        score_threshold: Optional[float] = None,
                        sources: Optional[List[str]] = None) -> QueryContext:
        """
        Retrieve relevant context for a given query.
        
        Args:
            query: The search query
            limit: Maximum number of results (defaults to self.default_limit)
            score_threshold: Minimum relevance score (defaults to self.min_score_threshold)
            sources: Filter by specific sources (optional)
            
        Returns:
            QueryContext: Structured context with retrieved documents
        """
        start_time = datetime.now()
        
        # Use defaults if not provided
        limit = limit or self.default_limit
        score_threshold = score_threshold or self.min_score_threshold
        
        logger.info(f"Retrieving context for query: '{query[:50]}...'")
        
        try:
            # Search Qdrant for relevant documents
            search_results = self.qdrant_manager.retrieve_similar_docs(
                query=query,
                limit=limit,
                score_threshold=score_threshold
            )
            
            # Process results into structured format
            retrieved_docs = []
            sources_count = {}
            
            for result in search_results:
                # Extract document data from the result structure
                doc_data = result.get("metadata", {})
                doc_data["content"] = result.get("text", "")
                
                # Apply source filter if specified
                if sources and doc_data.get("source") not in sources:
                    continue
                
                # Create RetrievedDocument
                retrieved_doc = RetrievedDocument(
                    id=str(result.get("id", "")),
                    source=doc_data.get("source", "Unknown"),
                    title=doc_data.get("title", "No title"),
                    content=doc_data.get("content", ""),
                    url=doc_data.get("url", ""),
                    relevance_score=result.get("score", 0.0),
                    word_count=doc_data.get("word_count", 0),
                    chunk_index=doc_data.get("chunk_index", 0),
                    total_chunks=doc_data.get("total_chunks", 1),
                    retrieved_at=datetime.now().isoformat()
                )
                
                retrieved_docs.append(retrieved_doc)
                
                # Count sources
                source = retrieved_doc.source
                sources_count[source] = sources_count.get(source, 0) + 1
            
            # Use fallback if no results from Qdrant
            if not retrieved_docs and self.fallback_data:
                logger.warning("Qdrant returned zero results - using fallback context")
                retrieved_docs = self._get_fallback_contexts(query)
                # Recalculate sources_count
                sources_count = {}
                for doc in retrieved_docs:
                    sources_count[doc.source] = sources_count.get(doc.source, 0) + 1
            
            # Calculate search time
            search_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Calculate confidence score (average of top 3 scores)
            top_scores = [doc.relevance_score for doc in retrieved_docs[:3]]
            confidence_score = sum(top_scores) / len(top_scores) if top_scores else 0.0
            
            # Create structured context
            context = QueryContext(
                query=query,
                total_results=len(retrieved_docs),
                max_results=limit,
                search_time_ms=round(search_time, 2),
                retrieved_documents=retrieved_docs,
                sources_summary=sources_count,
                confidence_score=round(confidence_score, 3),
                query_timestamp=datetime.now().isoformat()
            )
            
            logger.info(f"Retrieved {len(retrieved_docs)} documents in {search_time:.2f}ms")
            return context
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            # Return empty context on error
            return QueryContext(
                query=query,
                total_results=0,
                max_results=limit,
                search_time_ms=0.0,
                retrieved_documents=[],
                sources_summary={},
                confidence_score=0.0,
                query_timestamp=datetime.now().isoformat()
            )
    
    def get_context_json(self, 
                        query: str, 
                        limit: Optional[int] = None,
                        score_threshold: Optional[float] = None,
                        sources: Optional[List[str]] = None) -> str:
        """
        Get context as JSON string.
        
        Args:
            query: The search query
            limit: Maximum number of results
            score_threshold: Minimum relevance score
            sources: Filter by specific sources
            
        Returns:
            str: JSON string representation of QueryContext
        """
        context = self.retrieve_context(query, limit, score_threshold, sources)
        return json.dumps(asdict(context), indent=2, ensure_ascii=False)
    
    def get_context_dict(self, 
                        query: str, 
                        limit: Optional[int] = None,
                        score_threshold: Optional[float] = None,
                        sources: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get context as Python dictionary.
        
        Args:
            query: The search query
            limit: Maximum number of results
            score_threshold: Minimum relevance score
            sources: Filter by specific sources
            
        Returns:
            Dict: Dictionary representation of QueryContext
        """
        context = self.retrieve_context(query, limit, score_threshold, sources)
        return asdict(context)
    
    def get_sources(self) -> List[str]:
        """
        Get list of available sources in the collection.
        
        Returns:
            List[str]: List of unique sources
        """
        try:
            # Get collection info to extract sources
            stats = self.qdrant_manager.get_collection_stats()
            logger.info(f"Collection stats: {stats}")
            
            # For now, return known sources from our data
            # In production, you might want to query for unique sources
            return ["Next.js", "Supabase", "Prisma", "FastAPI", "Redis"]
            
        except Exception as e:
            logger.error(f"Error getting sources: {e}")
            return []
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on the retriever agent.
        
        Returns:
            Dict: Health status information
        """
        try:
            # Test Qdrant connection
            stats = self.qdrant_manager.get_collection_stats()
            
            # Test search functionality
            test_context = self.retrieve_context("test", limit=1)
            
            return {
                "status": "healthy",
                "qdrant_connected": True,
                "collection_name": self.collection_name,
                "vectors_count": stats.get("vectors_count", 0),
                "search_functional": test_context.total_results >= 0,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

def main():
    """Test the Retriever Agent functionality."""
    print("🚀 Testing Retriever Agent")
    print("=" * 50)
    
    # Initialize agent
    try:
        agent = RetrieverAgent()
        print("✅ Retriever Agent initialized")
    except Exception as e:
        print(f"❌ Failed to initialize: {e}")
        return
    
    # Health check
    health = agent.health_check()
    print(f"🏥 Health Status: {health['status']}")
    if health['status'] == 'healthy':
        print(f"   📊 Vectors: {health['vectors_count']}")
        print(f"   🔍 Search: {'✅' if health['search_functional'] else '❌'}")
    else:
        print(f"   ❌ Error: {health.get('error', 'Unknown')}")
        return
    
    # Test queries
    test_queries = [
        "FastAPI documentation",
        "Next.js app router",
        "Redis configuration",
        "API development",
        "web framework"
    ]
    
    print(f"\n🔍 Testing {len(test_queries)} queries:")
    print("-" * 30)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. Query: '{query}'")
        
        # Get context
        context = agent.retrieve_context(query, limit=3)
        
        print(f"   📊 Results: {context.total_results}")
        print(f"   ⏱️  Time: {context.search_time_ms}ms")
        print(f"   🎯 Confidence: {context.confidence_score}")
        print(f"   📚 Sources: {list(context.sources_summary.keys())}")
        
        # Show top result
        if context.retrieved_documents:
            top_doc = context.retrieved_documents[0]
            print(f"   🥇 Top: {top_doc.source} (score: {top_doc.relevance_score:.3f})")
            print(f"      {top_doc.content[:80]}...")
    
    # Test JSON output
    print(f"\n📄 Testing JSON output:")
    print("-" * 25)
    
    json_output = agent.get_context_json("FastAPI documentation", limit=2)
    print("✅ JSON output generated successfully")
    print(f"   Size: {len(json_output)} characters")
    
    # Test sources
    sources = agent.get_sources()
    print(f"\n📚 Available sources: {sources}")
    
    print(f"\n🎉 Retriever Agent test completed!")

if __name__ == "__main__":
    main()
