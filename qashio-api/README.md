#  Qashio API - Backend Service

A robust RESTful API built with **NestJS** for managing expenses, transactions, budgets, and categories with JWT authentication and comprehensive data validation.

---

##  Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)

---

##  Overview

This is the backend API service for the Qashio expense tracker application. It provides:

- User authentication and authorization
- Transaction management (CRUD operations)
- Category management
- Budget management
- Financial summary and analytics
- User data isolation
- Comprehensive API documentation

---

##  Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **ORM**: TypeORM 0.3
- **Database**: PostgreSQL 15
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: bcryptjs

---

##  Project Structure

```
qashio-api/
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── entities/          # Database entities
│   │   │   └── user.entity.ts
│   │   ├── guards/            # Auth guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/        # Passport strategies
│   │   │   └── jwt.strategy.ts
│   │   └── decorators/        # Custom decorators
│   │       └── get-user.decorator.ts
│   ├── transactions/          # Transactions module
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   ├── transactions.module.ts
│   │   ├── entities/
│   │   │   └── transaction.entity.ts
│   │   └── dto/
│   │       ├── create-transaction.dto.ts
│   │       └── update-transaction.dto.ts
│   ├── categories/            # Categories module
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── categories.module.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   └── dto/
│   │       └── create-category.dto.ts
│   ├── budgets/              # Budgets module
│   │   ├── budgets.controller.ts
│   │   ├── budgets.service.ts
│   │   ├── budgets.module.ts
│   │   ├── budget.interface.ts
│   │   └── dto/
│   │       ├── create-budget.dto.ts
│   │       └── update-budget.dto.ts
│   ├── database/             # Database utilities
│   │   └── init-database.ts
│   ├── app.module.ts         # Root module
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── package.json
├── tsconfig.json
└── README.md
```

---

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/qashio_points

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Server
PORT=3001
NODE_ENV=development
```

3. **Initialize the database**

The application will automatically create the database and tables on first run.

4. **Start the development server**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

### Production Build

```bash
npm run build
npm run start:prod
```

---

##  API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Transactions

All transaction endpoints require JWT authentication.

#### Get All Transactions
```http
GET /transactions?type=expense&category=Food&startDate=2024-01-01&endDate=2024-12-31&search=groceries
Authorization: Bearer <token>
```

#### Get Transaction Summary
```http
GET /transactions/summary?startDate=2024-01-01&endDate=2024-12-31&type=expense
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalIncome": 5000.00,
  "totalExpenses": 3000.00,
  "balance": 2000.00,
  "transactionCount": 25,
  "byCategory": [
    {
      "category": "Food",
      "total": 1200.00,
      "count": 15
    }
  ],
  "byMonth": [
    {
      "month": "2024-01",
      "income": 2000.00,
      "expenses": 1500.00
    }
  ]
}
```

#### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "category": "Food",
  "date": "2024-01-15",
  "type": "expense",
  "description": "Grocery shopping"
}
```

#### Get Transaction by ID
```http
GET /transactions/:id
Authorization: Bearer <token>
```

#### Update Transaction
```http
PUT /transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 60.00,
  "description": "Updated description"
}
```

#### Delete Transaction
```http
DELETE /transactions/:id
Authorization: Bearer <token>
```

### Categories

#### Get All Categories
```http
GET /categories
Authorization: Bearer <token>
```

#### Create Category
```http
POST /categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Entertainment"
}
```

#### Get Category by ID
```http
GET /categories/:id
Authorization: Bearer <token>
```

### Budgets

#### Get All Budgets
```http
GET /budgets?withSpending=true
Authorization: Bearer <token>
```

#### Create Budget
```http
POST /budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "Food",
  "amount": 500.00,
  "timePeriod": "monthly",
  "startDate": "2024-01-01"
}
```

#### Get Budget by ID
```http
GET /budgets/:id?withSpending=true
Authorization: Bearer <token>
```

#### Update Budget
```http
PATCH /budgets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 600.00
}
```

#### Delete Budget
```http
DELETE /budgets/:id
Authorization: Bearer <token>
```

---

##  Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### How Authentication Works

1. User registers or logs in via `/auth/register` or `/auth/login`
2. Server returns a JWT token
3. Client includes the token in subsequent requests
4. Server validates the token and extracts user information
5. All data operations are filtered by the authenticated user's ID

### Security Features

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire (configurable)
- All protected routes use `JwtAuthGuard`
- User data is isolated - users can only access their own data

---

##  Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR NOT NULL,
  date DATE NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  name VARCHAR NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### Budgets
Currently stored in-memory. Can be migrated to database if needed.

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start in watch mode
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build for production
npm run start:prod     # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
```

### Code Structure

- **Modules**: Each feature is a separate module (auth, transactions, categories, budgets)
- **DTOs**: Data Transfer Objects for request validation
- **Entities**: TypeORM entities representing database tables
- **Guards**: Route protection (JWT authentication)
- **Decorators**: Custom decorators for extracting user info
- **Services**: Business logic
- **Controllers**: Request handling and routing

---

##  Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

---

##  API Documentation

Once the server is running, access the interactive Swagger documentation:

**Swagger UI**: http://localhost:3001/api

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality
- Example requests and responses

---

##  Security Best Practices

1. **Password Security**
   - Passwords are hashed with bcrypt (10 rounds)
   - Never return passwords in API responses

2. **JWT Tokens**
   - Tokens are signed with a secret key
   - Tokens should be stored securely on the client
   - Consider implementing token refresh

3. **Data Isolation**
   - All queries filter by `userId`
   - Users can only access their own data
   - No cross-user data leakage

4. **Input Validation**
   - All inputs are validated using DTOs
   - SQL injection prevention via TypeORM
   - XSS prevention through proper sanitization

---

##  Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection string in .env
# Ensure database exists
```

### Port Already in Use

```bash
# Change PORT in .env file
# Or kill the process using the port
lsof -ti:3001 | xargs kill -9
```

### JWT Token Issues

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify token format in Authorization header

---

##  License

This project is private and proprietary.

---

##  Contributors

- Development Team

---

For more information, see the [main README](../README.md).
