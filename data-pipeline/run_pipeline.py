"""
Complete RAG Pipeline Runner

Orchestrates the entire pipeline: crawl -> chunk -> embed -> store
"""

import os
import sys
import json
import argparse
from datetime import datetime
from typing import Dict, Any

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crawler.enhanced_crawler import EnhancedCrawler
from chunker import process_documents, validate_chunks
from embedder import DocumentEmbedder, process_chunks_file


class RAGPipeline:
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the RAG pipeline.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or {}
        self.pipeline_stats = {
            "start_time": datetime.now().isoformat(),
            "steps_completed": [],
            "errors": []
        }
    
    def run_crawler(self, force: bool = False) -> bool:
        """
        Run the web crawler to collect documents.
        
        Args:
            force: Force re-crawling even if output exists
        
        Returns:
            True if successful, False otherwise
        """
        print("\n" + "="*50)
        print("STEP 1: CRAWLING DOCUMENTS")
        print("="*50)
        
        output_file = "crawled_docs_enhanced.json"
        
        if os.path.exists(output_file) and not force:
            print(f"Output file {output_file} already exists. Use --force to re-crawl.")
            self.pipeline_stats["steps_completed"].append("crawler")
            return True
        
        try:
            crawler = EnhancedCrawler()
            documents = crawler.crawl_all()
            
            if documents:
                print(f"✅ Crawling completed: {len(documents)} documents collected")
                self.pipeline_stats["steps_completed"].append("crawler")
                return True
            else:
                print("❌ Crawling failed: No documents collected")
                self.pipeline_stats["errors"].append("crawler: No documents collected")
                return False
                
        except Exception as e:
            print(f"❌ Crawling failed: {e}")
            self.pipeline_stats["errors"].append(f"crawler: {e}")
            return False
    
    def run_chunker(self, force: bool = False) -> bool:
        """
        Run the document chunker.
        
        Args:
            force: Force re-chunking even if output exists
        
        Returns:
            True if successful, False otherwise
        """
        print("\n" + "="*50)
        print("STEP 2: CHUNKING DOCUMENTS")
        print("="*50)
        
        input_file = "crawled_docs_enhanced.json"
        output_file = "chunks.json"
        
        if not os.path.exists(input_file):
            print(f"❌ Input file {input_file} not found. Run crawler first.")
            self.pipeline_stats["errors"].append("chunker: Input file not found")
            return False
        
        if os.path.exists(output_file) and not force:
            print(f"Output file {output_file} already exists. Use --force to re-chunk.")
            self.pipeline_stats["steps_completed"].append("chunker")
            return True
        
        try:
            chunk_size = self.config.get("chunk_size", 500)
            overlap = self.config.get("overlap", 50)
            
            stats = process_documents(input_file, output_file, chunk_size, overlap)
            
            if stats["total_chunks"] > 0:
                print(f"✅ Chunking completed: {stats['total_chunks']} chunks created")
                self.pipeline_stats["steps_completed"].append("chunker")
                return True
            else:
                print("❌ Chunking failed: No chunks created")
                self.pipeline_stats["errors"].append("chunker: No chunks created")
                return False
                
        except Exception as e:
            print(f"❌ Chunking failed: {e}")
            self.pipeline_stats["errors"].append(f"chunker: {e}")
            return False
    
    def run_embedder(self, force: bool = False) -> bool:
        """
        Run the document embedder.
        
        Args:
            force: Force re-embedding even if data exists
        
        Returns:
            True if successful, False otherwise
        """
        print("\n" + "="*50)
        print("STEP 3: GENERATING EMBEDDINGS")
        print("="*50)
        
        chunks_file = "chunks.json"
        
        if not os.path.exists(chunks_file):
            print(f"❌ Chunks file {chunks_file} not found. Run chunker first.")
            self.pipeline_stats["errors"].append("embedder: Chunks file not found")
            return False
        
        try:
            # Check if we should skip embedding (data already exists)
            if not force:
                embedder = DocumentEmbedder()
                try:
                    db_stats = embedder.get_database_stats()
                    if db_stats.get("total_documents", 0) > 0:
                        print(f"Database already contains {db_stats['total_documents']} documents. Use --force to re-embed.")
                        self.pipeline_stats["steps_completed"].append("embedder")
                        return True
                finally:
                    embedder.close()
            
            # Process chunks
            stats = process_chunks_file(chunks_file)
            
            if stats.get("processed", 0) > 0:
                print(f"✅ Embedding completed: {stats['processed']} chunks embedded")
                self.pipeline_stats["steps_completed"].append("embedder")
                return True
            else:
                print("❌ Embedding failed: No chunks processed")
                self.pipeline_stats["errors"].append("embedder: No chunks processed")
                return False
                
        except Exception as e:
            print(f"❌ Embedding failed: {e}")
            self.pipeline_stats["errors"].append(f"embedder: {e}")
            return False
    
    def validate_pipeline(self) -> bool:
        """
        Validate the entire pipeline.
        
        Returns:
            True if validation passes, False otherwise
        """
        print("\n" + "="*50)
        print("VALIDATION")
        print("="*50)
        
        validation_passed = True
        
        # Validate chunks
        if os.path.exists("chunks.json"):
            if not validate_chunks("chunks.json"):
                validation_passed = False
        
        # Validate database
        try:
            embedder = DocumentEmbedder()
            try:
                db_stats = embedder.get_database_stats()
                if db_stats.get("total_documents", 0) == 0:
                    print("❌ Database validation failed: No documents found")
                    validation_passed = False
                else:
                    print(f"✅ Database validation passed: {db_stats['total_documents']} documents")
            finally:
                embedder.close()
        except Exception as e:
            print(f"❌ Database validation failed: {e}")
            validation_passed = False
        
        return validation_passed
    
    def run_full_pipeline(self, force: bool = False) -> bool:
        """
        Run the complete RAG pipeline.
        
        Args:
            force: Force re-processing of all steps
        
        Returns:
            True if successful, False otherwise
        """
        print("🚀 Starting RAG Pipeline")
        print(f"Force mode: {force}")
        print(f"Start time: {self.pipeline_stats['start_time']}")
        
        success = True
        
        # Step 1: Crawl
        if not self.run_crawler(force):
            success = False
        
        # Step 2: Chunk
        if success and not self.run_chunker(force):
            success = False
        
        # Step 3: Embed
        if success and not self.run_embedder(force):
            success = False
        
        # Validation
        if success:
            if not self.validate_pipeline():
                success = False
        
        # Final stats
        self.pipeline_stats["end_time"] = datetime.now().isoformat()
        self.pipeline_stats["success"] = success
        
        print("\n" + "="*50)
        print("PIPELINE SUMMARY")
        print("="*50)
        
        if success:
            print("✅ Pipeline completed successfully!")
        else:
            print("❌ Pipeline failed!")
        
        print(f"Steps completed: {', '.join(self.pipeline_stats['steps_completed'])}")
        if self.pipeline_stats["errors"]:
            print(f"Errors: {len(self.pipeline_stats['errors'])}")
            for error in self.pipeline_stats["errors"]:
                print(f"  - {error}")
        
        # Save pipeline stats
        with open("pipeline_stats.json", "w") as f:
            json.dump(self.pipeline_stats, f, indent=2)
        
        return success


