import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse'); // v1.1.1 — exports a plain function
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import db from './db.js';

// ── Load .env manually (no dotenv package needed in ESM) ──────────────────────
try {
  const envContent = readFileSync(new URL('./.env', import.meta.url), 'utf-8');
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
} catch { /* .env optional in production */ }

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'padhai_bias_secret_2024_do_not_share';
const IMPORTANT_TOPICS_URL = new URL('../../data/important_topics_3rd_year.csv', import.meta.url);
const TRAINING_DATASET_URL = new URL('../../data/training-dataset.csv', import.meta.url);

// ── Anthropic AI setup ────────────────────────────────────────────────────────
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
const MODEL = 'claude-3-5-sonnet-20241022'; // Latest Claude model

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const withTimeout = (promise, ms, message) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
]);

async function generateWithFallback(prompt) {
  try {
    console.log(`  Sending to Anthropic Claude (${MODEL})...`);
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log(`  ✅ Success with: ${MODEL}`);
    return responseText;
  } catch (err) {
    console.error(`  ❌ Anthropic error:`, err.message);
    
    if (err.status === 429) {
      throw new Error('Anthropic API rate-limited. Please wait a moment and try again.');
    }
    
    if (err.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY in .env');
    }
    
    throw new Error(`AI Service unavailable: ${err.message}`);
  }
}

function parseCsvLine(line) {
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

function toTitleCase(value) {
  const aliases = {
    'DATA ANALYTICS': 'Data Analytics',
    'ARTIFICIAL INTELLIGENCE': 'Artificial Intelligence',
    'COMPUTER NETWORKS': 'Computer Networks',
    'COMPUTER NETWORK': 'Computer Networks',
    'ANALYSIS OF ALGORITHMS': 'Analysis of Algorithms',
    'DESIGN & ANALYSIS OF ALGORITHM': 'Design and Analysis of Algorithms',
    'GRAPHICS': 'Computer Graphics',
    'COMPUTER GRAPHICS': 'Computer Graphics',
    'DATABASE MANAGEMENT SYSTEM': 'Database Management System',
    'CONSTITUTION OF INDIA': 'Constitution of India',
  };

  if (aliases[value]) return aliases[value];
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bDbms\b/g, 'DBMS');
}

