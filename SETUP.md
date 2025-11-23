# GeekHive.ai Setup Guide

## Quick Start

### 1. Database Setup

First, ensure you have PostgreSQL installed and create a database:

```sql
CREATE DATABASE geekhive;
```

Then enable the pgvector extension:

```sql
\c geekhive
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- **DATABASE_URL**: Your PostgreSQL connection string
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **NEXTAUTH_URL**: Your app URL (http://localhost:3000 for dev)
- **GOOGLE_CLIENT_ID** & **GOOGLE_CLIENT_SECRET**: From Google Cloud Console
- **OPENAI_API_KEY**: Your OpenAI API key (or use Anthropic/Groq)
- **UPSTASH_REDIS_REST_URL** & **UPSTASH_REDIS_REST_TOKEN**: For rate limiting

### 3. Install and Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Admin Access

After seeding, you can sign in with:
- Email: `admin@geekhive.ai`
- Use Google OAuth (you'll need to add this email to your Google OAuth allowed users)

Or manually create an admin user in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## Upstash Redis Setup (for Rate Limiting)

1. Sign up at [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy REST URL and Token to `.env`

## Troubleshooting

### pgvector Extension Error

If you get an error about the vector extension:

```sql
-- Check if extension exists
SELECT * FROM pg_extension WHERE extname = 'vector';

-- If not, install it
CREATE EXTENSION vector;
```

### Prisma Client Not Generated

```bash
npm run db:generate
```

### Database Connection Issues

Check your DATABASE_URL format:
```
postgresql://username:password@host:port/database?schema=public
```

### NextAuth Issues

Ensure:
- NEXTAUTH_SECRET is set
- NEXTAUTH_URL matches your app URL
- Google OAuth credentials are correct
- Redirect URI is added in Google Cloud Console

## Next Steps

1. **Customize Categories**: Edit `prisma/seed.ts` to add your categories
2. **Add More Tools**: Use the vendor submission form or seed script
3. **Configure AI Provider**: Switch between OpenAI, Anthropic, or Groq in `.env`
4. **Deploy**: Follow deployment instructions in README.md

## Production Checklist

- [ ] Set strong NEXTAUTH_SECRET
- [ ] Use production database
- [ ] Configure production NEXTAUTH_URL
- [ ] Set up proper rate limiting
- [ ] Enable HTTPS
- [ ] Configure CORS if needed
- [ ] Set up monitoring/logging
- [ ] Review security settings

