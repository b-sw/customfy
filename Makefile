.PHONY: backend frontend dev help clean install local

# Default target
help:
	@echo "Available commands:"
	@echo "  backend    - Run backend development server"
	@echo "  frontend   - Run frontend development server"
	@echo "  dev        - Run both backend and frontend concurrently"
	@echo "  local      - Set up env files and run the full local stack"
	@echo "  install    - Install dependencies for both backend and frontend"
	@echo "  clean      - Clean node_modules and build artifacts"
	@echo "  help       - Show this help message"

# Run backend development server
backend:
	@echo "Starting backend development server..."
	cd backend && pnpm run start:dev

# Run frontend development server
frontend:
	@echo "Starting frontend development server..."
	cd frontend && pnpm run dev

# Run both backend and frontend concurrently
dev:
	@echo "Starting both backend and frontend..."
	@trap 'kill %1; kill %2' EXIT; \
	make backend & make frontend & \
	wait

# Install dependencies for both projects
install:
	@echo "Installing backend dependencies..."
	cd backend && pnpm install
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install

# Clean build artifacts and node_modules
clean:
	@echo "Cleaning backend..."
	cd backend && rm -rf node_modules dist
	@echo "Cleaning frontend..."
	cd frontend && rm -rf node_modules dist

# Set up and run complete local stack (real DB + real Google OAuth, from .env)
local:
	@echo "Setting up local development environment..."
	@make install
	@echo "Setting up environment files..."
	@cp -n backend/.env.example backend/.env && echo "Created backend/.env" || echo "backend/.env already exists"
	@cp -n frontend/.env.example frontend/.env && echo "Created frontend/.env" || echo "frontend/.env already exists"
	@echo "Starting backend and frontend (using MONGO_URL and Google OAuth from .env)..."
	@trap 'kill %1; kill %2' EXIT; \
	make backend & make frontend & \
	wait
