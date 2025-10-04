"""
Document Chunker for RAG Pipeline

Splits crawled documents into semantic chunks with overlap for context continuity.
Optimized for sentence-transformers/all-MiniLM-L6-v2 (384 dimensions).
"""

from typing import List, Dict, Any
import json
import os
import re
from datetime import datetime
import hashlib


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Splits text into chunks with overlap for context continuity.
    
    Args:
        text: Input text to chunk
        chunk_size: Target number of words per chunk
        overlap: Number of words to overlap between chunks
    
    Returns:
        List of text chunks
    """
    if not text or len(text.strip()) == 0:
        return []
    
    # Clean and normalize text
    text = re.sub(r'\s+', ' ', text.strip())
    words = text.split()
    
    if len(words) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        
        # Only add chunk if it has meaningful content
        if len(chunk.strip()) > 50:  # Minimum chunk size
            chunks.append(chunk.strip())
        
        # Move start position with overlap
        start += chunk_size - overlap
        
        # Prevent infinite loop
        if start >= len(words):
            break
    
    return chunks


def chunk_document(doc: Dict[str, Any], chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Chunk a single document into multiple chunks with metadata.
    
    Args:
        doc: Document dictionary with 'content', 'source', 'url', etc.
        chunk_size: Target number of words per chunk
        overlap: Number of words to overlap between chunks
    
    Returns:
        List of chunk dictionaries
    """
    content = doc.get("content", "")
    if not content:
        return []
    
    chunks = chunk_text(content, chunk_size, overlap)
    chunked_docs = []
    
    for i, chunk in enumerate(chunks):
        # Create unique chunk ID
        chunk_id = f"{doc.get('id', 'unknown')}_chunk_{i}"
        
        chunked_doc = {
            "id": chunk_id,
            "parent_id": doc.get("id"),
            "source": doc.get("source", "unknown"),
            "url": doc.get("url", ""),
            "title": doc.get("title", ""),
            "content": chunk,
            "chunk_index": i,
            "total_chunks": len(chunks),
            "word_count": len(chunk.split()),
            "chunked_at": datetime.now().isoformat(),
            "type": doc.get("type", "unknown"),
            "crawled_at": doc.get("crawled_at", "")
        }
        
        chunked_docs.append(chunked_doc)
    
    return chunked_docs


def process_documents(input_file: str, output_file: str, chunk_size: int = 500, overlap: int = 50) -> Dict[str, Any]:
    """
    Process crawled documents: read JSON, split into chunks, save new JSON.
    
    Args:
        input_file: Path to input JSON file (crawled_docs_enhanced.json)
        output_file: Path to output JSON file (chunks.json)
        chunk_size: Target number of words per chunk
        overlap: Number of words to overlap between chunks
    
    Returns:
        Processing statistics
    """
    print(f"Loading documents from {input_file}...")
    
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Handle both old format (list) and new format (with metadata)
    if isinstance(data, list):
        documents = data
        metadata = {"total_documents": len(documents)}
    else:
        documents = data.get("documents", [])
        metadata = data.get("metadata", {})
    
    print(f"Processing {len(documents)} documents...")
    
    all_chunks = []
    processing_stats = {
        "total_documents": len(documents),
        "total_chunks": 0,
        "chunks_by_source": {},
        "chunks_by_type": {},
        "average_chunks_per_doc": 0,
        "chunk_size": chunk_size,
        "overlap": overlap,
        "processed_at": datetime.now().isoformat()
    }
    
    for i, doc in enumerate(documents):
        if i % 10 == 0:
            print(f"Processing document {i+1}/{len(documents)}...")
        
        chunks = chunk_document(doc, chunk_size, overlap)
        all_chunks.extend(chunks)
        
        # Update statistics
        source = doc.get("source", "unknown")
        doc_type = doc.get("type", "unknown")
        
        processing_stats["chunks_by_source"][source] = processing_stats["chunks_by_source"].get(source, 0) + len(chunks)
        processing_stats["chunks_by_type"][doc_type] = processing_stats["chunks_by_type"].get(doc_type, 0) + len(chunks)
    
    processing_stats["total_chunks"] = len(all_chunks)
    processing_stats["average_chunks_per_doc"] = len(all_chunks) / len(documents) if documents else 0
    
    # Create output data structure
    output_data = {
        "metadata": {
            **metadata,
            "processing_stats": processing_stats
        },
        "chunks": all_chunks
    }
    
    print(f"Saving {len(all_chunks)} chunks to {output_file}...")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print("Chunking complete!")
    print(f"Total documents: {processing_stats['total_documents']}")
    print(f"Total chunks: {processing_stats['total_chunks']}")
    print(f"Average chunks per document: {processing_stats['average_chunks_per_doc']:.2f}")
    print(f"Chunks by source: {processing_stats['chunks_by_source']}")
    print(f"Chunks by type: {processing_stats['chunks_by_type']}")
    
    return processing_stats


def validate_chunks(chunks_file: str) -> bool:
    """
    Validate the chunked documents for quality and consistency.
    
    Args:
        chunks_file: Path to chunks JSON file
    
    Returns:
        True if validation passes, False otherwise
    """
    print(f"Validating chunks in {chunks_file}...")
    
    with open(chunks_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    chunks = data.get("chunks", [])
    
    if not chunks:
        print("ERROR: No chunks found!")
        return False
    
    # Validation checks
    issues = []
    
    for i, chunk in enumerate(chunks):
        # Check required fields
        required_fields = ["id", "content", "source", "word_count"]
        for field in required_fields:
            if field not in chunk:
                issues.append(f"Chunk {i}: Missing required field '{field}'")
        
        # Check content quality
        content = chunk.get("content", "")
        word_count = chunk.get("word_count", 0)
        
        if len(content.strip()) < 10:
            issues.append(f"Chunk {i}: Content too short ({len(content)} chars)")
        
        if word_count < 5:
            issues.append(f"Chunk {i}: Word count too low ({word_count} words)")
        
        # Check for empty or whitespace-only content
        if not content.strip():
            issues.append(f"Chunk {i}: Empty content")
    
    if issues:
        print(f"Validation failed with {len(issues)} issues:")
        for issue in issues[:10]:  # Show first 10 issues
            print(f"  - {issue}")
        if len(issues) > 10:
            print(f"  ... and {len(issues) - 10} more issues")
        return False
    
    print("Validation passed! All chunks look good.")
    return True


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Chunk documents for RAG pipeline")
    parser.add_argument("--input", "-i", default="crawled_docs_enhanced.json", 
                       help="Input JSON file (default: crawled_docs_enhanced.json)")
    parser.add_argument("--output", "-o", default="chunks.json", 
                       help="Output JSON file (default: chunks.json)")
    parser.add_argument("--chunk-size", "-s", type=int, default=500, 
                       help="Target words per chunk (default: 500)")
    parser.add_argument("--overlap", "-p", type=int, default=50, 
                       help="Words overlap between chunks (default: 50)")
    parser.add_argument("--validate", "-v", action="store_true", 
                       help="Validate chunks after processing")
    
    args = parser.parse_args()
    
    # Check if input file exists
    if not os.path.exists(args.input):
        print(f"ERROR: Input file '{args.input}' not found!")
        print("Please run the crawler first to generate crawled_docs_enhanced.json")
        exit(1)
    
    # Process documents
    stats = process_documents(args.input, args.output, args.chunk_size, args.overlap)
    
    # Validate if requested
    if args.validate:
        validate_chunks(args.output)
