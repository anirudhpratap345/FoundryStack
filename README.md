# 🚀 FoundryStack

> **Multi-Agent AI SaaS Platform** that transforms startup ideas into comprehensive, actionable business blueprints using cutting-edge AI orchestration and retrieval-augmented generation (RAG).

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-green?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-red?style=flat)](https://qdrant.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Multi-Agent System](#-multi-agent-system)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**FoundryStack** democratizes startup creation by providing founders with AI-generated business plans, technical architectures, market analyses, and implementation roadmaps—all in minutes instead of weeks.

### **The Problem**
Creating a comprehensive startup blueprint requires weeks of research, market analysis, technical planning, and documentation. Most founders lack the time, resources, or expertise to do this thoroughly.

### **Our Solution**
An intelligent platform where users input a startup idea (e.g., *"AI-powered fintech for small businesses"*) and receive:

- 📊 **Market Analysis** - TAM/SAM/SOM, competitors, trends, customer personas
- 🛠️ **Technical Blueprint** - Architecture, tech stack, API design, security
- 📅 **Implementation Plan** - Sprint breakdown, timelines, resources, budget
- 💾 **Code Templates** - Starter files and boilerplate code
- 📄 **Exportable Documents** - JSON, Markdown, HTML formats

### **What Makes Us Different**
- ✅ **RAG-Enhanced**: Uses real-world data from TechCrunch, Y Combinator, ProductHunt
- ✅ **Multi-Agent Architecture**: Specialized AI agents work together like a virtual consulting team
- ✅ **Gemini 2.5 Pro**: Latest Google AI for comprehensive, contextual analysis
- ✅ **Export-Ready**: Professional documents ready for investors and developers

---

## ✨ Features

### **Core Capabilities**
- 🎨 **Blueprint Generation** - Transform ideas into comprehensive startup plans
- 🔍 **RAG-Powered Context** - Semantic search across 100+ startup documents
- 🤖 **Multi-Agent Orchestration** - 4 specialized AI agents working in harmony
- 📊 **Quality Scoring** - Accuracy, Clarity, and Completeness metrics (0-10)
- 📤 **Multi-Format Export** - JSON, Markdown, and HTML outputs
- 🔄 **Blueprint Regeneration** - Refine and improve existing blueprints
- ⚡ **Real-Time Status** - Track generation progress (ANALYZING → COMPLETED)

### **Intelligent Analysis**
- **Market Opportunity** - TAM, SAM, SOM calculations with growth projections
- **Competitive Landscape** - Competitor analysis and differentiation strategies
- **Technical Architecture** - Full stack recommendations with security & scaling
- **Financial Projections** - Revenue models, unit economics, 3-year forecasts
- **Implementation Roadmap** - Week-by-week sprint planning with resource allocation
- **Risk Assessment** - Identified risks with mitigation strategies

---

## 🏗️ Architecture

### **System Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Next.js)                │
│              localhost:3000 - Create, View, Export          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Proxy Layer)               │
│          /api/blueprints - CRUD + Pipeline forwarding       │
└────────────────────┬────────────────────────────────────────┘
                     │ POST /generate
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         UNIFIED PIPELINE API (FastAPI - Port 8015)          │
│  Orchestrates: Retriever → Writer → Reviewer → Exporter    │
└─────┬───────┬──────────┬──────────┬─────────────────────────┘
      │       │          │          │
      ▼       ▼          ▼          ▼
   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
   │ 🔍   │ │ ✍️   │ │ 🔎   │ │ 📦   │
   │Retri │ │Writer│ │Review│ │Export│
   │ever  │ │Agent │ │er    │ │er    │
   └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
      │        │        │        │
      ▼        ▼        ▼        ▼
   ┌────────────────────────────────┐
   │   EXTERNAL SERVICES            │
   ├────────────────────────────────┤
   │ • Qdrant Cloud (Vectors)       │
   │ • Google Gemini 2.5 Pro (LLM)  │
   │ • Redis (Optional Cache)       │
   │ • File Storage (Blueprints)    │
   └────────────────────────────────┘
```

### **Data Flow**

```
User Query
    ↓
