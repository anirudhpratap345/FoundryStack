"""
Qdrant Vector Database Manager for FoundryStack RAG Pipeline

This module provides a production-ready interface to Qdrant vector database
for storing and retrieving document embeddings. It's designed to integrate 
seamlessly with the multi-agent FoundryStack system.

Features:
- Local and cloud Qdrant support
- Document embedding storage with metadata
- Semantic similarity search
- Error handling and logging
- Modular design for multi-agent integration

Author: FoundryStack AI Engineering Team
"""

import os
import json
import logging
from typing import List, Dict, Optional, Any, Union
from urllib.parse import urlparse

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()  # Load .env file from current directory
except ImportError:
    pass  # dotenv not available, use system env vars
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Using system environment variables instead")

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance, VectorParams, PointStruct, Filter, 
        FieldCondition, MatchValue, SearchRequest
    )
    from sentence_transformers import SentenceTransformer
    import numpy as np
except ImportError as e:
    logging.error(f"Missing required dependencies: {e}")
    logging.error("Install with: pip install qdrant-client sentence-transformers")
    raise

logger = logging.getLogger(__name__)

class QdrantManager:
    """
    Production-ready Qdrant vector database manager.
    
    Handles document embedding storage, retrieval, and semantic search
    for the FoundryStack multi-agent RAG system.
    """
    
    def __init__(self, 
                 qdrant_url: Optional[str] = None,
                 api_key: Optional[str] = None,
                 collection_name: str = "foundrystack_docs"):
        """
        Initialize Qdrant manager.
        
        Args:
            qdrant_url: Qdrant server URL (local or cloud)
            api_key: API key for Qdrant cloud (optional for local)
            collection_name: Name of the vector collection
        """
        self.collection_name = collection_name
        self.qdrant_url = qdrant_url or os.getenv("QDRANT_URL", "http://localhost:6333")
        self.api_key = api_key or os.getenv("QDRANT_API_KEY")
        
        # Initialize embedding model
        self.model_name = "all-MiniLM-L6-v2"
        self.embedding_dim = 384
        
        # Initialize clients
        self._init_qdrant_client()
        self._init_embedding_model()
        
        # Create collection
        self._ensure_collection_exists()
        
        logger.info(f"QdrantManager initialized: {self.qdrant_url}")
    
    def _init_qdrant_client(self):
        """Initialize Qdrant client with proper configuration."""
        try:
            # Parse URL to determine connection type
            parsed = urlparse(self.qdrant_url)
            
            if parsed.scheme in ['http', 'https']:
                # Cloud or remote Qdrant
                self.client = QdrantClient(
                    url=self.qdrant_url,
                    api_key=self.api_key,
                    timeout=60
                )
                logger.info("Connected to Qdrant cloud/remote instance")
            else:
                # Local Qdrant
                self.client = QdrantClient(
                    host="localhost",
                    port=6333,
                    timeout=60
                )
                logger.info("Connected to local Qdrant instance")
                
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant client: {e}")
            logger.error("Troubleshooting:")
            logger.error("1. Check if Qdrant is running (docker run -p 6333:6333 qdrant/qdrant)")
            logger.error("2. Verify cloud URL and API key")
            logger.error("3. Check network connectivity")
            raise
    
    def _init_embedding_model(self):
        """Initialize sentence-transformers model for embeddings."""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.embedding_model = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            logger.error("Make sure sentence-transformers is installed")
            raise
    
    def _ensure_collection_exists(self):
        """Create collection if it doesn't exist."""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.client.collection_exists(self.collection_name):
                logger.info(f"Collection '{self.collection_name}' already exists")
            else:
                # Create collection
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_dim,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created collection '{self.collection_name}' with dimension {self.embedding_dim}")
                
        except Exception as e:
            logger.error(f"Failed to ensure collection exists: {e}")
            raise
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embeddings for text.
        
        Args:
            text: Input text to embed
            
        Returns:
            Embedding vector as list of floats
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            return [0.0] * self.embedding_dim
        
        try:
            # Generate embedding
            embedding = self.embedding_model.encode(text)
            
            # Convert to list if numpy array
            if isinstance(embedding, np.ndarray):
                embedding = embedding.tolist()
            
            logger.debug(f"Generated embedding of dimension {len(embedding)}")
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    def store_document(self, 
                      document_id: str,
                      text: str, 
                      metadata: Dict[str, Any]) -> bool:
        """
        Store document with embedding in Qdrant.
        
        Args:
            document_id: Unique identifier for the document
            text: Document text content
            metadata: Document metadata (source, url, etc.)
            
        Returns:
            True if successful
        """
        try:
            # Generate embedding
            embedding = self.embed_text(text)
            
            # Prepare payload
            payload = {
                "text": text,
                **metadata  # Include all metadata fields
            }
            
            # Create point
            point = PointStruct(
                id=document_id,
                vector=embedding,
                payload=payload
            )
            
            # Store in Qdrant
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            
            logger.info(f"Stored document {document_id} with embedding")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store document {document_id}: {e}")
            return False
    
    def batch_store_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Store multiple documents in batch.
        
        Args:
            documents: List of documents with id, text, and metadata
            
        Returns:
            Dict with success/failure counts
        """
        try:
            points = []
            
            for doc in documents:
                # Generate embedding
                embedding = self.embed_text(doc["text"])
                
                # Prepare payload
                payload = {
                    "text": doc["text"],
                    **doc.get("metadata", {})
                }
                
                # Create point
                point = PointStruct(
                    id=doc["id"],
                    vector=embedding,
                    payload=payload
                )
                points.append(point)
            
            # Batch upsert
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
            logger.info(f"Batch stored {len(points)} documents")
            return {"success": len(points), "failed": 0}
            
        except Exception as e:
            logger.error(f"Failed to batch store documents: {e}")
            return {"success": 0, "failed": len(documents)}
    
    def retrieve_similar_docs(self, 
                             query: str, 
                             limit: int = 5,
                             score_threshold: float = 0.7,
                             filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Retrieve similar documents using semantic search.
        
        Args:
            query: Search query
            limit: Maximum number of results
            score_threshold: Minimum similarity score
            filters: Optional metadata filters
            
        Returns:
            List of similar documents with scores and metadata
        """
        try:
            # Generate query embedding
            query_embedding = self.embed_text(query)
            
            # Build search request
            search_request = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold,
                with_payload=True
            )
            
            # Extract results
            results = []
            for hit in search_request:
                result = {
                    "id": hit.id,
                    "score": hit.score,
                    "text": hit.payload.get("text", ""),
                    "metadata": {
                        key: value for key, value in hit.payload.items() 
                        if key != "text"
                    }
                }
                results.append(result)
            
            logger.info(f"Retrieved {len(results)} similar documents for query")
            return results
            
        except Exception as e:
            logger.error(f"Failed to retrieve similar documents: {e}")
            return []
    
    def search_by_metadata(self, 
                          filters: Dict[str, Any], 
                          limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search documents by metadata filters.
        
        Args:
            filters: Metadata filters (e.g., {"source": "techcrunch"})
            limit: Maximum number of results
            
        Returns:
            List of matching documents
        """
        try:
            # Build filter conditions
            conditions = []
            for key, value in filters.items():
                condition = FieldCondition(
                    key=key,
                    match=MatchValue(value=value)
                )
                conditions.append(condition)
            
            # Search with filters
            search_request = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=Filter(must=conditions),
                limit=limit,
                with_payload=True
            )
            
            # Extract results
            results = []
            for hit in search_request[0]:
                result = {
                    "id": hit.id,
                    "text": hit.payload.get("text", ""),
                    "metadata": {
                        key: value for key, value in hit.payload.items() 
                        if key != "text"
                    }
                }
                results.append(result)
            
            logger.info(f"Found {len(results)} documents matching filters")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search by metadata: {e}")
            return []
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        try:
            info = self.client.get_collection(self.collection_name)
            
            stats = {
                "name": self.collection_name,
                "vectors_count": info.points_count,
                "indexed_vectors_count": info.indexed_vectors_count,
                "dimension": info.config.params.vectors.size,
                "distance": info.config.params.vectors.distance,
                "status": info.status
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {}
    
    def delete_document(self, document_id: str) -> bool:
        """Delete a document by ID."""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=[document_id]
            )
            logger.info(f"Deleted document {document_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete document {document_id}: {e}")
            return False
    
    def delete_collection(self) -> bool:
        """Delete the entire collection."""
        try:
            self.client.delete_collection(self.collection_name)
            logger.info(f"Deleted collection '{self.collection_name}'")
            return True
        except Exception as e:
            logger.error(f"Failed to delete collection: {e}")
            return False


def test_qdrant_connection():
    """Test Qdrant connection and basic operations."""
    logger.info("🔍 Testing Qdrant connection...")
    
    try:
        # Initialize manager
        qdrant_manager = QdrantManager()
        
        # Test document storage
        test_doc = {
            "id": 1,  # Use integer ID instead of string
            "text": "This is a test document for FoundryStack RAG system.",
            "metadata": {
                "source": "test",
                "url": "https://test.com/1",
                "page": 1,
                "company_size": "startup"
            }
        }
        
        # Store document
        if qdrant_manager.store_document(
            document_id=test_doc["id"],
            text=test_doc["text"],
            metadata=test_doc["metadata"]
        ):
            logger.info("✅ Document storage successful")
        else:
            logger.error("❌ Document storage failed")
            return False
        
        # Test search
        results = qdrant_manager.retrieve_similar_docs(
            query="test document",
            limit=3
        )
        
        if results:
            logger.info(f"✅ Search successful - found {len(results)} results")
            logger.info(f"Top result: {results[0]['text'][:50]}... (score: {results[0]['score']:.3f})")
        else:
            logger.error("❌ Search failed")
            return False
        
        # Test collection stats
        stats = qdrant_manager.get_collection_stats()
        logger.info(f"✅ Collection stats: {stats}")
        
        # Clean up test document
        qdrant_manager.delete_document(1)
        logger.info("✅ Test cleanup successful")
        
        logger.info("🎉 Qdrant connection test passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Qdrant connection test failed: {e}")
        return False


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_qdrant_connection()
