# ⚡ PadhAI Quick Reference Card

## 🌐 Live URLs (All Running Now)

| Service | URL | Port | Status |
|---------|-----|------|--------|
| **Frontend** | http://localhost:5173 | 5173 | ✅ Running |
| **Backend API** | http://localhost:3001 | 3001 | ✅ Running |
| **Jupyter** | http://localhost:8888 | 8888 | ✅ Running |

---

## 🔑 Jupyter Access

**Token:** `9bbad8d3120c52178b39ec2889f0997e7d3f679cdf5c2dca`

```
Direct URL:
http://localhost:8888/tree?token=9bbad8d3120c52178b39ec2889f0997e7d3f679cdf5c2dca
```

---

## 📊 Key Files

| File | Purpose |
|------|---------|
| `data/important_topics_3rd_year.csv` | Top 20 topics for study |
| `question_predictor.ipynb` | ML model & predictions |
| `ai projeect/backend/.env` | Gemini API configuration |
| `ai projeect/backend/server.js` | Backend API server |
| `ai projeect/src/` | React components |

---

## 🚀 Start/Stop Commands

### All in One (if needed)

```powershell
# Backend
cd "c:\Users\pawan\OneDrive\Desktop\padhAI\ai projeect\backend"
node server.js

# Frontend (new terminal)
cd "c:\Users\pawan\OneDrive\Desktop\padhAI\ai projeect"
npm run dev

# Jupyter (new terminal)
cd "c:\Users\pawan\OneDrive\Desktop\padhAI"
jupyter notebook question_predictor.ipynb
```

### Stop Everything
```
Press Ctrl+C in each terminal
```

---

## 📝 API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/upload` - Upload PDF
- `GET /api/predictions` - Get predictions
- `POST /api/predict-topics` - Generate predictions

---

## 🎯 What to Do Next

1. **Visit Frontend:** http://localhost:5173
2. **Create Account:** Sign up with email
3. **Upload PDF:** Upload exam paper
4. **View Results:** See AI predictions
5. **Check Topics:** Review `data/important_topics_3rd_year.csv`
6. **Run Notebook:** Open Jupyter for detailed analysis

---

## ✅ Verification Checklist

- [ ] Can access http://localhost:5173
- [ ] Can access http://localhost:3001/api
- [ ] Can access http://localhost:8888
- [ ] CSV file exists: `data/important_topics_3rd_year.csv`
- [ ] Can upload PDF and get predictions

---

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port already in use | `netstat -ano \| findstr :PORT` then `taskkill /PID <PID> /F` |
| Gemini API error | Check API key in `.env`, wait if quota exceeded |
| Frontend won't load | Clear cache, check console (F12), restart npm |
| Backend won't connect | Verify `.env` file exists, check port 3001 |
| Jupyter token issues | Check terminal for new token |

---

## 🔐 Security Notes

- ✅ API key is in `.env` (not in code)
- ✅ Never commit `.env` to Git
- ✅ Change JWT_SECRET in production
- ✅ Use HTTPS in production
- ✅ Validate all file uploads

---

## 📊 Important Topics (3rd Year)

Top 5 Topics by Frequency:

1. 📊 **DATA ANALYTICS** - 5.2%
2. 🤖 **ARTIFICIAL INTELLIGENCE** - 3.7%
3. 🌐 **COMPUTER NETWORKS** - 3.4%
4. ⚙️ **ANALYSIS OF ALGORITHMS** - 2.0%
5. 🎨 **COMPUTER GRAPHICS** - 1.8%

**See full list:** `data/important_topics_3rd_year.csv`

---

## 💾 Technologies Running

| Component | Tech | Version |
|-----------|------|---------|
| Frontend | React + Vite | 18 + 8.0.14 |
| Backend | Express.js | Latest |
| Database | SQLite3 | Latest |
| AI API | Google Gemini | 2.0-flash |
| ML Model | T5 | Small (60M params) |
| Python | Python | 3.13.7 |
| Node.js | Node | Latest |

---

## 🎓 Study Guide

**Based on the data analyzed:**

- **Priority 1:** Data Analytics, AI, Networks (11.3%)
- **Priority 2:** Algorithm, Graphics, Database (5.6%)
- **Priority 3:** Design, Others (1.1%)

---

**Everything is ready! Start at:** http://localhost:5173

🚀 Happy coding with PadhAI!