[1] Retriever Agent queries Qdrant (semantic search)
    ↓ Returns top 5 relevant chunks
[2] Writer Agent + Gemini 2.5 Pro generates 10-section draft
    ↓ Structured JSON with comprehensive analysis
[3] Reviewer Agent evaluates & scores (Accuracy, Clarity, Completeness)
    ↓ Refined content + improvement suggestions
[4] Exporter Agent creates JSON, Markdown, HTML files
    ↓
Final Blueprint (saved to database + exports/)
```

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

### **Backend**
- **API Framework**: FastAPI
- **Language**: Python 3.10+
- **LLM**: Google Gemini 2.5 Pro
- **Vector Database**: Qdrant Cloud
- **Embeddings**: sentence-transformers (`all-MiniLM-L6-v2`, 384-dim)
- **Cache**: Redis (optional, with mock fallback)
- **Storage**: File-based JSON

### **AI & ML**
- **LLM Provider**: Google Generative AI
- **Model**: `gemini-2.5-pro`
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Vector Similarity**: Cosine similarity
- **RAG Framework**: Custom implementation

### **Data Pipeline**
- **Web Crawler**: crawl4ai + newspaper3k
- **Text Processing**: NLTK, BeautifulSoup
- **Chunking Strategy**: Overlap-based (500 words, 50 overlap)
- **Batch Processing**: tqdm for progress tracking

### **Infrastructure**
- **Development**: Node.js + Python venv
- **Containerization**: Docker (Qdrant local option)
- **Cloud**: Qdrant Cloud (Europe-West3)
- **Version Control**: Git + GitHub

---

## 🚀 Getting Started

### **Prerequisites**

- **Node.js** 18+ and npm
- **Python** 3.10+
- **API Keys**:
  - Google Gemini API Key ([Get it here](https://ai.google.dev/))
  - Qdrant Cloud API Key ([Sign up](https://qdrant.tech/))
  - (Optional) OpenWeather, Redis

### **Installation**

#### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/foundry-stack.git
cd foundry-stack
```

#### **2. Frontend Setup**
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API keys
```

**Required Environment Variables (`.env.local`):**
```env
# Qdrant Configuration
QDRANT_URL=https://your-cluster.gcp.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Pipeline Configuration
PIPELINE_API_URL=http://localhost:8015
PIPELINE_HOST=0.0.0.0
PIPELINE_PORT=8015

# Optional: Redis
REDIS_URL=redis://localhost:6379

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **3. Backend Setup**
```bash
cd data-pipeline

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp ../.env.example .env

# Edit .env with same values as .env.local
```

#### **4. Initialize Vector Database**

**Option A: Use Qdrant Cloud (Recommended)**
- Already configured if you set `QDRANT_URL` and `QDRANT_API_KEY`

**Option B: Run Qdrant Locally**
```bash
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage:z \
  qdrant/qdrant
```

#### **5. Populate Vector Database (Optional)**

If you want to crawl fresh data:

```bash
cd data-pipeline

# Run the full pipeline (crawl → chunk → embed)
python run_pipeline.py

# Or run individual steps:
python enhanced_crawler.py    # Crawl sources
python chunker.py              # Create chunks
python qdrant_embedder.py      # Generate & store embeddings
```

### **Running the Application**

#### **Terminal 1: Start Frontend**
```bash
npm run dev
# → http://localhost:3000
```

#### **Terminal 2: Start Backend Pipeline**
```bash
cd data-pipeline
python pipeline_api.py
# → http://localhost:8015
```

#### **Terminal 3: (Optional) Redis**
```bash
docker run -p 6379:6379 redis
```

### **Verification**

1. **Check Pipeline Health**:
   ```bash
   curl http://localhost:8015/health
   ```
   Expected output:
   ```json
   {
     "status": "ok",
     "gemini": true,
     "agents": {
       "retriever": true,
       "writer": true,
       "reviewer": true,
       "exporter": true
     }
   }
   ```

2. **Check Frontend**:
   - Visit `http://localhost:3000`
   - You should see the FoundryStack dashboard

---

## 💡 Usage

