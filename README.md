# Groq Study Partner - Backend

NestJS backend API for the Groq study partner discovery app with MongoDB Atlas, JWT authentication, and Groq AI integration.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: Google OAuth 2.0 + JWT
- **AI Integration**: Groq LLM API
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js >= 18
- npm or pnpm
- MongoDB Atlas account
- Google OAuth credentials
- Groq API key

## Environment Variables

Create a `.env` file in the backend directory (see `.env.example`):

```env
PORT=3001
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/groq-db?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Groq AI
GROQ_API_KEY=your-groq-api-key
GROQ_BASE_URL=https://api.groq.com/openai/v1

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

## Installation

```bash
npm install
# or
pnpm install
```

## Running Locally

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`

## API Documentation

Swagger UI is available at: `http://localhost:3001/api/docs`

To export OpenAPI spec:

```bash
npm run swagger:export
```

This generates `openapi.json` and `openapi.yaml` files.

## API Endpoints

### Authentication
- `POST /auth/google` - Authenticate with Google OAuth token
- `POST /auth/logout` - Logout and revoke tokens
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users` - List users with filters (protected)
- `GET /users/:id` - Get user profile (protected)
- `PUT /users/:id` - Update own profile (protected)

### Matches
- `POST /matches/:targetId` - Create match (swipe right) (protected)
- `DELETE /matches/:id` - Unmatch (protected)
- `GET /matches` - List user matches (protected)
- `GET /matches/suggestions` - AI-powered suggestions (protected)

### Messages
- `GET /messages/:matchId` - List messages for match (protected)
- `POST /messages/:matchId` - Send message (protected)
- `DELETE /messages/:id` - Delete message (protected)

## Database Models

### User
- googleId, name, email, imageUrl
- schoolName, age, major, faculty
- interests[], bio
- settings (aiSuggestionsEnabled, notifications, darkMode)
- lastSeenAt, refreshToken

### Match
- userAId, userBId
- status (pending, matched, unmatched)
- score (AI compatibility 0-100)
- explanation (AI reasoning)

### Message
- matchId, senderId, recipientId
- content, deleted
- createdAt

## Groq AI Integration

The backend uses Groq's OpenAI-compatible API for AI-powered match suggestions.

### Example Request to Groq

```typescript
POST https://api.groq.com/openai/v1/chat/completions
Authorization: Bearer <GROQ_API_KEY>

{
  "model": "mixtral-8x7b-32768",
  "messages": [
    {
      "role": "system",
      "content": "You are an AI study partner matching assistant..."
    },
    {
      "role": "user",
      "content": "Analyze these candidates: [...]"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### Fallback Matcher

If Groq API is unavailable or API key not configured, a deterministic fallback matcher is used based on:
- Interest overlap
- Major similarity
- Random variation for diversity

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Create `vercel.json` in backend root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
  ]
}
```

3. Deploy:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all variables from `.env.example`
   - Redeploy

### Alternative: Build Command for Vercel

In Vercel dashboard:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Security Best Practices

1. **JWT Tokens**: Short-lived access tokens (15m) + httpOnly refresh cookies
2. **CORS**: Whitelist specific origins
3. **Rate Limiting**: Configured via Throttler module
4. **Helmet**: Security headers enabled
5. **Input Validation**: class-validator on all DTOs
6. **Password Hashing**: bcrypt (if adding email/password auth)
7. **MongoDB Injection**: Mongoose escapes queries by default

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/             # User module
│   │   ├── dto/
│   │   ├── schemas/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── matches/           # Match module
│   │   ├── clients/       # LLM clients
│   │   ├── dto/
│   │   ├── interfaces/
│   │   ├── schemas/
│   │   ├── matches.controller.ts
│   │   ├── matches.service.ts
│   │   └── matches.module.ts
│   ├── messages/          # Message module
│   │   ├── dto/
│   │   ├── schemas/
│   │   ├── messages.controller.ts
│   │   ├── messages.service.ts
│   │   └── messages.module.ts
│   ├── app.module.ts
│   └── main.ts
├── scripts/
│   └── export-swagger.ts
├── test/
├── package.json
├── tsconfig.json
└── .env.example
```

## License

MIT