function getImportantTopics(limit = 12) {
  const raw = readFileSync(IMPORTANT_TOPICS_URL, 'utf-8');
  const [, ...rows] = raw.split(/\r?\n/).filter(Boolean);
  const blocked = [/^section\b/i, /^unit[-\s]/i, /p\.?t\.?o/i, /^\d/, /^[A-Z]{2,}[-\d]/i, /\|/];
  const seen = new Set();

  const primaryTopics = rows
    .map((line) => {
      const [rank, topic, questionCount, percentage] = parseCsvLine(line);
      const cleanTopic = topic
        .replace(/\s+/g, ' ')
        .replace(/\s+–\s+/g, ' - ')
        .trim();

      return {
        rank: Number(rank),
        topic: toTitleCase(cleanTopic),
        questionCount: Number(questionCount),
        percentage: Number(percentage),
      };
    })
    .filter((row) => row.topic && !blocked.some((rx) => rx.test(row.topic)))
    .filter((row) => {
      const key = row.topic
        .toLowerCase()
        .replace(/\bnetworks\b/g, 'network')
        .replace(/\bdesign & analysis of algorithm\b/g, 'analysis of algorithms')
        .replace(/\bcomputer graphics\b/g, 'graphics');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row, index) => ({
      ...row,
      score: Math.max(28, 98 - index * 4),
      probability: Math.max(25, 96 - index * 4),
      priorityLabel: index < 5 ? 'High' : index < 12 ? 'Medium' : 'Low',
    }));

  const supplementalTopics = getDatasetTopics(limit * 2)
    .filter((row) => {
      const key = row.topic
        .toLowerCase()
        .replace(/\bnetworks\b/g, 'network')
        .replace(/\bcomputer graphics\b/g, 'graphics');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return [...primaryTopics, ...supplementalTopics]
    .slice(0, limit)
    .map((row, index) => ({
      ...row,
      score: row.score ?? Math.max(22, 98 - index * 3),
      probability: row.probability ?? Math.max(20, 96 - index * 3),
      priorityLabel: row.priorityLabel ?? (index < 5 ? 'High' : index < 15 ? 'Medium' : 'Low'),
    }));
}

function getTrainingRows() {
  const raw = readFileSync(TRAINING_DATASET_URL, 'utf-8');
  const [headerLine, ...lines] = raw.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(headerLine);

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function getDatasetTopics(limit = 40) {
  const blocked = [/^q\.?\d/i, /^section\b/i, /^unit[-\s]/i, /p\.?t\.?o/i, /^\d/, /^[A-Z]{2,}[-\d]/i, /\|/, /semester/i, /tech/i, /^\(?[a-z]\)?$/i];
  const counts = new Map();

  for (const row of getTrainingRows()) {
    const topic = toTitleCase(row.topic.trim().replace(/\s+/g, ' '));
    if (!topic || blocked.some((rx) => rx.test(topic))) continue;
    if (!isUsefulQuestion(row.question_text, topic)) continue;
    counts.set(topic, (counts.get(topic) || 0) + (Number(row.occurrence_count) || 1));
  }

  return [...counts.entries()]
    .map(([topic, questionCount]) => ({ topic, questionCount }))
    .sort((a, b) => b.questionCount - a.questionCount)
    .slice(0, limit)
    .map((row, index) => ({
      rank: index + 1,
      topic: row.topic,
      questionCount: row.questionCount,
      percentage: Number(Math.max(0.2, row.questionCount / 8).toFixed(1)),
      score: Math.max(22, 82 - index * 2),
      probability: Math.max(20, 80 - index * 2),
      priorityLabel: index < 5 ? 'Medium' : 'Low',
    }));
}

function isUsefulQuestion(question, topic) {
  if (!question || question.length < 24) return false;
  if (!topic || topic.length < 4) return false;

  const noisyQuestion = [
    /^answer any/i,
    /^attempt any/i,
    /^explain\.?$/i,
    /^t\.?o\.?$/i,
    /^tech/i,
    /p\.?t\.?o/i,
    /semester examination/i,
    /^can be improved/i,
  ];
  const noisyTopic = [/^q\.?\d/i, /^section\b/i, /^unit[-\s]/i, /p\.?t\.?o/i, /^\d/, /^[A-Z]{2,}[-\d]/i, /\|/];

  return !noisyQuestion.some((rx) => rx.test(question.trim()))
    && !noisyTopic.some((rx) => rx.test(topic.trim()));
}

function getExactQuestions(limit = 60) {
  const importantTopics = getImportantTopics(30);
  const topicWords = importantTopics.map((item, index) => ({
    topic: item.topic,
    priority: index,
    words: item.topic.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3),
  }));
  const seen = new Set();

  const matchedRows = getTrainingRows()
    .filter((row) => isUsefulQuestion(row.question_text, row.topic))
    .map((row) => {
      const haystack = `${row.topic} ${row.question_text}`.toLowerCase();
      const rowTopic = toTitleCase(row.topic.trim());
      const match = topicWords.find((entry) =>
        rowTopic === entry.topic ||
        entry.words.filter((word) => haystack.includes(word)).length >= Math.min(2, entry.words.length)
      );
      if (!match || row.question_text.length > 260) return null;

      const occurrenceCount = Number(row.occurrence_count) || 1;
      const score = 120 - match.priority * 3 + occurrenceCount * 6 + Math.min(row.question_text.length, 120) / 12;

      return {
        question: row.question_text.trim(),
        topic: match.topic,
        year: row.year,
        occurrenceCount,
        score,
        priority: match.priority,
        difficulty: row.question_text.length > 110 ? 'Hard' : row.question_text.length > 65 ? 'Medium' : 'Easy',
        marks: row.question_text.length > 95 ? 10 : row.question_text.length > 55 ? 7 : 5,
      };
    })
    .filter(Boolean)
    .filter((row) => {
      const key = row.question.toLowerCase().replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score || a.priority - b.priority);

  return matchedRows.slice(0, limit).map((row, index) => ({
    ...row,
    likelihood: Math.max(35, Math.round(96 - index * 1.6)),
  }));
}

function getTopicHeatmap() {
  return getImportantTopics(30).map((item) => ({
    topic: item.topic,
    values: [
      Math.min(9, Math.max(1, Math.round(item.questionCount / 4))),
      Math.min(9, Math.max(1, Math.round(item.percentage * 1.5))),
      Math.min(9, Math.max(1, Math.round(item.score / 11))),
      Math.min(9, Math.max(1, Math.round(item.probability / 11))),
    ],
    questionCount: item.questionCount,
  }));
}

// ── SYLLABUS KEYWORD EXTRACTOR ────────────────────────────────────────────────
// Extracts meaningful multi-word and single-word tokens from raw syllabus text
function extractSyllabusKeywords(syllabusText) {
  if (!syllabusText) return [];

  // Common noise words to ignore
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

  const text = syllabusText
    .replace(/[^a-zA-Z0-9\s+\-&]/g, ' ')  // keep letters, digits, &, -
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

  const words = text.split(' ').filter(w => w.length > 2 && !STOP_WORDS.has(w));

  // Build bigrams (2-word phrases) and trigrams (3-word phrases)
  const phrases = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i < words.length - 2; i++) {
    phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  // Deduplicate and return top unique phrases
  return [...new Set(phrases)];
}

// ── TRAINED DATASET MATCHER ───────────────────────────────────────────────────
// Primary AI system: matches uploaded syllabus against the trained question CSV
function matchSyllabusToTrainedData(syllabusText) {
  const keywords = extractSyllabusKeywords(syllabusText);
  if (keywords.length === 0) return null;

  const allRows = getTrainingRows();
  const blocked = [
    /^answer any/i, /^attempt any/i, /^explain\.?$/i, /^t\.?o\.?$/i,
    /^tech/i, /p\.?t\.?o/i, /semester examination/i, /^q\.?\d/i,
    /^section\b/i, /^unit[-\s]/i, /^\d/, /^[A-Z]{2,}[-\d]/i, /\|/,
    /^\(?[a-z]\)?$/, /^can be improved/i,
  ];

  // Score every row against the syllabus keywords
  const scored = allRows
    .filter(row => isUsefulQuestion(row.question_text, row.topic))
    .filter(row => !blocked.some(rx => rx.test(row.topic?.trim())))
    .map(row => {
      const haystack = `${row.topic} ${row.question_text}`.toLowerCase();
      let score = 0;
      let matchedKeywords = 0;

      for (const kw of keywords) {
        if (haystack.includes(kw)) {
          // Longer phrase matches count more
          score += kw.split(' ').length * (kw.split(' ').length > 1 ? 3 : 1);
          matchedKeywords++;
        }
      }

      // Boost by occurrence count in training data
      score += (Number(row.occurrence_count) || 1) * 2;

      return { row, score, matchedKeywords };
    })
    .filter(item => item.matchedKeywords >= 1 && item.score >= 4)
    .sort((a, b) => b.score - a.score);

  // Need at least 3 matched questions to consider this a valid syllabus match
  if (scored.length < 3) return null;

  // Deduplicate questions
  const seen = new Set();
  const uniqueRows = scored.filter(({ row }) => {
    const key = row.question_text.toLowerCase().trim().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Extract matched topics
  const topicScores = new Map();
  for (const { row, score } of uniqueRows) {
    const topic = toTitleCase(row.topic.trim());
    if (!blocked.some(rx => rx.test(topic))) {
      topicScores.set(topic, (topicScores.get(topic) || 0) + score);
    }
  }

  const rankedTopics = [...topicScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([topic, sc], index) => ({
      topic,
      score: Math.max(30, 95 - index * 3),
      probability: Math.max(28, 93 - index * 3),
      priorityLabel: index < 5 ? 'High' : index < 12 ? 'Medium' : 'Low',
      questionCount: topicScores.get(topic),
    }));

  // Build questions list
  const exactQuestions = uniqueRows.slice(0, 60).map(({ row, score }, index) => ({
    question: row.question_text.trim(),
    topic: toTitleCase(row.topic.trim()),
    year: row.year,
    occurrenceCount: Number(row.occurrence_count) || 1,
    score,
    difficulty: row.question_text.length > 110 ? 'Hard' : row.question_text.length > 65 ? 'Medium' : 'Easy',
    marks: row.question_text.length > 95 ? 10 : row.question_text.length > 55 ? 7 : 5,
    likelihood: Math.max(35, Math.round(96 - index * 1.5)),
  }));

  // Group into units by topic clusters
  const topicList = rankedTopics.slice(0, 15);
  const units = [];
  for (let i = 0; i < topicList.length; i += 4) {
    const group = topicList.slice(i, i + 4);
    const unitQs = exactQuestions
      .filter(q => group.some(t => t.topic === q.topic))
      .slice(0, 6);
    if (group.length > 0) {
      units.push({
        unitNumber: Math.floor(i / 4) + 1,
        unitName: group[0].topic,
        topics: group.map(t => t.topic),
        weightage: Math.max(10, 40 - i * 3),
        importantTopics: group.map(t => t.topic),
        predictedQuestions: unitQs.map(q => ({
          question: q.question,
          topic: q.topic,
          type: q.difficulty === 'Easy' ? 'Short Answer' : 'Long Answer',
          marks: q.marks,
          likelihood: q.likelihood,
        })),
      });
    }
  }

  return {
    summary: `Syllabus analysis complete — found ${exactQuestions.length} questions from your trained BIAS question dataset matching this syllabus.`,
    totalTopics: rankedTopics.length,
    totalUnits: units.length,
    estimatedQuestions: exactQuestions.length,
    difficulty: exactQuestions.filter(q => q.difficulty === 'Hard').length > exactQuestions.length / 3 ? 'Hard' : 'Moderate',
    units,
    topPredictions: rankedTopics.slice(0, 10).map(item => ({
      topic: item.topic,
      probability: item.probability,
      reason: `Matched from your uploaded syllabus — ${item.questionCount} exam occurrences in training data.`,
    })),
    exactQuestions,
    studyTips: [
      'These questions are predicted directly from YOUR syllabus using the trained BIAS dataset.',
      'Focus on High priority topics first — they appear most frequently in past papers.',
      'Practice both short (5-mark) and long (10-mark) question formats for each topic.',
    ],
    heatmap: rankedTopics.map((item, index) => ({
      topic: item.topic,
      score: item.score,
      unit: (index % 4) + 1,
    })),
    source: 'trained-dataset-match',
    inputCharacters: syllabusText.length,
    matchedQuestions: exactQuestions.length,
  };
}

function buildLocalAnalysis(syllabusText = '') {
  const topics = getImportantTopics(30);
  const exactQuestions = getExactQuestions(60);
  const units = [];

  for (let i = 0; i < topics.length; i += 5) {
    const group = topics.slice(i, i + 5);
    const unitQuestions = exactQuestions
      .filter((question) => group.some((topic) => topic.topic === question.topic))
      .slice(0, 8);

    units.push({
      unitNumber: Math.floor(i / 5) + 1,
      unitName: `Priority Group ${Math.floor(i / 5) + 1}`,
      topics: group.map((item) => item.topic),
      weightage: Math.max(10, 38 - i),
      importantTopics: group.map((item) => item.topic),
      predictedQuestions: unitQuestions.map((item) => ({
        question: item.question,
        topic: item.topic,
        type: item.difficulty === 'Easy' ? 'Short Answer' : 'Long Answer',
        marks: item.marks,
        likelihood: item.likelihood,
      })),
    });
  }

  return {
    summary: 'General analysis from trained BIAS past-paper dataset (no syllabus-specific match found).',
    totalTopics: topics.length,
    totalUnits: units.length,
    estimatedQuestions: exactQuestions.length,
    difficulty: 'Moderate',
    units,
    topPredictions: topics.slice(0, 10).map((item) => ({
      topic: item.topic,
      probability: item.probability,
      reason: `Appeared ${item.questionCount} times in the BIAS question dataset.`,
    })),
    exactQuestions,
    studyTips: [
      'Start with the highest ranked topics before moving to low-frequency topics.',
      'Prepare one short answer and one long answer for every top prediction.',
      'Revise repeated topic names from previous papers first.',
    ],
    heatmap: topics.map((item, index) => ({
      topic: item.topic,
      score: item.score,
      unit: (index % 4) + 1,
    })),
    source: 'local-important-topics',
    inputCharacters: syllabusText.length,
  };
}

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || origin.startsWith('http://localhost')),
  credentials: true,
}));
app.use(express.json());

// ── Multer (memory storage for PDF and image uploads) ──────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Accepted: PDF, JPG, PNG, WebP. Received: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 1,
  },
});