def main():
    """Main entry point for the pipeline."""
    parser = argparse.ArgumentParser(description="RAG Pipeline Runner")
    parser.add_argument("--step", choices=["crawl", "chunk", "embed", "all"], 
                       default="all", help="Pipeline step to run")
    parser.add_argument("--force", action="store_true", 
                       help="Force re-processing of existing files")
    parser.add_argument("--chunk-size", type=int, default=500, 
                       help="Chunk size in words (default: 500)")
    parser.add_argument("--overlap", type=int, default=50, 
                       help="Chunk overlap in words (default: 50)")
    parser.add_argument("--config", type=str, 
                       help="Path to configuration JSON file")
    
    args = parser.parse_args()
    
    # Load configuration
    config = {
        "chunk_size": args.chunk_size,
        "overlap": args.overlap
    }
    
    if args.config and os.path.exists(args.config):
        with open(args.config, "r") as f:
            config.update(json.load(f))
    
    # Initialize pipeline
    pipeline = RAGPipeline(config)
    
    # Run selected step
    if args.step == "crawl":
        success = pipeline.run_crawler(args.force)
    elif args.step == "chunk":
        success = pipeline.run_chunker(args.force)
    elif args.step == "embed":
        success = pipeline.run_embedder(args.force)
    elif args.step == "all":
        success = pipeline.run_full_pipeline(args.force)
    else:
        print(f"Unknown step: {args.step}")
        success = False
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
