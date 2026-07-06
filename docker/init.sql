-- Runs automatically on first database initialization (docker-entrypoint-initdb.d).
-- Ensures the pgvector extension exists before Drizzle creates the vector column.
CREATE EXTENSION IF NOT EXISTS vector;
