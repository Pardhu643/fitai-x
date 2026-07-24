# FitAI X

AI-powered adaptive fitness platform with modular monolith architecture designed for microservice extraction.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Lucide React

### Backend
- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT-ready authentication
- bcrypt
- Zod validation
- Helmet
- CORS
- express-rate-limit
- Structured logging

## Architecture

FitAI X uses a **modular monolith** architecture with:
- Controller-Service-Repository pattern
- Feature-based module isolation
- API versioning (`/api/v1`)
- Strict TypeScript typing
- Microservice-ready design

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Project Structure

```
fitaix/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript
├── docs/              # Architecture documentation
├── docker-compose.yml # PostgreSQL container
├── package.json       # Root workspace
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for PostgreSQL)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd fitaix
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Copy the example environment files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Update the values in both `.env` files as needed.

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Start the development servers

To run both frontend and backend:

```bash
npm run dev
```

Or run individually:

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Endpoint**: http://localhost:3000/api/v1/health
- **Prisma Studio**: Run `npm run db:studio` (opens at http://localhost:5555)

## Build Commands

```bash
# Build both
npm run build

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

## Type Checking

```bash
# Type check both
npm run typecheck

# Type check frontend only
npm run typecheck:frontend

# Type check backend only
npm run typecheck:backend
```

## Linting

```bash
# Lint both
npm run lint

# Lint frontend only
npm run lint:frontend

# Lint backend only
npm run lint:backend
```

## Database Commands

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Development Workflow

1. Make changes to frontend or backend
2. Run type checking: `npm run typecheck`
3. Run linting: `npm run lint`
4. Test locally
5. Build before committing: `npm run build`

## Stopping PostgreSQL

```bash
docker-compose down
```

To remove volumes (deletes data):

```bash
docker-compose down -v
```

## License

Proprietary
