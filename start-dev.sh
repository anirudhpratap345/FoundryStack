#!/bin/bash

# Development startup script for FoundryStack with Python AI Agents

echo "🚀 Starting FoundryStack Development Environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Create virtual environments for Python agents if they don't exist
echo "📦 Setting up Python virtual environments..."

# Retriever Agent
if [ ! -d "python-retriever/venv" ]; then
    echo "📦 Creating Retriever Agent virtual environment..."
    cd python-retriever
    python3 -m venv venv
    cd ..
fi

# Analyst Agent
if [ ! -d "analyst-agent/venv" ]; then
    echo "📦 Creating Analyst Agent virtual environment..."
    cd analyst-agent
    python3 -m venv venv
    cd ..
fi

# Writer Agent
if [ ! -d "writer-agent/venv" ]; then
    echo "📦 Creating Writer Agent virtual environment..."
    cd writer-agent
    python3 -m venv venv
    cd ..
fi

# Reviewer Agent
if [ ! -d "reviewer-agent/venv" ]; then
    echo "📦 Creating Reviewer Agent virtual environment..."
    cd reviewer-agent
    python3 -m venv venv
    cd ..
fi

# Exporter Agent
if [ ! -d "exporter-agent/venv" ]; then
    echo "📦 Creating Exporter Agent virtual environment..."
    cd exporter-agent
    python3 -m venv venv
    cd ..
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."

# Retriever Agent
cd python-retriever
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Analyst Agent
cd analyst-agent
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Writer Agent
cd writer-agent
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Reviewer Agent
cd reviewer-agent
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Exporter Agent
cd exporter-agent
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start Python AI Agents in background
echo "🐍 Starting Python AI Agents..."

# Start Retriever Agent
echo "🔍 Starting Retriever Agent..."
cd python-retriever
source venv/bin/activate
python main.py &
RETRIEVER_PID=$!
cd ..

# Start Analyst Agent
echo "📊 Starting Analyst Agent..."
cd analyst-agent
source venv/bin/activate
python main.py &
ANALYST_PID=$!
cd ..

# Start Writer Agent
echo "✍️ Starting Writer Agent..."
cd writer-agent
source venv/bin/activate
python main.py &
WRITER_PID=$!
cd ..

# Start Reviewer Agent
echo "🔍 Starting Reviewer Agent..."
cd reviewer-agent
source venv/bin/activate
python main.py &
REVIEWER_PID=$!
cd ..

# Start Exporter Agent
echo "📤 Starting Exporter Agent..."
cd exporter-agent
source venv/bin/activate
python main.py &
EXPORTER_PID=$!
cd ..

# Wait for Python services to start
echo "⏳ Waiting for Python AI Agents to start..."
sleep 10

# Check if all Python services are running
echo "🔍 Checking service health..."

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Retriever Agent is running on http://localhost:8000"
else
    echo "❌ Failed to start Retriever Agent"
    kill $RETRIEVER_PID $ANALYST_PID $WRITER_PID 2>/dev/null
    exit 1
fi

if curl -f http://localhost:8002/health > /dev/null 2>&1; then
    echo "✅ Analyst Agent is running on http://localhost:8002"
else
    echo "❌ Failed to start Analyst Agent"
    kill $RETRIEVER_PID $ANALYST_PID $WRITER_PID 2>/dev/null
    exit 1
fi

if curl -f http://localhost:8003/health > /dev/null 2>&1; then
    echo "✅ Writer Agent is running on http://localhost:8003"
else
    echo "❌ Failed to start Writer Agent"
    kill $RETRIEVER_PID $ANALYST_PID $WRITER_PID $REVIEWER_PID 2>/dev/null
    exit 1
fi

if curl -f http://localhost:8004/health > /dev/null 2>&1; then
    echo "✅ Reviewer Agent is running on http://localhost:8004"
else
    echo "❌ Failed to start Reviewer Agent"
    kill $RETRIEVER_PID $ANALYST_PID $WRITER_PID $REVIEWER_PID $EXPORTER_PID 2>/dev/null
    exit 1
fi

if curl -f http://localhost:8005/health > /dev/null 2>&1; then
    echo "✅ Exporter Agent is running on http://localhost:8005"
else
    echo "❌ Failed to start Exporter Agent"
    kill $RETRIEVER_PID $ANALYST_PID $WRITER_PID $REVIEWER_PID $EXPORTER_PID 2>/dev/null
    exit 1
fi

# Start Next.js development server
echo "⚛️ Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait for Next.js to start
echo "⏳ Waiting for Next.js to start..."
sleep 10

# Check if Next.js is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Next.js is running on http://localhost:3000"
else
    echo "❌ Failed to start Next.js"
    kill $RETRIEVER_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 FoundryStack Development Environment is ready!"
echo ""
echo "📊 Services:"
echo "  - Next.js App: http://localhost:3000"
echo "  - Retriever Agent: http://localhost:8000"
echo "  - Analyst Agent: http://localhost:8002"
echo "  - Writer Agent: http://localhost:8003"
echo "  - Reviewer Agent: http://localhost:8004"
echo "  - Exporter Agent: http://localhost:8005"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "🧪 Test the complete 5-agent pipeline:"
echo "  python test-complete-5-agent-pipeline.py"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $RETRIEVER_PID 2>/dev/null
    kill $ANALYST_PID 2>/dev/null
    kill $WRITER_PID 2>/dev/null
    kill $REVIEWER_PID 2>/dev/null
    kill $EXPORTER_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
