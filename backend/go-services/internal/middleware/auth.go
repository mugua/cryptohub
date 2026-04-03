// Package middleware provides Gin middleware for JWT authentication.
// 中间件包：提供 Gin 的 JWT 认证中间件
package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/cryptohub/backend/pkg/response"
)

const (
	ContextUserID = "user_id"
	ContextRole   = "user_role"
	ContextEmail  = "user_email"
)

// Claims defines the JWT payload fields.
type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthMiddleware validates the Bearer JWT token in the Authorization header.
// AuthMiddleware 验证 Authorization 头中的 Bearer JWT 令牌
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "authorization header required")
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
			response.Unauthorized(c, "invalid authorization header format")
			return
		}
		tokenStr := parts[1]
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			response.Unauthorized(c, "invalid or expired token")
			return
		}
		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextRole, claims.Role)
		c.Set(ContextEmail, claims.Email)
		c.Next()
	}
}

// RequireRole returns a middleware that ensures the authenticated user has the required role.
// RequireRole 返回确保已认证用户拥有所需角色的中间件
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, _ := c.Get(ContextRole)
		if userRole != role {
			response.Forbidden(c, "insufficient permissions")
			return
		}
		c.Next()
	}
}
