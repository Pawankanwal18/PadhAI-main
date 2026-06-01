# 🚀 PadhAI — Complete Setup Instructions

## Prerequisites
- **Node.js** v16+ (for frontend & backend)
- **Python** 3.8+ (for ML model)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

---

## Step 1: Install Python Dependencies

```bash
cd c:\Users\pawan\OneDrive\Desktop\padhAI
python -m pip install -r requirements.txt
```

**What's installed:**
- `pandas` — Data manipulation
- `scikit-learn` — Machine learning utilities
- `transformers` — T5 model library
- `torch` — Deep learning framework
- `pdfminer.six` — PDF extraction
- `tqdm` — Progress bars

---

## Step 2: Setup Gemini API Key (CRITICAL!)

### 2a. Get Your API Key
1. Go to: https://ai.google.dev
2. Click **"Get API Key"**
3. Create a new API key for this project
4. Copy the key (format: `AIzaSyD...`)

### 2b. Create `.env` File in Backend
```bash
cd "ai projeect/backend"
cp .env.example .env
```

### 2c. Edit `.env` and Add Your Key
```env
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

**⚠️ DO NOT:**
- Share this key publicly
- Commit `.env` to Git
- Use production keys for testing

---

## Step 3: Install Node.js Dependencies

### Frontend:
```bash
cd "ai projeect"
npm install
```

### Backend:
```bash
cd "ai projeect/backend"
npm install
```

**What's installed:**
- `express` — Web framework
- `cors` — Cross-origin requests
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `multer` — File uploads
- `@google/generative-ai` — Gemini API client
- `pdf-parse` — PDF parsing
- `sqlite3` — Database

---

## Step 4: Run the Application

### Terminal 1: Start Backend (Port 3001)
```bash
cd "ai projeect/backend"
node server.js
```

Expected output:
```
Server running on port 3001
Gemini API initialized
Database ready
```

### Terminal 2: Start Frontend (Port 5173)
```bash
cd "ai projeect"
npm run dev
```

Expected output:
```
VITE v5.x.x
Local:   http://localhost:5173/
```

### Terminal 3 (Optional): View Jupyter Notebook
```bash
cd c:\Users\pawan\OneDrive\Desktop\padhAI
jupyter notebook question_predictor.ipynb
```

---

## Step 5: Access the Application

Open your browser and visit:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Jupyter:** http://localhost:8888

---

## 📊 Key Generated Outputs

### 1. Important Topics CSV
```
📁 data/important_topics_3rd_year.csv

Rank | Topic | Questions | Percentage
-----|-------|-----------|----------
1    | DATA ANALYTICS | 34 | 5.2%
2    | ARTIFICIAL INTELLIGENCE | 24 | 3.7%
3    | COMPUTER NETWORKS | 22 | 3.4%
... (20 total topics)
```

### 2. Pre-trained Model
```
📁 saved_model/
├── model.safetensors    (T5 model weights)
├── config.json          (Model config)
├── tokenizer.json       (Tokenizer)
└── tokenizer_config.json
```

### 3. Training Dataset
```
📁 data/training-dataset.csv
- 1,739 total questions
- 656 from 3rd year
- 1,083 from 4th year
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use:
netstat -ano | findstr :3001

# If in use, kill the process:
taskkill /PID <PID> /F

# Or change port in server.js
```

### Gemini API Error (429)
- **Cause:** API quota exceeded
- **Solution:** Wait a few minutes or use different API key
- **Backend fallback:** Automatically tries other models

### Model not found
- **Cause:** `saved_model/` directory missing
- **Solution:** Ensure `saved_model/` folder exists with all files

### Port 5173 already in use
```bash
# Kill existing process:
taskkill /PID <PID> /F

# Or use different port:
npm run dev -- --port 5174
```

### Python package import errors
```bash
# Reinstall packages:
python -m pip install --upgrade -r requirements.txt

# Or use virtual environment:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📱 Using the Application

### As a Student:
1. **Sign Up** → Create account
2. **Upload PDF** → Submit exam papers
3. **View Predictions** → See AI-generated predictions
4. **Check Topics** → Review important topics for 3rd year

### As an Admin:
1. **Login** → Use admin credentials
2. **Manage Questions** → Upload & organize questions
3. **View Analytics** → See topic frequency
4. **Generate Reports** → Export study guides

---

## 🔄 Workflow Summary

```
┌─────────────────┐
│  Upload PDF     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend:       │
│  - Parse PDF    │
│  - Extract Qs   │
│  - Store in DB  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini API:    │
│  - Generate     │
│  - Predictions  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ML Model:      │
│  - T5-small     │
│  - Rank Topics  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display to     │
│  Frontend       │
└─────────────────┘
```

---

## ✅ Verification Checklist

- [ ] Python dependencies installed
- [ ] Gemini API key obtained
- [ ] `.env` file created with API key
- [ ] Node.js dependencies installed
- [ ] Backend runs without errors
- [ ] Frontend loads at localhost:5173
- [ ] Can upload PDF file
- [ ] Get predictions from model
- [ ] View topics in CSV

---

## 📞 Support Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **React/Vite Docs:** https://vitejs.dev
- **Express.js Docs:** https://expressjs.com
- **Transformers Docs:** https://huggingface.co/docs

---

## 🎉 Done!

Your complete PadhAI stack is now running:
- ✅ ML Model (Python)
- ✅ Backend API (Node.js)
- ✅ Frontend UI (React)
- ✅ AI Integration (Gemini)
- ✅ Database (SQLite)

**Next Steps:**
1. Upload your first exam PDF
2. View predicted topics
3. Check `data/important_topics_3rd_year.csv` for study focus areas
4. Use the generated insights for curriculum planning

Good luck! 🚀

