// Package config provides Viper-based configuration loading for all Go microservices.
// 配置包：使用 Viper 加载所有 Go 微服务的配置
package config

import (
	"fmt"
	"strings"
	"time"

	"github.com/spf13/viper"
)

// Config holds the complete application configuration.
// Config 保存完整的应用程序配置
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	NATS     NATSConfig
	JWT      JWTConfig
	Exchange ExchangeConfig
}

// ServerConfig holds HTTP server settings.
type ServerConfig struct {
	Host            string        `mapstructure:"host"`
	Port            int           `mapstructure:"port"`
	ReadTimeout     time.Duration `mapstructure:"read_timeout"`
	WriteTimeout    time.Duration `mapstructure:"write_timeout"`
	ShutdownTimeout time.Duration `mapstructure:"shutdown_timeout"`
	Mode            string        `mapstructure:"mode"` // debug / release
}

// DatabaseConfig holds PostgreSQL connection settings.
type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	SSLMode  string `mapstructure:"sslmode"`
	MaxConns int32  `mapstructure:"max_conns"`
	MinConns int32  `mapstructure:"min_conns"`
}

// DSN constructs the PostgreSQL DSN string.
// DSN 构造 PostgreSQL 连接字符串
func (d DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s pool_max_conns=%d pool_min_conns=%d",
		d.Host, d.Port, d.User, d.Password, d.DBName, d.SSLMode, d.MaxConns, d.MinConns,
	)
}

// RedisConfig holds Redis connection settings.
type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

// Addr returns host:port for Redis.
func (r RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", r.Host, r.Port)
}

// NATSConfig holds NATS messaging settings.
type NATSConfig struct {
	URL            string        `mapstructure:"url"`
	ClusterID      string        `mapstructure:"cluster_id"`
	ClientID       string        `mapstructure:"client_id"`
	ConnectTimeout time.Duration `mapstructure:"connect_timeout"`
}

// JWTConfig holds JWT token settings.
type JWTConfig struct {
	Secret          string        `mapstructure:"secret"`
	AccessTokenTTL  time.Duration `mapstructure:"access_token_ttl"`
	RefreshTokenTTL time.Duration `mapstructure:"refresh_token_ttl"`
	Issuer          string        `mapstructure:"issuer"`
}

// ExchangeConfig holds exchange API key configuration.
type ExchangeConfig struct {
	EncryptionKey string            `mapstructure:"encryption_key"`
	Binance       ExchangeAPIConfig `mapstructure:"binance"`
	OKX           ExchangeAPIConfig `mapstructure:"okx"`
	Bybit         ExchangeAPIConfig `mapstructure:"bybit"`
}

// ExchangeAPIConfig holds API credentials for a single exchange.
type ExchangeAPIConfig struct {
	APIKey    string `mapstructure:"api_key"`
	SecretKey string `mapstructure:"secret_key"`
	Passphrase string `mapstructure:"passphrase"` // OKX requires passphrase
	Testnet   bool   `mapstructure:"testnet"`
	BaseURL   string `mapstructure:"base_url"`
	WSURL     string `mapstructure:"ws_url"`
}

// Load reads configuration from environment variables and config files.
// Precedence: env vars > config file > defaults.
// Load 从环境变量和配置文件中读取配置，优先级：环境变量 > 配置文件 > 默认值
func Load() (*Config, error) {
	v := viper.New()

	// Set defaults / 设置默认值
	setDefaults(v)

	// Config file search paths / 配置文件搜索路径
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("./config")
	v.AddConfigPath("/etc/cryptohub")

	// Read config file (optional) / 读取配置文件（可选）
	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}
	}

	// Bind environment variables / 绑定环境变量
	v.SetEnvPrefix("CRYPTOHUB")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	if err := validate(&cfg); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return &cfg, nil
}

// setDefaults populates Viper with sensible default values.
// setDefaults 为 Viper 填充合理的默认值
func setDefaults(v *viper.Viper) {
	// Server defaults / 服务器默认值
	v.SetDefault("server.host", "0.0.0.0")
	v.SetDefault("server.port", 8080)
	v.SetDefault("server.read_timeout", 30*time.Second)
	v.SetDefault("server.write_timeout", 30*time.Second)
	v.SetDefault("server.shutdown_timeout", 10*time.Second)
	v.SetDefault("server.mode", "release")

	// Database defaults / 数据库默认值
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.sslmode", "disable")
	v.SetDefault("database.max_conns", 20)
	v.SetDefault("database.min_conns", 5)

	// Redis defaults / Redis 默认值
	v.SetDefault("redis.host", "localhost")
	v.SetDefault("redis.port", 6379)
	v.SetDefault("redis.db", 0)
	v.SetDefault("redis.pool_size", 10)

	// NATS defaults / NATS 默认值
	v.SetDefault("nats.url", "nats://localhost:4222")
	v.SetDefault("nats.connect_timeout", 5*time.Second)

	// JWT defaults / JWT 默认值
	v.SetDefault("jwt.access_token_ttl", 15*time.Minute)
	v.SetDefault("jwt.refresh_token_ttl", 7*24*time.Hour)
	v.SetDefault("jwt.issuer", "cryptohub")

	// Exchange defaults / 交易所默认值
	v.SetDefault("exchange.binance.base_url", "https://api.binance.com")
	v.SetDefault("exchange.binance.ws_url", "wss://stream.binance.com:9443")
	v.SetDefault("exchange.okx.base_url", "https://www.okx.com")
	v.SetDefault("exchange.okx.ws_url", "wss://ws.okx.com:8443/ws/v5")
	v.SetDefault("exchange.bybit.base_url", "https://api.bybit.com")
	v.SetDefault("exchange.bybit.ws_url", "wss://stream.bybit.com/v5/public")
}

// validate checks that required configuration fields are set.
// validate 检查必填配置字段是否已设置
func validate(cfg *Config) error {
	if cfg.JWT.Secret == "" {
		return fmt.Errorf("jwt.secret is required")
	}
	if cfg.Database.User == "" || cfg.Database.DBName == "" {
		return fmt.Errorf("database.user and database.dbname are required")
	}
	if cfg.Exchange.EncryptionKey != "" && len(cfg.Exchange.EncryptionKey) != 32 {
		return fmt.Errorf("exchange.encryption_key must be exactly 32 bytes for AES-256")
	}
	return nil
}
