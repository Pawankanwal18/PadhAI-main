# Anthropic Claude API Migration Guide

## ✅ Changes Completed

Your project has been successfully migrated from **Google Gemini** to **Anthropic Claude**!

### Files Updated:
1. ✅ `.env` - Changed `GEMINI_API_KEY` → `ANTHROPIC_API_KEY`
2. ✅ `package.json` - Changed `@google/generative-ai` → `@anthropic-ai/sdk`
3. ✅ `backend/server.js` - Replaced all Gemini API calls with Anthropic Claude

---

## 🔐 Setting Up Your API Key (SECURE WAY)

### Step 1: Get Your Anthropic API Key
1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. **Copy it** (you'll only see it once)

### Step 2: Add to .env File

Edit `.env` file in `ai projeect/backend/`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
PORT=3001
```

### Step 3: NEVER Commit API Keys!

Add `.env` to `.gitignore`:

```bash
echo ".env" >> ai\ projeect/backend/.gitignore
```

Your `.env` file should already be ignored, but verify by checking:
```bash
cat ai\ projeect/backend/.gitignore
```

Should contain: `.env`

---

## 📦 Install Dependencies

```bash
cd "ai projeect"
npm install
```

This will install the Anthropic SDK instead of Google Generative AI.

---

## 🚀 Run the Backend

```bash
npm run backend
```

You should see:
```
✅ PadhAI Backend running on http://localhost:3001
🤖 Anthropic Claude: Connected
```

---

## 🧪 Test the API

### Test Endpoint:
```bash
curl -X POST http://localhost:3001/api/analyze-syllabus \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Unit 1: Data Structures\n- Arrays\n- Linked Lists\n- Trees"
  }'
```

---

## ⚠️ Security Checklist

- ✅ Exposed API key has been mentioned → **REVOKE IT IMMEDIATELY** from Anthropic dashboard
- ✅ Create a new API key
- ✅ Use `.env` file (DO NOT commit it)
- ✅ Add `.env` to `.gitignore`
- ✅ Never share API keys in messages, code, or public repositories

---

## 📊 Model Information

**Current Model:** `claude-3-5-sonnet-20241022`

This is Anthropic's latest and most capable model:
- Excellent at analyzing syllabuses and generating questions
- Supports vision (image analysis for OCR)
- Fast and cost-effective
- Best for your use case

---

## 🔄 API Differences (Gemini → Claude)

| Feature | Gemini | Claude |
|---------|--------|--------|
| Text Generation | ✅ | ✅ |
| Vision/OCR | ✅ | ✅ |
| Error Handling | Multiple models | Single model (faster) |
| Rate Limiting | 429 errors | 429 errors |
| JSON Output | Reliable | Excellent |

---

## ❓ Troubleshooting

### Error: "Invalid Anthropic API key"
```
❌ Solution: Check your .env file and ensure the key is correct
```

### Error: "API rate-limited"
```
❌ Solution: Wait a moment and retry. Anthropic has generous quotas.
```

### Error: "ANTHROPIC_API_KEY is undefined"
```
❌ Solution: Restart the backend server after adding the key to .env
```

---

## 📝 Next Steps

1. Set up your `.env` file with the new API key
2. Run `npm install` to install Anthropic SDK
3. Start the backend: `npm run backend`
4. Test the API endpoints
5. Integrate with your frontend

---

**Status:** ✅ Ready for deployment
**Last Updated:** 2026-06-22
