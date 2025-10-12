import os
from redis.asyncio import from_url

TRIAL_LIMIT = int(os.getenv("FINANCE_TRIAL_LIMIT", 2))
TRIAL_EXPIRY_DAYS = int(os.getenv("FINANCE_TRIAL_EXPIRY_DAYS", 7))  # auto reset
REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
	raise RuntimeError("REDIS_URL is not set in environment")

redis = from_url(REDIS_URL, decode_responses=True)


class RedisLimiter:
	def __init__(self):
		self.redis = redis

	async def get_user_key(self, user_id: str):
		return f"user:{user_id}"

	async def get_usage(self, user_id: str):
		key = await self.get_user_key(user_id)
		data = await self.redis.hgetall(key)
		if not data:
			return {"trials_used": 0, "tokens_used": 0}
		return {
			"trials_used": int(data.get("trials_used", 0)),
			"tokens_used": int(data.get("tokens_used", 0)),
		}

	async def can_use(self, user_id: str) -> bool:
		usage = await self.get_usage(user_id)
		return usage["trials_used"] < TRIAL_LIMIT

	async def increment_usage(self, user_id: str, tokens: int = 0):
		key = await self.get_user_key(user_id)
		# set expiry if not already set (auto reset)
		if not await self.redis.exists(key):
			await self.redis.hset(key, mapping={"trials_used": 0, "tokens_used": 0})
			await self.redis.expire(key, TRIAL_EXPIRY_DAYS * 86400)
		await self.redis.hincrby(key, "trials_used", 1)
		await self.redis.hincrby(key, "tokens_used", tokens)

	async def remaining_trials(self, user_id: str):
		usage = await self.get_usage(user_id)
		return max(TRIAL_LIMIT - usage["trials_used"], 0)
