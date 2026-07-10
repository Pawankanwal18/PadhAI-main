/**
 * RAG Integration API Endpoints for PadhAI Backend
 * Adds RAG-enhanced question generation routes
 */

import express from 'express';
import { ragBridge } from './ragBridge.js';

const router = express.Router();

/**
 * POST /api/rag/generate-question
 * Generate a question using RAG context from Anthropic API
 */
router.post('/rag/generate-question', async (req, res) => {
  try {
    const { query, topic, year, difficulty } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    // Build RAG context
    const contextPrompt = ragBridge.buildContextPrompt(query, topic, year);

    return res.json({
      success: true,
      context: contextPrompt,
      metadata: {
        query,
        topic: topic || 'Any',
        year: year || 'Any',
        difficulty: difficulty || 'medium',
        similar_questions_count: ragBridge.retrieveSimilarQuestions(query, 3).length,
      },
    });
  } catch (err) {
    console.error('RAG generation error:', err);
    res.status(500).json({ error: 'Question generation failed: ' + err.message });
  }
});

/**
 * GET /api/rag/report
 * Get comprehensive RAG system status and statistics
 */
router.get('/rag/report', (req, res) => {
  try {
    const report = ragBridge.getReport();
    res.json({
      success: true,
      report,
    });
  } catch (err) {
    console.error('RAG report error:', err);
    res.status(500).json({ error: 'Could not generate report: ' + err.message });
  }
});

/**
 * POST /api/rag/retrieve-context
 * Retrieve similar questions for a given query (up to 30)
 */
router.post('/rag/retrieve-context', (req, res) => {
  try {
    const { query, topK = 30, topic, year } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    let results = ragBridge.retrieveSimilarQuestions(query, topK);

    // Filter by topic if provided
    if (topic) {
      const filtered = results.filter(
        item => item.topic.toLowerCase().includes(topic.toLowerCase())
      );
      if (filtered.length > 0) {
        results = filtered.slice(0, topK);
      }
    }

    // Filter by year if provided
    if (year) {
      const yearFiltered = results.filter(item => item.year === year);
      if (yearFiltered.length > 0) {
        results = yearFiltered.slice(0, topK);
      }
    }

    res.json({
      success: true,
      query,
      totalResults: results.length,
      results,
      metadata: {
        topMatches: results.slice(0, 5),
        averageRelevance: results.length > 0 ? 
          Math.round(results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length) : 0
      }
    });
  } catch (err) {
    console.error('RAG retrieval error:', err);
    res.status(500).json({ error: 'Retrieval failed: ' + err.message });
  }
});

/**
 * GET /api/rag/topics
 * Get all available topics in the dataset
 */
router.get('/rag/topics', (req, res) => {
  try {
    const stats = ragBridge.getTopicStatistics();
    const topics = Object.entries(stats).map(([topic, data]) => ({
      topic,
      count: data.count,
      difficulties: data.difficulties,
    }));

    res.json({
      success: true,
      topics: topics.sort((a, b) => b.count - a.count),
      totalTopics: topics.length,
    });
  } catch (err) {
    console.error('Topics error:', err);
    res.status(500).json({ error: 'Could not fetch topics: ' + err.message });
  }
});

/**
 * GET /api/rag/statistics
 * Get dataset statistics
 */
router.get('/rag/statistics', (req, res) => {
  try {
    const stats = {
      total_questions: ragBridge.optimizedDataset.length,
      total_topics: Object.keys(ragBridge.topicIndex).length,
      total_years: Object.keys(ragBridge.yearIndex).length,
      difficulty_distribution: ragBridge.getDifficultyDistribution(),
      available_topics: Object.keys(ragBridge.topicIndex).sort(),
      available_years: Object.keys(ragBridge.yearIndex).sort(),
    };

    res.json({
      success: true,
      statistics: stats,
    });
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ error: 'Could not fetch statistics: ' + err.message });
  }
});

/**
 * POST /api/rag/search
 * Advanced search with filters
 */