### **Creating a Blueprint**

1. **Navigate to Home**
   - Go to `http://localhost:3000`

2. **Click "Create Blueprint"**
   - Enter a title (e.g., "Fintech Startup")
   - Enter your idea (e.g., "AI-powered personal finance coach for millennials")

3. **Submit & Wait**
   - Status changes: `ANALYZING` → `COMPLETED` (2-3 minutes)
   - Pipeline runs all 4 agents automatically

4. **View Results**
   - Click on the blueprint to see detailed sections
   - Review market analysis, technical blueprint, implementation plan

### **Regenerating a Blueprint**

1. **Open Existing Blueprint**
   - Click on any blueprint from the list

2. **Click "Regenerate"**
   - Optionally modify the prompt
   - Pipeline re-runs with updated context

3. **Compare Versions**
   - Review new scores (Accuracy, Clarity, Completeness)
   - Check updated sections

### **Exporting a Blueprint**

1. **Open Blueprint**
   - Navigate to the blueprint detail page

2. **Click "Export"**
   - Choose format (JSON, Markdown, HTML)
   - Files saved to `data-pipeline/exports/`

3. **Use Exported Files**
   - **JSON**: For developers/integrations
   - **Markdown**: For documentation/GitHub
   - **HTML**: For presentations/web

---

## 🤖 Multi-Agent System

### **Agent Pipeline Flow**

```
User Query → 🔍 Retriever → ✍️ Writer → 🔎 Reviewer → 📦 Exporter → Final Blueprint
```

### **1. Retriever Agent** 🔍
**Role**: Context enrichment specialist

**Technology**:
- Qdrant vector database
- `sentence-transformers/all-MiniLM-L6-v2` (384-dim embeddings)
- Cosine similarity search

**Process**:
1. Embeds user query into 384-dim vector
2. Searches Qdrant collection (`foundrystack_docs`)
3. Returns top 5 semantically similar chunks
4. Extracts metadata (source, URL, relevance score)

**Output**: Enriched context with real startup data

### **2. Writer Agent** ✍️
**Role**: Content generation expert

**Technology**:
- Google Gemini 2.5 Pro
- Temperature: 0.4 (balanced creativity/accuracy)
- Max tokens: 4000

**Process**:
1. Receives user query + retrieved context
2. Generates 10 comprehensive sections:
   - Executive Summary
   - Problem & Solution
   - Market Opportunity
   - Business Model
   - Technical Architecture
   - Go-to-Market Strategy
   - Financial Projections
   - Team & Resources
   - Risks & Mitigation
   - Implementation Roadmap
3. Structures output as JSON

**Output**: Detailed startup blueprint draft

### **3. Reviewer Agent** 🔎
**Role**: Quality assurance specialist

**Technology**:
- Google Gemini 2.5 Pro
- Temperature: 0.2 (high precision)
- Max tokens: 4000

**Process**:
1. Evaluates Writer's draft on 3 dimensions:
   - **Accuracy** (0-10): Factual correctness
   - **Clarity** (0-10): Readability & structure
   - **Completeness** (0-10): Coverage of all sections
2. Provides improvement suggestions
3. Refines content based on analysis

**Output**: Reviewed blueprint + scores + feedback

### **4. Exporter Agent** 📦
**Role**: Document formatter

**Technology**:
- Python (Jinja2, markdown, json)
- Multiple format support

**Process**:
1. Takes reviewed blueprint
2. Formats for each export type:
   - **JSON**: Structured data with metadata
   - **Markdown**: Human-readable with headers
   - **HTML**: Web-ready with styling
3. Saves to `exports/` directory

**Output**: Professional documents ready to share

---

## 📁 Project Structure

