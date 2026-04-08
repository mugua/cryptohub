package config

import "os"

type Config struct {
	DatabaseURL    string
	RedisURL       string
	KafkaBootstrap string
	SecretKey      string
	Port           string
}

func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/trading?sslmode=disable"),
		RedisURL:       getEnv("REDIS_URL", "redis://localhost:6379/0"),
		KafkaBootstrap: getEnv("KAFKA_BOOTSTRAP", "localhost:9092"),
		SecretKey:      getEnv("SECRET_KEY", "default-secret-key"),
		Port:           getEnv("PORT", "8001"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
