# 🚀 PadhAI RAG System Setup & Usage Guide

## Overview

The RAG (Retrieval-Augmented Generation) system enhances PadhAI's question generation by:
1. **Optimizing the dataset** - Removing duplicates, normalizing text, categorizing by difficulty
2. **Creating embeddings** - Generating semantic representations of questions and topics
3. **Intelligent retrieval** - Finding similar questions based on user queries
4. **Context injection** - Providing Anthropic API with relevant examples for better question generation

---

## 🔧 Installation & Setup

### Step 1: Install Python Dependencies (Optional but Recommended)

For embeddings support, install sentence-transformers:

```bash
pip install sentence-transformers scikit-learn numpy
```

If not installed, the system will fall back to keyword-based retrieval.

### Step 2: Node.js Backend Integration

The RAG system is automatically initialized when the backend starts:

```bash
cd "ai projeect/backend"
node server.js
```

You'll see:
```
✅ PadhAI Backend running on http://localhost:3001
   📚 RAG System: Ready
```

### Step 3: Initialize RAG Dataset (Optional Python Setup)

To generate optimized dataset and embeddings separately:

```bash
cd c:\Users\pawan\OneDrive\Desktop\PadhAI-main
python rag_system.py
```

This creates:
- `data/optimized_dataset.json` - Cleaned, enriched dataset
- `data/embeddings_cache.pkl` - Semantic embeddings (if sentence-transformers installed)

---

## 📊 RAG API Endpoints

### 1. Generate Question with RAG Context

**Endpoint:** `POST /api/rag/generate-question`

Request:
```json
{
  "query": "artificial intelligence machine learning algorithms",
  "topic": "ARTIFICIAL INTELLIGENCE",
  "year": "4th Year",
  "difficulty": "medium"
}
```

Response:
```json
{
  "success": true,
  "context": "You are an expert exam question generator...\n\nSimilar Questions in Dataset:\n1. Topic: ARTIFICIAL INTELLIGENCE\n   Question: Explain the concept of machine learning?",
  "metadata": {
    "query": "artificial intelligence machine learning algorithms",
    "topic": "ARTIFICIAL INTELLIGENCE",
    "similar_questions_count": 3
  }
}
```

### 2. Retrieve Similar Questions

**Endpoint:** `POST /api/rag/retrieve-context`

Request:
```json
{
  "query": "database indexing optimization",
  "topK": 5,
  "topic": "DATABASE MANAGEMENT SYSTEM",
  "year": "3rd Year"
}
```

Response:
```json
{
  "success": true,
  "query": "database indexing optimization",
  "results": [
    {
      "id": "q_123",
      "year": "3rd Year",
      "topic": "Database Management System",
      "normalized_question": "explain database indexing",
      "question_text": "Explain database indexing and its importance?",
      "difficulty": "medium"
    }
  ],
  "count": 1
}
```

### 3. Get RAG System Report

**Endpoint:** `GET /api/rag/report`

Response:
```json
{
  "success": true,
  "report": {
    "initialized": true,
    "total_questions": 1245,
    "total_topics": 45,
    "total_years": 4,
    "difficulty_distribution": {
      "easy": 312,
      "medium": 654,
      "hard": 279
    },
    "available_topics": [
      "Artificial Intelligence",
      "Database Management System",
      "Computer Networks",
      ...
    ],
    "available_years": ["1st Year", "2nd Year", "3rd Year", "4th Year"]
  }
}
```

### 4. Get All Topics with Statistics

**Endpoint:** `GET /api/rag/topics`

Response:
```json
{
  "success": true,
  "topics": [
    {
      "topic": "Data Analytics",
      "count": 156,
      "difficulties": {
        "easy": 45,
        "medium": 78,
        "hard": 33
      }
    }
  ],
  "totalTopics": 45
}
```

### 5. Advanced Search

**Endpoint:** `POST /api/rag/search`

Request:
```json
{
  "keywords": "machine learning classification",
  "topic": "ARTIFICIAL INTELLIGENCE",
  "year": "4th Year",
  "difficulty": "hard",
  "limit": 10
}
```

Response:
```json
{
  "success": true,
  "query": {
    "keywords": "machine learning classification",
    "topic": "ARTIFICIAL INTELLIGENCE",
    "difficulty": "hard"
  },
  "results": [...],
  "count": 3
}
```

### 6. Dataset Statistics

**Endpoint:** `GET /api/rag/statistics`

Response:
```json
{
  "success": true,
  "statistics": {
    "total_questions": 1245,
    "total_topics": 45,
    "total_years": 4,
    "difficulty_distribution": {
      "easy": 312,
      "medium": 654,
      "hard": 279
    }
  }
}
```

### 7. Health Check

**Endpoint:** `GET /api/rag/health`

Response:
```json
{
  "success": true,
  "initialized": true,
  "questions_loaded": 1245,
  "status": "ready"
}
```

---

## 💡 Usage Examples

### Example 1: Generate Question for Specific Topic

```bash
curl -X POST http://localhost:3001/api/rag/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain the OSI model layers",
    "topic": "COMPUTER NETWORKS",
    "year": "3rd Year",
    "difficulty": "medium"
  }'
```

### Example 2: Find Questions Similar to User Query

```bash
curl -X POST http://localhost:3001/api/rag/retrieve-context \
  -H "Content-Type: application/json" \
  -d '{
    "query": "binary search trees balanced trees",
    "topK": 10,
    "topic": "DATA STRUCTURES"
  }'
```

### Example 3: Search with Multiple Filters

```bash
curl -X POST http://localhost:3001/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "socket programming network programming",
    "topic": "COMPUTER NETWORKS",
    "year": "4th Year",
    "difficulty": "hard",
    "limit": 15
  }'
```

