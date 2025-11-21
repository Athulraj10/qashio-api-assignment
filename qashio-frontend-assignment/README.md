#  Qashio Frontend - Expense Tracker UI

A modern, responsive web application built with **Next.js 15** and **Material-UI v7** for managing personal finances, tracking expenses, and analyzing spending patterns.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features](#features)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [State Management](#state-management)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building for Production](#building-for-production)

---

##  Overview

This is the frontend application for the Qashio expense tracker. It provides:

- User authentication (login/register)
- Comprehensive financial dashboard
- Transaction management
- Category management
- Budget tracking
- Interactive charts and visualizations
- Responsive design
- Real-time data updates

###  Architecture

```mermaid
graph TD
    User[User] -->|HTTPS| Client[Frontend Client (Next.js)]
    Client -->|API Calls| NextAPI[Next.js API Routes]
    NextAPI -->|Proxy| NestAPI[Backend API (NestJS)]
    NestAPI -->|TypeORM| DB[(PostgreSQL Database)]
    
    subgraph Frontend
    Client
    NextAPI
    end
    
    subgraph Backend
    NestAPI
    DB
    end
    
    Client -.->|Auth Token| NestAPI
```

---

##  Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.8
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Query (TanStack Query) 5.74
- **Charts**: Recharts 3.4
- **Date Handling**: date-fns 4.1
- **Forms**: MUI Form Components
- **HTTP Client**: Fetch API (via React Query)

---

##  Project Structure

```
qashio-frontend-assignment/
├── app/
│   ├── api/                   # Next.js API routes (proxy to backend)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── transactions/
│   │   │   ├── [id]/
│   │   │   └── summary/
│   │   ├── categories/
│   │   └── budgets/
│   │       └── [id]/
│   ├── components/            # Reusable React components
│   │   ├── NavBar.tsx
│   │   ├── PageLayout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── TransactionDetailModal.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   ├── useCategories.ts
│   │   ├── useBudgets.ts
│   │   └── useSummary.ts
│   ├── login/                 # Login page
│   ├── register/             # Registration page
│   ├── page.tsx              # Dashboard (home page)
│   ├── transactions/         # Transactions pages
│   │   ├── page.tsx         # Transactions list
│   │   └── new/             # Create transaction
│   ├── categories/           # Categories page
│   ├── budgets/              # Budgets page
│   ├── layout.tsx            # Root layout
│   ├── providers.tsx         # Context providers
│   └── middleware.ts         # Route protection
├── lib/
│   ├── api.ts                # API client
│   └── db.ts                 # Local database (legacy)
├── public/
│   └── data/
│       └── categories.json   # Default categories
├── .env.local                # Environment variables
├── package.json
└── README.md
```

---

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see [Backend README](../qashio-api/README.md))

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_PORT=3001
```

3. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

---

##  Features

###  Authentication
- User registration with validation
- Secure login with JWT tokens
- Protected routes
- Automatic token refresh
- Logout functionality

###  Dashboard
- **Financial Summary Cards**
  - Total Balance
  - Total Income
  - Total Expenses
  - Transaction Count

- **Interactive Charts**
  - Monthly Income vs Expenses (Area Chart)
  - Category Breakdown (Pie Chart)
  - Category Comparison (Bar Chart)
  - Category Trends (Line Chart)

- **Quick Insights**
  - Recent transactions
  - Top spending categories
  - Budget alerts
  - Expense ratios

###  Transactions
- View all transactions in a sortable table
- Filter by type, category, date range
- Search functionality
- Inline editing
- Create new transactions
- Delete transactions
- Transaction details modal

###  Categories
- View all categories
- Create new categories
- Category statistics
- Category icons

###  Budgets
- View all budgets with progress indicators
- Create new budgets
- Edit budgets
- Delete budgets
- Budget alerts when approaching limits
- Spending vs budget visualization

---

##  Pages & Routes

### Public Routes

- `/login` - User login page
- `/register` - User registration page

### Protected Routes

- `/` - Dashboard (home page)
- `/transactions` - Transactions list
- `/transactions/new` - Create transaction
- `/categories` - Categories management
- `/budgets` - Budgets management

### Route Protection

All protected routes are wrapped with `ProtectedRoute` component and `middleware.ts` to ensure:
- Users must be authenticated
- Unauthenticated users are redirected to login
- Authenticated users accessing login/register are redirected to dashboard

---

##  Components

### NavBar
Top navigation bar with:
- Logo/Brand name
- Navigation links (Dashboard, Transactions, Budgets, Categories)
- Authentication buttons (Login/Register/Logout)
- Active route highlighting

### PageLayout
Layout wrapper that provides:
- Consistent page structure
- NavBar integration
- Footer
- Container styling

### ProtectedRoute
Client-side route protection that:
- Checks for authentication token
- Shows loading state during check
- Redirects to login if not authenticated
- Prevents hydration errors

### TransactionDetailModal
Modal component for displaying:
- Full transaction details
- Edit functionality
- Delete confirmation

---

##  State Management

### React Query (TanStack Query)

Used for server state management:

- **useAuth** - Authentication state
- **useTransactions** - Transaction data and mutations
- **useCategories** - Category data and mutations
- **useBudgets** - Budget data and mutations
- **useSummary** - Financial summary data

### Features

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling
- Loading states

---

##  UI/UX Features

### Design System
- Modern Material Design
- **Premium Color Scheme**:
  - Primary: `#003082` (Deep Blue)
  - Secondary: `#FFC917` (Bright Yellow)
