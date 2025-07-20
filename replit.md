# Ministering Companion

## Overview

Ministering Companion is a full-stack web application built for LDS (Latter-day Saint) members to manage and track their ministering responsibilities. The app enables users to record voice-based ministering visits, receive AI-powered insights and suggestions, and access gospel resources to better serve those they minister to.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with functional components and hooks
- **Styling**: TailwindCSS with shadcn/ui component library
- **Routing**: wouter for client-side routing
- **State Management**: @tanstack/react-query for server state management
- **Build Tool**: Vite with TypeScript support
- **UI Components**: Extensive use of Radix UI primitives through shadcn/ui

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's built-in OIDC authentication system with passport.js
- **Session Management**: express-session with PostgreSQL store

### Project Structure
- **Monorepo**: Single repository with client, server, and shared code
- **client/**: React frontend application
- **server/**: Express.js backend API
- **shared/**: Common TypeScript types and schemas using Drizzle and Zod

## Key Components

### Authentication System
- Uses Replit's OIDC authentication provider
- Session-based authentication with secure HTTP-only cookies
- Mandatory user and session tables for Replit compatibility
- Protected API routes with authentication middleware

### Database Schema
- **users**: User profiles (required for Replit auth)
- **sessions**: Session storage (required for Replit auth)
- **ministeredPersons**: People being ministered to
- **ministeringEntries**: Visit records and transcriptions
- **gospelResources**: Scripture references, talks, and service ideas

### Voice Recording & AI Integration
- Browser-based voice recording using MediaRecorder API
- OpenAI Whisper API for audio transcription
- GPT-4 for analyzing visits and generating insights
- Automatic suggestions for follow-ups, scriptures, and resources

### File Upload System
- Multer middleware for handling audio file uploads
- Support for multiple audio formats (wav, mp3, m4a, ogg, webm)
- File size limits and type validation

## Data Flow

1. **Authentication**: User logs in through Replit auth, session created
2. **Dashboard**: User views list of ministered persons with summary data
3. **Visit Recording**: User records audio of ministering visit
4. **Transcription**: Audio sent to OpenAI Whisper for transcription
5. **Analysis**: Transcript analyzed by GPT-4 for insights and suggestions
6. **Storage**: Visit data, transcript, and insights stored in database
7. **Resources**: AI-suggested gospel resources displayed to user

## External Dependencies

### Required Services
- **Replit Authentication**: OIDC provider for user authentication
- **PostgreSQL Database**: Primary data storage (via Neon serverless)
- **OpenAI API**: Audio transcription (Whisper) and text analysis (GPT-4)

### Key Libraries
- **@neondatabase/serverless**: PostgreSQL connection with WebSocket support
- **drizzle-orm**: Type-safe database queries and schema management
- **@tanstack/react-query**: Server state management and caching
- **passport & openid-client**: Authentication strategy implementation
- **multer**: File upload handling for audio recordings

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire application
- **TailwindCSS**: Utility-first CSS framework
- **Replit-specific plugins**: Development environment integration

## Deployment Strategy

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `OPENAI_API_KEY`: OpenAI API access
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `ISSUER_URL`: OIDC issuer endpoint

### Build Process
- Frontend: Vite builds to `dist/public`
- Backend: esbuild compiles TypeScript to `dist/index.js`
- Database: Drizzle Kit manages schema migrations

### Production Considerations
- Session store uses PostgreSQL for persistence
- Audio files temporarily stored in `uploads/` directory
- CORS and security headers configured for production
- Error handling with proper HTTP status codes

### Development vs Production
- Development uses Vite dev server with HMR
- Production serves static files through Express
- Database migrations handled through `drizzle-kit push`
- Replit-specific development tools integrated conditionally

The application follows a traditional three-tier architecture with clear separation between presentation (React), business logic (Express API), and data persistence (PostgreSQL), while leveraging cloud services for authentication and AI capabilities.