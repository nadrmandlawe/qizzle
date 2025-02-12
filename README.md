# 🎯 Quizmify - AI-Powered Quiz Platform

Quizmify is an intelligent quiz generation platform that leverages the power of AI to create personalized learning experiences. Challenge yourself with dynamically generated questions across any topic, track your progress, and improve your knowledge through interactive quizzes.

## ✨ Features

### Core Features
- 🤖 **AI-Powered Quiz Generation** - Utilizes Google's Gemini AI to create intelligent and contextually relevant questions
- 🎯 **Multiple Quiz Types** 
  - Multiple Choice Questions (MCQ)
  - Open-ended Questions with AI-powered answer evaluation
- 📊 **Comprehensive Statistics**
  - Detailed performance analytics
  - Topic-wise progress tracking
  - Historical quiz data visualization

### User Experience
- 🌓 **Dark/Light Mode** - Beautiful UI that adapts to your preference
- 📱 **Responsive Design** - Seamless experience across all devices
- 🎨 **Modern Interface** - Built with Shadcn UI components
- ⚡ **Real-time Feedback** - Instant scoring and performance insights

### Smart Features
- 🎚️ **Difficulty Levels** - Choose between Beginner, Intermediate, and Expert
- 🏷️ **Topic Filtering** - Organize and filter quizzes by topics
- 📈 **Progress Tracking** - Monitor your improvement over time
- 🔥 **Hot Topics** - Discover popular quiz categories

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - Latest features including App Router and React Server Components
- **TypeScript** - Type-safe code development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality UI components
- **React Query** - Efficient server state management
- **Next-Auth** - Secure authentication

### Backend
- **Prisma** - Type-safe database ORM
- **MySQL** - Reliable data storage
- **Docker** - Containerized development environment
- **Google Gemini API** - Advanced AI capabilities

### Authentication & Security
- **NextAuth.js** - OAuth integration with Google
- **Prisma Adapter** - Seamless auth-database integration
- **JWT Tokens** - Secure session management

### Development Tools
- **ESLint** - Code quality maintenance
- **Prettier** - Code formatting
- **Docker Compose** - Development environment orchestration

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/nadrmandlawe/quizmify.git
   cd quizmify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   # Database
   DATABASE_URL="mysql://quizmify:quizmify@localhost:3306/quizmify"

   # Authentication
   NEXTAUTH_SECRET='your-nextauth-secret'
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID='your-google-client-id'
   GOOGLE_CLIENT_SECRET='your-google-client-secret'

   # AI API (use either Gemini or OpenAI)
   GEMINI_API_KEY='your-gemini-api-key'
   OPENAI_API_KEY='your-openai-api-key'
   ```

4. **Start the database**
   ```bash
   docker compose up -d
   ```

5. **Initialize Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 📱 Screenshots

[Add your application screenshots here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## 🙏 Acknowledgments

- Thanks to the amazing open-source community
- Powered by Google's Gemini AI
- Built with Next.js and Vercel

