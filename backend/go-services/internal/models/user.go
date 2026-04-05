// Package models defines core domain models for the CryptoHub platform.
// 模型包：定义 CryptoHub 平台的核心领域模型
package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a registered platform user.
// User 表示已注册的平台用户
type User struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"`
	// Role controls access level: "admin" has full access, "user" has standard access.
	// Role 控制访问级别："admin" 拥有完全访问权限，"user" 拥有标准访问权限
	Role         string    `json:"role" db:"role"`
	TwoFAEnabled bool      `json:"two_fa_enabled" db:"two_fa_enabled"`
	TwoFASecret  string    `json:"-" db:"two_fa_secret"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// UserRole constants define valid role values.
const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

// RegisterRequest is the payload for creating a new user.
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=32"`
	Password string `json:"password" binding:"required,min=8"`
}

// LoginRequest is the payload for user authentication.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	TOTPCode string `json:"totp_code"` // Optional when 2FA is enabled / 当启用双因素认证时可选
}

// TokenPair holds the access and refresh token returned after authentication.
// TokenPair 保存认证后返回的访问令牌和刷新令牌
type TokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// RefreshRequest carries the refresh token for renewal.
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Enable2FAResponse holds the TOTP secret and QR code URI.
type Enable2FAResponse struct {
	Secret     string `json:"secret"`
	QRCodeURI  string `json:"qr_code_uri"`
}

// Verify2FARequest carries a TOTP code for 2FA verification.
type Verify2FARequest struct {
	Code string `json:"code" binding:"required,len=6"`
}
