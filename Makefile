.PHONY: setup dev build test lint docker-up docker-down docker-build migrate seed proto clean \
        frontend-dev backend-go-dev backend-python-dev app-android app-ios

# ── Colours ─────────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

LOG   = @printf "$(CYAN)▶ %-28s$(RESET)\n"

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT          := $(shell pwd)
FRONTEND_DIR  := $(ROOT)/frontend
GO_DIR        := $(ROOT)/backend/go-services
PYTHON_DIR    := $(ROOT)/backend/python-services
MOBILE_DIR    := $(ROOT)/mobile
PROTO_DIR     := $(ROOT)/proto

# ── Go service list ──────────────────────────────────────────────────────────
GO_SERVICES   := api-gateway trading-engine ws-gateway order-service \
                 risk-service auth-service exchange-proxy

# ── Python service list ──────────────────────────────────────────────────────
PYTHON_SERVICES := trend-engine data-collector backtest-engine sentiment-analyzer

# ── Tools ────────────────────────────────────────────────────────────────────
PROTOC        ?= protoc
BUF           ?= buf
AIR           ?= air
MIGRATE       ?= migrate

# ============================================================================
# setup — install all development toolchain dependencies
# ============================================================================
setup:
	$(LOG) "Installing Go tools"
	go install github.com/air-verse/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	$(LOG) "Installing Python tools"
	pip install --upgrade pip uv
	for svc in $(PYTHON_SERVICES); do \
	  uv pip install -r $(PYTHON_DIR)/$$svc/requirements.txt; \
	done
	$(LOG) "Installing Node/frontend tools"
	cd $(FRONTEND_DIR) && npm ci
	$(LOG) "Installing Flutter"
	cd $(MOBILE_DIR) && flutter pub get
	@echo "✅  Setup complete"

# ============================================================================
# dev — start all services in development / watch mode
# ============================================================================
dev: docker-up
	$(LOG) "Starting all services in dev mode"
	@$(MAKE) -j4 frontend-dev backend-go-dev backend-python-dev

# ============================================================================
# build — build all service binaries
# ============================================================================
build:
	$(LOG) "Building Go services"
	@for svc in $(GO_SERVICES); do \
	  printf "  building $$svc...\n"; \
	  cd $(GO_DIR) && CGO_ENABLED=0 GOOS=linux \
	    go build -ldflags="-w -s" -o $(ROOT)/bin/$$svc ./cmd/$$svc/main.go; \
	done
	$(LOG) "Building frontend"
	cd $(FRONTEND_DIR) && npm run build
	@echo "✅  Build complete — artefacts in ./bin/ and ./frontend/dist/"

# ============================================================================
# test — run full test suite
# ============================================================================
test:
	$(LOG) "Running Go tests"
	cd $(GO_DIR) && go test -race -coverprofile=coverage.out ./...
	$(LOG) "Running Python tests"
	@for svc in $(PYTHON_SERVICES); do \
	  printf "  testing $$svc...\n"; \
	  cd $(PYTHON_DIR)/$$svc && python -m pytest --tb=short -q; \
	done
	$(LOG) "Running frontend tests"
	cd $(FRONTEND_DIR) && npm run test -- --run
	$(LOG) "Running Flutter tests"
	cd $(MOBILE_DIR) && flutter test
	@echo "✅  All tests passed"

# ============================================================================
# lint — lint all services
# ============================================================================
lint:
	$(LOG) "Linting Go services"
	cd $(GO_DIR) && golangci-lint run ./...
	$(LOG) "Linting Python services"
	@for svc in $(PYTHON_SERVICES); do \
	  printf "  linting $$svc...\n"; \
	  cd $(PYTHON_DIR)/$$svc && ruff check . && ruff format --check .; \
	done
	$(LOG) "Linting frontend"
	cd $(FRONTEND_DIR) && npm run lint && npm run type-check
	$(LOG) "Linting Flutter"
	cd $(MOBILE_DIR) && flutter analyze
	@echo "✅  Lint passed"

# ============================================================================
# Docker targets
# ============================================================================
docker-up:
	$(LOG) "Starting Docker services"
	docker compose up -d --remove-orphans

docker-down:
	$(LOG) "Stopping Docker services"
	docker compose down

docker-build:
	$(LOG) "Building Docker images"
	docker compose build --parallel

# ============================================================================
# Database
# ============================================================================
migrate:
	$(LOG) "Running database migrations"
	$(MIGRATE) -path $(ROOT)/backend/go-services/migrations \
	           -database "$${POSTGRES_URL}" up

seed:
	$(LOG) "Seeding development data"
	cd $(GO_DIR) && go run ./cmd/seed/main.go

# ============================================================================
# Protocol Buffers
# ============================================================================
proto:
	$(LOG) "Generating gRPC stubs"
	$(BUF) generate
	@echo "✅  Proto generation complete"

# ============================================================================
# Service-specific dev targets (called by 'make dev')
# ============================================================================
frontend-dev:
	$(LOG) "Starting frontend dev server (port 3000)"
	cd $(FRONTEND_DIR) && npm run dev

backend-go-dev:
	$(LOG) "Starting Go services with hot-reload"
	@for svc in $(GO_SERVICES); do \
	  printf "  starting $$svc (air)...\n"; \
	  cd $(GO_DIR) && SERVICE_NAME=$$svc $(AIR) -c .air.toml & \
	done; wait

backend-python-dev:
	$(LOG) "Starting Python services with hot-reload"
	@for svc in $(PYTHON_SERVICES); do \
	  printf "  starting $$svc...\n"; \
	  cd $(PYTHON_DIR)/$$svc && \
	    uvicorn app:app --host 0.0.0.0 --port $${PORT:-8100} --reload & \
	done; wait

# ============================================================================
# Mobile
# ============================================================================
app-android:
	$(LOG) "Building Android APK"
	cd $(MOBILE_DIR) && flutter build apk --release

app-ios:
	$(LOG) "Building iOS IPA"
	cd $(MOBILE_DIR) && flutter build ipa --release

# ============================================================================
# Clean
# ============================================================================
clean:
	$(LOG) "Cleaning build artefacts"
	rm -rf $(ROOT)/bin
	rm -rf $(FRONTEND_DIR)/dist
	find $(GO_DIR) -name '*.pb.go' -delete
	find $(PYTHON_DIR) -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name '*.pyc' -delete
	@echo "✅  Clean complete"
