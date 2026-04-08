package main

import (
	"log"

	"github.com/cryptohub/trading/config"
	"github.com/cryptohub/trading/internal/handlers"
	"github.com/cryptohub/trading/internal/middleware"
	"github.com/cryptohub/trading/internal/services"
	"github.com/cryptohub/trading/internal/services/exchange"
	"github.com/cryptohub/trading/internal/ws"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	// Exchange registry
	exchanges := map[string]exchange.Exchange{
		"binance": exchange.NewBinanceExchange("", ""),
		"okx":     exchange.NewOKXExchange("", "", ""),
	}

	// Services
	riskService := services.NewRiskService()
	tradingService := services.NewTradingService(nil, exchanges, riskService, cfg.KafkaBootstrap)
	backtestService := services.NewBacktestService()

	// WebSocket hub
	hub := ws.NewHub()
	go hub.Run()

	// Handlers
	strategyHandler := handlers.NewStrategyHandler(nil)
	orderHandler := handlers.NewOrderHandler(tradingService)
	backtestHandler := handlers.NewBacktestHandler(backtestService)
	portfolioHandler := handlers.NewPortfolioHandler(nil)
	wsHandler := handlers.NewWSHandler(hub)

	// Router
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.RateLimitMiddleware(10, 20))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "trading"})
	})

	// WebSocket (no auth required)
	r.GET("/ws", wsHandler.Handle)

	// Authenticated routes
	api := r.Group("/api/v1")
	api.Use(middleware.AuthMiddleware(cfg.SecretKey))
	{
		strategies := api.Group("/strategies")
		{
			strategies.GET("", strategyHandler.List)
			strategies.POST("", strategyHandler.Create)
			strategies.GET("/:id", strategyHandler.Get)
			strategies.PUT("/:id", strategyHandler.Update)
			strategies.DELETE("/:id", strategyHandler.Delete)
			strategies.POST("/:id/start", strategyHandler.Start)
			strategies.POST("/:id/stop", strategyHandler.Stop)
		}

		orders := api.Group("/orders")
		{
			orders.POST("", orderHandler.Place)
			orders.GET("", orderHandler.List)
			orders.GET("/:id", orderHandler.Get)
			orders.POST("/:id/cancel", orderHandler.Cancel)
		}

		backtests := api.Group("/backtests")
		{
			backtests.POST("", backtestHandler.Run)
			backtests.GET("/:id", backtestHandler.GetResult)
		}

		portfolios := api.Group("/portfolios")
		{
			portfolios.GET("", portfolioHandler.List)
			portfolios.POST("", portfolioHandler.Create)
			portfolios.PUT("/:id", portfolioHandler.Update)
			portfolios.GET("/:id/performance", portfolioHandler.GetPerformance)
		}
	}

	log.Printf("Trading service starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
