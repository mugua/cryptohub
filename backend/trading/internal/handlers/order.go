package handlers

import (
	"net/http"

	"github.com/cryptohub/trading/internal/models"
	"github.com/cryptohub/trading/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrderHandler struct {
	tradingService *services.TradingService
}

func NewOrderHandler(tradingService *services.TradingService) *OrderHandler {
	return &OrderHandler{tradingService: tradingService}
}

func (h *OrderHandler) Place(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var req models.PlaceOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.tradingService.ExecuteOrder(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "order": order})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *OrderHandler) List(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	orders, err := h.tradingService.ListOrders(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func (h *OrderHandler) Get(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	order, err := h.tradingService.GetOrder(c.Request.Context(), userID, orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func (h *OrderHandler) Cancel(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	if err := h.tradingService.CancelOrder(c.Request.Context(), userID, orderID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "order cancelled"})
}
