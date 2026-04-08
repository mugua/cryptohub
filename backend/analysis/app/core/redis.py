from __future__ import annotations

import json
from typing import Any, Optional

import redis.asyncio as aioredis

from config import settings


class RedisClient:
    def __init__(self) -> None:
        self._redis: Optional[aioredis.Redis] = None

    async def connect(self) -> None:
        try:
            self._redis = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
            )
            await self._redis.ping()
        except Exception:
            self._redis = None

    async def disconnect(self) -> None:
        if self._redis:
            await self._redis.aclose()
            self._redis = None

    async def get(self, key: str) -> Optional[str]:
        if not self._redis:
            return None
        return await self._redis.get(key)

    async def get_json(self, key: str) -> Optional[Any]:
        raw = await self.get(key)
        if raw is None:
            return None
        return json.loads(raw)

    async def set(
        self, key: str, value: str, expire: Optional[int] = None
    ) -> None:
        if not self._redis:
            return
        await self._redis.set(key, value, ex=expire)

    async def set_json(
        self, key: str, value: Any, expire: Optional[int] = None
    ) -> None:
        await self.set(key, json.dumps(value, default=str), expire)

    async def delete(self, key: str) -> None:
        if not self._redis:
            return
        await self._redis.delete(key)


redis_client = RedisClient()
