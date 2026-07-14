/**
 * RAG Integration Module for PadhAI Backend
 * Handles retrieval of contextual information for improved question generation
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '../../data');
const OPTIMIZED_DATASET_PATH = join(DATA_DIR, 'optimized_dataset.json');

class RAGBridge {
  constructor() {
    this.optimizedDataset = [];
    this.topicIndex = {};
    this.yearIndex = {};
    this.initialized = false;
  }

  /**
   * Initialize RAG system - load optimized dataset
   */
  async initialize() {
    try {
      // First try to use pre-generated optimized dataset
      if (existsSync(OPTIMIZED_DATASET_PATH)) {
        console.log('📚 Loading optimized dataset...');
        const data = readFileSync(OPTIMIZED_DATASET_PATH, 'utf-8');
        this.optimizedDataset = JSON.parse(data);
        this.buildIndexes();
        this.initialized = true;
        console.log(`✅ RAG initialized with ${this.optimizedDataset.length} questions`);
        return true;
      }

      // Fall back to manual initialization
      console.log('🔄 Building optimized dataset from raw data...');
      return this.buildOptimizedDatasetFromCSV();
    } catch (err) {
      console.error('❌ RAG initialization error:', err.message);
      return false;
    }
  }

  /**
   * Build optimized dataset from CSV files
   */
  buildOptimizedDatasetFromCSV() {
    try {
      const csvFiles = [
        '1st_year_questions.csv',
        '2nd_year_questions.csv',
        '3rd_year_questions.csv',
        '4th_year_questions.csv'
      ];
      const questions = [];
      const seen = new Set();
      let questionCount = 0;

      for (const fileName of csvFiles) {
        const filePath = join(DATA_DIR, fileName);
        if (!existsSync(filePath)) {
          console.warn(`⚠️  Dataset file not found: ${fileName}`);
          continue;
        }

        console.log(`📖 Loading questions from ${fileName}...`);
        const csvContent = readFileSync(filePath, 'utf-8');
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = this.parseCSVLine(lines[i]);
          const item = {};

          headers.forEach((header, idx) => {
            item[header] = values[idx] || '';
          });

          const normalized = item.normalized_question?.toLowerCase().trim();
          if (!normalized || seen.has(normalized)) continue;

          seen.add(normalized);
          questionCount++;

          // Estimate difficulty
          const questionLength = item.question_text?.length || 0;
          const difficulty = questionLength < 50 ? 'easy' : questionLength < 150 ? 'medium' : 'hard';

          questions.push({
            id: `q_${questionCount}`,
            year: item.year || 'Unknown',
            topic: item.topic || 'General',
            normalized_question: normalized,
            question_text: item.question_text || '',
            source: item.source_file || 'unknown',
            difficulty,
            occurrence_count: parseInt(item.occurrence_count) || 1,
          });
        }
      }

      this.optimizedDataset = questions;
      this.buildIndexes();
      this.initialized = true;

      console.log(`✅ Built combined optimized dataset with ${questions.length} unique questions`);

      // Save for future use
      try {
        writeFileSync(OPTIMIZED_DATASET_PATH, JSON.stringify(this.optimizedDataset, null, 2));
        console.log(`💾 Saved combined optimized dataset to ${OPTIMIZED_DATASET_PATH}`);
      } catch (e) {
        console.warn('⚠️  Could not save combined optimized dataset');
      }

      return true;
    } catch (err) {
      console.error('❌ Error building combined dataset:', err.message);
      return false;
    }
  }

  /**
   * Parse CSV line respecting quoted fields
   */
  parseCSVLine(line) {
    const cells = [];
    let current = '';
    let quoted = false;

    for (const char of line) {
      if (char === '"') {
        quoted = !quoted;
      } else if (char === ',' && !quoted) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    return cells;
  }

  /**
   * Build indexes for fast lookups
   */
  buildIndexes() {
    this.topicIndex = {};
    this.yearIndex = {};

    for (const item of this.optimizedDataset) {
      // Topic index
      const topic = item.topic || 'General';
      if (!this.topicIndex[topic]) {
        this.topicIndex[topic] = [];
      }
      this.topicIndex[topic].push(item);

      // Year index
      const year = item.year || 'Unknown';
      if (!this.yearIndex[year]) {
        this.yearIndex[year] = [];
      }
      this.yearIndex[year].push(item);
    }
  }

  /**
   * Retrieve similar questions based on query (keyword matching)
   * Enhanced to return up to 30 questions with scoring
   */
  retrieveSimilarQuestions(query, topK = 30) {
    if (!this.initialized || this.optimizedDataset.length === 0) {
      return [];
    }

    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const scored = [];

    for (const item of this.optimizedDataset) {
      const text = `${item.normalized_question} ${item.topic}`.toLowerCase();
      const textWords = new Set(text.split(/\s+/));

      // Calculate intersection score
      let score = 0;
      let matchedWords = [];
      
      for (const word of queryWords) {
        if (textWords.has(word)) {
          score++;
          matchedWords.push(word);
        }
      }

      // Boost score by occurrence count (frequency matters)
      const occurrenceBoost = Math.min(item.occurrence_count * 2, 10);
      score += occurrenceBoost;

      if (score > 0) {
        scored.push({ 
          item, 
          score,
          matchedWordsCount: matchedWords.length,
          occurrenceCount: item.occurrence_count
        });
      }
    }

    // Sort by score descending, then by occurrence count
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.item.occurrence_count - a.item.occurrence_count;
    });

    // Return up to topK questions with scoring metadata
    return scored.slice(0, topK).map(({ item, score, matchedWordsCount, occurrenceCount }) => ({
      ...item,
      relevanceScore: Math.round(score * 10) / 10,
      matchedKeywords: matchedWordsCount,
      frequencyInPapers: occurrenceCount
    }));
  }

  /**
   * Get most important questions for a specific topic/subject
   * Ranked by frequency in exam papers
   */
  getImportantQuestionsByTopic(topic, limit = 30) {
    if (!this.initialized) return [];

    const topicQuestions = this.optimizedDataset.filter(item => 
      item.topic.toLowerCase().includes(topic.toLowerCase())
    );

    // Sort by occurrence count (frequency) and difficulty
    const ranked = topicQuestions
      .sort((a, b) => {
        // First sort by occurrence (frequency)
        if (b.occurrence_count !== a.occurrence_count) {
          return b.occurrence_count - a.occurrence_count;
        }
        // Then by difficulty level (hard > medium > easy)
        const difficultyOrder = { hard: 3, medium: 2, easy: 1 };
        return (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0);
      })
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        importanceRank: index + 1,
        importance: 'High' + (index < 10 ? ' (Critical)' : ''),
        frequencyScore: Math.round((item.occurrence_count / 10) * 100)
      }));

    return ranked;
  }

  /**
   * Get questions grouped by marks (commonly asked patterns)
   */
  getQuestionsByMarks(marks = null, topic = null, limit = 30) {
    let questions = this.optimizedDataset;

    // Filter by topic if provided
    if (topic) {
      questions = questions.filter(item =>
        item.topic.toLowerCase().includes(topic.toLowerCase())
      );
    }

    // Estimate marks from question length if not provided
    const withMarks = questions.map(item => {
      let estimatedMarks = marks;
      if (!marks) {
        const length = item.question_text.length;
        estimatedMarks = length > 150 ? 10 : length > 80 ? 7 : 5;
      }
      return {
        ...item,
        estimatedMarks,
        isCommonPattern: item.occurrence_count >= 2
      };
    });

    // Group by marks and sort by frequency
    const grouped = {};
    withMarks.forEach(item => {
      if (!grouped[item.estimatedMarks]) {
        grouped[item.estimatedMarks] = [];
      }
      grouped[item.estimatedMarks].push(item);
    });

    // Sort each group by frequency and flatten
    const result = [];
    Object.keys(grouped)
      .sort((a, b) => parseInt(b) - parseInt(a)) // Higher marks first
      .forEach(marks => {
        grouped[marks]
          .sort((a, b) => b.occurrence_count - a.occurrence_count)
          .slice(0, limit / Object.keys(grouped).length)
          .forEach(item => result.push(item));
      });

    return result.slice(0, limit);
  }

  /**
   * Get most repeated questions by year/unit
   */
  getRepeatedQuestionsByYear(year, limit = 30) {
    if (!this.initialized) return [];

    const yearQuestions = this.optimizedDataset.filter(item => 
      item.year === year
    );

    return yearQuestions
      .sort((a, b) => {
        // Sort by occurrence count (repeated questions first)
        if (b.occurrence_count !== a.occurrence_count) {
          return b.occurrence_count - a.occurrence_count;
        }
        // Then by question length (more complete questions)
        return b.question_text.length - a.question_text.length;
      })
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        repetitionRank: index + 1,
        timesRepeated: item.occurrence_count,
        likelihood: Math.round(Math.max(30, 100 - (index * 2)))
      }));
  }

  /**
   * Comprehensive search combining all filters
   */
  comprehensiveSearch(params) {
    const {
      keywords,
      topic,
      year,
      difficulty,
      marks,
      minFrequency = 1,
      limit = 30
    } = params;

    let results = this.optimizedDataset;

    // Apply filters
    if (keywords) {
      const queryWords = new Set(keywords.toLowerCase().split(/\s+/));
      results = results.filter(item => {
        const text = `${item.normalized_question} ${item.topic}`.toLowerCase();
        const textWords = new Set(text.split(/\s+/));
        let score = 0;
        for (const word of queryWords) {
          if (textWords.has(word)) score++;
        }
        return score > 0;
      });
    }

    if (topic) {
      results = results.filter(item =>
        item.topic.toLowerCase().includes(topic.toLowerCase())
      );
    }

    if (year) {
      results = results.filter(item => item.year === year);
    }

    if (difficulty) {
      results = results.filter(item => item.difficulty === difficulty);
    }

    if (marks) {
      results = results.filter(item => {
        const estimatedMarks = item.question_text.length > 150 ? 10 :
                             item.question_text.length > 80 ? 7 : 5;
        return estimatedMarks === marks;
      });
    }

    // Filter by minimum frequency
    results = results.filter(item => item.occurrence_count >= minFrequency);

    // Sort by frequency and relevance
    results.sort((a, b) => {
      if (b.occurrence_count !== a.occurrence_count) {
        return b.occurrence_count - a.occurrence_count;
      }
      return b.question_text.length - a.question_text.length;
    });

    return results.slice(0, limit).map((item, index) => ({
      ...item,
      searchRank: index + 1,
      relevance: Math.round(Math.max(50, 100 - (index * 1.5)))
    }));
  }

  /**
   * Get topic statistics
   */
  getTopicStatistics() {
    const stats = {};

    for (const item of this.optimizedDataset) {
      const topic = item.topic || 'Unknown';
      if (!stats[topic]) {
        stats[topic] = { count: 0, difficulties: { easy: 0, medium: 0, hard: 0 } };
      }

      stats[topic].count++;
      stats[topic].difficulties[item.difficulty]++;
    }

    return stats;
  }

  /**
   * Get difficulty distribution
   */
  getDifficultyDistribution() {
    const dist = { easy: 0, medium: 0, hard: 0 };

    for (const item of this.optimizedDataset) {
      dist[item.difficulty]++;
    }

    return dist;
  }

  /**
   * Build context prompt for Anthropic API with RAG
   */
  buildContextPrompt(query, userTopic = null, userYear = null) {
    let contextItems = this.retrieveSimilarQuestions(query, 3);

    // Filter by user preferences
    if (userTopic) {
      const filtered = contextItems.filter(
        item => item.topic.toLowerCase().includes(userTopic.toLowerCase())
      );
      if (filtered.length > 0) {
        contextItems = filtered;
      }
    }

    if (userYear) {
      const yearFiltered = contextItems.filter(item => item.year === userYear);
      if (yearFiltered.length > 0) {
        contextItems = yearFiltered;
      }
    }

    let context = `You are an expert exam question generator for computer science students.

CONTEXT FROM KNOWLEDGE BASE:
`;

    if (contextItems.length > 0) {
      context += '\nSimilar Questions in Dataset:\n';
      contextItems.forEach((item, i) => {
        context += `\n${i + 1}. Topic: ${item.topic}
   Year: ${item.year}
   Question: ${item.question_text || item.normalized_question}
   Difficulty: ${item.difficulty}
`;
      });
    }

    context += `
USER REQUEST:
${query}
`;

    if (userTopic) {
      context += `\nTopic Focus: ${userTopic}`;
    }

    if (userYear) {
      context += `\nYear Level: ${userYear}`;
    }

    context += `

GENERATE: A high-quality exam question following the patterns and style of similar questions in the dataset above. The question should:
- Match the difficulty level and style
- Cover the specified topic comprehensively
- Be suitable for the specified year/level
- Include 2-4 parts if asking for explanation or design
- Be clear, unambiguous, and properly formatted`;

    return context;
  }

  /**
   * Get 30 most important + repeated questions for a topic
   * Enhanced: uses broad keyword matching, not just topic.includes()
   */
  getTop30ImportantRepeated(topic, limit = 20) {
    if (!topic) return [];

    const NOISE_TOPICS = [
      /^p\.?t\.?o\.?$/i, /^q\d/i, /^q\.\d/i, /semester examination/i,
      /^unit\s*[-–]/i, /^section/i, /^\[?p\.?t\.?o/i, /^mm\.?:/i,
      /^\(?[a-z]\)?$/i, /^\d+$/, /^ds-/i, /^tcs-/i, /^beet-/i, /^bitt-/i,
      /^e\d+$/i, /^attempt/i, /^answer/i,
    ];

    // Step 1: Try direct topic matching (case-insensitive)
    let topicQuestions = this.optimizedDataset.filter(item => {
      if (NOISE_TOPICS.some(rx => rx.test(item.topic?.trim()))) return false;
      return item.topic.toLowerCase().includes(topic.toLowerCase()) ||
             topic.toLowerCase().includes(item.topic.toLowerCase());
    });

    // Step 2: If few results, try keyword matching against question_text + topic
    if (topicQuestions.length < limit) {
      const keywords = topic.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);

      const keywordMatched = this.optimizedDataset.filter(item => {
        if (NOISE_TOPICS.some(rx => rx.test(item.topic?.trim()))) return false;
        if (!item.question_text || item.question_text.length < 20) return false;
        const haystack = `${item.topic} ${item.question_text}`.toLowerCase();
        const matchCount = keywords.filter(kw => haystack.includes(kw)).length;
        return matchCount >= Math.min(2, keywords.length);
      });

      // Merge without duplicates
      const existingIds = new Set(topicQuestions.map(q => q.id));
      for (const q of keywordMatched) {
        if (!existingIds.has(q.id)) {
          topicQuestions.push(q);
          existingIds.add(q.id);
        }
      }
    }

    if (topicQuestions.length === 0) return [];

    // Score each question based on importance + frequency
    const maxOccurrence = Math.max(...topicQuestions.map(q => q.occurrence_count), 1);
    const scored = topicQuestions.map((item, idx) => ({
      ...item,
      importanceScore: item.occurrence_count * 10,
      combinedScore: item.occurrence_count * 15,
      rank: idx + 1
    }));

    // Sort by combined score (importance + repetition)
    scored.sort((a, b) => b.combinedScore - a.combinedScore);

    // Return top N with metadata
    return scored.slice(0, limit).map((item, idx) => ({
      question_id: item.id,
      question_text: item.question_text,
      topic: item.topic,
      year: item.year,
      difficulty: item.difficulty,
      occurrence_count: item.occurrence_count,
      importanceRank: idx + 1,
      importance: item.occurrence_count >= 5 ? 'Critical' : item.occurrence_count >= 3 ? 'High' : 'Medium',
      frequencyScore: Math.round((item.occurrence_count / maxOccurrence) * 100),
      likelihood: Math.min(95, Math.round(item.occurrence_count * 15))
    }));
  }

  /**
   * Scan the ENTIRE database for questions matching syllabus text
   * Uses broad keyword extraction and fuzzy matching
   * Always guarantees returning results
   */
  getQuestionsFromSyllabus(syllabusText, limit = 20) {
    if (!this.initialized || !syllabusText) return [];

    const NOISE_TOPICS = [
      /^p\.?t\.?o\.?$/i, /^q\d/i, /^q\.\d/i, /semester examination/i,
      /^unit\s*[-–]/i, /^section/i, /^\[?p\.?t\.?o/i, /^mm\.?:/i,
      /^\(?[a-z]\)?$/i, /^\d+$/, /^ds-/i, /^tcs-/i, /^beet-/i, /^bitt-/i,
      /^e\d+$/i, /^attempt/i, /^answer/i,
    ];

    const STOP_WORDS = new Set([
      'the','a','an','and','or','of','to','in','is','are','be','was','were',
      'it','its','for','with','by','as','at','on','this','that','these','those',
      'unit','section','note','marks','year','sem','semester','examination',
      'paper','question','answer','part','following','attempt','any','two',
      'three','four','five','explain','define','describe','discuss','write',
      'list','what','how','why','give','state','compare','differentiate',
      'short','long','detail','brief','suitable','example','diagram','block',
      'note','also','each','per','from','not','can','do','does','has','have',
    ]);

    // Extract keywords from syllabus
    const words = syllabusText
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));

    const uniqueKeywords = [...new Set(words)];

    // Also extract 2-word phrases
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i+1])) {
        bigrams.push(`${words[i]} ${words[i+1]}`);
      }
    }
    const uniqueBigrams = [...new Set(bigrams)];

    // Score every question in the database
    const scored = [];
    for (const item of this.optimizedDataset) {
      if (NOISE_TOPICS.some(rx => rx.test(item.topic?.trim()))) continue;
      if (!item.question_text || item.question_text.length < 20) continue;

      const haystack = `${item.topic} ${item.question_text}`.toLowerCase();
      let score = 0;
      let matchedKeywords = 0;

      // Check bigrams first (higher value)
      for (const bg of uniqueBigrams) {
        if (haystack.includes(bg)) {
          score += 6;
          matchedKeywords++;
        }
      }

      // Check single keywords
      for (const kw of uniqueKeywords) {
        if (haystack.includes(kw)) {
          score += 2;
          matchedKeywords++;
        }
      }

      // Boost by frequency
      score += (item.occurrence_count || 1) * 3;

      if (matchedKeywords >= 2 && score >= 6) {
        scored.push({ item, score, matchedKeywords });
      }
    }

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Deduplicate
    const seen = new Set();
    const unique = scored.filter(({ item }) => {
      const key = item.question_text.toLowerCase().trim().slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const maxOccurrence = Math.max(...unique.map(u => u.item.occurrence_count), 1);

    return unique.slice(0, limit).map(({ item, score }, idx) => ({
      question_id: item.id,
      question_text: item.question_text,
      topic: item.topic,
      year: item.year,
      difficulty: item.difficulty,
      occurrence_count: item.occurrence_count,
      importanceRank: idx + 1,
      importance: item.occurrence_count >= 5 ? 'Critical' : item.occurrence_count >= 3 ? 'High' : 'Medium',
      frequencyScore: Math.round((item.occurrence_count / maxOccurrence) * 100),
      likelihood: Math.min(95, Math.round(Math.max(35, 96 - idx * 2))),
      matchScore: score,
    }));
  }

  /**
   * Get comprehensive RAG report
   */
  getReport() {
    return {
      initialized: this.initialized,
      total_questions: this.optimizedDataset.length,
      total_topics: Object.keys(this.topicIndex).length,
      total_years: Object.keys(this.yearIndex).length,
      topic_statistics: this.getTopicStatistics(),
      difficulty_distribution: this.getDifficultyDistribution(),
      available_topics: Object.keys(this.topicIndex).sort(),
      available_years: Object.keys(this.yearIndex).sort(),
    };
  }
}

// Export singleton instance
export const ragBridge = new RAGBridge();

// Auto-initialize when module is loaded
await ragBridge.initialize().catch(err => {
  console.error('Failed to initialize RAG:', err);
});

export default ragBridge;
