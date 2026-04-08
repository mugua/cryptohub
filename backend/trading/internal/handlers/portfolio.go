package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/cryptohub/trading/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PortfolioHandler struct {
	db *pgxpool.Pool
}

func NewPortfolioHandler(db *pgxpool.Pool) *PortfolioHandler {
	return &PortfolioHandler{db: db}
}

func (h *PortfolioHandler) List(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	if h.db == nil {
		c.JSON(http.StatusOK, []models.Portfolio{})
		return
	}

	rows, err := h.db.Query(c.Request.Context(), `
		SELECT id, user_id, name, description, allocations, is_active, created_at, updated_at
		FROM portfolios WHERE user_id=$1 ORDER BY created_at DESC`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var portfolios []models.Portfolio
	for rows.Next() {
		var p models.Portfolio
		if err := rows.Scan(&p.ID, &p.UserID, &p.Name, &p.Description,
			&p.Allocations, &p.IsActive, &p.CreatedAt, &p.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		portfolios = append(portfolios, p)
	}
	c.JSON(http.StatusOK, portfolios)
}

func (h *PortfolioHandler) Create(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var req models.CreatePortfolioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	portfolio := models.Portfolio{
		ID:          uuid.New(),
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Allocations: req.Allocations,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if portfolio.Allocations == nil {
		portfolio.Allocations = json.RawMessage("[]")
	}

	if h.db != nil {
		_, err := h.db.Exec(c.Request.Context(), `
			INSERT INTO portfolios (id, user_id, name, description, allocations, is_active, created_at, updated_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
			portfolio.ID, portfolio.UserID, portfolio.Name, portfolio.Description,
			portfolio.Allocations, portfolio.IsActive, portfolio.CreatedAt, portfolio.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, portfolio)
}

func (h *PortfolioHandler) Update(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid portfolio id"})
		return
	}

	var req models.UpdatePortfolioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if h.db == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	_, err = h.db.Exec(c.Request.Context(), `
		UPDATE portfolios SET name=COALESCE(NULLIF($3,''), name), description=COALESCE(NULLIF($4,''), description),
		allocations=COALESCE($5, allocations), updated_at=$6
		WHERE id=$1 AND user_id=$2`,
		id, userID, req.Name, req.Description, req.Allocations, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "portfolio updated"})
}

func (h *PortfolioHandler) GetPerformance(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid portfolio id"})
		return
	}

	// Simplified performance calculation
	perf := models.PortfolioPerformance{
		PortfolioID:  id,
		TotalValue:   10000.0,
		TotalReturn:  5.2,
		DailyReturn:  0.3,
		WeeklyReturn: 1.8,
	}

	// TODO: query actual portfolio data filtered by userID
	_ = userID
	c.JSON(http.StatusOK, perf)
}
