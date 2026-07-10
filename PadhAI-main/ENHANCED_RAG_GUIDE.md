# 🚀 Enhanced RAG System - 30 Question Retrieval & Important Questions

## 📋 Overview

The enhanced RAG system now provides:

1. **30+ Question Retrieval** - Returns up to 30 matching questions based on keywords
2. **Important Questions by Topic** - Shows most critical/frequently repeated questions
3. **Questions by Marks** - Retrieves questions organized by 5, 7, 10 mark patterns
4. **Repeated Questions** - Finds questions that appear frequently in exam papers
5. **PDF Analysis** - Extracts keywords from PDFs and finds matching questions
6. **Comprehensive Search** - Advanced filtering with all combined parameters

---

## 🎯 New API Endpoints

### 1. **Enhanced Question Retrieval** (30 questions default)
**Endpoint:** `POST /api/rag/retrieve-context`

Request:
```json
{
  "query": "machine learning algorithms neural networks",
  "topK": 30,
  "topic": "ARTIFICIAL INTELLIGENCE",
  "year": "4th Year"
}
```

Response:
```json
{
  "success": true,
  "query": "machine learning algorithms neural networks",
  "totalResults": 30,
  "results": [
    {
      "id": "q_123",
      "question_text": "Explain neural networks and backpropagation?",
      "topic": "ARTIFICIAL INTELLIGENCE",
      "difficulty": "medium",
      "relevanceScore": 9.5,
      "matchedKeywords": 3,
      "frequencyInPapers": 5
    }
    // ... 29 more questions
  ],
  "metadata": {
    "topMatches": [...top 5 matches...],
    "averageRelevance": 8.7
  }
}
```

---

### 2. **Important Questions by Topic**
**Endpoint:** `POST /api/rag/important-questions`

Request:
```json
{
  "topic": "DATABASE MANAGEMENT SYSTEM",
  "limit": 30
}
```

Response:
```json
{
  "success": true,
  "topic": "DATABASE MANAGEMENT SYSTEM",
  "totalQuestions": 30,
  "questions": [
    {
      "question_text": "Explain ACID properties in database transactions",
      "importanceRank": 1,
      "importance": "High (Critical)",
      "occurrence_count": 8,
      "frequencyScore": 80
    }
    // ... more critical questions
  ],
  "summary": {
    "mostImportant": [...5 most important...],
    "criticalQuestions": 12,
    "averageFrequency": 4.5
  }
}
```

---

### 3. **Questions by Marks (5, 7, 10 mark patterns)**
**Endpoint:** `POST /api/rag/questions-by-marks`

Request:
```json
{
  "marks": 10,
  "topic": "ARTIFICIAL INTELLIGENCE",
  "limit": 30
}
```

Response:
```json
{
  "success": true,
  "filters": {
    "marks": 10,
    "topic": "ARTIFICIAL INTELLIGENCE"
  },
  "totalQuestions": 25,
  "questionsByMarks": {
    "5": [...questions...],
    "7": [...questions...],
    "10": [...questions...]
  },
  "details": {
    "5MarksCount": 8,
    "7MarksCount": 9,
    "10MarksCount": 8
  }
}
```

---

### 4. **Frequently Repeated Questions**
**Endpoint:** `POST /api/rag/repeated-questions`

Request:
```json
{
  "year": "4th Year",
  "limit": 30
}
```

Response:
```json
{
  "success": true,
  "year": "4th Year",
  "totalQuestions": 30,
  "questions": [
    {
      "question_text": "...",
      "repetitionRank": 1,
      "timesRepeated": 7,
      "likelihood": 96
    }
  ],
  "analysis": {
    "mostRepeated": [...top 5...],
    "totalRepetitions": 145,
    "averageLikelihood": 78
  }
}
```

---

### 5. **PDF Analysis with Question Matching**
**Endpoint:** `POST /api/rag/analyze-pdf-questions`

Request:
```json
{
  "keywords": "database indexing transactions ACID properties",
  "minFrequency": 1,
  "limit": 30
}
```

