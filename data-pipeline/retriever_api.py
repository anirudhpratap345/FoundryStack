"""
FastAPI endpoints for the Retriever Agent.

This provides REST API access to the retriever agent functionality
for integration with the FoundryStack multi-agent system.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging
import json
import os

from retriever_agent import RetrieverAgent, RetrievedDocument, QueryContext

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FoundryStack Retriever Agent API",
    description="REST API for the Retriever Agent that queries Qdrant vector database",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize retriever agent
try:
    retriever_agent = RetrieverAgent()
    logger.info("Retriever Agent API initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Retriever Agent: {e}")
    retriever_agent = None

# Pydantic models for request/response
class QueryRequest(BaseModel):
    query: str
    limit: Optional[int] = 5
    score_threshold: Optional[float] = 0.3
    sources: Optional[List[str]] = None

class QueryResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    retriever_agent: dict
    timestamp: str

@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API information."""
    return {
        "message": "FoundryStack Retriever Agent API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "query": "/query",
            "sources": "/sources",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    if not retriever_agent:
        return HealthResponse(
            status="unhealthy",
            retriever_agent={"error": "Retriever agent not initialized"},
            timestamp=""
        )
    
    try:
        health = retriever_agent.health_check()
        return HealthResponse(
            status=health["status"],
            retriever_agent=health,
            timestamp=health.get("timestamp", "")
        )
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            retriever_agent={"error": str(e)},
            timestamp=""
        )

@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Query documents using semantic search.
    
    Args:
        request: QueryRequest with query, limit, score_threshold, and sources
        
    Returns:
        QueryResponse with structured context data
    """
    if not retriever_agent:
        raise HTTPException(
            status_code=503, 
            detail="Retriever agent not available"
        )
    
    try:
        # Retrieve context using the retriever agent
        context = retriever_agent.retrieve_context(
            query=request.query,
            limit=request.limit,
            score_threshold=request.score_threshold,
            sources=request.sources
        )
        
        # Convert to dictionary for JSON response
        context_dict = {
            "query": context.query,
            "total_results": context.total_results,
            "max_results": context.max_results,
            "search_time_ms": context.search_time_ms,
            "retrieved_documents": [
                {
                    "id": doc.id,
                    "source": doc.source,
                    "title": doc.title,
                    "content": doc.content,
                    "url": doc.url,
                    "relevance_score": doc.relevance_score,
                    "word_count": doc.word_count,
                    "chunk_index": doc.chunk_index,
                    "total_chunks": doc.total_chunks,
                    "retrieved_at": doc.retrieved_at
                }
                for doc in context.retrieved_documents
            ],
            "sources_summary": context.sources_summary,
            "confidence_score": context.confidence_score,
            "query_timestamp": context.query_timestamp
        }
        
        return QueryResponse(
            success=True,
            data=context_dict,
            timestamp=context.query_timestamp
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return QueryResponse(
            success=False,
            error=str(e),
            timestamp=""
        )

@app.get("/query", response_model=QueryResponse)
async def query_documents_get(
    q: str = Query(..., description="Search query"),
    limit: int = Query(5, description="Maximum number of results"),
    score_threshold: float = Query(0.3, description="Minimum relevance score"),
    sources: Optional[str] = Query(None, description="Comma-separated list of sources to filter by")
):
    """
    Query documents using GET method with query parameters.
    
    Args:
        q: Search query
        limit: Maximum number of results
        score_threshold: Minimum relevance score
        sources: Comma-separated list of sources
        
    Returns:
        QueryResponse with structured context data
    """
    # Parse sources if provided
    sources_list = None
    if sources:
        sources_list = [s.strip() for s in sources.split(",")]
    
    # Create request object
    request = QueryRequest(
        query=q,
        limit=limit,
        score_threshold=score_threshold,
        sources=sources_list
    )
    
    return await query_documents(request)

@app.get("/sources", response_model=dict)
async def get_sources():
    """Get list of available sources."""
    if not retriever_agent:
        raise HTTPException(
            status_code=503, 
            detail="Retriever agent not available"
        )
    
    try:
        sources = retriever_agent.get_sources()
        return {
            "success": True,
            "sources": sources,
            "count": len(sources)
        }
    except Exception as e:
        logger.error(f"Error getting sources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats", response_model=dict)
async def get_stats():
    """Get collection statistics."""
    if not retriever_agent:
        raise HTTPException(
            status_code=503, 
            detail="Retriever agent not available"
        )
    
    try:
        stats = retriever_agent.qdrant_manager.get_collection_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("RETRIEVER_HOST", "0.0.0.0")
    # Prefer RETRIEVER_PORT, then PORT, default to 8001
    port_env = os.getenv("RETRIEVER_PORT") or os.getenv("PORT") or "8001"
    try:
        port = int(port_env)
    except ValueError:
        port = 8001
    uvicorn.run(app, host=host, port=port)
