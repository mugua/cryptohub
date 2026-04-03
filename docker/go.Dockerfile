# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

RUN apk --no-cache add git ca-certificates tzdata

WORKDIR /app

# Download dependencies first to benefit from Docker layer caching
COPY backend/go-services/go.mod backend/go-services/go.sum ./
RUN go mod download && go mod verify

# Copy the full Go source tree
COPY backend/go-services/ .

# Build the specific service binary
ARG SERVICE_NAME
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
      -ldflags="-w -s -X main.Version=$(git describe --tags --always 2>/dev/null || echo dev)" \
      -o /server \
      ./cmd/${SERVICE_NAME}/main.go

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata wget && \
    addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder /server .

# Drop privileges
USER app

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./server"]
