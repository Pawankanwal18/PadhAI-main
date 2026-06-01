# PadhAI – AI-Powered Exam Predictor for BIAS Students

> Predict smarter. Study better.

PadhAI is a full-stack web application built exclusively for **BIAS (Birla Institute of Applied Sciences)** students. It uses Google Gemini AI to analyze your uploaded syllabus, predict high-probability exam questions, and surface important topics ranked by historical frequency.

---

## ✨ Features

- 🤖 **Gemini AI Syllabus Analysis** — Upload a PDF, image, or paste raw syllabus text
- 📊 **Smart Dashboard** — View topic heat maps, predicted questions, and priority rankings
- 🔐 **Secure Auth** — Username + password login with JWT, Gmail-only registration
- 📚 **Question Bank** — Historical BIAS past-paper questions ranked by occurrence
- 🎨 **Premium UI** — Cinematic scroll-driven animations with glassmorphism design

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Framer Motion, Lenis |
| Backend | Node.js, Express 5, better-sqlite3 |
| AI | Google Gemini API (gemini-2.0-flash-lite / 1.5-flash) |
| Auth | JWT + bcryptjs |
| Styling | Tailwind CSS v4, custom CSS animations |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- A Gemini API key from [https://ai.google.dev](https://ai.google.dev)

### 1. Install dependencies

```bash
cd "ai projeect"
npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Run the app

```bash
# Terminal 1 — Backend (port 3001)
npm run backend

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## ☁️ Deploying to Vercel

This project is configured for Vercel deployment of the **frontend**.

> ⚠️ The Express backend uses `better-sqlite3` (a native binary + file-system database) which **cannot run on Vercel serverless functions**. You need to deploy the backend separately (see options below).

### Frontend Deployment (Vercel)

1. Push this repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `ai projeect`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com`
5. Deploy ✅

### Backend Deployment Options

| Platform | Notes |
|---|---|
| **Railway** | Easiest — supports SQLite, persistent disk |
| **Render** | Free tier available, supports Node + SQLite |
| **Fly.io** | Great for persistent SQLite with volumes |

### Backend Environment Variables

```env
GEMINI_API_KEY=your_key_here
PORT=3001
```

---

## 📁 Project Structure

```
ai projeect/
├── src/               # React frontend source
│   ├── components/    # UI components (HeroSection, AuthPage, etc.)
│   ├── hooks/         # Custom React hooks
│   └── App.jsx        # Root component with routing
├── backend/
│   ├── server.js      # Express API server
│   ├── db.js          # SQLite database setup
│   └── .env.example   # Environment variable template
├── public/            # Static assets
├── vercel.json        # Vercel deployment config
└── vite.config.js     # Vite build config
```

---

## 🔒 Security Notes

- Never commit your `.env` file or `GEMINI_API_KEY`
- The `JWT_SECRET` in `server.js` should be changed to a strong random string in production
- SQLite `users.db` is excluded from git (contains user credentials)

---

## 📄 License

MIT — built with ❤️ for BIAS students.
