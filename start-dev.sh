#!/bin/bash

# Development startup script for FoundryStack with Python Retriever Agent

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

# Create virtual environment for Python if it doesn't exist
if [ ! -d "python-retriever/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd python-retriever
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "📦 Installing Python dependencies..."
cd python-retriever
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start Python Retriever Agent in background
echo "🐍 Starting Python Retriever Agent..."
cd python-retriever
source venv/bin/activate
python main.py &
RETRIEVER_PID=$!
cd ..

# Wait for Python service to start
echo "⏳ Waiting for Python Retriever Agent to start..."
sleep 5

# Check if Python service is running
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Python Retriever Agent is running on http://localhost:8000"
else
    echo "❌ Failed to start Python Retriever Agent"
    kill $RETRIEVER_PID 2>/dev/null
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
echo "  - Python Retriever: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "🧪 Test the Python Retriever:"
echo "  curl -X POST http://localhost:8000/enrich -H 'Content-Type: application/json' -d '{\"query\":\"create a blueprint for AI fintech startup\"}'"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $RETRIEVER_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
