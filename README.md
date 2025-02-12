# Quizmify

A Next.js application for creating and taking quizzes powered by AI.

## Prerequisites

- Node.js 16+ and npm
- Docker Desktop
- Google OAuth credentials
- OpenAI API key or Google Gemini API key

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quizmify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="mysql://quizmify:quizmify@localhost:3306/quizmify"

   # Authentication
   NEXTAUTH_SECRET='your-nextauth-secret'
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID='your-google-client-id'
   GOOGLE_CLIENT_SECRET='your-google-client-secret'

   # AI APIs (use either OpenAI or Gemini)
   OPENAI_API_KEY='your-openai-api-key'
   GEMINI_API_KEY='your-gemini-api-key'

   # App URL
   API_URL='http://localhost:3000'
   ```

4. **Start the MySQL Database**
   ```bash
   # Start MySQL and Adminer containers
   docker compose up -d
   ```

   You can access Adminer at http://localhost:8080 with these credentials:
   - System: MySQL
   - Server: mysql
   - Username: quizmify
   - Password: quizmify
   - Database: quizmify

5. **Initialize the database**
   ```bash
   # Push the database schema
   npx prisma db push
   
   # Generate Prisma Client
   npx prisma generate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

## Features

- Google Authentication
- AI-powered quiz generation
- Multiple choice and open-ended questions
- Topic-based quizzes
- Real-time scoring
- User dashboard
- Dark/Light mode

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Prisma ORM
- MySQL
- NextAuth.js
- Tailwind CSS
- OpenAI/Google Gemini API
- Docker

## Useful Commands

```bash
# Start the application
npm run dev

# Build the application
npm run build

# Start production server
npm start

# Database Management
npx prisma studio    # Open Prisma Studio
npx prisma db push   # Push schema changes
npx prisma generate  # Generate Prisma Client

# Docker Commands
docker compose up -d          # Start containers
docker compose down          # Stop containers
docker compose logs         # View container logs
```

## Environment Setup Help

1. **Google OAuth Setup:**
   - Go to Google Cloud Console
   - Create a new project
   - Enable OAuth 2.0
   - Create credentials (OAuth client ID)
   - Add authorized redirect URI: http://localhost:3000/api/auth/callback/google

2. **Database Connection:**
   - Make sure Docker is running
   - The MySQL container should be running on port 3306
   - Use Adminer (http://localhost:8080) to manage the database

3. **AI API Setup:**
   - For OpenAI: Get API key from OpenAI dashboard
   - For Gemini: Get API key from Google AI Studio
