@echo off
REM Development startup script for FoundryStack with Python Retriever Agent

echo 🚀 Starting FoundryStack Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Create virtual environment for Python if it doesn't exist
if not exist "python-retriever\venv" (
    echo 📦 Creating Python virtual environment...
    cd python-retriever
    python -m venv venv
    cd ..
)

REM Activate virtual environment and install dependencies
echo 📦 Installing Python dependencies...
cd python-retriever
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Start Python Retriever Agent in background
echo 🐍 Starting Python Retriever Agent...
cd python-retriever
start /B cmd /c "venv\Scripts\activate.bat && python main.py"
cd ..

REM Wait for Python service to start
echo ⏳ Waiting for Python Retriever Agent to start...
timeout /t 5 /nobreak >nul

REM Check if Python service is running
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Failed to start Python Retriever Agent
    pause
    exit /b 1
) else (
    echo ✅ Python Retriever Agent is running on http://localhost:8000
)

REM Start Next.js development server
echo ⚛️ Starting Next.js development server...
start /B cmd /c "npm run dev"

REM Wait for Next.js to start
echo ⏳ Waiting for Next.js to start...
timeout /t 10 /nobreak >nul

REM Check if Next.js is running
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Failed to start Next.js
    pause
    exit /b 1
) else (
    echo ✅ Next.js is running on http://localhost:3000
)

echo.
echo 🎉 FoundryStack Development Environment is ready!
echo.
echo 📊 Services:
echo   - Next.js App: http://localhost:3000
echo   - Python Retriever: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.
echo 🧪 Test the Python Retriever:
echo   curl -X POST http://localhost:8000/enrich -H "Content-Type: application/json" -d "{\"query\":\"create a blueprint for AI fintech startup\"}"
echo.
echo Press any key to stop all services
pause >nul
