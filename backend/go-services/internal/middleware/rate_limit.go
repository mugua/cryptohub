package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// RateLimitMiddleware limits each user to maxRequests per window using Redis.
// RateLimitMiddleware 使用 Redis 将每个用户限制在时间窗口内最多 maxRequests 次请求
func RateLimitMiddleware(rdb *redis.Client, maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Use user ID if authenticated, otherwise fall back to IP.
		// 如果已认证则使用用户 ID，否则回退到 IP 地址
		identifier, exists := c.Get(ContextUserID)
		if !exists || identifier == "" {
			identifier = c.ClientIP()
		}
		key := fmt.Sprintf("rate_limit:%v", identifier)
		ctx := context.Background()

		pipe := rdb.Pipeline()
		incr := pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, window)
		if _, err := pipe.Exec(ctx); err != nil {
			// On Redis error, allow the request to pass to avoid blocking all traffic.
			// Redis 错误时放行请求，避免阻断所有流量
			c.Next()
			return
		}
		count := incr.Val()
		remaining := int64(maxRequests) - count
		if remaining < 0 {
			remaining = 0
		}
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(window).Unix()))

		if count > int64(maxRequests) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "RATE_LIMIT_EXCEEDED",
					"message": "too many requests, please slow down",
				},
			})
			return
		}
		c.Next()
	}
}
