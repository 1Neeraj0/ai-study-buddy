# AI Study Buddy - Smart Notes App

A full-stack web application that helps students study smarter using AI. Upload your notes and let AI summarize them, generate flashcards, answer your questions, and create quizzes.

## Tech Stack

- **Frontend:** Angular 18 + Angular Material
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **AI:** OpenAI API (GPT-3.5 Turbo)

## Features

- **User Authentication** - Register and login with JWT
- **Notes Management** - Create, edit, delete study notes
- **AI Summarization** - Get concise summaries of your notes
- **AI Flashcards** - Auto-generate flashcards from notes
- **AI Q&A** - Ask questions about your notes, get AI answers
- **AI Quiz** - Take AI-generated quizzes to test your knowledge

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- OpenAI API key

## Setup

### 1. MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account and a free cluster
3. Create a database user (username + password)
4. Get your connection string (click "Connect" > "Drivers")
5. Whitelist your IP (or allow all: `0.0.0.0/0`)

### 2. OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account (new accounts get free credits)
3. Go to API Keys > Create new key

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and OpenAI API key
npm install
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npx ng serve
```

### 5. Open the App

Visit `http://localhost:4200` in your browser.

## Project Structure

```
rendom/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/               # Mongoose schemas
│   ├── middleware/auth.js     # JWT authentication
│   ├── routes/               # API endpoints
│   ├── services/aiService.js # OpenAI integration
│   └── server.js             # Express entry point
├── frontend/
│   └── src/app/
│       ├── components/       # Shared components (navbar)
│       ├── guards/           # Auth guards
│       ├── models/           # TypeScript interfaces
│       ├── pages/            # Page components
│       └── services/         # HTTP services
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### AI
- `POST /api/ai/summarize/:noteId` - Summarize a note
- `POST /api/ai/flashcards/:noteId` - Generate flashcards
- `POST /api/ai/ask/:noteId` - Ask question about a note
- `POST /api/ai/quiz/:noteId` - Generate quiz from a note
