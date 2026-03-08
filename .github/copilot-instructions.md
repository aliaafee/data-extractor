# Copilot Instructions

This is a simple Express.js REST API server using Prisma ORM and SQLite as the database backend.

## Project Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite

## Project Structure
- `src/index.js` - Entry point, Express server setup
- `src/routes/` - Route handlers
- `prisma/schema.prisma` - Prisma schema definition
- `prisma/dev.db` - SQLite database file (auto-generated)

## Development Guidelines
- Use Prisma Client for all database operations
- Keep route handlers in separate files under `src/routes/`
- Use environment variables from `.env` for configuration
