from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os
import logging
from dotenv import load_dotenv

from orchestrator import ChainManager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Redis-backed limiter (enable only if REDIS_URL present)
REDIS_URL = os.getenv("REDIS_URL")
use_redis_limiter = bool(REDIS_URL)
TRIAL_LIMIT = int(os.getenv("FINANCE_TRIAL_LIMIT", 2))

if use_redis_limiter:
	try:
		from core.limiter_redis import RedisLimiter
		limiter = RedisLimiter()
		logger.info(f"[OK] Redis limiter initialized (limit={TRIAL_LIMIT})")
	except Exception as e:
		logger.error(f"[ERROR] Failed to initialize Redis limiter: {e}")
		use_redis_limiter = False
		user_trials: Dict[str, int] = {}
else:
	# Fallback to in-memory if Redis not configured
	logger.warning("[WARNING] Redis not configured, using in-memory limiter")
	user_trials: Dict[str, int] = {}

# Request/Response models
class GenerateRequest(BaseModel):
	user_id: str = Field(..., min_length=1)
	prompt: str = Field(..., min_length=1)
	input_overrides: Optional[Dict[str, Any]] = None

class GenerateResponse(BaseModel):
	response: Dict[str, Any]
	tokens_used: int
	remaining_trials: int

# Initialize orchestrator (ensures API key loaded only on startup)
chain_manager = ChainManager(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))


@app.on_event("startup")
async def startup_event():
	"""Test Redis connection on startup"""
	if use_redis_limiter:
		try:
			test_key = "startup_test"
			await limiter.redis.set(test_key, "ok")
			result = await limiter.redis.get(test_key)
			await limiter.redis.delete(test_key)
			if result == "ok":
				logger.info("[OK] Redis connection verified on startup")
			else:
				logger.error("[ERROR] Redis test failed: unexpected value")
		except Exception as e:
			logger.error(f"[ERROR] Redis connection test failed: {e}")


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
	user_id = req.user_id

	# Check trial limit
	if use_redis_limiter:
		try:
			if not await limiter.can_use(user_id):
				logger.info(f"[BLOCKED] User {user_id} exceeded trial limit (Redis)")
				raise HTTPException(status_code=403, detail="Free trials exhausted. Please upgrade.")
			logger.info(f"[OK] User {user_id} within trial limit (Redis)")
		except HTTPException:
			raise
		except Exception as e:
			logger.error(f"[ERROR] Redis limiter check failed: {e}")
			raise HTTPException(status_code=500, detail="Trial limiter error")
	else:
		# In-memory limiter
		used = user_trials.get(user_id, 0)
		if used >= TRIAL_LIMIT:
			logger.info(f"[BLOCKED] User {user_id} exceeded trial limit (in-memory)")
			raise HTTPException(status_code=403, detail="Trial limit reached. Upgrade to continue.")
		logger.info(f"[OK] User {user_id} within trial limit (in-memory): {used}/{TRIAL_LIMIT}")

	# Build a minimal input payload for the chain from the prompt + overrides
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
	if req.input_overrides:
		base_input.update(req.input_overrides)

	# Run the chain (sync; for heavy loads consider background/task queue)
	result = chain_manager.run(base_input)
	# naive token approximation
	tokens_used = len(str(result)) // 4

	# Update usage and compute remaining
	if use_redis_limiter:
		try:
			await limiter.increment_usage(user_id, tokens_used)
			remaining = await limiter.remaining_trials(user_id)
			logger.info(f"[OK] User {user_id} usage updated in Redis. Remaining: {remaining}")
		except Exception as e:
			logger.error(f"[ERROR] Failed to update Redis usage: {e}")
			raise HTTPException(status_code=500, detail="Failed to update usage")
	else:
		# In-memory update
		user_trials[user_id] = user_trials.get(user_id, 0) + 1
		remaining = max(TRIAL_LIMIT - user_trials[user_id], 0)
		logger.info(f"[OK] User {user_id} usage updated in-memory. Used: {user_trials[user_id]}, Remaining: {remaining}")

	return GenerateResponse(
		response=result,
		tokens_used=tokens_used,
		remaining_trials=remaining,
	)


@app.get("/api/health")
async def health():
	return {"status": "ok"}

@app.get("/")
async def root():
	return {"message": "Finance Copilot API is live 🚀"}

if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="0.0.0.0", port=8000)