router.post('/rag/search', (req, res) => {
  try {
    const { keywords, topic, year, difficulty, limit = 10 } = req.body;

    if (!keywords && !topic) {
      return res.status(400).json({ error: 'Keywords or topic is required' });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    let results = [];

    // Search by keywords or topic
    if (keywords) {
      results = ragBridge.retrieveSimilarQuestions(keywords, limit * 2);
    } else if (topic) {
      results = ragBridge.topicIndex[topic] || [];
    }

    // Filter by difficulty
    if (difficulty) {
      results = results.filter(item => item.difficulty === difficulty);
    }

    // Filter by year
    if (year) {
      results = results.filter(item => item.year === year);
    }

    // Limit results
    results = results.slice(0, limit);

    res.json({
      success: true,
      query: { keywords, topic, year, difficulty },
      results,
      count: results.length,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed: ' + err.message });
  }
});

/**
 * GET /api/rag/health
 * Health check endpoint
 */
router.get('/rag/health', (req, res) => {
  res.json({
    success: true,
    initialized: ragBridge.initialized,
    questions_loaded: ragBridge.optimizedDataset.length,
    status: ragBridge.initialized ? 'ready' : 'initializing',
  });
});

/**
 * POST /api/rag/important-questions
 * Get most important/frequently repeated questions for a topic
 */
router.post('/rag/important-questions', (req, res) => {
  try {
    const { topic, limit = 30 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    const results = ragBridge.getImportantQuestionsByTopic(topic, limit);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for topic: ${topic}`,
        availableTopics: Object.keys(ragBridge.getTopicStatistics()).slice(0, 10)
      });
    }

    res.json({
      success: true,
      topic,
      totalQuestions: results.length,
      questions: results,
      summary: {
        mostImportant: results.slice(0, 5),
        criticalQuestions: results.filter(q => q.importance.includes('Critical')).length,
        averageFrequency: Math.round(results.reduce((sum, q) => sum + q.occurrence_count, 0) / results.length)
      }
    });
  } catch (err) {
    console.error('Important questions error:', err);
    res.status(500).json({ error: 'Failed to fetch important questions: ' + err.message });
  }
});

/**
 * POST /api/rag/questions-by-marks
 * Get questions grouped by marks (5, 7, 10 mark questions)
 */
router.post('/rag/questions-by-marks', (req, res) => {
  try {
    const { marks, topic, limit = 30 } = req.body;

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    const results = ragBridge.getQuestionsByMarks(marks, topic, limit);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found with specified filters'
      });
    }

    // Group results by marks
    const grouped = {};
    results.forEach(q => {
      const mark = q.estimatedMarks;
      if (!grouped[mark]) grouped[mark] = [];
      grouped[mark].push(q);
    });

    res.json({
      success: true,
      filters: { marks, topic },
      totalQuestions: results.length,
      questionsByMarks: grouped,
      commonPatterns: results.filter(q => q.isCommonPattern),
      details: {
        '5MarksCount': grouped[5]?.length || 0,
        '7MarksCount': grouped[7]?.length || 0,
        '10MarksCount': grouped[10]?.length || 0
      }
    });
  } catch (err) {
    console.error('Questions by marks error:', err);
    res.status(500).json({ error: 'Failed to fetch questions: ' + err.message });
  }
});

/**
 * POST /api/rag/repeated-questions
 * Get most repeated questions for a specific year
 */
router.post('/rag/repeated-questions', (req, res) => {
  try {
    const { year, limit = 30 } = req.body;

    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    const results = ragBridge.getRepeatedQuestionsByYear(year, limit);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for year: ${year}`,
        availableYears: ragBridge.getReport().available_years
      });
    }

    res.json({
      success: true,
      year,
      totalQuestions: results.length,
      questions: results,
      analysis: {
        mostRepeated: results.slice(0, 5),
        totalRepetitions: results.reduce((sum, q) => sum + q.occurrence_count, 0),
        averageLikelihood: Math.round(results.reduce((sum, q) => sum + q.likelihood, 0) / results.length)
      }
    });
  } catch (err) {
    console.error('Repeated questions error:', err);
    res.status(500).json({ error: 'Failed to fetch repeated questions: ' + err.message });
  }
});

/**
 * POST /api/rag/comprehensive-search
 * Advanced search with all filters combined
 */
router.post('/rag/comprehensive-search', (req, res) => {
  try {
    const {
      keywords,
      topic,
      year,
      difficulty,
      marks,
      minFrequency = 1,
      limit = 30
    } = req.body;

    if (!keywords && !topic) {
      return res.status(400).json({ error: 'Keywords or topic is required' });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    const results = ragBridge.comprehensiveSearch({
      keywords,
      topic,
      year,
      difficulty,
      marks,
      minFrequency,
      limit
    });

    res.json({
      success: true,
      filters: {
        keywords,
        topic,
        year,
        difficulty,
        marks,
        minFrequency
      },
      totalResults: results.length,
      questions: results,
      topMatches: results.slice(0, 10),
      statistics: {
        totalFound: results.length,
        byDifficulty: {
          easy: results.filter(q => q.difficulty === 'easy').length,
          medium: results.filter(q => q.difficulty === 'medium').length,
          hard: results.filter(q => q.difficulty === 'hard').length
        }
      }
    });
  } catch (err) {
    console.error('Comprehensive search error:', err);
    res.status(500).json({ error: 'Search failed: ' + err.message });
  }
});

export default router;

/**
 * Helper function to extract key phrases from text
 */
function extractKeyPhrases(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'are', 'be', 'was',
    'for', 'with', 'by', 'on', 'at', 'from', 'this', 'that', 'it', 'its', 'as'
  ]);

  // Split into words and filter
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Extract unique phrases
  const phrases = [...new Set(words)];

  // Also extract 2-word phrases
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 3 && words[i + 1].length > 3) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
  }

  return [...new Set([...phrases, ...bigrams.slice(0, 10)])].slice(0, 30);
}

