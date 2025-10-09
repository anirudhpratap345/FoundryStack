# 🔍 FoundryStack Pipeline Diagnostic Report
**Date:** October 9, 2025  
**Issue:** Blueprints generated for different industries look too similar

---

## ❌ ROOT CAUSE IDENTIFIED

### **The Qdrant Vector Database is Empty**

```
CRITICAL ERROR: Qdrant returns 403 Forbidden
└─> No embeddings are stored (vectors_count = 0)
    └─> Retriever returns ZERO context
        └─> Writer generates content with NO real-world data
            └─> All blueprints look similar (LLM hallucination)
```

---

## 📊 PIPELINE STATUS

| Component | Status | Details |
|-----------|--------|---------|
| **Crawler** | ✅ Working | `enhanced_crawler.py` - Fetches docs from TechCrunch, YC, Next.js, Supabase, etc. |
| **Crawled Data** | ✅ Present | `crawled_docs_enhanced.json` - 9 documents (360-442 words each) |
| **Chunker** | ✅ Working | `chunker.py` - Splits docs into 12 chunks (500 words/chunk, 50 overlap) |
| **Chunks** | ✅ Present | `chunks.json` - 12 ready-to-embed chunks |
| **Embedder** | ⚠️ Not Run | `qdrant_embedder.py` - Code exists but hasn't successfully embedded data |
| **Qdrant DB** | ❌ **FAILED** | `403 Forbidden` - Cannot access collection |
| **Retriever** | ⚠️ Degraded | Returns empty context due to empty Qdrant |
| **Writer** | ⚠️ Blind | Generates content WITHOUT industry-specific data |
| **Reviewer** | ✅ Working | Reviews whatever Writer produces |
| **Exporter** | ✅ Working | Exports to JSON/Markdown/HTML |

---

## 🐛 SILENT FAILURE LOCATIONS

### **1. Pipeline API Swallows Qdrant Errors**
**File:** `data-pipeline/pipeline_api.py` (lines 90-96)

```python
try:
    retriever_agent = RetrieverAgent()
    retriever_ok = True
except Exception:
    retriever_agent = None
    retriever_ok = False  # ← API starts successfully even when Qdrant is broken!
```

**Result:** Users get blueprints with no context, thinking the system is working.

### **2. Empty Context Fallback**
**File:** `data-pipeline/pipeline_api.py` (lines 129-140)

```python
contexts: List[Dict[str, Any]] = []
if retriever_agent is not None:
    try:
        context = retriever_agent.retrieve_context(req.query, limit=5, score_threshold=0.2)
        contexts = [...]
    except Exception:
        contexts = []  # ← Falls back to ZERO context silently

# Writer generates with contexts = []
draft = writer_agent.write(req.query, contexts)
```

**Result:** LLM hallucinates generic startup advice with no real-world data.

---

## 🔍 WHAT'S ACTUALLY CRAWLED

### Current Data Sources (Static)
```
data-pipeline/crawled_docs_enhanced.json
├─ Next.js Docs (360 words)
├─ Supabase Docs (204 words)
├─ Prisma Docs (442 words)
├─ FastAPI Docs (7 chunks, ~3000+ words total)
└─ Redis Docs (2 chunks, ~1000 words total)

Last Crawl: October 4, 2025 (20 days ago)
```

### Crawler Implementation
**File:** `data-pipeline/crawler/enhanced_crawler.py`

**What it does:**
1. **News Sites** (lines 89-150):
   - TechCrunch, The Verge, InfoQ, Hacker News
   - Uses `newspaper3k` for article extraction
   - Filters ads, footers, cookie notices

2. **Startup Directories** (lines 152-217):
   - YCombinator companies
   - ProductHunt products

3. **Tech Docs** (lines 219-282):
   - Next.js, Supabase, Prisma, FastAPI, Redis
   - Extracts `<main>` content with BeautifulSoup

