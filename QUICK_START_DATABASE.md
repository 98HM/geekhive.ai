# Quick Database Setup

## Easiest Option: Supabase (Free, 2 minutes)

1. **Sign up at https://supabase.com** (free account)

2. **Create a new project:**
   - Click "New Project"
   - Choose a name (e.g., "geekhive")
   - Set a database password (save it!)
   - Choose a region
   - Click "Create new project"

3. **Get your connection string:**
   - Wait 2 minutes for project to initialize
   - Go to **Settings** → **Database**
   - Scroll to "Connection string"
   - Copy the "URI" connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

4. **Enable pgvector:**
   - Go to **SQL Editor** in Supabase dashboard
   - Click "New query"
   - Run this SQL:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```
   - Click "Run"

5. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```
   Replace `[YOUR-PASSWORD]` with the password you set, and `xxxxx` with your project reference.

6. **Push the schema:**
   ```bash
   npm run db:push
   ```

7. **Seed the database:**
   ```bash
   npm run db:seed
   ```

---

## Alternative: Neon (Also Free)

1. Sign up at https://neon.tech
2. Create a project
3. Copy the connection string
4. Update `.env`
5. pgvector is pre-installed!

---

## If You Want Local PostgreSQL

**macOS with Homebrew:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb geekhive
psql geekhive -c "CREATE EXTENSION vector;"
```

Then update `.env`:
```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/geekhive?schema=public"
```

