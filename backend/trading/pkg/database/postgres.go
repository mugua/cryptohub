package database

import (
	"context"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	pool *pgxpool.Pool
	once sync.Once
)

func InitDB(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	var initErr error
	once.Do(func() {
		config, err := pgxpool.ParseConfig(databaseURL)
		if err != nil {
			initErr = fmt.Errorf("parsing database config: %w", err)
			return
		}
		config.MaxConns = 20

		p, err := pgxpool.NewWithConfig(ctx, config)
		if err != nil {
			initErr = fmt.Errorf("creating connection pool: %w", err)
			return
		}

		if err := p.Ping(ctx); err != nil {
			initErr = fmt.Errorf("pinging database: %w", err)
			return
		}

		pool = p
	})
	return pool, initErr
}

func GetPool() *pgxpool.Pool {
	return pool
}
