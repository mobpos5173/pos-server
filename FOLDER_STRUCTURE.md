# Project Folder Structure Documentation

This document provides an overview of the project's folder structure and the purpose of each directory and key files.

## Root Directory

The root directory contains configuration files and main project directories:

- `package.json` - Project dependencies and scripts
- `package-lock.json` - Locked versions of dependencies
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `middleware.ts` - Next.js middleware configuration
- `local.db` - Local SQLite database file

## Main Directories

### `/app`
The main application directory following Next.js 13+ app directory structure:

- `/api` - API routes and endpoints
- `/dashboard` - Dashboard related pages
- `/inventory` - Inventory management pages
- `/transactions` - Transaction related pages
- `/categories` - Category management pages
- `/products` - Product management pages
- `/settings` - Application settings pages
- `/sign-in` - Authentication pages
- `/qr` - QR code related functionality
- `layout.tsx` - Root layout component
- `page.tsx` - Home page component
- `globals.css` - Global styles

### `/lib`
Core library and utility functions:

- `/db` - Database related code and schemas
- `/api` - API utility functions and types
- `/utils` - General utility functions
- `/export` - Export functionality
- `auth.ts` - Authentication utilities
- `utils.ts` - General utilities

### `/components`
Reusable React components used throughout the application.

### `/hooks`
Custom React hooks for shared functionality.

### `/public`
Static assets like images, fonts, and other public files.

### `/scripts`
Utility scripts for development, deployment, or maintenance.

### `/drizzle`
Database migration files and schema definitions.

## Configuration Files

- `.gitignore` - Git ignore rules
- `components.json` - Component configuration
- `next-env.d.ts` - Next.js TypeScript declarations
- `types.d.ts` - Global TypeScript type definitions

## Development Notes

- The project uses TypeScript for type safety
- Next.js is used as the main framework
- Tailwind CSS is used for styling
- Drizzle ORM is used for database operations
- ESLint is configured for code quality
- The project follows the Next.js 13+ app directory structure 