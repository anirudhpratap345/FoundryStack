"""
Document Embedder for RAG Pipeline

Generates embeddings using sentence-transformers and stores them in Supabase pgvector.
Uses the free all-MiniLM-L6-v2 model (384 dimensions) for fast, accurate embeddings.
"""

import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import numpy as np
from datetime import datetime
import logging
from urllib.parse import urlparse

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # dotenv is optional; continue if not available
    pass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model configuration
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384


class DocumentEmbedder:
    def __init__(self, supabase_config: Optional[Dict[str, str]] = None):
        """
        Initialize the document embedder.
        
        Args:
            supabase_config: Dictionary with Supabase connection details
        """
        self.model = None
        self.connection = None
        self.cursor = None
        
        # Load embedding model
        self._load_model()
        
        # Setup database connection
        self._setup_database(supabase_config)
    
    def _load_model(self):
        """Load the sentence transformer model."""
        logger.info(f"Loading embedding model: {MODEL_NAME}")
        try:
            self.model = SentenceTransformer(MODEL_NAME)
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def _setup_database(self, supabase_config: Optional[Dict[str, str]] = None):
        """Setup database connection and create tables if needed."""
        if supabase_config is None:
            # Prefer a single DATABASE_URL / SUPABASE_URL if provided
            database_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_URL")
            if database_url:
                supabase_config = {"dsn": database_url}
            else:
                # Fallback to discrete vars
                supabase_config = {
                    "host": os.getenv("SUPABASE_HOST"),
                    "dbname": os.getenv("SUPABASE_DB", "postgres"),
                    "user": os.getenv("SUPABASE_USER"),
                    "password": os.getenv("SUPABASE_PASSWORD"),
                    "port": os.getenv("SUPABASE_PORT", "5432")
                }
        
        # Validate required config
        # If DSN provided, use it straight away
        if "dsn" in supabase_config:
            conn_args = {"dsn": supabase_config["dsn"]}
        else:
            required_fields = ["host", "user", "password"]
            missing_fields = [field for field in required_fields if not supabase_config.get(field)]
            if missing_fields:
                logger.error(f"Missing required Supabase config: {missing_fields}")
                logger.info("Provide DATABASE_URL/SUPABASE_URL or set SUPABASE_HOST, SUPABASE_USER, SUPABASE_PASSWORD")
                raise ValueError(f"Missing required config: {missing_fields}")
            conn_args = dict(
                host=supabase_config["host"],
                dbname=supabase_config.get("dbname", "postgres"),
                user=supabase_config["user"],
                password=supabase_config["password"],
                port=supabase_config.get("port", "5432"),
            )
        
        try:
            logger.info("Connecting to Supabase...")
            
            # Test connection with timeout
            import socket
            if "dsn" in conn_args:
                # Parse DSN to get host/port for testing
                parsed = urlparse(conn_args["dsn"])
                host = parsed.hostname
                port = parsed.port or 5432
            else:
                host = conn_args["host"]
                port = int(conn_args["port"])
            
            # Test TCP connection first
            logger.info(f"Testing connection to {host}:{port}...")
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            try:
                result = sock.connect_ex((host, port))
                if result != 0:
                    logger.error(f"TCP connection failed to {host}:{port} (error code: {result})")
                    logger.error("Check if Supabase is running and accessible from your network")
                    raise ConnectionError(f"Cannot reach {host}:{port}")
                logger.info("TCP connection successful")
            finally:
                sock.close()
            
            # Now try PostgreSQL connection
            self.connection = psycopg2.connect(**conn_args)
            self.cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            logger.info("Connected to Supabase successfully!")
            
            # Create tables
            self._create_tables()
            
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {e}")
            logger.error("Troubleshooting tips:")
            logger.error("1. Check if your Supabase project is active")
            logger.error("2. Verify the connection string/host is correct")
            logger.error("3. Check if your IP is whitelisted in Supabase")
            logger.error("4. Try connecting from Supabase dashboard first")
            raise
    
    def _create_tables(self):
        """Create the documents table with pgvector support."""
        logger.info("Creating documents table...")
        
        # Enable pgvector extension
        self.cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # Create documents table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            parent_id TEXT,
            source TEXT NOT NULL,
            url TEXT,
            title TEXT,
            content TEXT NOT NULL,
            embedding VECTOR(%s),
            chunk_index INTEGER,
            total_chunks INTEGER,
            word_count INTEGER,
            type TEXT,
            crawled_at TIMESTAMP,
            chunked_at TIMESTAMP,
            embedded_at TIMESTAMP DEFAULT NOW()
        );
        """ % EMBEDDING_DIMENSION
        
        self.cursor.execute(create_table_sql)
        
        # Create indexes for better performance
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);",
            "CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);",
            "CREATE INDEX IF NOT EXISTS idx_documents_embedded_at ON documents(embedded_at);",
            "CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);"
        ]
        
        for index_sql in indexes:
            self.cursor.execute(index_sql)
        
        self.connection.commit()
        logger.info("Tables created successfully!")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text to embed
        
        Returns:
            List of embedding values
        """
        try:
            embedding = self.model.encode(text, convert_to_tensor=False)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    def embed_and_store_chunk(self, chunk: Dict[str, Any]) -> bool:
        """
        Generate embedding for a chunk and store it in the database.
        
        Args:
            chunk: Chunk dictionary with content and metadata
        
        Returns:
            True if successful, False otherwise
        """
        try:
            content = chunk.get("content", "")
            if not content:
                logger.warning(f"Empty content for chunk {chunk.get('id')}")
                return False
            
            # Generate embedding
            embedding = self.generate_embedding(content)
            
            # Prepare data for insertion
            insert_data = (
                chunk.get("id"),
                chunk.get("parent_id"),
                chunk.get("source", "unknown"),
                chunk.get("url", ""),
                chunk.get("title", ""),
                content,
                embedding,
                chunk.get("chunk_index"),
                chunk.get("total_chunks"),
                chunk.get("word_count", 0),
                chunk.get("type", "unknown"),
                chunk.get("crawled_at"),
                chunk.get("chunked_at")
            )
            
            # Insert into database
            insert_sql = """
            INSERT INTO documents (
                id, parent_id, source, url, title, content, embedding,
                chunk_index, total_chunks, word_count, type, crawled_at, chunked_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            ) ON CONFLICT (id) DO UPDATE SET
                content = EXCLUDED.content,
                embedding = EXCLUDED.embedding,
                embedded_at = NOW()
            """
            
            self.cursor.execute(insert_sql, insert_data)
            return True
            
        except Exception as e:
            logger.error(f"Failed to embed and store chunk {chunk.get('id')}: {e}")
            return False
    
    def embed_and_store_chunks(self, chunks: List[Dict[str, Any]], batch_size: int = 100) -> Dict[str, Any]:
        """
        Process multiple chunks and store them in the database.
        
        Args:
            chunks: List of chunk dictionaries
            batch_size: Number of chunks to process in each batch
        
        Returns:
            Processing statistics
        """
        logger.info(f"Processing {len(chunks)} chunks...")
        
        stats = {
            "total_chunks": len(chunks),
            "processed": 0,
            "failed": 0,
            "skipped": 0,
            "start_time": datetime.now().isoformat()
        }
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(len(chunks) + batch_size - 1)//batch_size}")
            
            for chunk in batch:
                try:
                    # Check if chunk already exists
                    chunk_id = chunk.get("id")
                    if chunk_id:
                        self.cursor.execute("SELECT id FROM documents WHERE id = %s", (chunk_id,))
                        if self.cursor.fetchone():
                            stats["skipped"] += 1
                            continue
                    
                    # Process chunk
                    if self.embed_and_store_chunk(chunk):
                        stats["processed"] += 1
                    else:
                        stats["failed"] += 1
                        
                except Exception as e:
                    logger.error(f"Error processing chunk {chunk.get('id')}: {e}")
                    stats["failed"] += 1
            
            # Commit batch
            self.connection.commit()
            
            # Progress update
            if (i + batch_size) % (batch_size * 5) == 0:
                logger.info(f"Progress: {stats['processed']}/{stats['total_chunks']} processed")
        
        stats["end_time"] = datetime.now().isoformat()
        stats["success_rate"] = stats["processed"] / stats["total_chunks"] if stats["total_chunks"] > 0 else 0
        
        logger.info(f"Embedding complete!")
        logger.info(f"Processed: {stats['processed']}")
        logger.info(f"Failed: {stats['failed']}")
        logger.info(f"Skipped: {stats['skipped']}")
        logger.info(f"Success rate: {stats['success_rate']:.2%}")
        
        return stats
    
    def search_similar_chunks(self, query: str, limit: int = 10, similarity_threshold: float = 0.7) -> List[Dict[str, Any]]:
        """
        Search for similar chunks using vector similarity.
        
        Args:
            query: Search query
            limit: Maximum number of results
            similarity_threshold: Minimum similarity score
        
        Returns:
            List of similar chunks with metadata
        """
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Search for similar chunks
            search_sql = """
            SELECT 
                id, parent_id, source, url, title, content, 
                chunk_index, total_chunks, word_count, type,
                1 - (embedding <=> %s) as similarity
            FROM documents 
            WHERE 1 - (embedding <=> %s) > %s
            ORDER BY embedding <=> %s
            LIMIT %s
            """
            
            self.cursor.execute(search_sql, (query_embedding, query_embedding, similarity_threshold, query_embedding, limit))
            results = self.cursor.fetchall()
            
            return [dict(row) for row in results]
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get statistics about the documents in the database."""
        try:
            stats = {}
            
            # Total documents
            self.cursor.execute("SELECT COUNT(*) as total FROM documents")
            stats["total_documents"] = self.cursor.fetchone()["total"]
            
            # Documents by source
            self.cursor.execute("SELECT source, COUNT(*) as count FROM documents GROUP BY source ORDER BY count DESC")
            stats["by_source"] = dict(self.cursor.fetchall())
            
            # Documents by type
            self.cursor.execute("SELECT type, COUNT(*) as count FROM documents GROUP BY type ORDER BY count DESC")
            stats["by_type"] = dict(self.cursor.fetchall())
            
            # Average word count
            self.cursor.execute("SELECT AVG(word_count) as avg_words FROM documents")
            stats["average_word_count"] = float(self.cursor.fetchone()["avg_words"] or 0)
            
            # Latest embedding
            self.cursor.execute("SELECT MAX(embedded_at) as latest FROM documents")
            stats["latest_embedding"] = self.cursor.fetchone()["latest"]
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {}
    
    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logger.info("Database connection closed.")


def process_chunks_file(chunks_file: str, supabase_config: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Process a chunks JSON file and store embeddings in the database.
    
    Args:
        chunks_file: Path to chunks JSON file
        supabase_config: Supabase connection configuration
    
    Returns:
        Processing statistics
    """
    logger.info(f"Loading chunks from {chunks_file}...")
    
    with open(chunks_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    chunks = data.get("chunks", [])
    if not chunks:
        logger.error("No chunks found in file!")
        return {}
    
    # Initialize embedder
    embedder = DocumentEmbedder(supabase_config)
    
    try:
        # Process chunks
        stats = embedder.embed_and_store_chunks(chunks)
        
        # Get final database stats
        db_stats = embedder.get_database_stats()
        stats["database_stats"] = db_stats
        
        return stats
        
    finally:
        embedder.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate embeddings and store in pgvector")
    parser.add_argument("--chunks", "-c", default="chunks.json", 
                       help="Input chunks JSON file (default: chunks.json)")
    parser.add_argument("--batch-size", "-b", type=int, default=100, 
                       help="Batch size for processing (default: 100)")
    parser.add_argument("--search", "-s", type=str, 
                       help="Search for similar chunks (optional)")
    parser.add_argument("--limit", "-l", type=int, default=10, 
                       help="Search result limit (default: 10)")
    parser.add_argument("--stats", action="store_true", 
                       help="Show database statistics")
    
    args = parser.parse_args()
    
    # Check if chunks file exists
    if not os.path.exists(args.chunks):
        print(f"ERROR: Chunks file '{args.chunks}' not found!")
        print("Please run the chunker first to generate chunks.json")
        exit(1)
    
    # Initialize embedder
    embedder = DocumentEmbedder()
    
    try:
        if args.search:
            # Search mode
            print(f"Searching for: '{args.search}'")
            results = embedder.search_similar_chunks(args.search, args.limit)
            
            print(f"\nFound {len(results)} similar chunks:")
            for i, result in enumerate(results, 1):
                print(f"\n{i}. {result['title']} (similarity: {result['similarity']:.3f})")
                print(f"   Source: {result['source']}")
                print(f"   Content: {result['content'][:200]}...")
                
        elif args.stats:
            # Stats mode
            stats = embedder.get_database_stats()
            print("\nDatabase Statistics:")
            print(f"Total documents: {stats.get('total_documents', 0)}")
            print(f"Average word count: {stats.get('average_word_count', 0):.1f}")
            print(f"Latest embedding: {stats.get('latest_embedding', 'N/A')}")
            
            print("\nBy source:")
            for source, count in stats.get('by_source', {}).items():
                print(f"  {source}: {count}")
            
            print("\nBy type:")
            for doc_type, count in stats.get('by_type', {}).items():
                print(f"  {doc_type}: {count}")
                
        else:
            # Process mode
            stats = process_chunks_file(args.chunks)
            print(f"\nProcessing complete!")
            print(f"Processed: {stats.get('processed', 0)}")
            print(f"Failed: {stats.get('failed', 0)}")
            print(f"Success rate: {stats.get('success_rate', 0):.2%}")
    
    finally:
        embedder.close()
