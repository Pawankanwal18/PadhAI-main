# 🎯 PadhAI RAG System - Quick Reference

## ⚡ Quick Start (5 minutes)

### 1. Verify RAG is Running
```bash
curl http://localhost:3001/api/rag/health
```
Expected:
```json
{
  "success": true,
  "initialized": true,
  "questions_loaded": 2213,
  "status": "ready"
}
```

### 2. View System Status
```bash
curl http://localhost:3001/api/rag/report
```

### 3. Generate a Question with RAG Context
```bash
curl -X POST http://localhost:3001/api/rag/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning algorithms",
    "topic": "ARTIFICIAL INTELLIGENCE"
  }'
```

---

## 🔍 Common API Calls

### Find Similar Questions
```bash
curl -X POST http://localhost:3001/api/rag/retrieve-context \
  -H "Content-Type: application/json" \
  -d '{"query": "explain database indexing", "topK": 5}'
```

### List All Topics
```bash
curl http://localhost:3001/api/rag/topics
```

### Search with Filters
```bash
curl -X POST http://localhost:3001/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "data structures trees",
    "difficulty": "medium",
    "limit": 10
  }'
```

### Get Statistics
```bash
curl http://localhost:3001/api/rag/statistics
```

---

## 📊 Dataset Overview

- **Total Questions**: 2,213
- **Total Topics**: 148
- **Years Covered**: 4 (1st Year - 4th Year)
- **Difficulty Distribution**:
  - Easy: 1,376 (62%)
  - Medium: 800 (36%)
  - Hard: 37 (2%)

---

## 🎨 How RAG Improves Your Questions

### RAG Context Injection:
```
User Query: "Explain operating system concepts"
  ↓
RAG Finds: Similar questions from dataset
  ↓
Context Added: 
  "Topic: OS, Year: 3rd Year"
  "Similar Q1: Explain process scheduling?"
  "Similar Q2: What are threads and processes?"
  ↓
Anthropic API: Generates new question matching style
  ↓
Result: "Explain the difference between..."
```

---

## 💻 Example Integration Code

### Node.js
```javascript
const response = await fetch('http://localhost:3001/api/rag/generate-question', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'database optimization',
    topic: 'DBMS',
    difficulty: 'hard'
  })
});
const data = await response.json();
```

### Python
```python
import requests
response = requests.post(
    'http://localhost:3001/api/rag/generate-question',
    json={
        'query': 'artificial intelligence',
        'topic': 'ARTIFICIAL INTELLIGENCE',
        'difficulty': 'medium'
    }
)
print(response.json())
```

### cURL
```bash
curl -X POST http://localhost:3001/api/rag/generate-question \
  -H "Content-Type: application/json" \
  -d '{"query":"ML algorithms","topic":"AI"}'
```

---

## 📈 Performance Tips

| Task | Approach | Speed |
|------|----------|-------|
| Find top 5 similar questions | `topK=5` | ⚡ Fast |
| Specific topic search | Add `topic` filter | ⚡ Fast |
| Specific difficulty | Add `difficulty` filter | ⚡ Fast |
| Broad keyword search | Remove filters | ⚠️ Slower |
| Multiple filters | Combine filters | ⚡ Fast |

---

## 🔧 Troubleshooting

### RAG not initialized?
```bash
# Check health
curl http://localhost:3001/api/rag/health

# Verify data files exist
ls data/training-dataset.csv
ls data/important_topics_3rd_year.csv
```

### No results found?
- Try simpler keywords
- Remove topic/year filters
- Check available topics: `curl http://localhost:3001/api/rag/topics`

### Slow responses?
- Reduce `topK` from 10 to 5
- Add more specific filters
- Install `sentence-transformers` for faster embeddings

---

## 📚 Available Topics (Sample)

- Data Analytics
- Artificial Intelligence
- Computer Networks
- Database Management System
- Data Structures
- Operating Systems
- Cryptography
- Web Technologies
- And 140+ more...

---

## ✅ RAG Benefits

| Feature | Before RAG | With RAG |
|---------|-----------|----------|
| Context awareness | ❌ No | ✅ Yes |
| Example-based | ❌ No | ✅ Yes |
| Format consistency | ⚠️ Maybe | ✅ Guaranteed |
| Topic relevance | ⚠️ Medium | ✅ High |
| Difficulty matching | ❌ No | ✅ Yes |
| Quality | ⚠️ Variable | ✅ Consistent |

---

## 🚀 Next Steps

1. **Start Backend**
   ```bash
   cd "ai projeect/backend"
   node server.js
   ```

2. **Test RAG Endpoints**
   ```bash
   curl http://localhost:3001/api/rag/health
   ```

3. **Generate Questions**
   ```bash
   curl -X POST http://localhost:3001/api/rag/generate-question \
     -H "Content-Type: application/json" \
     -d '{"query":"your topic here"}'
   ```

4. **Integrate in Frontend**
   - Use `/api/rag/generate-question` for smart question generation
   - Use `/api/rag/retrieve-context` for showing similar questions
   - Use `/api/rag/topics` to populate topic dropdowns

---

## 📖 Full Documentation

See `RAG_SETUP_GUIDE.md` for detailed API documentation, configuration options, and advanced usage.

---

**Status**: ✅ Ready to Use
**Last Updated**: 2026-07-10
**RAG Version**: 1.0