```
foundry-stack/
├── src/                          # Next.js frontend
│   ├── app/                      # App router pages
│   │   ├── api/                  # API routes (proxy layer)
│   │   │   ├── blueprints/       # Blueprint CRUD
│   │   │   ├── analyst/          # Agent endpoints
│   │   │   ├── writer/
│   │   │   ├── reviewer/
│   │   │   └── exporter/
│   │   ├── blueprints/           # Blueprint pages
│   │   │   ├── [id]/             # Blueprint detail
│   │   │   └── page.tsx          # Blueprint list
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   └── TechnicalBlueprintDisplay.tsx
│   └── lib/                      # Utilities
│       ├── api/                  # API client
│       ├── qdrant/               # Qdrant integration
│       ├── redis/                # Redis cache
│       └── validation.ts         # Input validation
│
├── data-pipeline/                # Python backend
│   ├── pipeline_api.py           # 🚀 Unified FastAPI server
│   ├── retriever_agent.py        # 🔍 Qdrant search
│   ├── writer_agent.py           # ✍️ Content generation
│   ├── reviewer_agent.py         # 🔎 Quality review
│   ├── exporter_agent.py         # 📦 Multi-format export
│   ├── qdrant_manager.py         # Vector DB operations
│   ├── qdrant_embedder.py        # Embedding generation
│   ├── enhanced_crawler.py       # Web scraping
│   ├── chunker.py                # Text chunking
│   ├── run_pipeline.py           # Full pipeline orchestration
│   ├── requirements.txt          # Python dependencies
│   ├── blueprints/               # Stored blueprints
│   ├── exports/                  # Exported documents
│   │   ├── json/
│   │   ├── markdown/
│   │   └── html/
│   └── data/                     # Crawled data
│       ├── crawled_docs.json
│       └── chunks.json
│
├── public/                       # Static assets
├── .env.example                  # Example environment variables
├── .env.local                    # Your environment variables
├── docker-compose.yml            # Docker services
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── next.config.js                # Next.js config
├── README.md                     # This file
├── QDRANT_SETUP_GUIDE.md         # Qdrant setup instructions
└── SUPABASE_TO_QDRANT_MIGRATION.md  # Migration guide
```

---

## 💻 Development

### **Frontend Development**

```bash
# Start dev server with hot reload
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### **Backend Development**

```bash
cd data-pipeline

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Start pipeline API with auto-reload
uvicorn pipeline_api:app --reload --host 0.0.0.0 --port 8015

# Test individual agents
python retriever_agent.py
python writer_agent.py
python reviewer_agent.py
python exporter_agent.py

# Run data pipeline
python run_pipeline.py
```

### **Testing**

```bash
# Test Qdrant connection
cd data-pipeline
python test_qdrant.py

# Test pipeline health
curl http://localhost:8015/health

# Test blueprint generation
curl -X POST http://localhost:8015/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "AI startup for healthcare", "options": {"export_formats": ["json"]}}'
```

### **Debugging Tips**

1. **Pipeline not responding**:
   - Check if `pipeline_api.py` is running
   - Verify port 8015 is not in use: `netstat -ano | findstr :8015`
   - Check logs in terminal running pipeline

2. **Qdrant connection errors**:
   - Verify `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
   - Test connection: `python test_qdrant.py`
   - Check Qdrant Cloud dashboard

3. **Gemini API errors**:
   - Verify `GEMINI_API_KEY` in `.env`
   - Check API quota: [Google AI Studio](https://ai.google.dev/)
   - Review rate limits

4. **Redis errors** (non-critical):
   - Redis is optional, app uses mock client as fallback
   - To fix: `docker run -p 6379:6379 redis`

---

## 📚 API Documentation

### **Pipeline API Endpoints**

#### **GET /health**
Check system health and agent status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-09T12:00:00",
  "gemini": true,
  "agents": {
    "retriever": true,
    "writer": true,
    "reviewer": true,
    "exporter": true
  }
}
```

#### **POST /generate**
Generate a complete startup blueprint.

**Request**:
```json
{
  "query": "AI-powered fintech for small businesses",
  "options": {
    "export_formats": ["json", "markdown", "html"]
  }
}
```

**Response**:
```json
{
  "draft": {
    "summary": "Executive summary...",
    "sections": { ... }
  },
  "review": {
    "scores": {
      "accuracy": 9,
      "clarity": 8,
      "completeness": 9
    },
    "suggestions": ["..."]
  },
  "files": {
    "json": "exports/json/blueprint_xyz.json",
    "markdown": "exports/markdown/blueprint_xyz.md",
    "html": "exports/html/blueprint_xyz.html"
  },
  "processing_time": 145.23
}
```

### **Next.js API Routes**

#### **GET /api/blueprints**
Get all blueprints.

#### **POST /api/blueprints**
Create a new blueprint.

#### **GET /api/blueprints/[id]**
Get a specific blueprint.

#### **POST /api/blueprints/[id]**
Regenerate a blueprint.

#### **DELETE /api/blueprints/[id]**
Delete a blueprint.

---

## 🚢 Deployment

### **Docker Deployment**

```bash
# Build and run all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### **Production Checklist**

