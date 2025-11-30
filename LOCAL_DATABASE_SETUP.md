# Local PostgreSQL Setup Guide

## Option 1: Postgres.app (Easiest - No Terminal Required)

1. **Download Postgres.app:**
   - Go to https://postgresapp.com/downloads.html
   - Download the latest version for macOS
   - Drag it to your Applications folder

2. **Start Postgres.app:**
   - Open Postgres.app from Applications
   - Click "Initialize" to create a new server
   - The server will start automatically

3. **Create the database:**
   - Open Terminal
   - Run:
     ```bash
     /Applications/Postgres.app/Contents/Versions/latest/bin/createdb geekhive
     ```

4. **Enable pgvector extension:**
   ```bash
   /Applications/Postgres.app/Contents/Versions/latest/bin/psql geekhive -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

5. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://localhost:5432/geekhive?schema=public"
   ```

---

## Option 2: Install Homebrew + PostgreSQL (More Control)

### Step 1: Install Homebrew

Run this in Terminal (it will ask for your password):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. After installation, you may need to add Homebrew to your PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 2: Install PostgreSQL

```bash
brew install postgresql@15
```

### Step 3: Start PostgreSQL

```bash
brew services start postgresql@15
```

### Step 4: Create Database

```bash
createdb geekhive
```

### Step 5: Enable pgvector

First, install pgvector:
```bash
brew install pgvector
```

Then enable it:
```bash
psql geekhive -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Step 6: Update `.env`

```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/geekhive?schema=public"
```

Or if you have a password set:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/geekhive?schema=public"
```

---

## After Setup (Either Option)

1. **Test the connection:**
   ```bash
   psql geekhive -c "SELECT version();"
   ```

2. **Push the schema:**
   ```bash
   npm run db:push
   ```

3. **Seed the database:**
   ```bash
   npm run db:seed
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

---

## Troubleshooting

### "psql: command not found"

If using Postgres.app, use the full path:
```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql geekhive
```

Or add to your PATH:
```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "extension vector does not exist"

You need to install pgvector. For Postgres.app, you may need to compile it manually or use a version that includes it. Consider using Option 2 (Homebrew) or a cloud database for pgvector support.

### Connection refused

Make sure PostgreSQL is running:
- Postgres.app: Check if the icon shows a running server
- Homebrew: Run `brew services list` to check status


