# Qdrant Migration Guide

This document outlines the migration from Supabase/pgvector to Qdrant vector database for the FoundryStack RAG pipeline.

## 🎯 Migration Overview

**Status:** ✅ **Phase 1 Complete** - Data Pipeline Migration

### What Was Migrated:
- ✅ **QdrantManager** - Production-ready Qdrant interface
- ✅ **QdrantDocumentEmbedder** - Document embedding with Qdrant
- ✅ **Pipeline Runner** - Updated to use Qdrant
- ✅ **Requirements** - Updated dependencies

### What Needs Migration:
- 🔄 **Web App Database** - Replace Supabase client/server
- 🔄 **Environment Variables** - Update configuration
- 🔄 **Documentation** - Update setup guides

## 🚀 Quick Setup

### Option 1: Local Qdrant (Recommended)

1. **Install Docker Desktop**
2. **Start Qdrant:**
   ```bash
   docker run -d -p 6333:6333 -p 6334:6334 qdrant/qdrant
   ```

3. **Test Connection:**
   ```bash
   python data-pipeline/test_qdrant.py
   ```

### Option 2: Qdrant Cloud

1. **Sign up:** https://qdrant.tech
2. **Get credentials:** URL and API key
3. **Set environment variables:**
   ```bash
   $env:QDRANT_URL="https://your-cluster.qdrant.tech"
   $env:QDRANT_API_KEY="your-api-key"
   ```

## 📁 New Files Created

### Core Components:
- `data-pipeline/qdrant_manager.py` - Qdrant interface
- `data-pipeline/qdrant_embedder.py` - Document embedder
- `data-pipeline/test_qdrant.py` - Connection test

### Updated Files:
- `data-pipeline/requirements.txt` - Added qdrant-client
- `data-pipeline/run_pipeline.py` - Uses Qdrant embedder

## 🔧 Usage Examples

### Basic Usage:
```python
from qdrant_manager import QdrantManager

# Initialize
manager = QdrantManager()

# Store document
manager.store_document(
    document_id="doc-1",
    text="AI startup fintech solution",
    metadata={"source": "techcrunch", "url": "https://..."}
)

# Search
results = manager.retrieve_similar_docs(
    query="AI startup",
    limit=5,
    score_threshold=0.7
)
```

### Pipeline Usage:
```bash
# Run full pipeline
python data-pipeline/run_pipeline.py --step all

# Embed documents only
python data-pipeline/run_pipeline.py --step embed --force
```

## 🌟 Benefits of Qdrant Migration

### Performance:
- ⚡ **Faster vector search** - Optimized for embeddings
- 📈 **Better scalability** - Handles millions of vectors
- 🔍 **Advanced filtering** - Metadata + vector search

### Reliability:
- ✅ **No IPv4 issues** - Works with any network
- 🛡️ **Better error handling** - Production-ready
- 🔄 **Easy backup/restore** - Built-in snapshots

### Developer Experience:
- 🎯 **Simple API** - Less configuration
- 📚 **Better documentation** - Clear examples
- 🐳 **Docker support** - Easy local development

## 🔄 Migration Status

### ✅ Completed (Phase 1):
- [x] Create QdrantManager class
- [x] Create QdrantDocumentEmbedder 
- [x] Update pipeline runner
- [x] Update requirements.txt
- [x] Create test script
- [x] Add error handling and logging

### 🔄 In Progress (Phase 2):
- [ ] Replace Supabase client/server in web app
- [ ] Update environment variables
- [ ] Update documentation
- [ ] Test integration with agents

### 📋 Next Steps:
1. **Start Qdrant** (local or cloud)
2. **Test pipeline:** `python data-pipeline/test_qdrant.py`
3. **Run crawler:** `python data-pipeline/run_pipeline.py --step crawl`
4. **Embed documents:** `python data-pipeline/run_pipeline.py --step embed`

## 🆚 Before vs After

### Before (Supabase/pgvector):
```python
# Complex Setup
embedder = DocumentEmbedder({
    "host": "db.xyz.supabase.co",
    "port": "5432", 
    "user": "postgres",
    "password": "password",
    "dbname": "postgres"
})
```

### After (Qdrant):
```python
# Simple Setup
manager = QdrantManager()  # Uses default localhost:6333
# OR
manager = QdrantManager(
    qdrant_url="https://cloud.qdrant.tech",
    api_key="your-key"
)
```

## 🐛 Troubleshooting

### Connection Issues:
```
❌ [WinError 10061] No connection could be made
Solution: Start Qdrant - docker run -d -p 6333:6333 qdrant/qdrant
```

### Dependency Issues:
```
❌ No module named 'qdrant_client'
Solution: pip install qdrant-client sentence-transformers
```

### Performance Issues:
```
❌ Slow embeddings
Solution: Use batch processing with embedder.embed_documents()
```

## 📞 Support

- **Qdrant Docs:** https://qdrant.tech/documentation
- **Issues:** Check `data-pipeline/test_qdrant.py` output
- **Cloud Setup:** https://qdrant.tech/cloud

---

**Migration Date:** January 26, 2025  
**Status:** ✅ Data Pipeline Complete, 🔄 Web App Pending