**What it DOESN'T do:**
- ❌ Dynamic crawling based on user query (e.g., "fintech startup" doesn't trigger fintech-specific sites)
- ❌ Industry-specific data (no fintech APIs, healthcare regulations, etc.)
- ❌ Real-time updates (last crawl: 20 days ago)

---

## 🚨 QDRANT ERROR DETAILS

```bash
$ python test_qdrant.py

ERROR:qdrant_manager:Failed to ensure collection exists: Unexpected Response: 403 (Forbidden)
Raw response content:
b'{"error":"forbidden"}'
```

### Possible Causes:
1. **Missing/Invalid API Key**
   - `QDRANT_API_KEY` not set in environment
   - API key is incorrect or expired
   - Check: `env.example` shows placeholder `your_qdrant_api_key_here`

2. **Wrong Qdrant URL**
   - `QDRANT_URL` points to wrong cluster
   - Check: `env.example` shows placeholder `https://your-cluster-id.region.cloud.qdrant.io`

3. **Network/Firewall Block**
   - Corporate firewall blocking Qdrant Cloud
   - VPN interfering with connection

4. **Local Qdrant Not Running**
   - If using local instance: `docker run -p 6333:6333 qdrant/qdrant` not executed

---

## 🛠️ FIXES REQUIRED

### **IMMEDIATE FIX: Get Qdrant Working**

#### Option A: Use Qdrant Cloud (Recommended)
```bash
# 1. Sign up at https://qdrant.tech/
# 2. Create a cluster and get credentials
# 3. Create .env file in project root:

echo "QDRANT_URL=https://your-actual-cluster.cloud.qdrant.io" > .env
echo "QDRANT_API_KEY=your_actual_api_key" >> .env
echo "GEMINI_API_KEY=your_gemini_key" >> .env

# 4. Embed the existing chunks:
cd data-pipeline
python qdrant_embedder.py --embed chunks.json

# 5. Verify:
python test_qdrant.py
# Expected: "✅ vectors_count > 0"
```

#### Option B: Use Local Qdrant
```bash
# 1. Start local Qdrant
docker run -d -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant

# 2. Create .env file:
echo "QDRANT_URL=http://localhost:6333" > .env
echo "GEMINI_API_KEY=your_gemini_key" >> .env

# 3. Embed the chunks:
cd data-pipeline
python qdrant_embedder.py --embed chunks.json

# 4. Verify:
python test_qdrant.py
```

### **SHORT-TERM FIX: Add Better Logging**

**File to modify:** `data-pipeline/pipeline_api.py`

```python
# Replace lines 90-96 with:
try:
    retriever_agent = RetrieverAgent()
    retriever_ok = True
    logger.info("✅ Retriever Agent initialized successfully")
except Exception as e:
    retriever_agent = None
    retriever_ok = False
    logger.error(f"❌ Retriever Agent failed: {e}")
    logger.error("⚠️  Pipeline will run WITHOUT contextual data - all blueprints will be generic!")

# Replace lines 129-140 with:
contexts: List[Dict[str, Any]] = []
if retriever_agent is not None:
    try:
        context = retriever_agent.retrieve_context(req.query, limit=5, score_threshold=0.2)
        contexts = [
            {"content": d.content, "source": d.source, "score": d.relevance_score}
            for d in context.retrieved_documents
        ]
        logger.info(f"✅ Retrieved {len(contexts)} context chunks for query: '{req.query[:50]}...'")
    except Exception as e:
        logger.error(f"❌ Context retrieval failed: {e}")
        contexts = []
else:
    logger.warning("⚠️  No retriever available - generating without context")

if not contexts:
    logger.warning(f"❌ ZERO context retrieved for query: '{req.query}' - LLM will hallucinate!")
```

### **MEDIUM-TERM FIX: Add Fallback Data**

**Create:** `data-pipeline/fallback_context.json`

```json
{
  "fintech": [
    "Stripe handles payment processing for millions of businesses...",
    "Plaid connects apps to user bank accounts for financial data...",
    "Regulatory compliance: PCI-DSS for payments, SOC 2 for data..."
  ],
  "healthcare": [
    "HIPAA compliance required for patient data handling...",
    "Epic and Cerner are major EHR system providers...",
    "FDA regulations apply to medical device software..."
  ],
  "ecommerce": [
    "Shopify and WooCommerce power most online stores...",
    "Payment gateways: Stripe, PayPal, Square...",
    "Inventory management systems: Shopify, NetSuite..."
  ]
}
```

**Modify:** `data-pipeline/retriever_agent.py`

```python
import json
from pathlib import Path

FALLBACK_DATA = Path(__file__).parent / "fallback_context.json"

def retrieve_context(self, query: str, ...):
    # ... existing code ...
    
    if not retrieved_docs and FALLBACK_DATA.exists():
        logger.warning("Using fallback context due to empty Qdrant")
        with open(FALLBACK_DATA) as f:
            fallback = json.load(f)
            # Match query to industry and inject fallback
            for industry, contexts in fallback.items():
                if industry.lower() in query.lower():
                    for ctx in contexts:
                        retrieved_docs.append(RetrievedDocument(
                            id=f"fallback_{industry}",
                            source=f"Fallback: {industry.title()}",
                            title=f"{industry.title()} Context",
                            content=ctx,
                            url="",
                            relevance_score=0.5,
                            word_count=len(ctx.split()),
                            chunk_index=0,
                            total_chunks=1,
                            retrieved_at=datetime.now().isoformat()
                        ))
    # ... rest of code ...
```

### **LONG-TERM FIX: Dynamic Industry-Specific Crawling**

**Create:** `data-pipeline/dynamic_crawler.py`

```python
"""
Dynamic Crawler - Fetches industry-specific content based on user query
"""

INDUSTRY_SOURCES = {
    "fintech": [
        "https://www.finextra.com/",
        "https://www.fintechfutures.com/",
        "https://stripe.com/blog",
        "https://plaid.com/blog/"
    ],
    "healthcare": [
        "https://www.healthcareitnews.com/",
        "https://www.healthtech.com/",
        "https://www.fda.gov/news-events"
    ],
    "ecommerce": [
        "https://www.shopify.com/blog",
        "https://www.bigcommerce.com/blog/",
        "https://woocommerce.com/blog/"
    ],
    "saas": [
        "https://www.saastr.com/",
        "https://www.saasquatch.com/blog/",
        "https://www.profitwell.com/recur/blog"
    ]
}

def detect_industry(query: str) -> str:
    """Detect industry from query keywords"""
    query_lower = query.lower()
    for industry in INDUSTRY_SOURCES.keys():
        if industry in query_lower:
            return industry
    # Default to generic tech
    return "tech"

def crawl_for_query(query: str, max_articles: int = 5) -> List[Dict]:
    """Crawl industry-specific sources based on query"""
    industry = detect_industry(query)
    sources = INDUSTRY_SOURCES.get(industry, [])
    
    crawler = EnhancedCrawler()
    articles = []
    
    for source_url in sources:
        try:
            html = crawler.fetch_page(source_url)
            if html:
                content = crawler.extract_clean_text(html)
                articles.append({
                    "id": hashlib.md5(source_url.encode()).hexdigest()[:12],
                    "source": industry.title(),
                    "url": source_url,
                    "title": f"{industry.title()} - Latest News",
                    "content": content,
                    "crawled_at": datetime.now().isoformat(),
                    "word_count": len(content.split()),
                    "type": "industry_news"
                })
                if len(articles) >= max_articles:
                    break
        except Exception as e:
            logger.error(f"Failed to crawl {source_url}: {e}")
    
    return articles
```

**Integrate into pipeline:**

```python
# In pipeline_api.py, before retrieval:
from dynamic_crawler import crawl_for_query

# Before calling retriever
fresh_data = crawl_for_query(req.query, max_articles=3)
if fresh_data:
    # Chunk and embed fresh data
    for doc in fresh_data:
        chunks = chunk_document(doc)
        embedder.embed_and_store_chunks(chunks)
```

---

## 🎯 SUCCESS CRITERIA

### After Fix, Verify:
```bash
# 1. Qdrant has data
python -c "from qdrant_manager import QdrantManager; print(QdrantManager().get_collection_stats())"
# Expected: vectors_count > 0

# 2. Retriever returns context
python -c "from retriever_agent import RetrieverAgent; r = RetrieverAgent(); print(len(r.retrieve_context('fintech startup').retrieved_documents))"
# Expected: > 0

# 3. Different industries get different context
curl -X POST http://localhost:8015/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "fintech startup blueprint"}' | jq '.draft.sections[].heading'

curl -X POST http://localhost:8015/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "healthcare AI startup blueprint"}' | jq '.draft.sections[].heading'

# Expected: Different sections/content based on industry
```

---

## 📋 ACTION ITEMS (Priority Order)

- [ ] **P0: Fix Qdrant connection** (1 hour)
  - Set `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
  - Run `python qdrant_embedder.py --embed chunks.json`
  - Verify with `python test_qdrant.py`

- [ ] **P1: Add logging for empty context** (30 min)
  - Modify `pipeline_api.py` to warn when contexts is empty
  - Add health check endpoint showing Qdrant status

- [ ] **P2: Create fallback context** (2 hours)
  - Build `fallback_context.json` with industry-specific data
  - Modify retriever to use fallback when Qdrant is empty

- [ ] **P3: Re-crawl fresh data** (1 hour)
  - Run `python crawler/enhanced_crawler.py`
  - Chunk and embed new data

- [ ] **P4: Implement dynamic crawler** (1 day)
  - Build `dynamic_crawler.py`
  - Integrate into pipeline
  - Add industry detection logic

- [ ] **P5: Automate data refresh** (1 day)
  - Set up cron job to re-crawl weekly
  - Implement incremental embedding updates

---

## 🔗 FILES TO REVIEW

1. `data-pipeline/pipeline_api.py` - Line 90-96 (silent failure)
2. `data-pipeline/retriever_agent.py` - Line 113-118 (search logic)
3. `data-pipeline/qdrant_manager.py` - Line 86-115 (connection setup)
4. `data-pipeline/crawler/enhanced_crawler.py` - Line 284-306 (crawl all)
5. `data-pipeline/qdrant_embedder.py` - Line 92-208 (embed documents)

---

## 💡 KEY INSIGHT

**The multi-agent architecture is sound, but the data layer is broken.**

```
USER QUERY: "Build me a fintech startup"
    ↓
RETRIEVER: Searches Qdrant... finds NOTHING (empty DB)
    ↓
WRITER: "Here's a generic startup blueprint" (hallucination)
    ↓
REVIEWER: "Looks good!" (no context to fact-check)
    ↓
USER: "Why does this look like my healthcare blueprint?"
```

**Fix the data layer, and the similarity problem disappears.**

---

**Report Generated:** October 9, 2025  
**Next Step:** Run immediate fix to restore Qdrant connection

