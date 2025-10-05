# FoundryStack

Transform startup ideas into end-to-end blueprints and 4-week implementation plans with AI-powered analysis and orchestration.

## 🚀 What We've Built

FoundryStack is a comprehensive multi-agent SaaS system that transforms startup ideas into detailed technical blueprints using AI-powered analysis and orchestration.

### ✅ Completed Features

- **Modern Frontend**: Next.js 15 with App Router, Tailwind CSS, and shadcn/ui components
- **Multi-Agent System**: 5 specialized AI agents working in orchestration
- **Vector Database**: Qdrant for semantic search and document retrieval
- **Blueprint Management**: Create, view, and manage startup blueprints
- **Real-time Processing**: Live updates during blueprint generation
- **Export Capabilities**: Multiple format exports (JSON, Markdown, HTML, PDF)

### 🎯 Key Pages

1. **Home Page** (`/`) - Main landing page with idea input form
2. **Blueprints Dashboard** (`/blueprints`) - View all created blueprints
3. **Blueprint Detail** (`/blueprints/[id]`) - Detailed view of individual blueprints

### 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Vector Database**: Qdrant Cloud for semantic search
- **AI Integration**: Gemini, OpenAI, Groq APIs
- **Caching**: Redis for performance optimization
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

### 🤖 Multi-Agent Architecture

The system uses 5 specialized AI agents:

1. **Retriever Agent** - Queries Qdrant for relevant context
2. **Analyst Agent** - Analyzes context into structured insights
3. **Writer Agent** - Generates comprehensive blueprints
4. **Reviewer Agent** - Reviews and refines blueprints
5. **Exporter Agent** - Exports blueprints in multiple formats

### 🏗 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── blueprints/          # Blueprint CRUD operations
│   │   ├── retriever/           # Retriever agent API
│   │   ├── analyst/             # Analyst agent API
│   │   ├── writer/              # Writer agent API
│   │   ├── reviewer/            # Reviewer agent API
│   │   ├── exporter/            # Exporter agent API
│   │   └── health/              # Health check endpoint
│   ├── blueprints/              # Blueprint pages
│   ├── globals.css              # Global styles and design system
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/ui/               # Reusable UI components
└── lib/
    ├── qdrant/                  # Qdrant database service
    ├── ai/                      # AI client integrations
    ├── redis/                   # Redis caching
    └── utils.ts                 # Utility functions

data-pipeline/
├── crawler/                     # Web crawling for data collection
├── chunker.py                   # Document chunking
├── qdrant_manager.py            # Qdrant operations
├── qdrant_embedder.py           # Embedding generation
├── retriever_agent.py           # Retriever agent implementation
└── retriever_api.py             # Retriever agent API
```

### 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🐳 Docker Setup

For full multi-agent system with Docker:

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

### 🔧 Environment Variables

Required environment variables:

```env
# Qdrant Configuration
QDRANT_URL=https://your-cluster-id.region.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
AI_PROVIDER=gemini

# Optional AI Providers
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 🎨 Design System

The app uses a comprehensive design system with:
- **Colors**: HSL-based color tokens with dark mode support
- **Typography**: Geist Sans and Geist Mono fonts
- **Components**: Consistent, accessible UI components
- **Spacing**: Tailwind's spacing scale
- **Shadows**: Subtle elevation system

### 🔄 Data Pipeline

The system includes a complete data pipeline:

1. **Crawling**: Web scraping for technical documentation
2. **Chunking**: Document segmentation for optimal processing
3. **Embedding**: Vector generation using sentence-transformers
4. **Storage**: Qdrant vector database for semantic search
5. **Retrieval**: Context-aware document retrieval

### 🎯 Key Features

- ✅ **Idea Input**: Users can describe their startup ideas
- ✅ **Multi-Agent Processing**: 5 AI agents working in orchestration
- ✅ **Vector Search**: Semantic search across technical documentation
- ✅ **Blueprint Generation**: Comprehensive technical blueprints
- ✅ **Real-time Updates**: Live progress tracking
- ✅ **Export Options**: Multiple format exports
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Dark Mode**: Automatic dark/light theme switching
- ✅ **Error Handling**: Robust error handling and recovery

### 🚀 Production Ready

The system is production-ready with:
- Docker containerization
- Health checks and monitoring
- Error handling and logging
- Performance optimization with Redis caching
- Scalable multi-agent architecture
- Vector database integration

This is a complete, production-ready multi-agent SaaS system for transforming startup ideas into detailed technical blueprints.