- Gradient backgrounds
- Smooth animations
- Responsive layout

### User Experience
- Loading skeletons
- Error states with retry
- Empty states with helpful messages
- Toast notifications
- Form validation
- Inline editing
- Responsive design (mobile, tablet, desktop)

### Charts & Visualizations
- Area charts for trends
- Pie charts for category breakdown
- Bar charts for comparisons
- Line charts for historical data
- Interactive tooltips
- Responsive chart containers

---

##  Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `BACKEND_PORT` | Backend port (fallback) | `3001` |

Create `.env.local` for local development (not committed to git).

---

##  Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Development Workflow

1. Start the backend API (see [Backend README](../qashio-api/README.md))
2. Start the frontend: `npm run dev`
3. Open `http://localhost:3000`
4. Register a new account or login
5. Start using the application!

### Hot Reload

Next.js provides hot module replacement (HMR) for instant updates during development.

---

##  Building for Production

### Build Process

```bash
npm run build
```

This will:
- Optimize all pages
- Generate static assets
- Create production bundles
- Optimize images
- Minify JavaScript and CSS

### Production Server

```bash
npm run start
```

The production server will run on port 3000 by default.

### Environment Variables

Ensure production environment variables are set:
- `NEXT_PUBLIC_API_URL` - Production backend URL
- Other required variables

---

## 🔌 API Integration

The frontend communicates with the backend through:

1. **Next.js API Routes** (`/app/api/*`) - Proxy routes that forward requests to the backend
2. **API Client** (`/lib/api.ts`) - Centralized API client with authentication handling

### Authentication Flow

1. User logs in → Token stored in `localStorage`
2. All API requests include `Authorization: Bearer <token>` header
3. On 401 errors → User redirected to login
4. Token automatically included in all requests

---

## 📱 Responsive Design

The application is fully responsive:

- **Mobile** (< 600px): Single column layout, stacked cards
- **Tablet** (600px - 960px): Two column layout
- **Desktop** (> 960px): Full multi-column layout

All charts and tables are responsive and adapt to screen size.

---

##  Key Features Implementation

### Dashboard
- Real-time financial summary
- Multiple chart types
- Date range filtering
- Quick action buttons
- Recent transactions
- Budget alerts

### Transactions
- DataGrid with sorting and filtering
- Inline editing
- Search functionality
- Date range filters
- Category filters
- Type filters (income/expense)

### Categories
- Category list with statistics
- Create new categories
- Category icons
- User-specific categories

### Budgets
- Budget list with progress bars
- Create/edit/delete budgets
- Budget alerts
- Spending calculations
- Time period support (daily, weekly, monthly, yearly)

---

##  Troubleshooting

### Connection Issues

If you see "Failed to fetch" errors:

1. Ensure backend is running on the correct port
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS is enabled on backend

### Authentication Issues

If you're redirected to login unexpectedly:

1. Check if token exists in `localStorage`
2. Verify token hasn't expired
3. Check browser console for errors

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

---

##  Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [React Query Documentation](https://tanstack.com/query)
- [Recharts Documentation](https://recharts.org/)

---

##  License

This project is private and proprietary.

---

##  Contributors

- Development Team

---

For more information, see the [main README](../README.md) and [Backend README](../qashio-api/README.md).

