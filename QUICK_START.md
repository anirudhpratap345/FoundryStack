# 🚀 FoundryStack Quick Start Guide

**Status:** ✅ All systems operational with new API key  
**Date:** October 10, 2025

---

## ✅ What's Working

- **Pipeline API:** Running on `http://localhost:8015`
- **Qdrant:** Connected with 12 vectors (Next.js, FastAPI, Redis, Supabase, Prisma)
- **Gemini API:** New key configured and active
- **Retriever:** ✅ Working (fetches real context + fallback for 7 industries)
- **Writer:** ✅ Working (generates comprehensive blueprints)
- **Reviewer:** ✅ Working (evaluates quality)
- **Exporter:** ✅ Working (JSON, Markdown, HTML)

---

## 🎯 How to Generate a Blueprint

### Method 1: Using the Web UI (Recommended)

1. **Make sure the pipeline is running:**
   ```powershell
   cd D:\FoundryStack\foundry-stack\data-pipeline
   python pipeline_api.py
   ```

2. **Start the Next.js frontend:**
   ```powershell
   cd D:\FoundryStack\foundry-stack
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to: `http://localhost:3000`
   - Enter your startup idea (be specific!)
   - Click "Generate Blueprint"
   - Wait 30-60 seconds for the first generation

### Method 2: Using PowerShell (Direct API)

```powershell
$body = @{ 
    query = "Build a fintech startup for mobile payment processing targeting small businesses" 
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8015/generate" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -TimeoutSec 120
```

---

## 💡 Tips for Better Blueprints

### Be Specific in Your Query

**❌ Bad:**
> "Build a tech startup"

**✅ Good:**
> "Build a fintech startup for mobile payment processing targeting small businesses in emerging markets, with focus on offline-first architecture and USSD fallback"

### Industry Keywords That Trigger Context

The system auto-detects industries from keywords:

- **Fintech:** payment, banking, fintech, financial, money, transaction, wallet, stripe, plaid
- **Healthcare:** healthcare, medical, health, patient, doctor, hospital, clinical, diagnosis, ehr, hipaa
- **Ecommerce:** ecommerce, shopping, marketplace, retail, shopify, woocommerce, product
- **SaaS:** saas, software, subscription, platform, b2b, enterprise, api, cloud
- **AI:** ai, machine learning, artificial intelligence, ml, llm, gpt, openai, neural, model
- **Blockchain:** blockchain, crypto, web3, ethereum, bitcoin, defi, nft, smart contract
- **DevTools:** developer tools, api, sdk, cli, infrastructure, monitoring, cicd, platform

---

## ⚙️ Configuration

### Current Environment Variables

Located in: `data-pipeline/.env`

```env
QDRANT_API_KEY=eyJhbGci...
QDRANT_URL=https://fd9eb25a-974b-4e57-aa88-95cc7aa3077e.europe-west3-0.gcp.cloud.qdrant.io:6333
PIPELINE_HOST=127.0.0.1
PIPELINE_PORT=8015
GEMINI_API_KEY=AIzaSyByeBdI3gT1OCxb7IbFK70n8AEroBetmWo
```

### Switching Gemini Models

If you want to switch between models for speed/cost:

**Edit:** `data-pipeline/writer_agent.py` and `data-pipeline/reviewer_agent.py`

```python
# Line 65 in writer_agent.py
DEFAULT_GEMINI_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-pro")  # Current

# Options:
# - "gemini-2.5-pro"     - Most capable, slower, 2 req/min free tier
# - "gemini-1.5-pro"     - Very capable, moderate speed, 2 req/min
# - "gemini-1.5-flash"   - Fast, good quality, 15 req/min free tier
```

**Or set in .env:**
```env
LLM_MODEL=gemini-1.5-flash
```

---

## 🐛 Troubleshooting

### Pipeline Won't Start

**Check if already running:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*python*"}
```

**Kill existing process:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Stop-Process -Force
```

**Restart:**
```powershell
cd D:\FoundryStack\foundry-stack\data-pipeline
python pipeline_api.py
```

### "Unable to connect to remote server"

**Check health:**
```powershell
curl http://localhost:8015/health
```

**Expected output:**
```json
{
  "status": "ok",
  "agents": {
    "retriever": true,
    "writer": true,
    "reviewer": true,
    "exporter": true
  }
}
```

### Generation Takes Too Long / Times Out

**This is normal for the FIRST generation:**
- Sentence transformer model needs to load (~2GB)
- Gemini model initialization
- Can take 30-90 seconds

**Subsequent generations are faster:** ~10-20 seconds

### Rate Limit Errors

```
429 You exceeded your current quota
```

**Solutions:**
1. **Wait 60 seconds** between generations (free tier limit: 2 req/min)
2. **Switch to gemini-1.5-flash** (15 req/min)
3. **Upgrade to paid tier** (higher limits)

---

## 📊 What Data Is Available

### Qdrant Vector Database (12 chunks)
- Next.js documentation
- Supabase documentation  
- Prisma documentation
- FastAPI documentation (7 chunks)
- Redis documentation (2 chunks)

### Fallback Context (42 contexts across 7 industries)
- Fintech (6 contexts: Stripe, Plaid, PCI-DSS, etc.)
- Healthcare (6 contexts: HIPAA, EHR, FDA, etc.)
- Ecommerce (6 contexts: Shopify, payment gateways, etc.)
- SaaS (6 contexts: pricing, metrics, PLG, etc.)
- AI (6 contexts: LLMs, RAG, embeddings, etc.)
- Blockchain (6 contexts: Web3, DeFi, NFTs, etc.)
- DevTools (6 contexts: APIs, SDKs, monitoring, etc.)

---

## 🔄 Adding More Data

### Re-crawl Fresh Data

```powershell
cd data-pipeline/crawler
python enhanced_crawler.py

cd ..
python chunker.py -i crawled_docs_enhanced.json -o chunks.json
python qdrant_embedder.py --embed chunks.json
```

### Verify New Data

```powershell
python test_qdrant.py
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `data-pipeline/.env` | API keys and configuration |
| `data-pipeline/pipeline_api.py` | Main API server |
| `data-pipeline/fallback_context.json` | Industry knowledge base |
| `DIAGNOSTIC_REPORT.md` | Complete problem analysis |
| `SOLUTION_SUMMARY.md` | What was fixed |
| `FINAL_STATUS.md` | Complete status report |
| `QUICK_START.md` | This file |

---

## ✅ Success Checklist

Before generating blueprints, verify:

- [ ] Pipeline running: `curl http://localhost:8015/health`
- [ ] All agents show `true` in health check
- [ ] `.env` file exists with valid keys
- [ ] Qdrant has vectors: Check health response

---

## 🎉 You're Ready!

Your system is fully operational. Try generating a blueprint:

1. Open `http://localhost:3000`
2. Enter: *"Build a fintech startup for mobile money transfer in Africa"*
3. Click "Generate Blueprint"
4. Wait 30-60 seconds (first time)
5. Review your comprehensive startup blueprint!

**Different industries will get different, relevant content!** 🚀
