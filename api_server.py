from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

from orchestrator import ChainManager

# Load env from .env.local or .env
from pathlib import Path
env_local = Path('.env.local')
env_file = Path('.env')
if env_local.exists():
	load_dotenv(env_local)
elif env_file.exists():
	load_dotenv(env_file)
else:
	load_dotenv()

app = FastAPI(title="Finance Copilot API", version="1.0.0")

# CORS for local Next.js dev
origins = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
]
app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Simple in-memory trial limiter
TRIAL_LIMIT = 2
user_trials: Dict[str, int] = {}

# Request/Response models
class GenerateRequest(BaseModel):
	user_id: str = Field(..., min_length=1)
	prompt: str = Field(..., min_length=1)
	# Optional: forward structured fields if needed in future
	input_overrides: Optional[Dict[str, Any]] = None

class GenerateResponse(BaseModel):
	response: Dict[str, Any]
	tokens_used: int
	remaining_trials: int

# Initialize orchestrator (ensures API key loaded only on startup)
chain_manager = ChainManager(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
	# Trial limit enforcement
	used = user_trials.get(req.user_id, 0)
	remaining = max(TRIAL_LIMIT - used, 0)
	if used >= TRIAL_LIMIT:
		raise HTTPException(status_code=403, detail="Trial limit reached. Upgrade to continue.")

	# Build a minimal input payload for the chain from the prompt
	# For MVP, we map the freeform prompt into the existing example structure.
	# In production, pass the real structured form data from the frontend.
	base_input = {
		"startupName": "User Startup",
		"industry": "General",
		"targetMarket": "B2B",
		"geography": "United States",
		"teamSize": 3,
		"productStage": "MVP",
		"monthlyRevenue": 0,
		"growthRate": "",
		"tractionSummary": req.prompt[:200],
		"businessModel": "Subscription",
		"fundingGoal": None,
		"mainFinancialConcern": req.prompt,
	}

	# Apply optional overrides from client
	if req.input_overrides:
		base_input.update(req.input_overrides)

	# Run the full agent chain (sync CPU-bound, so use threadpool in real scale)
	result = chain_manager.run(base_input)

	# Update trials
	used += 1
	user_trials[req.user_id] = used
	remaining = max(TRIAL_LIMIT - used, 0)

	# Compute a simple token count approximation (optional)
	tokens_used = len(str(result)) // 4  # naive approx

	return GenerateResponse(
		response=result,
		tokens_used=tokens_used,
		remaining_trials=remaining,
	)


@app.get("/api/health")
async def health():
	return {"status": "ok"}


if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="0.0.0.0", port=8000)