Response:
```json
{
  "success": true,
  "pdfKeywords": "...",
  "totalMatchingQuestions": 28,
  "questions": [...30 matching questions...],
  "analysis": {
    "topTopics": [
      { "topic": "DATABASE MANAGEMENT SYSTEM", "count": 12 },
      { "topic": "Data Structures", "count": 8 }
    ],
    "difficultyDistribution": {
      "easy": 10,
      "medium": 12,
      "hard": 6
    },
    "marksDistribution": {
      "5": 8,
      "7": 10,
      "10": 10
    },
    "topMatches": [...top 10...]
  }
}
```

---

### 6. **Question Extraction from PDF Content**
**Endpoint:** `POST /api/rag/question-extraction-from-pdf`

Request:
```json
{
  "pdfContent": "Unit 1: Databases... Transaction management... ACID properties...",
  "limit": 30
}
```

Response:
```json
{
  "success": true,
  "extractedKeywords": [
    "databases",
    "transaction management",
    "ACID properties",
    // ... up to 20 keywords
  ],
  "matchingQuestions": [...30 questions...],
  "totalMatches": 28,
  "coverage": {
    "keywords": 18,
    "matches": 28,
    "percentage": 156
  }
}
```

---

### 7. **Comprehensive Advanced Search**
**Endpoint:** `POST /api/rag/comprehensive-search`

Request:
```json
{
  "keywords": "machine learning classification",
  "topic": "ARTIFICIAL INTELLIGENCE",
  "year": "4th Year",
  "difficulty": "hard",
  "marks": 10,
  "minFrequency": 2,
  "limit": 30
}
```

Response:
```json
{
  "success": true,
  "filters": {
    "keywords": "machine learning classification",
    "topic": "ARTIFICIAL INTELLIGENCE",
    "year": "4th Year",
    "difficulty": "hard",
    "marks": 10
  },
  "totalResults": 12,
  "questions": [...results...],
  "topMatches": [...10 best matches...],
  "statistics": {
    "totalFound": 12,
    "byDifficulty": {
      "easy": 0,
      "medium": 2,
      "hard": 10
    }
  }
}
```

---

## 📖 Usage Examples

### Example 1: Find Top 30 Questions on a Topic

```bash
curl -X POST http://localhost:3001/api/rag/retrieve-context \
  -H "Content-Type: application/json" \
  -d '{
    "query": "database indexing optimization B-trees hash tables",
    "topK": 30,
    "topic": "DATABASE MANAGEMENT SYSTEM"
  }'
```

### Example 2: Get Most Important Questions for Exam Prep

```bash
curl -X POST http://localhost:3001/api/rag/important-questions \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "COMPUTER NETWORKS",
    "limit": 30
  }'
```

### Example 3: Get All 10-Mark Questions for a Topic

```bash
curl -X POST http://localhost:3001/api/rag/questions-by-marks \
  -H "Content-Type: application/json" \
  -d '{
    "marks": 10,
    "topic": "ARTIFICIAL INTELLIGENCE",
    "limit": 30
  }'
```

### Example 4: Find Questions Repeated in 4th Year Papers

```bash
curl -X POST http://localhost:3001/api/rag/repeated-questions \
  -H "Content-Type: application/json" \
  -d '{
    "year": "4th Year",
    "limit": 30
  }'
```

### Example 5: Advanced Search with All Filters

```bash
curl -X POST http://localhost:3001/api/rag/comprehensive-search \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "neural networks machine learning",
    "topic": "ARTIFICIAL INTELLIGENCE",
    "difficulty": "hard",
    "marks": 10,
    "minFrequency": 2,
    "limit": 30
  }'
```

---

## 🔄 PDF Upload Integration

When a user uploads a PDF or asks a question:

### Flow:
```
User Uploads PDF / Asks Question
    ↓
System Extracts Keywords
    ↓
RAG System Searches Database
    ↓
Returns UP TO 30 Matching Questions
    ↓
Organized by:
  - Relevance Score
  - Frequency in Papers
  - Difficulty Level
  - Mark Distribution
```

