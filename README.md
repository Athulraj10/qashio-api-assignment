# Qashio - Simple Expense Tracker

A comprehensive expense tracking application built with **NestJS** and **Next.js** that helps users manage their income, expenses, budgets, and categories with a modern, user-friendly interface.

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Features Overview](#-features-overview)
- [Development](#-development)

---

## Features

###  Authentication
- User registration and login
- JWT-based authentication
- Protected routes and API endpoints
- Secure password hashing with bcrypt

###  Transactions
- Create, read, update, and delete transactions
- Track income and expenses
- Filter by type, category, date range, and search
- Transaction descriptions
- User-specific data isolation

###  Categories
- Create and manage custom categories
- Category statistics and insights
- User-specific categories

###  Budgets
- Set budgets per category
- Multiple time periods (daily, weekly, monthly, yearly)
- Budget progress tracking
- Budget alerts when approaching limits

###  Dashboard
- Financial summary (balance, income, expenses)
- Interactive charts and graphs:
  - Monthly income vs expenses trend
  - Category breakdown (pie chart)
  - Category comparison (current vs previous month)
  - Category trends over time
- Recent transactions
- Top spending categories
- Budget alerts

---

##  Tech Stack

### 🛠 Backend
- **Framework**: NestJS with TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT (Passport.js)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

###  Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript + React 19
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Date Handling**: date-fns

---

##  Project Structure

```
assistment/
├── qashio-api/                 # Backend API (NestJS)
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── transactions/      # Transactions module
│   │   ├── categories/        # Categories module
│   │   ├── budgets/           # Budgets module
│   │   └── database/          # Database initialization
│   └── README.md
├── qashio-frontend-assignment/ # Frontend (Next.js)
│   ├── app/
│   │   ├── api/               # Next.js API routes (proxy)
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   └── ...
│   └── README.md
├── docker-compose.yml         # Docker configuration
└── README.md                  # This file
```

---

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v15 or higher)
- **Docker** and **Docker Compose** (optional, for containerized setup)

---

##  Getting Started

### Option 1: Using Docker (Recommended)

The easiest way to run the entire application:

```bash
docker-compose up --build
```

This will:
- Build Docker images for both frontend and backend
- Start PostgreSQL database
- Start Redis (if configured)
- Start Kafka (if configured)
- Start the backend API on port 3000
- Start the frontend on port 4000

Access the application:
- Frontend: http://localhost:4000
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api

### Option 2: Manual Setup

#### 1. Clone the repository

```bash
git clone <repository-url>
cd assistment
```

#### 2. Set up the Backend

```bash
cd qashio-api
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL (if not running)
# Then run migrations/initialize database

npm run start:dev
```

The backend will run on `http://localhost:3001` (or port specified in `.env`)

#### 3. Set up the Frontend

```bash
cd qashio-frontend-assignment
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your backend URL

npm run dev
```

The frontend will run on `http://localhost:3000`

---

## 🔧 Running the Application

### Backend

```bash
cd qashio-api

# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Frontend

```bash
cd qashio-frontend-assignment

# Development mode
npm run dev

# Production build
npm run build
npm run start
```

---

##  API Documentation

Once the backend is running, you can access the interactive API documentation:

**Swagger UI**: http://localhost:3001/api

The API documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

##  Features Overview

### Implemented Features

#### Backend
- JWT-based authentication
- User registration and login
- CRUD operations for transactions
- CRUD operations for categories
- CRUD operations for budgets
- Transaction summary endpoint with filtering
- Advanced filtering and pagination
- Swagger/OpenAPI documentation
- Input validation with DTOs
- Custom decorators and guards
- User data isolation (each user sees only their data)
- Error handling

#### Frontend
- User authentication (login/register)
- Protected routes
- Dashboard with financial overview
- Interactive charts and graphs
- Transaction management (CRUD)
- Category management
- Budget management
- Advanced filtering and search
- Responsive design
- Loading states and error handling
- Empty state handling

---

##  Backend Requirements

###  Transactions
CRUD operations for tracking individual entries:

- Properties:
  - `amount` 
  - `category` 
  - `date` 
  - `type` (`income` | `expense`)
  - `description` 

###  Categories
- Users can create and list categories
- Each transaction must belong to a category
- User-specific categories

###  Budgets Module
- Set a budget (e.g., $500) per category over a time period (e.g., monthly)
- View current spending vs. budget
- Budget alerts when approaching limits

---

##  Frontend Requirements

###  `/transactions` Page
- Fetch transaction data with React Query
- Display paginated table
- Support sortable columns and filters
- Inline editing capability

###  Transaction Detail View
- Click a row → open a modal
- Display full transaction details

###  Create Transaction (`/transactions/new`)
- Form for adding a new transaction
- Includes category dropdown, date picker, and type selector
- Description field

###  UX & Resilience
- Loading spinners and skeletons
- MUI alerts on error
- Empty states handling
- Toast notifications

---

##  Bonus Features Implemented

### Backend
- JWT-based authentication
- Custom decorators (`@GetUser`)
- Guards (`JwtAuthGuard`)
- Summary/report endpoint
- Filtering, sorting & pagination
- Swagger/OpenAPI documentation
- User data isolation

### Frontend
- Form validation
- Advanced state management (React Query)
- UI/UX enhancements
- Comprehensive dashboard
- Multiple chart types
- Filtering, sorting & pagination
- Responsive design

---

##  Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- User data isolation
- Input validation and sanitization
- CORS configuration

---

##  Environment Variables

### Backend (qashio-api)

Create a `.env` file in the `qashio-api` directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/qashio_points
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

### Frontend (qashio-frontend-assignment)

Create a `.env.local` file in the `qashio-frontend-assignment` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_PORT=3001
```

---

## 🧪 Testing

### Backend Tests

```bash
cd qashio-api

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd qashio-frontend-assignment

# Run tests
npm test
```

---

##  Additional Documentation

- [Backend API README](./qashio-api/README.md) - Detailed backend documentation
- [Frontend README](./qashio-frontend-assignment/README.md) - Detailed frontend documentation

---

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License

This project is public and open source.

---

##  Authors

- Development Team

---

Happy tracking! 💸
