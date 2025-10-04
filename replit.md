# Overview

Dopaya is a full-stack web platform designed to connect donors with high-impact social enterprises through a transparent, gamified giving experience. The platform enables users to support verified social projects, earn Impact Points, and unlock rewards while tracking their donation impact in real-time. Built with a modern tech stack, Dopaya aims to revolutionize how people engage with charitable giving by making it more transparent, rewarding, and community-driven.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Authentication**: Context-based auth provider with protected routes
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Storage**: Express-session with memory store for session management
- **API Design**: RESTful endpoints with systematic error handling and JSON validation

## Database Schema
- **Core Tables**: Users, Projects, Donations, Rewards, Redemptions
- **Impact Tracking**: Project impact metrics and user impact history tables
- **Media Storage**: Project media table for managing multiple images/videos per project
- **Gamification**: Impact points system with user levels and achievement tracking

## Authentication & Authorization
- **Strategy**: Supabase Auth with email/password authentication
- **Email Verification**: Automated email confirmation with callback handling at `/auth/callback`
- **Session Management**: Supabase session management with automatic token refresh
- **Route Protection**: Higher-order components for protecting authenticated routes
- **Username Generation**: Automatic username creation from email address during registration

## Data Layer Design
- **Primary Database**: PostgreSQL via Supabase with connection pooling
- **Fallback Strategy**: Supabase API client for cases where direct PostgreSQL connection fails
- **Migration Strategy**: Drizzle Kit for database schema migrations
- **Connection Management**: Automatic retry logic and connection health monitoring

# External Dependencies

## Database & Backend Services
- **Supabase**: Primary PostgreSQL database hosting with real-time capabilities
- **@neondatabase/serverless**: Alternative PostgreSQL connection driver for serverless environments

## Payment Processing
- **Stripe**: Payment processing integration with React Stripe.js components for secure donation handling

## UI & Design System
- **shadcn/ui**: Pre-built component library based on Radix UI primitives
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

## Development & Build Tools
- **Vite**: Fast build tool with HMR for development and optimized production builds
- **TypeScript**: Type safety across frontend and backend with shared schema definitions
- **Drizzle Kit**: Database migration and schema management tools

## Authentication & Validation
- **Passport.js**: Flexible authentication middleware for Express
- **Zod**: Runtime type validation for API requests and form handling
- **React Hook Form**: Form state management with validation integration

## Monitoring & Development
- **TanStack Query**: Server state synchronization with caching and background updates
- **React Helmet**: Dynamic head management for SEO and metadata