// ── JWT verify middleware ──────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ── AI PROMPT builder (Claude) ─────────────────────────────────────────────────
function buildPrompt(syllabusText) {
  return `You are an expert academic AI assistant for BIAS (BCA/MCA) students in India.
Analyze the following syllabus and return a detailed, structured JSON response.

SYLLABUS TEXT:
"""
${syllabusText}
"""

Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:
{
  "summary": "2-3 sentence overview of the syllabus",
  "totalTopics": <number>,
  "totalUnits": <number>,
  "estimatedQuestions": <number>,
  "difficulty": "Easy | Moderate | Hard",
  "units": [
    {
      "unitNumber": 1,
      "unitName": "Unit title here",
      "topics": ["topic 1", "topic 2", ...],
      "weightage": <percentage as number 0-100>,
      "importantTopics": ["most important topic 1", "most important topic 2"],
      "predictedQuestions": [
        { "question": "Question text here?", "type": "Short Answer | Long Answer | MCQ", "marks": <number> }
      ]
    }
  ],
  "topPredictions": [
    { "topic": "topic name", "probability": <0-100>, "reason": "Why this is likely to appear" }
  ],
  "studyTips": ["tip 1", "tip 2", "tip 3"],
  "heatmap": [
    { "topic": "topic name", "score": <0-100>, "unit": <unitNumber> }
  ]
}`;
}

