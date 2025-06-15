# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database:**
- `docker-compose up -d` - Start PostgreSQL database
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio GUI

## Architecture

This is a Next.js 15 kanban board application with the following key components:

**Database Layer:**
- PostgreSQL database (via Docker Compose)
- Prisma ORM with schema defining Board → Column → Task hierarchy
- Task priorities (LOW, MEDIUM, HIGH, URGENT) and completion status
- Unique position constraints for ordering within columns/boards

**Frontend Stack:**
- Next.js 15 with App Router (TypeScript)
- Tailwind CSS v4 with custom utility functions
- Lucide React icons
- DND Kit for drag-and-drop functionality
- Class Variance Authority for component styling

**Data Model:**
- Board: Contains multiple columns with title/description
- Column: Has position, color, and belongs to a board
- Task: Has position, priority, due date, completion status, belongs to column

**Key Dependencies:**
- `@dnd-kit/sortable` - Drag and drop functionality
- `class-variance-authority` - Component variant management  
- `tailwind-merge` + `clsx` - Utility function in lib/utils.ts for conditional classes

The application follows standard Next.js conventions with the App Router pattern. Database connection requires the DATABASE_URL environment variable pointing to PostgreSQL.