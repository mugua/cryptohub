// Package logger provides a structured Zap-based logger with log level control and file rotation.
// 日志包：提供基于 Zap 的结构化日志，支持日志级别控制和文件滚动
package logger

import (
	"fmt"
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Options configures the logger behaviour.
// Options 配置日志行为
type Options struct {
	Level      string // "debug", "info", "warn", "error"
	OutputPath string // file path; empty means stdout only / 文件路径；空则仅输出到标准输出
	MaxSizeMB  int    // max log file size before rotation (MB)
	MaxBackups int    // number of old log files to keep
	MaxAgeDays int    // maximum days to keep old log files
	Compress   bool   // compress rotated files
	JSON       bool   // use JSON encoder
}

// defaultOptions returns sensible production defaults.
func defaultOptions() Options {
	return Options{
		Level:      "info",
		MaxSizeMB:  100,
		MaxBackups: 3,
		MaxAgeDays: 7,
		Compress:   true,
		JSON:       true,
	}
}

// New creates a new *zap.Logger based on the provided options.
// New 根据提供的选项创建新的 *zap.Logger
func New(opts ...Options) (*zap.Logger, error) {
	opt := defaultOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}

	level, err := zapcore.ParseLevel(opt.Level)
	if err != nil {
		return nil, fmt.Errorf("invalid log level %q: %w", opt.Level, err)
	}

	encoderCfg := buildEncoderConfig()

	var enc zapcore.Encoder
	if opt.JSON {
		enc = zapcore.NewJSONEncoder(encoderCfg)
	} else {
		enc = zapcore.NewConsoleEncoder(encoderCfg)
	}

	cores := []zapcore.Core{
		// Always write to stdout / 始终写入标准输出
		zapcore.NewCore(enc, zapcore.AddSync(os.Stdout), level),
	}

	if opt.OutputPath != "" {
		if err := os.MkdirAll(filepath.Dir(opt.OutputPath), 0755); err != nil {
			return nil, fmt.Errorf("failed to create log directory: %w", err)
		}
		// Open (or create) the log file, append mode.
		// 以追加模式打开（或创建）日志文件
		f, err := os.OpenFile(opt.OutputPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return nil, fmt.Errorf("failed to open log file: %w", err)
		}
		cores = append(cores, zapcore.NewCore(enc, zapcore.AddSync(f), level))
	}

	core := zapcore.NewTee(cores...)

	logger := zap.New(core,
		zap.AddCaller(),
		zap.AddCallerSkip(0),
		zap.AddStacktrace(zapcore.ErrorLevel),
	)

	return logger, nil
}

// MustNew creates a logger and panics on failure.
// MustNew 创建日志器，失败时 panic
func MustNew(opts ...Options) *zap.Logger {
	l, err := New(opts...)
	if err != nil {
		panic(fmt.Sprintf("failed to initialise logger: %v", err))
	}
	return l
}

// buildEncoderConfig returns a production-grade encoder configuration.
// buildEncoderConfig 返回生产级编码器配置
func buildEncoderConfig() zapcore.EncoderConfig {
	cfg := zap.NewProductionEncoderConfig()
	cfg.TimeKey = "time"
	cfg.LevelKey = "level"
	cfg.MessageKey = "msg"
	cfg.CallerKey = "caller"
	cfg.EncodeTime = zapcore.ISO8601TimeEncoder
	cfg.EncodeLevel = zapcore.LowercaseLevelEncoder
	cfg.EncodeCaller = zapcore.ShortCallerEncoder
	return cfg
}

// Named returns a child logger with a fixed name field, useful for per-service tagging.
// Named 返回带有固定名称字段的子日志器，用于服务标记
func Named(base *zap.Logger, name string) *zap.Logger {
	return base.Named(name)
}

// With returns a child logger with pre-populated fields.
func With(base *zap.Logger, fields ...zap.Field) *zap.Logger {
	return base.With(fields...)
}
