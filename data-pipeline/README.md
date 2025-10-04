# FoundryStack RAG Data Pipeline

A complete data pipeline for building a vector database of startup and tech knowledge to power the FoundryStack multi-agent RAG system.

## 🎯 Overview

This pipeline crawls, processes, and embeds documents from multiple sources to create a searchable knowledge base:

1. **Crawler** - Collects documents from news sites, startup directories, and tech docs
2. **Chunker** - Splits documents into semantic chunks with overlap
3. **Embedder** - Generates embeddings using sentence-transformers and stores in Qdrant

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Qdrant (local Docker or cloud account)
- Environment variables set (see Configuration)

### Quick Setup

**Option 1: Local Qdrant (Recommended)**
```bash
# Start Qdrant with Docker
docker run -d -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Test connection
python data-pipeline/test_qdrant.py
```

**Option 2: Qdrant Cloud**
```bash
# Sign up at https://qdrant.tech
# Get your cluster URL and API key
# Set environment variables in Configuration section
```

### Installation

```bash
cd data-pipeline
python -m venv .venv

# Windows PowerShell
. .venv/Scripts/Activate.ps1

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### Configuration

Set these environment variables:

```bash
# Qdrant Configuration (optional - defaults to localhost)
export QDRANT_URL="http://localhost:6333"  # or your cloud URL
export QDRANT_API_KEY="your-api-key"        # for Qdrant Cloud only
```

Or create a `.env` file:

```env
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-api-key  # Only needed for Qdrant Cloud
```

**Note:** No complex database setup required! Qdrant handles all vector operations automatically.

### Run Complete Pipeline

```bash
python run_pipeline.py --step all
```

### Run Individual Steps

```bash
# Step 1: Crawl documents
python run_pipeline.py --step crawl

# Step 2: Chunk documents
python run_pipeline.py --step chunk

# Step 3: Generate embeddings
python run_pipeline.py --step embed
```

## 📁 Pipeline Components

### 1. Enhanced Crawler (`enhanced_crawler.py`)

**Sources:**
- **Tech News**: TechCrunch, The Verge, InfoQ, Hacker News
- **Startup Directories**: YC Companies, ProductHunt
- **Tech Documentation**: Next.js, Supabase, Prisma, FastAPI, Redis

**Features:**
- Ad-free content extraction using newspaper3k
- Robust error handling and retry logic
- Rate limiting to respect target sites
- Content filtering for meaningful text
- Structured output with metadata

**Output:** `crawled_docs_enhanced.json`

### 2. Document Chunker (`chunker.py`)

**Features:**
- Semantic chunking with configurable size and overlap
- Content validation and quality filtering
- Metadata preservation across chunks
- Batch processing for large datasets

**Configuration:**
- `chunk_size`: Target words per chunk (default: 500)
- `overlap`: Words overlap between chunks (default: 50)

**Output:** `chunks.json`

### 3. Document Embedder (`embedder.py`)

**Features:**
- Uses `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- Free, open-source embeddings
- pgvector integration with Supabase
- Batch processing for efficiency
- Similarity search capabilities

**Database Schema:**
```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    parent_id TEXT,
    source TEXT NOT NULL,
    url TEXT,
    title TEXT,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    chunk_index INTEGER,
    total_chunks INTEGER,
    word_count INTEGER,
    type TEXT,
    crawled_at TIMESTAMP,
    chunked_at TIMESTAMP,
    embedded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Usage Examples

### Basic Pipeline Run

```bash
# Run complete pipeline
python run_pipeline.py

# Force re-processing of all steps
python run_pipeline.py --force

# Run with custom chunk size
python run_pipeline.py --chunk-size 750 --overlap 75
```

### Individual Component Usage

```bash
# Crawl only
python enhanced_crawler.py

# Chunk only
python chunker.py --input crawled_docs_enhanced.json --output chunks.json

# Embed only
python embedder.py --chunks chunks.json

# Search similar chunks
python embedder.py --search "AI startup funding" --limit 5

# Show database statistics
python embedder.py --stats
```

### Advanced Configuration

Create a `config.json` file:

```json
{
  "chunk_size": 600,
  "overlap": 60,
  "max_articles_per_site": 15,
  "batch_size": 200
}
```

Run with config:

```bash
python run_pipeline.py --config config.json
```

## 📊 Output Files

### `crawled_docs_enhanced.json`
```json
{
  "metadata": {
    "total_documents": 150,
    "crawl_timestamp": "2024-01-01T12:00:00",
    "sources": ["TechCrunch", "YC Companies", "Next.js"],
    "document_types": ["news", "startup", "documentation"]
  },
  "documents": [
    {
      "id": "abc123def456",
      "source": "TechCrunch",
      "url": "https://techcrunch.com/article",
      "title": "AI Startup Raises $10M",
      "content": "Full article content...",
      "crawled_at": "2024-01-01T12:00:00",
      "word_count": 500,
      "type": "news"
    }
  ]
}
```

### `chunks.json`
```json
{
  "metadata": {
    "processing_stats": {
      "total_documents": 150,
      "total_chunks": 450,
      "average_chunks_per_doc": 3.0,
      "chunks_by_source": {"TechCrunch": 120, "YC Companies": 80},
      "chunks_by_type": {"news": 200, "startup": 150, "documentation": 100}
    }
  },
  "chunks": [
    {
      "id": "abc123def456_chunk_0",
      "parent_id": "abc123def456",
      "source": "TechCrunch",
      "content": "Chunk content...",
      "chunk_index": 0,
      "total_chunks": 3,
      "word_count": 500
    }
  ]
}
```

## 🔍 Search and Query

### Similarity Search

```python
from embedder import DocumentEmbedder

embedder = DocumentEmbedder()

# Search for similar chunks
results = embedder.search_similar_chunks(
    query="AI startup funding trends",
    limit=10,
    similarity_threshold=0.7
)

for result in results:
    print(f"Similarity: {result['similarity']:.3f}")
    print(f"Title: {result['title']}")
    print(f"Content: {result['content'][:200]}...")
    print()
```

### Database Statistics

```python
stats = embedder.get_database_stats()
print(f"Total documents: {stats['total_documents']}")
print(f"By source: {stats['by_source']}")
print(f"By type: {stats['by_type']}")
```

## 🛠️ Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Check environment variables
   - Ensure pgvector extension is enabled
   - Verify network connectivity

2. **No Documents Crawled**
   - Check internet connection
   - Verify target sites are accessible
   - Check for rate limiting

3. **Embedding Generation Failed**
   - Ensure sentence-transformers is installed
   - Check available memory
   - Verify model download

4. **Chunking Issues**
   - Adjust chunk_size and overlap parameters
   - Check input file format
   - Verify content quality

### Debug Mode

```bash
# Enable verbose logging
export PYTHONPATH=.
python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
from run_pipeline import RAGPipeline
pipeline = RAGPipeline()
pipeline.run_full_pipeline()
"
```

## 📈 Performance Optimization

### Batch Processing
- Adjust `batch_size` in embedder for memory optimization
- Use `--batch-size` parameter for large datasets

### Memory Management
- Process documents in smaller batches
- Use `chunk_size` to control memory usage
- Monitor system resources during processing

### Database Optimization
- Create indexes on frequently queried columns
- Use connection pooling for high-throughput scenarios
- Consider partitioning for very large datasets

## 🔒 Security Considerations

- Store Supabase credentials securely
- Use environment variables, not hardcoded values
- Implement proper access controls
- Regular security updates for dependencies

## 📝 License

This pipeline is part of the FoundryStack project and follows the same license terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the logs for error details
- Open an issue on GitHub