- [ ] Set production environment variables
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure production database
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting
- [ ] Set up backup strategy
- [ ] Review security best practices

### **Environment-Specific Configs**

**Development**:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
PIPELINE_API_URL=http://localhost:8015
```

**Production**:
```env
NEXT_PUBLIC_APP_URL=https://foundrystack.com
PIPELINE_API_URL=https://api.foundrystack.com
```

---

## 🗺️ Roadmap

### **Phase 1: MVP** ✅ (Completed)
- [x] Multi-agent pipeline implementation
- [x] RAG-powered context retrieval
- [x] Blueprint generation with Gemini 2.5 Pro
- [x] Quality scoring system
- [x] Multi-format export
- [x] Frontend UI with Next.js

### **Phase 2: Enhanced Intelligence** (Q1 2025)
- [ ] Expand knowledge base to 1,000+ documents
- [ ] Add more sources (Hacker News, GitHub Trending, Crunchbase)
- [ ] Implement continuous crawling (daily updates)
- [ ] Fine-tune embeddings for startup context
- [ ] Add industry-specific templates

### **Phase 3: User Experience** (Q2 2025)
- [ ] Real-time progress indicators with WebSockets
- [ ] Blueprint versioning & history tracking
- [ ] Collaborative editing (multiplayer mode)
- [ ] Comment & feedback system
- [ ] AI-powered suggestions during editing

### **Phase 4: Productization** (Q3 2025)
- [ ] User authentication (Clerk/Auth0)
- [ ] Payment integration (Stripe)
- [ ] Usage limits & tiered pricing
- [ ] API rate limiting per user
- [ ] Admin dashboard

### **Phase 5: Scale & Deploy** (Q4 2025)
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Production monitoring (Datadog, Sentry)
- [ ] Load testing & optimization
- [ ] Multi-region deployment

### **Phase 6: Advanced Features** (2026)
- [ ] AI-powered competitor analysis
- [ ] Financial model generator with scenarios
- [ ] Pitch deck creator (PDF/PowerPoint)
- [ ] Team matching algorithm
- [ ] Investor matching platform

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Ways to Contribute**
- 🐛 Report bugs via [GitHub Issues](https://github.com/yourusername/foundry-stack/issues)
- 💡 Suggest features via [Discussions](https://github.com/yourusername/foundry-stack/discussions)
- 📖 Improve documentation
- 🧪 Add tests
- 🔧 Submit pull requests

### **Development Workflow**

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/foundry-stack.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Link related issues
   - Wait for review

### **Code Style**
- **TypeScript**: Follow ESLint rules
- **Python**: Follow PEP 8, use Black formatter
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful language generation
- **Qdrant** for vector search capabilities
- **Vercel** for Next.js and deployment platform
- **FastAPI** for the excellent Python web framework
- **HuggingFace** for sentence-transformers
- **shadcn/ui** for beautiful UI components

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/foundry-stack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/foundry-stack/discussions)
- **Email**: support@foundrystack.com

---

## 📊 Project Stats

![Lines of Code](https://img.shields.io/tokei/lines/github/yourusername/foundry-stack)
![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/foundry-stack)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/foundry-stack)

---

<div align="center">

**Built with ❤️ by the FoundryStack Team**

[Website](https://foundrystack.com) • [Documentation](https://docs.foundrystack.com) • [Blog](https://blog.foundrystack.com)

⭐ Star us on GitHub if you find this project useful!

</div>
