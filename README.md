# GeekHive.ai

A next-generation AI discovery and recommendation platform with semantic workflow matching.

## Features

- 🤖 **AI-Powered Recommendations**: Semantic analysis of user workflows to suggest relevant AI tools
- 🔍 **Vector Search**: pgvector-powered semantic search for intelligent tool matching
- 👥 **Multi-Role Support**: User, Vendor, and Admin roles with RBAC
- 📊 **Admin Dashboard**: Tool approval, metrics, and moderation
- 🏪 **Vendor Submissions**: Vendors can submit tools for approval
- ⚖️ **Tool Comparison**: Side-by-side comparison of AI tools
- 💾 **User Dashboard**: Save favorites, comparisons, and recommendations
- 🔒 **Security**: Rate limiting, input validation, GDPR compliance

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Vector Search**: pgvector for semantic search
- **AI**: OpenAI/Anthropic/Groq for LLM and embeddings
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: TailwindCSS
- **Rate Limiting**: Upstash Redis

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL database with pgvector extension
- OpenAI API key (or Anthropic/Groq)
- Google OAuth credentials
- Upstash Redis account (for rate limiting)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/geekhive?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Providers (use one or more)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GROQ_API_KEY="your-groq-api-key"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# App Configuration
APP_ENV="development"
AI_PROVIDER="openai" # openai, anthropic, or groq
```

### 4. Database Setup

#### Enable pgvector Extension

Connect to your PostgreSQL database and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Run Migrations

```bash
npm run db:push
# or
npm run db:migrate
```

#### Generate Prisma Client

```bash
npm run db:generate
```

### 5. Seed Database

```bash
npm run db:seed
```

This will create:
- An admin user (admin@geekhive.ai)
- Sample categories and tags
- 5 sample AI tools with embeddings

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
geekhive.ai/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── vendor/            # Vendor pages
│   ├── auth/              # Authentication pages
│   └── ...
├── components/             # React components
│   ├── layout/            # Layout components
│   ├── features/          # Feature components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
│   ├── ai/                # AI/LLM utilities
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database utilities
│   ├── validations/       # Zod schemas
│   └── rate-limit/        # Rate limiting
├── prisma/                # Prisma schema and migrations
│   └── seed.ts            # Database seed script
├── prompts/               # Versioned AI prompts
│   └── versioned/
└── types/                 # TypeScript type definitions
```

## Key Features Implementation

### AI Recommendation Engine

The recommendation system uses a multi-step process:

1. **Workflow Analysis**: LLM analyzes user input to extract tasks, needs, and context
2. **Vector Search**: Semantic search using pgvector to find similar tools
3. **Re-ranking**: LLM re-ranks candidates based on relevance
4. **Personalization**: Generates "why this fits" explanations for each recommendation

### Security Features

- **Input Validation**: All inputs validated with Zod schemas
- **Rate Limiting**: Upstash Redis for API rate limiting
- **RBAC**: Role-based access control for admin/vendor routes
- **GDPR Compliance**: Marketing consent, data deletion support

### Database Schema

Key models:
- `User`: Users with roles (USER, VENDOR, ADMIN)
- `Tool`: AI tools with metadata and embeddings
- `Category` & `Tag`: Organization and filtering
- `Comparison`: Tool comparisons
- `ToolFeedback`: User feedback and feature requests

## Development

### Adding a New Tool

1. Sign in as vendor or admin
2. Navigate to `/vendor/submit`
3. Fill out the tool submission form
4. Admin approves via `/admin`

### Running Tests

(Add test setup instructions here)

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Migration

For production:

```bash
npm run db:migrate
```

## License

[Add your license here]

## Support

For issues and questions, please [create an issue](link-to-issues).