---

## 🎯 How RAG Improves Question Generation

### Before RAG:
- Anthropic API generates questions based solely on user query
- No dataset context or examples
- Questions may not match exam format/style

### With RAG:
1. **Context Retrieval**: Finds similar questions from training dataset
2. **Example Injection**: Provides Anthropic with real exam questions as examples
3. **Style Matching**: Generated questions follow same format/difficulty as dataset
4. **Better Accuracy**: Questions are more relevant to user's topic and level

### Generated Prompt Example:
```
You are an expert exam question generator...

CONTEXT FROM KNOWLEDGE BASE:

Similar Questions in Dataset:
1. Topic: Computer Networks
   Year: 4th Year
   Question: Explain the TCP/IP model and its layers?
   Difficulty: medium

2. Topic: Computer Networks
   Year: 3rd Year
   Question: Compare and contrast the OSI model with TCP/IP model.
   Difficulty: hard

USER REQUEST:
Generate a question about network protocols

GENERATE: A high-quality exam question following the patterns and style 
of similar questions in the dataset above.
```

---

## 📈 Dataset Optimization Features

### 1. Duplicate Removal
- Identifies and removes identical/near-duplicate questions
- Preserves occurrence count for importance weighting

### 2. Text Normalization
- Lowercase conversion
- Whitespace standardization
- Special character handling

### 3. Difficulty Classification
- **Easy**: Questions < 50 characters
- **Medium**: Questions 50-150 characters
- **Hard**: Questions > 150 characters

### 4. Metadata Enrichment
- Question ID generation
- Topic mapping
- Year/semester association
- Source file tracking
- Occurrence count preservation

### 5. Topic Statistics
```json
{
  "Data Analytics": {
    "count": 156,
    "difficulties": {
      "easy": 45,
      "medium": 78,
      "hard": 33
    }
  }
}
```

---

## ⚙️ Configuration & Customization

### Adjust Difficulty Threshold

Edit `ragBridge.js`:
```javascript
// Change these values to adjust difficulty classification
const difficultyThreshold = {
  easy: 50,      // characters
  medium: 150,   // characters
  hard: 300      // characters
};
```

### Change Retrieval Count

In API requests, adjust `topK` parameter:
```json
{
  "query": "...",
  "topK": 10  // Retrieve top 10 similar questions
}
```

### Customize Context Prompt

Edit `ragBridge.buildContextPrompt()` method to modify the context structure provided to Anthropic API.

---

## 🔍 Monitoring & Diagnostics

### Check RAG Status:
```bash
curl http://localhost:3001/api/rag/health
```

### View System Report:
```bash
curl http://localhost:3001/api/rag/report
```

### List Available Topics:
```bash
curl http://localhost:3001/api/rag/topics
```

### Get Dataset Statistics:
```bash
curl http://localhost:3001/api/rag/statistics
```

---

## 🚀 Performance Tips

1. **Use Specific Topics**: Provide topic parameter for faster, more relevant results
2. **Limit Top-K**: Start with `topK=5`, increase if needed (default: 5)
3. **Cache Embeddings**: System automatically caches embeddings for faster retrieval
4. **Optimize Queries**: Use clear, specific keywords for better matching

---

## ❌ Troubleshooting

### RAG System Not Initialized
```
❌ RAG system not initialized
```
**Solution**: Check that dataset files exist in `data/` folder

### No Similar Questions Found
```
"count": 0
```
**Solution**: Try broader keywords or remove topic filter

### Slow Retrieval
**Solution**: 
- Ensure sentence-transformers is installed for embedding-based search
- Reduce `topK` parameter
- Use more specific keywords

### API Timeout
**Solution**: Check backend is running and accessible
```bash
curl http://localhost:3001/api/rag/health
```

---

## 📝 Integration with Frontend

### React Hook Example:

```javascript
import { useState } from 'react';

function QuestionGenerator() {
  const [question, setQuestion] = useState(null);
  
  const generateQuestion = async () => {
    const response = await fetch('http://localhost:3001/api/rag/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'machine learning algorithms',
        topic: 'ARTIFICIAL INTELLIGENCE',
        difficulty: 'medium'
      })
    });
    
    const data = await response.json();
    setQuestion(data);
  };
  
  return (
    <>
      <button onClick={generateQuestion}>Generate Question</button>
      {question && <pre>{JSON.stringify(question, null, 2)}</pre>}
    </>
  );
}
```

---

## 📚 Files Structure

```
PadhAI-main/
├── rag_system.py                 # Python RAG system implementation
├── data/
│   ├── training-dataset.csv     # Source questions
│   ├── important_topics_3rd_year.csv
│   ├── optimized_dataset.json   # Generated (optional)
│   └── embeddings_cache.pkl     # Generated (optional)
├── ai projeect/backend/
│   ├── ragBridge.js             # Node.js RAG integration
│   ├── ragRoutes.js             # RAG API endpoints
│   └── server.js                # Updated with RAG
```

---

## 🎓 Next Steps

1. ✅ Backend running with RAG initialized
2. 📊 Start using RAG endpoints to enhance question generation
3. 🎨 Integrate RAG context into frontend UI
4. 🔧 Fine-tune retrieval parameters based on results
5. 📈 Monitor usage statistics and optimize

---

## 📞 Support

For issues or questions:
1. Check `data/` folder for dataset files
2. Run health check: `GET /api/rag/health`
3. View system report: `GET /api/rag/report`
4. Check console logs for initialization messages

---

**Last Updated**: 2026-07-10
**RAG System Version**: 1.0
**Status**: ✅ Active & Ready