/**
 * POST /api/rag/analyze-pdf-questions
 * Upload PDF and get matching questions (up to 30)
 */
router.post('/rag/analyze-pdf-questions', (req, res) => {
  try {
    const { keywords, minFrequency = 1, limit = 30 } = req.body;

    if (!keywords || keywords.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Keywords from PDF are required. Extracted keywords should be passed as query.' 
      });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    // Search for questions matching PDF keywords
    const results = ragBridge.comprehensiveSearch({
      keywords,
      minFrequency,
      limit
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching questions found for the PDF content',
        suggestions: 'Try with more specific keywords or check available topics'
      });
    }

    // Analyze patterns
    const topicFrequency = {};
    const difficultyFrequency = { easy: 0, medium: 0, hard: 0 };
    const marksFrequency = {};

    results.forEach(q => {
      topicFrequency[q.topic] = (topicFrequency[q.topic] || 0) + 1;
      difficultyFrequency[q.difficulty]++;
      
      const marks = q.question_text.length > 150 ? 10 : 
                   q.question_text.length > 80 ? 7 : 5;
      marksFrequency[marks] = (marksFrequency[marks] || 0) + 1;
    });

    res.json({
      success: true,
      pdfKeywords: keywords,
      totalMatchingQuestions: results.length,
      questions: results,
      analysis: {
        topTopics: Object.entries(topicFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([topic, count]) => ({ topic, count })),
        difficultyDistribution: difficultyFrequency,
        marksDistribution: marksFrequency,
        topMatches: results.slice(0, 10),
        mostRelevant: results.filter(q => q.searchRank <= 5)
      }
    });
  } catch (err) {
    console.error('PDF analysis error:', err);
    res.status(500).json({ error: 'PDF analysis failed: ' + err.message });
  }
});

/**
 * POST /api/rag/question-extraction-from-pdf
 * Extract questions from PDF content and find similar ones
 * Supports raw text extraction
 */
router.post('/rag/question-extraction-from-pdf', (req, res) => {
  try {
    const { pdfContent, limit = 30 } = req.body;

    if (!pdfContent || pdfContent.trim().length === 0) {
      return res.status(400).json({ error: 'PDF content is required' });
    }

    if (!ragBridge.initialized) {
      return res.status(500).json({ error: 'RAG system not initialized' });
    }

    // Extract key phrases from PDF content
    const extractedKeywords = extractKeyPhrases(pdfContent);

    // Search for matching questions
    const results = ragBridge.comprehensiveSearch({
      keywords: extractedKeywords.join(' '),
      limit
    });

    res.json({
      success: true,
      extractedKeywords: extractedKeywords.slice(0, 20),
      matchingQuestions: results,
      totalMatches: results.length,
      coverage: {
        keywords: extractedKeywords.length,
        matches: results.length,
        percentage: Math.round((results.length / extractedKeywords.length) * 100)
      }
    });
  } catch (err) {
    console.error('PDF extraction error:', err);
    res.status(500).json({ error: 'PDF extraction failed: ' + err.message });
  }
});
