package handlers

import (
	"net/http"

	"github.com/cryptohub/trading/internal/services"
	"github.com/gin-gonic/gin"
)

type BacktestHandler struct {
	backtestService *services.BacktestService
}

func NewBacktestHandler(backtestService *services.BacktestService) *BacktestHandler {
	return &BacktestHandler{backtestService: backtestService}
}

func (h *BacktestHandler) Run(c *gin.Context) {
	var req services.BacktestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.backtestService.RunBacktest(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *BacktestHandler) GetResult(c *gin.Context) {
	// In a full implementation, results would be stored and retrieved by ID
	c.JSON(http.StatusOK, gin.H{"message": "backtest results would be retrieved by ID"})
}
