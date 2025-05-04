# Project Structure Documentation

This document outlines the folder structure and organization of the POS (Point of Sale) System project.

## Root Directory Structure

```
├── app/                  # Next.js app directory (main application code)
├── components/          # Reusable React components
├── drizzle/            # Database migration files [generated]
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and core logic
├── public/             # Static assets
├── scripts/            # Build and deployment scripts
```

## Detailed Structure

### `/app` Directory

The main application code using Next.js App Router structure:

```
app/
├── api/                # API routes
│   ├── categories/     # Category-related endpoints
│   ├── products/       # Product-related endpoints
│   ├── refunds/        # Refund-related endpoints
│   ├── settings/       # Settings-related endpoints
│   ├── transactions/   # Transaction-related endpoints
│   └── upload/         # File upload endpoint
├── categories/         # Categories page
├── dashboard/          # Dashboard page
├── inventory/          # Inventory management page
├── products/          # Products management page
├── qr/                # QR code generation page
├── settings/          # Settings page
├── sign-in/           # Authentication pages
└── transactions/      # Transactions page
```

### `/components` Directory

Reusable React components organized by feature and UI components:

```
components/
├── auth/              # Authentication-related components
├── categories/        # Category-related components
├── products/         # Product-related components
├── refunds/          # Refund-related components
├── settings/         # Settings-related components
└── ui/               # Shared UI components (buttons, inputs, etc.)
```

### `/lib` Directory

Core application logic and utilities:

```
lib/
├── api/              # API-related functions
├── db/               # Database configuration and schema
│   ├── migrations/   # Database migration files
│   └── schema.ts     # Database schema definitions
├── export/           # Data export functionality
└── utils/            # Utility functions
```

### `/hooks` Directory

Custom React hooks for data fetching and state management:

```
hooks/
├── use-categories.tsx
├── use-mobile.tsx
├── use-payments.tsx
├── use-products.tsx
├── use-refunds.tsx
├── use-transactions.tsx
└── use-unit-measurements.tsx
```

## Key Features

### Database

-   Uses Drizzle ORM with SQLite
-   Migrations handled through `/lib/db/migrations`
-   Schema defined in `/lib/db/schema.ts`

### Authentication

-   Clerk.js for authentication
-   Auth components in `/components/auth`
-   Protected routes handled in `middleware.ts`

### API Routes

-   RESTful API endpoints in `/app/api`
-   Each feature has its own directory
-   Follows Next.js API route conventions

### UI Components

-   Shadcn UI components in `/components/ui`
-   Feature-specific components in respective directories
-   Responsive design with Tailwind CSS

## Development Guidelines

1. **Component Organization**

    - Place reusable components in `/components`
    - Feature-specific components go in feature directories
    - UI components should be in `/components/ui`

2. **API Development**

    - Create new endpoints in `/app/api`
    - Follow RESTful conventions
    - Include proper error handling

3. **Database Changes**

    - Add migrations in `/lib/db/migrations`
    - Update schema in `/lib/db/schema.ts`
    - Test migrations locally before deployment

4. **Type Safety**

    - Define types in `/types`
    - Use TypeScript strictly
    - Maintain type definitions for API responses

5. **State Management**

    - Use hooks for data fetching
    - Keep state close to where it's used
    - Share state through Context when needed

## Configuration Files

-   `next.config.ts`: Next.js configuration
-   `tailwind.config.ts`: Tailwind CSS configuration
-   `drizzle.config.ts`: Drizzle ORM configuration
-   `tsconfig.json`: TypeScript configuration
-   `package.json`: Project dependencies and scripts