// ── ANALYZE SYLLABUS endpoint — supports PDF, image (JPG/PNG), or plain text ──
app.post('/api/analyze-syllabus', (req, res, next) => {
  upload.single('pdf')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'FILE_TOO_LARGE') {
        return res.status(400).json({ 
          error: 'File is too large. Maximum size is 25MB. Please upload a smaller file.' 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          error: 'Please upload only one file at a time.' 
        });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ 
        error: err.message || 'File upload failed. Please check the file format and size.' 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    let syllabusText = '';
    let usedVision   = false;

    // ── STEP 1: Extract text from the uploaded file or body ──────────────────
    if (req.file) {
      const mime = req.file.mimetype || '';
      console.log(`  File received: ${req.file.originalname} (${mime}, ${req.file.size} bytes)`);

      // Image: use Anthropic Vision OCR
      if (mime.startsWith('image/')) {
        usedVision = true;
        console.log('  Image detected — sending to Anthropic Vision OCR...');
        try {
          const visionMessage = await withTimeout(
            client.messages.create({
              model: MODEL,
              max_tokens: 4096,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: mime,
                        data: req.file.buffer.toString('base64'),
                      },
                    },
                    {
                      type: 'text',
                      text: 'Extract all text from this syllabus image. Return only the raw extracted text, preserving structure (units, topics, subtopics). Do not summarize.',
                    },
                  ],
                },
              ],
            }),
            30000,
            'Image OCR timed out.'
          );
          syllabusText = visionMessage.content[0].type === 'text' ? visionMessage.content[0].text.trim() : '';
          if (!syllabusText || syllabusText.length < 20)
            return res.status(400).json({ error: 'Could not read text from this image. Ensure the photo is clear and well-lit, or paste the text manually.' });
          console.log(`  Extracted ${syllabusText.length} chars from image via Anthropic Vision`);
        } catch (vErr) {
          return res.status(500).json({ error: 'Image reading failed: ' + vErr.message });
        }

      // PDF: use pdf-parse
      } else {
        console.log('  PDF detected — extracting text...');
        const data = await withTimeout(
          pdfParse(req.file.buffer),
          15000,
          'PDF text extraction took too long.'
        );
        syllabusText = data.text?.trim();
        if (!syllabusText || syllabusText.length < 30)
          return res.status(400).json({ error: 'Could not extract text from this PDF. It may be a scanned image — try uploading it as an image (JPG/PNG) or paste the text manually.' });
        console.log(`  Extracted ${syllabusText.length} chars from PDF`);
      }

    } else if (req.body.text) {
      syllabusText = req.body.text.trim();
      if (!syllabusText) return res.status(400).json({ error: 'Please provide syllabus content.' });
    } else {
      return res.status(400).json({ error: 'Provide a PDF file, image, or paste text.' });
    }

    // ── STEP 2: PRIMARY — Match against the trained BIAS question dataset ─────
    console.log(`  [Step 2] Matching syllabus against trained dataset (${syllabusText.length} chars)...`);
    const trainedMatch = matchSyllabusToTrainedData(syllabusText);

    if (trainedMatch) {
      console.log(`  ✅ Trained dataset match: ${trainedMatch.exactQuestions.length} questions found`);
      return res.json({
        success: true,
        anthropicUsed: false,
        usedVision,
        trainedModelUsed: true,
        analysis: trainedMatch,
      });
    }

    console.log('  ⚠️  No trained dataset match — trying Anthropic AI fallback...');

    // ── STEP 3: FALLBACK — Try Anthropic Claude ──────────────────────────────
    let analysis;
    let anthropicUsed = false;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        console.log(`  [Step 3] Sending to Anthropic Claude...`);
        const rawResponse = await withTimeout(
          generateWithFallback(buildPrompt(syllabusText)),
          60000,
          'Anthropic Claude took too long.'
        );
        const cleaned = rawResponse.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); }
        catch { const m = cleaned.match(/{[\s\S]*}/); parsed = m ? JSON.parse(m[0]) : null; }

        if (!parsed) throw new Error('Claude returned non-JSON response');

        const localQuestions = buildLocalAnalysis(syllabusText);
        analysis = {
          ...parsed,
          exactQuestions: localQuestions.exactQuestions,
          source: 'anthropic-claude',
          inputCharacters: syllabusText.length,
        };
        anthropicUsed = true;
        console.log('  ✅ Claude analysis complete');
      } catch (aErr) {
        console.warn('  ⚠️  Claude also failed:', aErr.message);
        // ── STEP 4: FINAL FALLBACK — Not found ──────────────────────────────
        return res.status(200).json({
          success: false,
          anthropicUsed: false,
          trainedModelUsed: false,
          usedVision,
          notFound: true,
          error: 'Sorry, no exam questions were found matching this syllabus in our trained PadhAI dataset. The Anthropic Claude fallback also failed. Please try with a more detailed syllabus or paste the topic names directly.',
        });
      }
    } else {
      // No API key and no trained match → not found
      return res.status(200).json({
        success: false,
        anthropicUsed: false,
        trainedModelUsed: false,
        usedVision,
        notFound: true,
        error: 'Sorry, no exam questions were found matching this syllabus in our trained BIAS dataset. Please try with a more detailed syllabus or paste the topic names directly.',
      });
    }

    return res.json({ success: true, anthropicUsed, usedVision, trainedModelUsed: false, analysis });

  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed: ' + (err.message || 'Unknown error') });
  }
});

