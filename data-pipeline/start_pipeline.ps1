# FoundryStack Pipeline Startup Script
# Sets environment variables and starts the pipeline API

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   FoundryStack Multi-Agent Pipeline Startup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Set Python encoding to UTF-8
$env:PYTHONIOENCODING = "utf-8"
Write-Host "[1/4] Set Python encoding to UTF-8" -ForegroundColor Green

# Load .env file if it exists
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Write-Host "[2/4] Loading environment variables from .env..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.+)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
            Write-Host "      Loaded: $name" -ForegroundColor Gray
        }
    }
    Write-Host "      Environment variables loaded successfully!" -ForegroundColor Green
} else {
    Write-Host "[2/4] No .env file found at: $envFile" -ForegroundColor Yellow
    Write-Host "      Using system environment variables" -ForegroundColor Yellow
}

# Verify critical environment variables
Write-Host "[3/4] Verifying environment variables..." -ForegroundColor Green
$critical = @("QDRANT_URL", "QDRANT_API_KEY", "GEMINI_API_KEY")
$missing = @()
foreach ($var in $critical) {
    if ([string]::IsNullOrEmpty((Get-Item -Path "env:$var" -ErrorAction SilentlyContinue).Value)) {
        $missing += $var
        Write-Host "      MISSING: $var" -ForegroundColor Red
    } else {
        $value = (Get-Item -Path "env:$var").Value
        $display = if ($value.Length > 20) { $value.Substring(0, 20) + "..." } else { $value }
        Write-Host "      OK: $var = $display" -ForegroundColor Gray
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "ERROR: Missing required environment variables: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Please set these in the .env file or system environment" -ForegroundColor Red
    exit 1
}

Write-Host "      All critical variables present!" -ForegroundColor Green

# Start the pipeline
Write-Host "[4/4] Starting pipeline API on http://localhost:8015..." -ForegroundColor Green
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Pipeline is starting..." -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Run the pipeline
python pipeline_api.py

