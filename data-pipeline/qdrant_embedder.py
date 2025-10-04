"""
Qdrant-based Document Embedder for FoundryStack RAG Pipeline

Replaces the Supabase/pgvector implementation with Qdrant vector database.
Provides the same interface as the original embedder for seamless migration.

Author: FoundryStack AI Engineering Team
"""

import json
import logging
import os
from typing import List, Dict, Optional, Any
from pathlib import Path

try:
    from qdrant_manager import QdrantManager
    from tqdm import tqdm
except ImportError as e:
    logging.error(f"Missing required dependencies: {e}")
    logging.error("Install with: pip install qdrant-client sentence-transformers tqdm")
    raise

logger = logging.getLogger(__name__)

class QdrantDocumentEmbedder:
    """
    Qdrant-based document embedder for FoundryStack RAG pipeline.
    
    Replaces Supabase/pgvector with Qdrant vector database for:
    - Better performance and scalability
    - Simpler configuration (no IPv4 issues)
    - Native vector operations
    - Cloud and local deployment support
    """
    
    def __init__(self, 
                 qdrant_config: Optional[Dict[str, str]] = None,
                 collection_name: str = "foundrystack_docs"):
        """
        Initialize Qdrant embedder.
        
        Args:
            qdrant_config: Qdrant configuration (url, api_key)
            collection_name: Name of the vector collection
        """
        self.collection_name = collection_name
        
        # Setup Qdrant configuration
        self._setup_qdrant_config(qdrant_config)
        
        # Initialize Qdrant manager
        self.qdrant_manager = QdrantManager(
            qdrant_url=self.qdrant_url,
            api_key=self.api_key,
            collection_name=self.collection_name
        )
        
        logger.info("QdrantDocumentEmbedder initialized successfully")
    
    def _setup_qdrant_config(self, qdrant_config: Optional[Dict[str, str]] = None):
        """Setup Qdrant configuration from params and environment."""
        if qdrant_config is None:
            qdrant_config = {}
        
        # Get configuration from params or environment
        self.qdrant_url = (
            qdrant_config.get("url") or 
            qdrant_config.get("qdrant_url") or
            os.getenv("QDRANT_URL", "http://localhost:6333")
        )
        
        self.api_key = (
            qdrant_config.get("api_key") or 
            qdrant_config.get("qdrant_api_key") or
            os.getenv("QDRANT_API_KEY")
        )
        
        logger.info(f"Qdrant URL: {self.qdrant_url}")
        logger.info(f"Qdrant API Key: {'Set' if self.api_key else 'Not set (local mode)'}")
    
    def embed_documents(self, 
                       chunks_file: str, 
                       output_file: Optional[str] = None,
                       batch_size: int = 100) -> bool:
        """
        Embed document chunks and store in Qdrant.
        
        Args:
            chunks_file: Path to JSON file with document chunks
            output_file: Optional output file for embedding metadata
            batch_size: Number of documents to process in each batch
            
        Returns:
            True if successful
        """
        try:
            # Load chunks
            logger.info(f"Loading document chunks from {chunks_file}")
            chunks_path = Path(chunks_file)
            
            if not chunks_path.exists():
                logger.error(f"Chunks file not found: {chunks_file}")
                return False
            
            with open(chunks_path, 'r', encoding='utf-8') as f:
                chunks_data = json.load(f)
            
            # Handle chunks data structure
            if isinstance(chunks_data, dict) and "chunks" in chunks_data:
                chunks_data = chunks_data["chunks"]
                logger.info(f"Loaded {len(chunks_data)} document chunks from structured file")
            elif isinstance(chunks_data, list):
                logger.info(f"Loaded {len(chunks_data)} document chunks from list format")
            else:
                logger.error(f"Unexpected chunks data format: {type(chunks_data)}")
                return False
            
            # Process chunks in batches
            success_count = 0
            failed_count = 0
            
            print(f"Processing {len(chunks_data)} chunks in batches of {batch_size}")
            
            for i in tqdm(range(0, len(chunks_data), batch_size), 
                         desc="Embedding documents", 
                         unit="batch"):
                batch = chunks_data[i:i + batch_size]
                print(f"Processing batch {i//batch_size + 1}: chunks {i+1}-{min(i+batch_size, len(chunks_data))}")
                
                # Prepare documents for batch processing
                documents = []
                for chunk_idx, chunk in enumerate(batch):
                    # Convert string ID to integer for Qdrant compatibility
                    original_id = chunk.get("id", f"doc_{i}_{chunk_idx}")
                    doc_id = hash(original_id) % (2**63)  # Convert to positive int64
                    
                    # Prepare metadata
                    metadata = {
                        "source": chunk.get("source", "unknown"),
                        "url": chunk.get("url", ""),
                        "page": chunk.get("page", 1),
                        "timestamp": chunk.get("timestamp", ""),
                        "company_size": chunk.get("company_size", "startup")
                    }
                    
                    # Add any additional metadata
                    for key, value in chunk.items():
                        if key not in ["id", "chunk", "text"]:
                            metadata[key] = value
                    
                    # Use chunk content (try different field names)
                    chunk_text = chunk.get("chunk") or chunk.get("text") or chunk.get("content")
                    
                    if not chunk_text:
                        logger.warning(f"No text content found for chunk {doc_id}")
                        failed_count += 1
                        continue
                    
                    documents.append({
                        "id": doc_id,
                        "text": chunk_text,
                        "metadata": {
                            **metadata,
                            "original_id": original_id,  # Keep original ID for reference
                            "chunk_index": chunk.get("chunk_index", chunk_idx),
                            "total_chunks": chunk.get("total_chunks", 1)
                        }
                    })
                
                # Store batch in Qdrant
                if documents:
                    result = self.qdrant_manager.batch_store_documents(documents)
                    success_count += result.get("success", 0)
                    failed_count += result.get("failed", 0)
                    
                    logger.info(f"Batch {i//batch_size + 1}: {result}")
            
            # Save embedding metadata if requested
            if output_file:
                self._save_embedding_metadata(output_file, {
                    "total_chunks": len(chunks_data),
                    "success_count": success_count,
                    "failed_count": failed_count,
                    "collection_name": self.collection_name,
                    "qdrant_url": self.qdrant_url
                })
            
            # Get final collection stats
            stats = self.qdrant_manager.get_collection_stats()
            logger.info(f"Collection stats: {stats}")
            
            logger.info(f"Embedding complete: {success_count} successful, {failed_count} failed")
            return failed_count == 0
            
        except Exception as e:
            logger.error(f"Failed to embed documents: {e}")
            return False
    
    def _save_embedding_metadata(self, output_file: str, metadata: Dict[str, Any]):
        """Save embedding metadata to file."""
        try:
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved embedding metadata to {output_file}")
            
        except Exception as e:
            logger.error(f"Failed to save embedding metadata: {e}")
    
    def search_documents(self, 
                        query: str, 
                        limit: int = 10,
                        score_threshold: float = 0.7,
                        filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Search for similar documents.
        
        Args:
            query: Search query
            limit: Maximum number of results
            score_threshold: Minimum similarity score
            filters: Optional metadata filters
            
        Returns:
            List of similar documents with scores and metadata
        """
        try:
            results = self.qdrant_manager.retrieve_similar_docs(
                query=query,
                limit=limit,
                score_threshold=score_threshold,
                filters=filters
            )
            
            logger.info(f"Found {len(results)} similar documents for query: '{query[:50]}...'")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            return []
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        return self.qdrant_manager.get_collection_stats()
    
    def clear_collection(self) -> bool:
        """Clear all documents from collection."""
        try:
            return self.qdrant_manager.delete_collection()
        except Exception as e:
            logger.error(f"Failed to clear collection: {e}")
            return False
    
    def recreate_collection(self) -> bool:
        """Recreate collection (useful for schema changes)."""
        try:
            # Delete existing collection
            self.qdrant_manager.delete_collection()
            
            # Create new manager to recreate collection
            self.qdrant_manager = QdrantManager(
                qdrant_url=self.qdrant_url,
                api_key=self.api_key,
                collection_name=self.collection_name
            )
            
            logger.info("Collection recreated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to recreate collection: {e}")
            return False


def main():
    """Example usage of QdrantDocumentEmbedder."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("🚀 FoundryStack Qdrant Document Embedder")
    
    try:
        # Initialize embedder
        embedder = QdrantDocumentEmbedder()
        
        # Test connection
        stats = embedder.get_collection_stats()
        logger.info(f"✅ Qdrant connection successful: {stats}")
        
        # Example: Embed documents if chunks file exists
        chunks_file = "chunks.json"
        if os.path.exists(chunks_file):
            logger.info(f"Found chunks file: {chunks_file}")
            logger.info("To embed documents, run:")
            logger.info(f"python qdrant_embedder.py --embed {chunks_file}")
        else:
            logger.info("No chunks file found. Create chunks first with crawler/chunker")
        
        # Example search
        search_results = embedder.search_documents(
            query="AI startup fintech",
            limit=3,
            score_threshold=0.5
        )
        
        if search_results:
            logger.info("🔍 Sample search results:")
            for i, result in enumerate(search_results, 1):
                logger.info(f"{i}. Score: {result['score']:.3f}")
                logger.info(f"   Text: {result['text'][:100]}...")
                logger.info(f"   Source: {result['metadata'].get('source', 'unknown')}")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    import sys
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--embed" and len(sys.argv) > 2:
            chunks_file = sys.argv[2]
            
            logging.basicConfig(level=logging.INFO)
            embedder = QdrantDocumentEmbedder()
            
            # Embed documents
            success = embedder.embed_documents(chunks_file)
            sys.exit(0 if success else 1)
    
    # Run main function
    sys.exit(main())
