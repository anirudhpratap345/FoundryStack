# FoundryStack Qdrant Setup Guide

Complete setup guide for the FoundryStack multi-agent SaaS system with Qdrant vector database.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Docker and Docker Compose
- Qdrant Cloud account (or local Qdrant)

### 2. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd foundry-stack

# Copy environment template
cp env.example .env.local

# Install Node.js dependencies
npm install

# Install Python dependencies
cd data-pipeline
pip install -r requirements.txt
cd ..
```

### 3. Qdrant Configuration

#### Option A: Qdrant Cloud (Recommended)
1. Sign up at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a new cluster
3. Get your cluster URL and API key
4. Update `.env.local`:

```env
QDRANT_URL=https://your-cluster-id.region.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here
```

#### Option B: Local Qdrant with Docker
```bash
# Start Qdrant locally
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest

# Update .env.local
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Leave empty for local
```

### 4. AI API Keys

Add your AI provider API keys to `.env.local`:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
AI_PROVIDER=gemini

# Optional
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 5. Data Pipeline Setup

```bash
cd data-pipeline

# Create .env file for data pipeline
echo "QDRANT_URL=https://your-cluster-id.region.cloud.qdrant.io" > .env
echo "QDRANT_API_KEY=your_qdrant_api_key_here" >> .env

# Run the complete pipeline
python run_pipeline.py --step all --force
```

### 6. Start the Application

#### Development Mode
```bash
# Start Next.js development server
npm run dev

# In another terminal, start the retriever agent API
cd data-pipeline
python retriever_api.py
```

#### Production Mode with Docker
```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `QDRANT_URL` | Qdrant cluster URL | Yes | - |
| `QDRANT_API_KEY` | Qdrant API key | Yes (Cloud) | - |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `AI_PROVIDER` | AI provider to use | Yes | `gemini` |
| `OPENAI_API_KEY` | OpenAI API key | No | - |
| `GROQ_API_KEY` | Groq API key | No | - |
| `RETRIEVER_AGENT_URL` | Retriever agent URL | No | `http://localhost:8000` |
| `ANALYST_AGENT_URL` | Analyst agent URL | No | `http://localhost:8002` |
| `WRITER_AGENT_URL` | Writer agent URL | No | `http://localhost:8003` |
| `REVIEWER_AGENT_URL` | Reviewer agent URL | No | `http://localhost:8004` |
| `EXPORTER_AGENT_URL` | Exporter agent URL | No | `http://localhost:8005` |

### Docker Services

The `docker-compose.yml` includes:

- **qdrant**: Vector database service
- **retriever-agent**: Python retriever agent
- **analyst-agent**: Python analyst agent
- **writer-agent**: Python writer agent
- **reviewer-agent**: Python reviewer agent
- **exporter-agent**: Python exporter agent
- **nextjs-app**: Next.js frontend application

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "type": "Qdrant"
  }
}
```

### 2. Test Retriever Agent
```bash
cd data-pipeline
python retriever_agent.py
```

### 3. Test Data Pipeline
```bash
cd data-pipeline
python test_qdrant.py
```

### 4. Test Search Functionality
```bash
cd data-pipeline
python test_search.py
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Qdrant Connection Failed
```bash
# Check Qdrant service
curl http://localhost:6333/health

# Verify environment variables
echo $QDRANT_URL
echo $QDRANT_API_KEY
```

#### 2. Python Dependencies Missing
```bash
cd data-pipeline
pip install -r requirements.txt
```

#### 3. Docker Services Not Starting
```bash
# Check Docker logs
docker-compose logs qdrant
docker-compose logs retriever-agent

# Restart services
docker-compose restart
```

#### 4. Environment Variables Not Loaded
```bash
# Check .env.local exists
ls -la .env.local

# Verify variables are loaded
node -e "console.log(process.env.QDRANT_URL)"
```

### Performance Optimization

#### 1. Qdrant Configuration
- Use Qdrant Cloud for production
- Configure appropriate cluster size
- Enable persistence for data durability

#### 2. Caching
- Redis caching is enabled by default
- Monitor cache hit rates
- Adjust cache TTL as needed

#### 3. Agent Scaling
- Each agent runs in separate containers
- Scale agents based on load
- Monitor agent response times

## 📊 Monitoring

### Health Endpoints
- `/api/health` - Overall system health
- `/api/retriever/health` - Retriever agent health
- `/api/analyst/health` - Analyst agent health
- `/api/writer/health` - Writer agent health
- `/api/reviewer/health` - Reviewer agent health
- `/api/exporter/health` - Exporter agent health

### Metrics to Monitor
- Vector search response time
- Agent processing time
- Cache hit rates
- Error rates
- Memory usage
- CPU usage

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Production environment variables
NODE_ENV=production
QDRANT_URL=https://your-production-cluster.qdrant.io
QDRANT_API_KEY=your_production_api_key
```

### 2. Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Security Considerations
- Use strong API keys
- Enable HTTPS
- Configure CORS properly
- Set up monitoring and alerting
- Regular security updates

## 📚 Additional Resources

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Qdrant Cloud](https://cloud.qdrant.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🎯 Next Steps

1. **Customize Crawling**: Add your own data sources
2. **Enhance Agents**: Improve AI agent capabilities
3. **Add Monitoring**: Implement comprehensive monitoring
4. **Scale Infrastructure**: Plan for production scaling
5. **Security Hardening**: Implement security best practices

The FoundryStack system is now ready for development and production use with Qdrant vector database integration!
