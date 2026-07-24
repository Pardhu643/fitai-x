# FitAI X Architecture

## Overview

FitAI X is built using a **modular monolith** architecture that is designed to be easily extracted into microservices when needed. This approach provides the simplicity of a monolith during early development while enabling future scalability.

## Architectural Principles

1. **Modularity**: Each feature is a self-contained module with clear boundaries
2. **Separation of Concerns**: Clear distinction between controllers, services, and repositories
3. **Scalability**: Modules can be extracted into independent services
4. **Maintainability**: Clean code structure with strict typing
5. **Testability**: Isolated components that are easy to test
6. **Security**: Built-in security best practices
7. **Type Safety**: Full TypeScript coverage with no `any` types

## Backend Architecture

### Modular Monolith Pattern

The backend follows a modular monolith pattern where each business domain is organized as an independent module:

```
backend/src/
├── modules/
│   ├── authentication/     # User authentication & authorization
│   ├── users/              # User profile management
│   ├── adaptive-planning/  # AI-powered workout planning
│   ├── workout-version-control/  # Workout plan versioning
│   ├── ai-decision-explanation/   # AI decision transparency
│   ├── dynamic-goals/      # Dynamic fitness goal management
│   ├── ai-memory/          # AI learning & personalization
│   ├── smart-habits/       # Habit formation & tracking
│   ├── recovery-score/     # Recovery score calculation
│   ├── conflict-detection/ # Scheduling conflict resolution
│   ├── exercise-graph/     # Exercise relationship mapping
│   ├── progressive-overload/  # Progressive overload implementation
│   ├── fatigue-prediction/ # Fatigue level prediction
│   ├── workout-simulator/  # Workout outcome simulation
│   ├── scenario-planner/   # Scenario-based planning
│   ├── meal-planner/       # AI-powered meal planning
│   ├── grocery-generator/  # Grocery list generation
│   ├── streak-protection/  # Streak management
│   ├── smart-calendar/     # Intelligent calendar management
│   ├── injury-predictor/   # Injury risk prediction
│   ├── ai-coach/          # AI-powered coaching
│   ├── analytics/         # Fitness analytics
│   ├── notifications/     # User notifications
│   └── realtime/          # Real-time features
```

### Controller-Service-Repository Pattern

Each module follows the controller-service-repository pattern:

```
module-name/
├── controller/      # HTTP request handling
│   └── *.controller.ts
├── service/         # Business logic
│   └── *.service.ts
├── repository/      # Data access
│   └── *.repository.ts
├── dto/            # Data transfer objects
│   └── *.dto.ts
├── validators/     # Zod validation schemas
│   └── *.validator.ts
└── interfaces/     # TypeScript interfaces
    └── *.interface.ts
```

**Responsibilities:**

- **Controller**: Handles HTTP requests, validates input, calls services, returns responses
- **Service**: Contains business logic, orchestrates operations, enforces business rules
- **Repository**: Handles data access, database operations, data transformation

### Core Infrastructure

The core layer provides shared infrastructure:

```
backend/src/core/
├── config/         # Environment configuration
├── database/       # Database connection (Prisma)
├── errors/         # Custom error classes
├── logger/         # Structured logging (Pino)
└── security/       # Security utilities
```

### Middleware Layer

Express middleware for cross-cutting concerns:

```
backend/src/middleware/
├── error.middleware.ts          # Centralized error handling
├── not-found.middleware.ts      # 404 handler
├── validate.middleware.ts       # Request validation
├── rate-limit.middleware.ts     # Rate limiting
└── request-logger.middleware.ts # Request logging
```

### Shared Layer

Common utilities and types:

```
backend/src/shared/
├── constants/      # Application constants
├── dto/            # Shared DTOs
├── interfaces/     # Shared interfaces
├── utilities/      # Utility functions
└── validators/     # Shared validators
```

## API Design

### RESTful API Structure

- **Versioning**: `/api/v1` prefix for backward compatibility
- **Resource Naming**: Plural nouns (e.g., `/api/v1/users`)
- **HTTP Methods**: Proper use of GET, POST, PUT, PATCH, DELETE
- **Status Codes**: Appropriate HTTP status codes
- **Response Format**: Consistent JSON responses

### Response Format

