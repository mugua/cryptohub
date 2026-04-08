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

type StrategyHandler struct {
	db *pgxpool.Pool
}

func NewStrategyHandler(db *pgxpool.Pool) *StrategyHandler {
	return &StrategyHandler{db: db}
}

func (h *StrategyHandler) List(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	if h.db == nil {
		c.JSON(http.StatusOK, []models.Strategy{})
		return
	}

	rows, err := h.db.Query(c.Request.Context(), `
		SELECT id, user_id, name, description, strategy_type, config, code, is_active, is_paper, created_at, updated_at
		FROM strategies WHERE user_id=$1 ORDER BY created_at DESC`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var strategies []models.Strategy
	for rows.Next() {
		var s models.Strategy
		if err := rows.Scan(&s.ID, &s.UserID, &s.Name, &s.Description, &s.StrategyType,
			&s.Config, &s.Code, &s.IsActive, &s.IsPaper, &s.CreatedAt, &s.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		strategies = append(strategies, s)
	}
	c.JSON(http.StatusOK, strategies)
}

func (h *StrategyHandler) Create(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var req models.CreateStrategyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	strategy := models.Strategy{
		ID:           uuid.New(),
		UserID:       userID,
		Name:         req.Name,
		Description:  req.Description,
		StrategyType: req.StrategyType,
		Config:       req.Config,
		Code:         req.Code,
		IsActive:     false,
		IsPaper:      req.IsPaper,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if strategy.Config == nil {
		strategy.Config = json.RawMessage("{}")
	}

	if h.db != nil {
		_, err := h.db.Exec(c.Request.Context(), `
			INSERT INTO strategies (id, user_id, name, description, strategy_type, config, code, is_active, is_paper, created_at, updated_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
			strategy.ID, strategy.UserID, strategy.Name, strategy.Description, strategy.StrategyType,
			strategy.Config, strategy.Code, strategy.IsActive, strategy.IsPaper, strategy.CreatedAt, strategy.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusCreated, strategy)
}

func (h *StrategyHandler) Get(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid strategy id"})
		return
	}

	if h.db == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var s models.Strategy
	err = h.db.QueryRow(c.Request.Context(), `
		SELECT id, user_id, name, description, strategy_type, config, code, is_active, is_paper, created_at, updated_at
		FROM strategies WHERE id=$1 AND user_id=$2`, id, userID).Scan(
		&s.ID, &s.UserID, &s.Name, &s.Description, &s.StrategyType,
		&s.Config, &s.Code, &s.IsActive, &s.IsPaper, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "strategy not found"})
		return
	}

	c.JSON(http.StatusOK, s)
}

func (h *StrategyHandler) Update(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid strategy id"})
		return
	}

	var req models.UpdateStrategyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if h.db == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	_, err = h.db.Exec(c.Request.Context(), `
		UPDATE strategies SET name=COALESCE(NULLIF($3,''), name), description=COALESCE(NULLIF($4,''), description),
		strategy_type=COALESCE(NULLIF($5,''), strategy_type), config=COALESCE($6, config),
		code=COALESCE(NULLIF($7,''), code), is_paper=$8, updated_at=$9
		WHERE id=$1 AND user_id=$2`,
		id, userID, req.Name, req.Description, req.StrategyType, req.Config, req.Code, req.IsPaper, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "strategy updated"})
}

func (h *StrategyHandler) Delete(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid strategy id"})
		return
	}

	if h.db != nil {
		_, err = h.db.Exec(c.Request.Context(), `DELETE FROM strategies WHERE id=$1 AND user_id=$2`, id, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "strategy deleted"})
}

func (h *StrategyHandler) Start(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid strategy id"})
		return
	}

	if h.db != nil {
		_, err = h.db.Exec(c.Request.Context(), `UPDATE strategies SET is_active=true, updated_at=$3 WHERE id=$1 AND user_id=$2`, id, userID, time.Now())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "strategy started"})
}

func (h *StrategyHandler) Stop(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid strategy id"})
		return
	}

	if h.db != nil {
		_, err = h.db.Exec(c.Request.Context(), `UPDATE strategies SET is_active=false, updated_at=$3 WHERE id=$1 AND user_id=$2`, id, userID, time.Now())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "strategy stopped"})
}