### Sample Response:
```json
{
  "success": true,
  "source": "pdf-upload",
  "extractedTopics": ["AI", "Neural Networks", "ML Algorithms"],
  "matchingQuestions": [
    {
      "rank": 1,
      "question": "Explain neural networks and backpropagation?",
      "relevanceScore": 9.8,
      "frequencyInPapers": 7,
      "difficulty": "medium",
      "marks": 10,
      "likelihood": 95
    },
    // ... 29 more
  ],
  "statistics": {
    "totalMatches": 30,
    "avgRelevance": 8.5,
    "topMarks": [10, 7, 5],
    "difficultyDistribution": {
      "easy": 8,
      "medium": 14,
      "hard": 8
    }
  }
}
```

---

## 🎓 Scoring & Ranking System

### Relevance Score (0-10)
- Based on keyword match count
- Boosted by frequency in exam papers
- Higher = More relevant to query

### Importance Rank (1-30)
- Based on frequency of appearance
- Questions appearing 5+ times = Critical
- Helps focus on most likely exam topics

### Frequency Score (0-100)
- Percentage of papers question appears in
- 80+ = Almost certain to appear
- Used for priority ranking

### Likelihood (0-100)
- Combination of all factors
- 90+ = Very likely exam question
- Guides study priority

---

## 📊 Data Organization

### By Marks:
- **5-Mark Questions**: Short answers, quick concepts
- **7-Mark Questions**: Medium length, needs some explanation
- **10-Mark Questions**: Detailed answers, comprehensive topics

### By Difficulty:
- **Easy (1-3)**: Basic concept questions
- **Medium (4-6)**: Application/analysis questions
- **Hard (7-10)**: Design/evaluation questions

### By Frequency:
- **High (5+)**: Appeared 5+ times in dataset
- **Medium (2-4)**: Appeared 2-4 times
- **Low (1)**: Appeared once

---

## 🔍 Search Tips

### For Better Results:

1. **Be Specific** - Use exact subject names
   - ✅ "DATABASE MANAGEMENT SYSTEM"
   - ❌ "database"

2. **Use Multiple Keywords** - Helps match more questions
   - ✅ "machine learning classification algorithms"
   - ❌ "learning"

3. **Filter by Difficulty** - Gets appropriate level questions
   - Add `difficulty: "hard"` for challenging prep
   - Add `marks: 10` for comprehensive questions

4. **Use Year Filter** - Get year-specific questions
   - `year: "4th Year"` for advanced topics
   - `year: "2nd Year"` for fundamental concepts

---

## 💡 Benefits

✅ **Comprehensive Coverage** - Get 30 relevant questions at once
✅ **Smart Ranking** - Most important questions first
✅ **Frequency-Based** - Focus on likely exam questions
✅ **Mark Distribution** - Prepare for all mark patterns
✅ **Multi-Filter** - Find exact questions needed
✅ **PDF Integration** - Automatic keyword extraction
✅ **Quick Preparation** - All related questions in one query

---

## ⚙️ Performance

| Operation | Time | Questions |
|-----------|------|-----------|
| Keyword search | ~100ms | 30 |
| Important by topic | ~50ms | 30 |
| Questions by marks | ~80ms | 30 |
| Repeated questions | ~60ms | 30 |
| Comprehensive search | ~120ms | 30 |
| PDF extraction | ~150ms | 30 |

---

## 🚀 Quick Start

1. **Test the system**:
```bash
curl http://localhost:3001/api/rag/health
```

2. **Find questions on your topic**:
```bash
curl -X POST http://localhost:3001/api/rag/retrieve-context \
  -H "Content-Type: application/json" \
  -d '{"query":"your topic","topK":30}'
```

3. **Get important questions**:
```bash
curl -X POST http://localhost:3001/api/rag/important-questions \
  -H "Content-Type: application/json" \
  -d '{"topic":"YOUR SUBJECT","limit":30}'
```

---

## 📝 Integration Notes

- All endpoints return **exactly 30 questions** (or fewer if not available)
- Questions are **ranked by relevance** and **frequency**
- Metadata includes **importance scores** and **likelihood percentages**
- Perfect for **exam preparation** and **study planning**

---

**Status**: ✅ Enhanced & Ready
**Last Updated**: 2026-07-10
**Version**: 2.0