app.get('/api/important-topics', (_, res) => {
  try {
    res.json({
      success: true,
      topics: getImportantTopics(30),
    });
  } catch (err) {
    console.error('Important topics error:', err);
    res.status(500).json({ error: 'Could not load important topics.' });
  }
});

app.get('/api/dashboard-insights', (_, res) => {
  try {
    res.json({
      success: true,
      topics: getImportantTopics(30),
      heatmap: getTopicHeatmap(),
      heatmapColumns: ['Frequency', 'Share', 'Priority', 'Confidence'],
      questions: getExactQuestions(60),
    });
  } catch (err) {
    console.error('Dashboard insights error:', err);
    res.status(500).json({ error: 'Could not load dashboard insights.' });
  }
});

// ── REGISTER ───────────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
    return res.status(400).json({ error: 'Username must be 3-20 characters (letters, numbers, _ only).' });

  if (!/^[^\s@]+@gmail\.com$/i.test(email))
    return res.status(400).json({ error: 'Only @gmail.com email addresses are accepted.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username.toLowerCase()))
    return res.status(409).json({ error: `Username "@${username}" is already taken.` });

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()))
    return res.status(409).json({ error: 'An account with this email already exists.' });

  const hashed = await bcrypt.hash(password, 10);

  const result = db.prepare(
    'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)'
  ).run(name, username.toLowerCase(), email.toLowerCase(), hashed);

  const user = db.prepare(
    'SELECT id, name, username, email, role, college, created_at FROM users WHERE id = ?'
  ).get(result.lastInsertRowid);

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ message: 'Account created successfully!', token, user });
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase());
  if (!user)
    return res.status(401).json({ error: `No account found for "@${username}".` });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  const { password: _, ...safeUser } = user;
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: `Welcome back, ${user.name}!`, token, user: safeUser });
});

