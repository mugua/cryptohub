package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"cryptohub/go-core/internal/config"
	"cryptohub/go-core/internal/handlers"
	"cryptohub/go-core/internal/middleware"
	ws "cryptohub/go-core/internal/websocket"
)

func main() {
	cfg := config.Load()
	gin.SetMode(cfg.Server.Mode)

	hub := ws.NewHub()
	go hub.Run()
	hub.StartMarketSimulator()

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	// ── Public routes ────────────────────────────────────────────────────────
	r.GET("/health", handlers.Health)

	// WebSocket endpoint
	r.GET("/ws", hub.ServeWS)

	// ── API v1 ───────────────────────────────────────────────────────────────
	v1 := r.Group("/api/v1")
	{
		// Market data (public)
		market := v1.Group("/market")
		{
			market.GET("/tickers", handlers.GetTickers)
			market.GET("/candles/:symbol", handlers.GetCandles)
		}

		// Protected routes
		auth := v1.Group("")
		auth.Use(middleware.Auth())
		{
			// Portfolio
			auth.GET("/portfolio", handlers.GetPortfolio)

			// Strategies
			strat := auth.Group("/strategies")
			{
				strat.GET("", handlers.ListStrategies)
				strat.POST("", handlers.CreateStrategy)
				strat.GET("/:id", handlers.GetStrategy)
				strat.PATCH("/:id/status", handlers.UpdateStrategyStatus)
				strat.DELETE("/:id", handlers.DeleteStrategy)
			}

			// Orders
			orders := auth.Group("/orders")
			{
				orders.GET("", handlers.ListOrders)
				orders.POST("", handlers.PlaceOrder)
				orders.DELETE("/:id", handlers.CancelOrder)
			}

			// Exchange accounts
			exchanges := auth.Group("/exchanges")
			{
				exchanges.GET("", handlers.ListExchangeAccounts)
				exchanges.POST("", handlers.AddExchangeAccount)
				exchanges.DELETE("/:id", handlers.DeleteExchangeAccount)
			}
		}
	}

	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// Graceful shutdown
	go func() {
		log.Printf("[cryptohub] Go core service listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[cryptohub] shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}
	log.Println("[cryptohub] exited")
}