```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

Error response:

```json
{
  "status": "error",
  "message": "Error message",
  "errors": { "field": ["error message"] }
}
```

## Frontend Architecture

### Feature-Based Structure

The frontend is organized by features:

```
frontend/src/
├── features/
│   ├── authentication/    # Authentication flows
│   ├── onboarding/       # User onboarding
│   ├── dashboard/        # Main dashboard
│   ├── workouts/         # Workout management
│   ├── nutrition/        # Nutrition tracking
│   ├── recovery/         # Recovery tracking
│   ├── progress/         # Progress visualization
│   ├── calendar/         # Calendar view
│   ├── ai-coach/         # AI coach interface
│   └── settings/         # User settings
```

### Component Organization

```
frontend/src/components/
├── common/       # Generic reusable components
├── layout/       # Layout components (Navigation, etc.)
└── ui/           # UI primitives (Button, Input, Card, etc.)
```

### State Management

- **Zustand**: Global state management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Zod**: Form validation

## Database Design

### Prisma ORM

Prisma provides type-safe database access:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Migration Strategy

- Prisma migrations for schema changes
- Seed files for initial data
- Version-controlled schema

## Security Architecture

### Authentication

- JWT-based authentication
- bcrypt for password hashing
- Token expiration handling
- Refresh token support (future)

### Security Headers

- Helmet for HTTP security headers
- CORS configuration
- Rate limiting
- Input validation with Zod

### Data Protection

- Environment variable validation
- No hardcoded secrets
- Secure password storage
- SQL injection prevention (Prisma)

## Microservice Extraction Strategy

### When to Extract

Consider microservice extraction when:

1. **Team Scaling**: Multiple teams need to work on different features
2. **Performance Isolation**: A module needs independent scaling
3. **Technology Divergence**: A module requires different technology
4. **Deployment Frequency**: A module needs independent deployment

### Extraction Process

1. **Identify Boundaries**: Define module boundaries and dependencies
2. **Create API Contract**: Define communication protocol (REST/gRPC)
3. **Extract Database**: Separate database or use shared database pattern
4. **Implement Communication**: Add service-to-service communication
5. **Migrate Gradually**: Use strangler pattern for gradual migration
6. **Monitor & Optimize**: Monitor performance and optimize

### Module Independence

Each module is designed to be:

- **Loosely Coupled**: Minimal dependencies on other modules
- **Highly Cohesive**: Related functionality grouped together
- **Interface-Based**: Clear interfaces for communication
- **Testable**: Can be tested independently

## Deployment Architecture

### Development

- Docker Compose for local PostgreSQL
- Hot reload with tsx
- Environment-based configuration

### Production

- Containerized deployment (Docker)
- Horizontal scaling capability
- Load balancing readiness
- Health check endpoints

## Monitoring & Observability

### Logging

- Structured logging with Pino
- Log levels (fatal, error, warn, info, debug, trace)
- Request/response logging
- Error tracking

### Health Checks

- `/api/v1/health` endpoint
- Database connectivity check
- Service availability monitoring

## Performance Considerations

### Backend

- Connection pooling (Prisma)
- Query optimization
- Caching strategy (future: Redis)
- Rate limiting

### Frontend

- Code splitting (React.lazy)
- Image optimization
- Lazy loading
- TanStack Query caching

## Testing Strategy

### Backend Testing

- Unit tests for services and repositories
- Integration tests for controllers
- E2E tests for critical flows

### Frontend Testing

- Component tests (React Testing Library)
- Integration tests
- E2E tests (Playwright)

## Development Workflow

1. **Feature Development**: Work in feature modules
2. **Type Checking**: Run `npm run typecheck`
3. **Linting**: Run `npm run lint`
4. **Building**: Run `npm run build`
5. **Testing**: Run test suite
6. **Code Review**: Peer review process

## Technology Rationale

### Backend Choices

- **Express**: Mature, flexible, large ecosystem
- **TypeScript**: Type safety, better developer experience
- **Prisma**: Type-safe ORM, excellent DX
- **PostgreSQL**: Reliable, feature-rich database
- **Pino**: Fast, structured logging
- **Zod**: Runtime type validation

### Frontend Choices

- **React**: Component-based, large ecosystem
- **Vite**: Fast development, optimized builds
- **Tailwind CSS**: Utility-first, rapid development
- **TanStack Query**: Powerful data fetching
- **Zustand**: Simple state management
- **React Router**: Declarative routing

## Future Enhancements

### Backend

- GraphQL API (optional)
- Redis caching
- Message queue (RabbitMQ/Redis)
- WebSocket support
- API gateway

### Frontend

- Server-side rendering (Next.js migration option)
- Progressive Web App
- Offline support
- Advanced animations

## Conclusion

This architecture provides a solid foundation for FitAI X that balances simplicity for the MVP with the flexibility to scale into microservices as the application grows. The modular design ensures that each feature can be developed, tested, and deployed independently when needed.