// ── GET PROFILE (protected) ───────────────────────────────────────────────────
app.get('/api/profile', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, username, email, role, college, created_at, last_login FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

// ── UPDATE PROFILE (protected) ────────────────────────────────────────────────
app.put('/api/profile', requireAuth, (req, res) => {
  const { name } = req.body;
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);
  const user = db.prepare(
    'SELECT id, name, username, email, role, college, created_at, last_login FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json({ message: 'Profile updated!', user });
});

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ 
        error: 'File is too large. Maximum allowed size is 25MB.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Please upload only one file.' 
      });
    }
    return res.status(400).json({ 
      error: `File upload error: ${err.message}` 
    });
  }
  
  // Custom file validation errors
  if (err.message?.includes('File type not allowed')) {
    return res.status(400).json({ 
      error: 'Invalid file type. Accepted formats: PDF, JPG, PNG, WebP' 
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({ 
    error: err.message || 'An error occurred. Please try again.' 
  });
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ PadhAI Backend running on http://localhost:${PORT}`);
  console.log(`   🤖 Anthropic Claude: ${process.env.ANTHROPIC_API_KEY ? 'Connected' : '⚠️ API Key Missing'}`);
  console.log(`   Login: by username + password`);
  console.log(`   Email: @gmail.com only\n`);
});
