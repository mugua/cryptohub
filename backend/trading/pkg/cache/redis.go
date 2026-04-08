package cache

import (
	"context"
	"fmt"
	"sync"

	"github.com/redis/go-redis/v9"
)

var (
	client *redis.Client
	once   sync.Once
)

func InitRedis(ctx context.Context, redisURL string) (*redis.Client, error) {
	var initErr error
	once.Do(func() {
		opts, err := redis.ParseURL(redisURL)
		if err != nil {
			initErr = fmt.Errorf("parsing redis URL: %w", err)
			return
		}

		c := redis.NewClient(opts)
		if err := c.Ping(ctx).Err(); err != nil {
			initErr = fmt.Errorf("pinging redis: %w", err)
			return
		}
		client = c
	})
	return client, initErr
}

func GetClient() *redis.Client {
	return client
}
