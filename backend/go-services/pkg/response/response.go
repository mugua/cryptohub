// Package response provides standardised JSON response helpers for Gin handlers.
// 响应包：为 Gin 处理器提供标准化的 JSON 响应辅助函数
package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// envelope is the common JSON wrapper for all API responses.
// envelope 是所有 API 响应的通用 JSON 包装器
type envelope struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *apiError   `json:"error,omitempty"`
}

// apiError carries a machine-readable code and a human-readable message.
// apiError 携带机器可读的错误码和人类可读的错误信息
type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// PaginatedData wraps a slice of items with pagination metadata.
// PaginatedData 将数据切片与分页元数据包装在一起
type PaginatedData struct {
	Items      interface{} `json:"items"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

// Success sends an HTTP 200 response with the given data and an optional message.
// Success 发送 HTTP 200 响应，携带给定数据和可选消息
func Success(c *gin.Context, data interface{}, msgs ...string) {
	msg := "success"
	if len(msgs) > 0 && msgs[0] != "" {
		msg = msgs[0]
	}
	c.JSON(http.StatusOK, envelope{
		Success: true,
		Message: msg,
		Data:    data,
	})
}

// Created sends an HTTP 201 response for successfully created resources.
// Created 为成功创建的资源发送 HTTP 201 响应
func Created(c *gin.Context, data interface{}, msgs ...string) {
	msg := "created"
	if len(msgs) > 0 && msgs[0] != "" {
		msg = msgs[0]
	}
	c.JSON(http.StatusCreated, envelope{
		Success: true,
		Message: msg,
		Data:    data,
	})
}

// Error sends a JSON error response with the given HTTP status.
// Error 发送带有给定 HTTP 状态码的 JSON 错误响应
func Error(c *gin.Context, status int, code string, message string, details ...string) {
	detail := ""
	if len(details) > 0 {
		detail = details[0]
	}
	c.AbortWithStatusJSON(status, envelope{
		Success: false,
		Error: &apiError{
			Code:    code,
			Message: message,
			Details: detail,
		},
	})
}

// BadRequest is a convenience wrapper for HTTP 400 errors.
func BadRequest(c *gin.Context, message string, details ...string) {
	Error(c, http.StatusBadRequest, "BAD_REQUEST", message, details...)
}

// Unauthorized is a convenience wrapper for HTTP 401 errors.
// Unauthorized 是 HTTP 401 错误的便捷包装器
func Unauthorized(c *gin.Context, message string, details ...string) {
	Error(c, http.StatusUnauthorized, "UNAUTHORIZED", message, details...)
}

// Forbidden is a convenience wrapper for HTTP 403 errors.
func Forbidden(c *gin.Context, message string, details ...string) {
	Error(c, http.StatusForbidden, "FORBIDDEN", message, details...)
}

// NotFound is a convenience wrapper for HTTP 404 errors.
func NotFound(c *gin.Context, message string, details ...string) {
	Error(c, http.StatusNotFound, "NOT_FOUND", message, details...)
}

// InternalError is a convenience wrapper for HTTP 500 errors.
// InternalError 是 HTTP 500 错误的便捷包装器
func InternalError(c *gin.Context, message string, details ...string) {
	Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", message, details...)
}

// Paginated sends an HTTP 200 response with paginated data.
// Paginated 发送带有分页数据的 HTTP 200 响应
func Paginated(c *gin.Context, items interface{}, total int64, page, pageSize int) {
	totalPages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		totalPages++
	}
	c.JSON(http.StatusOK, envelope{
		Success: true,
		Data: PaginatedData{
			Items:      items,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	})
}

// NoContent sends HTTP 204 with no body.
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}
