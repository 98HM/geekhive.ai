# Database Setup Guide

## Option 1: Local PostgreSQL (Recommended for Development)

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Or use Postgres.app:**
Download from https://postgresapp.com/

### Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE geekhive;

# Enable pgvector extension
\c geekhive
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

### Update .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/geekhive?schema=public"
```

Replace `postgres:postgres` with your PostgreSQL username and password.

---

## Option 2: Cloud Database (Recommended for Production)

### Option 2a: Supabase (Free Tier Available)

1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Enable pgvector:**
- Go to SQL Editor in Supabase
- Run: `CREATE EXTENSION IF NOT EXISTS vector;`

### Option 2b: Neon (Free Tier Available)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `.env`:

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[ENDPOINT]/[DATABASE]"
```

**Enable pgvector:**
- pgvector is pre-installed on Neon

### Option 2c: Railway

1. Sign up at https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string
4. Update `.env`

**Enable pgvector:**
- Run: `CREATE EXTENSION IF NOT EXISTS vector;`

---

## Option 3: Docker (Quick Local Setup)

```bash
# Run PostgreSQL with pgvector in Docker
docker run --name geekhive-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=geekhive \
  -p 5432:5432 \
  -d pgvector/pgvector:pg15

# Enable pgvector extension
docker exec -it geekhive-postgres psql -U postgres -d geekhive -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Update `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/geekhive?schema=public"
```

---

## After Setting Up Database

1. **Update your `.env` file** with the correct DATABASE_URL
2. **Push the schema:**
   ```bash
   npm run db:push
   ```
3. **Generate Prisma Client (if needed):**
   ```bash
   npm run db:generate
   ```
4. **Seed the database:**
   ```bash
   npm run db:seed
   ```

---

## Verify Connection

Test your connection:
```bash
psql $DATABASE_URL -c "SELECT version();"
```

Or test with Prisma:
```bash
npx prisma db execute --stdin <<< "SELECT version();"
```

