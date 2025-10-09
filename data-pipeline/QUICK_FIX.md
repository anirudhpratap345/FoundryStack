# 🚨 QUICK FIX: Restore Qdrant Connection

## Problem
Qdrant vector database is returning `403 Forbidden`, causing:
- Zero embeddings stored (vectors_count = 0)
- Empty context retrieval
- Similar blueprints across all industries

## Solution Steps

### Step 1: Check if you have Qdrant credentials

```bash
# Do you have a Qdrant Cloud account?
# If NO: Sign up at https://qdrant.tech/ (free tier available)
# If YES: Get your cluster URL and API key from dashboard
```

### Step 2: Create `.env` file in project root

```bash
# Navigate to project root
cd D:\FoundryStack\foundry-stack

# Create .env file with your actual credentials
# Replace placeholders with real values!
```

**Create file:** `.env`
```env
# Qdrant Configuration (REPLACE WITH REAL VALUES!)
QDRANT_URL=https://your-cluster-xxx.us-east.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your_actual_qdrant_api_key_here

# Gemini API Key (already working, but add if missing)
GEMINI_API_KEY=your_actual_gemini_api_key
```

### Step 3: Test Qdrant connection
 
```bash
cd data-pipeline
python test_qdrant.py
```

**Expected output:**
```
✅ Qdrant connection test passed!
```

**If you see 403 error:**
- Double-check `QDRANT_URL` (must include `https://`)
- Double-check `QDRANT_API_KEY` (copy from Qdrant dashboard)
- Check if your IP is whitelisted in Qdrant Cloud settings

### Step 4: Embed the existing chunks

```bash
# Still in data-pipeline directory
python qdrant_embedder.py --embed chunks.json
```

**Expected output:**
```
Processing 12 chunks...
Batch stored 12 documents
Embedding complete: 12 successful, 0 failed
```

### Step 5: Verify embeddings are stored

```bash
python -c "from qdrant_manager import QdrantManager; mgr = QdrantManager(); stats = mgr.get_collection_stats(); print(f'Vectors stored: {stats.get(\"vectors_count\", 0)}')"
```

**Expected:**
```
Vectors stored: 12
```

### Step 6: Test retrieval

```bash
python retriever_agent.py
```

**Expected output:**
```
✅ Retriever Agent initialized
📊 Results: 3 (or more)
🎯 Confidence: 0.7+ (or similar)
```

### Step 7: Restart pipeline API

```bash
cd ..
cd data-pipeline
python pipeline_api.py
```

### Step 8: Test end-to-end

```bash
# In a new terminal
curl -X POST http://localhost:8015/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "Build a fintech startup blueprint"}' \
  | jq '.draft.sections[] | .heading'
```

**If you see context-specific content, SUCCESS!**

---

## Alternative: Use Local Qdrant

### If Qdrant Cloud is blocked/unavailable:

```bash
# 1. Start local Qdrant with Docker
docker run -d -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant

# 2. Update .env
QDRANT_URL=http://localhost:6333
# Remove or comment out QDRANT_API_KEY (not needed for local)

# 3. Follow steps 3-8 above
```

---

## Troubleshooting

### "docker: command not found"
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
```

### "ModuleNotFoundError: No module named 'qdrant_client'"
```bash
cd data-pipeline
pip install -r requirements.txt
```

### "403 Forbidden" persists
```bash
# Check Qdrant Cloud dashboard:
# 1. Cluster is "Active" status
# 2. API key is correct (regenerate if needed)
# 3. Your IP is whitelisted (or allow all IPs for testing)
```

### "Collection already exists" error
```bash
# Delete and recreate:
python -c "from qdrant_manager import QdrantManager; mgr = QdrantManager(); mgr.delete_collection(); print('Collection deleted')"
# Then re-run embed step
```

---

## After Fix: Expected Behavior

### Before Fix:
```
Query: "fintech startup"
Context retrieved: [] (EMPTY)
Blueprint: Generic startup advice (hallucination)
```

### After Fix:
```
Query: "fintech startup"
Context retrieved: [
  "Next.js is a React framework...",
  "Supabase provides a full Postgres database...",
  "FastAPI is a modern, fast web framework..."
]
Blueprint: Startup with Next.js frontend, Supabase backend, FastAPI API
```

---

## Next Steps After Fix

1. **Re-crawl fresh data** (current data is 20 days old):
   ```bash
   cd data-pipeline/crawler
   python enhanced_crawler.py
   cd ..
   python chunker.py -i crawled_docs_enhanced.json -o chunks.json
   python qdrant_embedder.py --embed chunks.json
   ```

2. **Add industry-specific data**:
   - Manually add fintech sources to crawler
   - Add healthcare sources to crawler
   - Re-crawl and re-embed

3. **Implement dynamic crawling** (see DIAGNOSTIC_REPORT.md for details)

---

**Time to fix:** 15-30 minutes (if you have Qdrant credentials)  
**Impact:** HIGH - Fixes root cause of similarity problem

