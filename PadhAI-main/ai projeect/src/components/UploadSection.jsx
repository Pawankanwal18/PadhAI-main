import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiCpu, FiType, FiAlignLeft, FiAlertCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const pdfStages = [
  { icon: FiUploadCloud, label: 'Uploading PDF',  color: '#3b82f6', pct: 20 },
  { icon: FiFileText,   label: 'OCR Extraction',  color: '#06b6d4', pct: 45 },
  { icon: FiCpu,        label: 'Gemini AI',        color: '#8b5cf6', pct: 80 },
  { icon: FiCheckCircle,label: 'Ready!',           color: '#22c55e', pct: 100 },
];

const textStages = [
  { icon: FiAlignLeft,  label: 'Reading Text',    color: '#3b82f6', pct: 20 },
  { icon: FiType,       label: 'Parsing Topics',  color: '#06b6d4', pct: 45 },
  { icon: FiCpu,        label: 'Gemini AI',        color: '#8b5cf6', pct: 80 },
  { icon: FiCheckCircle,label: 'Ready!',           color: '#22c55e', pct: 100 },
];

const UploadSection = () => {
  const [activeTab, setActiveTab]       = useState('pdf');
  const [dragActive, setDragActive]     = useState(false);
  const [processing, setProcessing]     = useState(false);
  const [stage, setStage]               = useState(-1);
  const [fileName, setFileName]         = useState('');
  const [textInput, setTextInput]       = useState('');
  const [charCount, setCharCount]       = useState(0);
  const [result, setResult]             = useState(null);
  const [resultMeta, setResultMeta]     = useState(null); // { trainedModelUsed, geminiUsed }
  const [notFound, setNotFound]         = useState(false);
  const [notFoundMsg, setNotFoundMsg]   = useState('');
  const [error, setError]               = useState('');
  const [ref, inView]                   = useInView({ triggerOnce: true, threshold: 0.1 });

  const stages = activeTab === 'pdf' ? pdfStages : textStages;

  const animateStages = useCallback(() => {
    let s = 0;
    const run = () => {
      setStage(s);
      s++;
      if (s < stages.length - 1) setTimeout(run, 1000);
    };
    setTimeout(run, 300);
  }, [stages.length]);

  const callGemini = useCallback(async (formData) => {
    setError('');
    setResult(null);
    setResultMeta(null);
    setNotFound(false);
    setNotFoundMsg('');
    setProcessing(true);
    animateStages();

    try {
      const res = await fetch('/api/analyze-syllabus', {
        method: 'POST',
        body: formData,
      });

      // Guard: if server returned HTML (backend down / proxy issue), give clear error
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Backend not responding. Make sure you ran: node backend/server.js');
      }

      const data = await res.json();

      // Handle "not found" case — syllabus didn't match any training data
      if (data.notFound) {
        setNotFound(true);
        setNotFoundMsg(data.error || 'Sorry, no questions found for this syllabus.');
        setProcessing(false);
        setStage(-1);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setStage(3);
      setResult(data.analysis);
      setResultMeta({ trainedModelUsed: data.trainedModelUsed, geminiUsed: data.geminiUsed });
    } catch (err) {
      setError(err.message);
      setProcessing(false);
      setStage(-1);
    }
  }, [animateStages]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    const fd = new FormData();
    fd.append('pdf', file);
    callGemini(fd);
  }, [callGemini]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const fd = new FormData();
    fd.append('pdf', file);
    callGemini(fd);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    setFileName('Pasted Syllabus Text');
    const fd = new FormData();
    fd.append('text', textInput.trim());
    callGemini(fd);
  };

  const reset = () => {
    setProcessing(false);
    setStage(-1);
    setFileName('');
    setTextInput('');
    setCharCount(0);
    setResult(null);
    setResultMeta(null);
    setNotFound(false);
    setNotFoundMsg('');
    setError('');
  };

  const switchTab = (tab) => {
    if (processing) return;
    setActiveTab(tab);
    reset();
  };

  const progress = stage >= 0 ? stages[stage]?.pct ?? 0 : 0;

  return (
    <section id="upload" className="section section-tinted dot-pattern relative w-full flex flex-col items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2" style={{ background: 'rgba(0,0,0,0.03)' }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(0,0,0,0.02)' }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20">
        {/* Heading */}
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-10 w-full">
          <div
            className="inline-flex items-center gap-2 tag-chip mb-5"
          >
            <FiUploadCloud style={{ color: '#0a0a0a', fontSize: '12px' }} />
            <span>Smart Upload Engine — Powered by Gemini AI</span>
          </div>
          <h2 className="font-playfair" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0a0a0a', marginBottom: '12px' }}>
            Upload Your <span style={{ fontStyle: 'italic' }}>Syllabus</span>
          </h2>
          <p className="font-space" style={{ color: '#666', maxWidth: '520px', margin: '0 auto', fontSize: '14px', lineHeight: 1.7 }}>
            Upload a PDF or paste text — Gemini AI will analyze topics, predict exam questions, and generate a study heatmap.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.15 }} className="flex items-center justify-center mb-6">
          <div className="glass rounded-2xl p-1.5 flex gap-1 border border-white/8">
            <button id="tab-pdf" onClick={() => switchTab('pdf')} className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-space font-semibold text-sm transition-all duration-300 ${activeTab === 'pdf' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {activeTab === 'pdf' && <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/80 to-cyan-600/80" style={{ boxShadow: '0 0 20px rgba(59,130,246,0.25)' }} />}
              <FiUploadCloud className="relative z-10 text-base" />
              <span className="relative z-10">PDF Upload</span>
            </button>
            <button id="tab-text" onClick={() => switchTab('text')} className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-space font-semibold text-sm transition-all duration-300 ${activeTab === 'text' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {activeTab === 'text' && <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.25)' }} />}
              <FiAlignLeft className="relative z-10 text-base" />
              <span className="relative z-10">Paste Text</span>
            </button>
          </div>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex items-center gap-3 bg-red-900/30 border border-red-500/40 rounded-2xl px-5 py-4 text-red-300 font-space text-sm">
              <FiAlertCircle className="text-red-400 text-xl shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-200">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.25 }} className={`glass-strong rounded-3xl p-8 relative overflow-hidden transition-all duration-500 ${activeTab === 'pdf' ? 'neon-border-cyan' : 'neon-border-purple'}`}>
          {/* Scan animation */}
          {processing && stage < 3 && (
            <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="absolute inset-0 opacity-10" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(6,182,212,0.15) 40px, rgba(6,182,212,0.15) 41px)' }} />
              <motion.div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" animate={{ top: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* ── NOT FOUND STATE ── */}
            {notFound && !processing && !result && (
              <motion.div key="not-found" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-10 flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '2px solid rgba(245,158,11,0.3)' }}>
                  <FiAlertCircle className="text-4xl" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg mb-2" style={{ color: '#0a0a0a' }}>Sorry, No Questions Found</h3>
                  <p className="font-space text-sm mb-1" style={{ color: '#666', maxWidth: '420px' }}>
                    The uploaded syllabus didn't match any topics in the trained BIAS question dataset.
                  </p>
                  <p className="font-space text-xs" style={{ color: '#999' }}>
                    💡 Try pasting the syllabus topic names directly, or upload a more detailed PDF with subject names visible.
                  </p>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 20px', maxWidth: '380px', textAlign: 'left' }}>
                  <p className="font-space font-semibold text-xs mb-2" style={{ color: '#92400e' }}>Suggestions:</p>
                  <ul className="font-space text-xs" style={{ color: '#78350f', lineHeight: 2 }}>
                    <li>→ Include subject names like "Data Analytics", "Computer Networks", "AI"</li>
                    <li>→ Use the "Paste Text" tab and type topic headings</li>
                    <li>→ Make sure the PDF is text-based (not a scanned image)</li>
                  </ul>
                </div>
                <button onClick={reset} className="btn-neon px-6 py-3 rounded-xl font-space font-bold text-sm">
                  Try Again
                </button>
              </motion.div>
            )}

            {/* ── IDLE INPUT ── */}
            {!processing && !result && !notFound && (
              <motion.div key={activeTab} initial={{ opacity: 0, x: activeTab === 'pdf' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                {activeTab === 'pdf' && (
                  <div onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-300 cursor-pointer ${dragActive ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]' : 'border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5'}`}
                    onClick={() => document.getElementById('file-input').click()}>
                    <input id="file-input" type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <motion.div className="absolute inset-0 rounded-full border-2 border-cyan-500/30" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <FiUploadCloud className="text-white text-3xl" />
                      </div>
                    </div>
                    <h3 className="font-space" style={{ fontWeight: 700, color: '#0a0a0a', fontSize: '18px', marginBottom: '8px' }}>{dragActive ? 'Release to Upload' : 'Drag & Drop PDF or Photo here'}</h3>
                    <p className="font-space text-sm mb-5" style={{ color: '#666' }}>or click to browse files</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: '100px', padding: '6px 14px' }}>
                      <span className="font-space" style={{ fontSize: '12px', color: '#888' }}>PDF or Image</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ccc', display: 'inline-block' }} />
                      <span className="font-space" style={{ fontSize: '12px', color: '#888' }}>Max 25MB</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ccc', display: 'inline-block' }} />
                      <span className="font-space" style={{ fontSize: '12px', color: '#888' }}>Secure</span>
                    </div>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <FiAlignLeft className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="font-space font-semibold text-white text-sm">Paste Syllabus Text</p>
                          <p className="text-xs text-slate-500 font-space">Any format — units, topics, subtopics</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <textarea id="syllabus-textarea" value={textInput} onChange={(e) => { setTextInput(e.target.value); setCharCount(e.target.value.length); }}
                        placeholder={`Paste your syllabus here...\n\nExample:\nUnit 1: Introduction to AI\n- History of AI\n- Types of AI\n\nUnit 2: Machine Learning\n- Supervised Learning\n- Neural Networks`}
                        rows={12} className="w-full rounded-2xl p-5 font-space text-sm text-slate-200 placeholder-slate-400 resize-none focus:outline-none transition-all duration-300"
                        style={{ background: 'rgba(8,10,20,0.7)', border: textInput.length > 0 ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(71,85,105,0.4)', lineHeight: '1.75', caretColor: '#a78bfa' }} />
                      <div className="absolute bottom-3 right-4 text-xs font-space text-slate-600">
                        {charCount.toLocaleString()} chars
                      </div>
                    </div>
                    <motion.button id="analyze-text-btn" onClick={handleTextSubmit} disabled={!textInput.trim()}
                      whileHover={textInput.trim() ? { scale: 1.02, y: -1 } : {}} whileTap={textInput.trim() ? { scale: 0.98 } : {}}
                      className={`w-full py-4 rounded-2xl font-space font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 ${textInput.trim() ? 'btn-neon cursor-pointer' : 'cursor-not-allowed'}`}
                      style={!textInput.trim() ? { background: '#f0f0f0', border: '1px solid #e0e0e0', color: '#bbb' } : {}}>
                      <FiCpu className={textInput.trim() ? 'text-yellow-300' : 'text-slate-600'} />
                      {textInput.trim() ? 'Find the Questions' : 'Paste your syllabus text above'}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── PROCESSING ── */}
            {processing && !result && (
              <motion.div key="processing" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="space-y-8">
                <div className="flex items-center gap-4 glass px-5 py-4 rounded-xl border border-blue-500/20">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${activeTab === 'pdf' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-purple-500 to-blue-600'}`}>
                    {activeTab === 'pdf' ? <FiFileText className="text-white text-xl" /> : <FiAlignLeft className="text-white text-xl" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-space font-medium text-white truncate">{fileName}</div>
                    <div className="text-xs text-slate-500 font-space">{activeTab === 'pdf' ? 'PDF Document' : 'Plain Text Syllabus'} · Analyzing with Gemini AI...</div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500/50 border-t-blue-400 animate-spin" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-space text-slate-400">{stage >= 0 ? stages[stage]?.label : 'Initializing...'}</span>
                    <span className="text-sm font-orbitron font-bold text-blue-400">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full progress-bar-fill rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {stages.map((s, i) => {
                    const SIcon = s.icon;
                    const done = stage >= i;
                    return (
                      <motion.div key={s.label} animate={done ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.4 }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${done ? 'glass border border-white/10' : 'bg-slate-900/30 border border-white/5'}`}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: done ? `${s.color}30` : '#1e293b', border: `1px solid ${done ? s.color + '50' : '#334155'}` }}>
                          <SIcon style={{ color: done ? s.color : '#475569' }} className="text-lg" />
                        </div>
                        <span className={`text-xs font-space text-center leading-tight ${done ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {result && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-orbitron text-xl font-bold flex items-center gap-2" style={{ color: '#0a0a0a' }}>
                      <span style={{ color: '#22c55e' }}>✓</span> Analysis Complete
                    </h3>
                    {/* Source badge */}
                    {resultMeta?.trainedModelUsed && (
                      <span className="inline-flex items-center gap-1.5 mt-1 font-space text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a' }}>
                        🧠 Matched from Trained BIAS Dataset
                      </span>
                    )}
                    {resultMeta?.geminiUsed && (
                      <span className="inline-flex items-center gap-1.5 mt-1 font-space text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#7c3aed' }}>
                        ✨ Powered by Gemini AI
                      </span>
                    )}
                    <p className="font-space mt-2" style={{ color: '#555', fontSize: '13px' }}>{result.summary}</p>
                  </div>
                  <button onClick={reset} className="btn-outline-neon px-4 py-2 rounded-xl text-xs font-space font-medium">Upload Another</button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Units',      value: result.totalUnits,         color: '#3b82f6' },
                    { label: 'Topics',     value: result.totalTopics,        color: '#06b6d4' },
                    { label: 'Questions',  value: result.estimatedQuestions, color: '#8b5cf6' },
                    { label: 'Difficulty', value: result.difficulty,         color: result.difficulty === 'Hard' ? '#ef4444' : result.difficulty === 'Moderate' ? '#f59e0b' : '#22c55e' },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div className="font-orbitron text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="font-space" style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top Predictions */}
                {result.topPredictions?.length > 0 && (
                  <div>
                    <h4 className="font-space font-semibold" style={{ color: '#0a0a0a', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HiSparkles style={{ color: '#f59e0b' }} /> Top Exam Predictions
                    </h4>
                    <div className="space-y-2">
                      {result.topPredictions.slice(0, 10).map((p, i) => (
                        <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="font-orbitron font-bold" style={{ color: p.probability >= 70 ? '#22c55e' : p.probability >= 40 ? '#f59e0b' : '#94a3b8', minWidth: '3rem', fontSize: '14px' }}>{p.probability}%</div>
                          <div style={{ width: '1px', height: '16px', background: '#e8e8e8' }} />
                          <div style={{ flex: 1 }}>
                            <div className="font-space font-semibold" style={{ color: '#0a0a0a', fontSize: '13px' }}>{p.topic}</div>
                            <div className="font-space" style={{ color: '#888', fontSize: '11px' }}>{p.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions */}
                {result.exactQuestions?.length > 0 && (
                  <div>
                    <h4 className="font-space font-semibold" style={{ color: '#0a0a0a', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiFileText style={{ color: '#06b6d4' }} /> Predicted Exam Questions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                      {result.exactQuestions.slice(0, 60).map((q, i) => (
                        <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span className="font-orbitron font-bold" style={{ fontSize: '10px', color: '#06b6d4', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', padding: '2px 8px', borderRadius: '6px', flexShrink: 0 }}>Q{i + 1}</span>
                            <div style={{ flex: 1 }}>
                              <p className="font-space" style={{ color: '#222', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{q.question}</p>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                <span className="font-space" style={{ fontSize: '10px', color: '#3b82f6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', padding: '2px 8px', borderRadius: '100px' }}>{q.topic}</span>
                                <span className="font-space" style={{ fontSize: '10px', color: '#666', background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '2px 8px', borderRadius: '100px' }}>{q.marks} Marks</span>
                                <span className="font-space" style={{ fontSize: '10px', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '100px' }}>{q.likelihood}% likely</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Units */}
                {result.units?.length > 0 && (
                  <div>
                    <h4 className="font-space font-semibold" style={{ color: '#0a0a0a', fontSize: '13px', marginBottom: '10px' }}>Unit Breakdown</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.units.map((unit) => (
                        <div key={unit.unitNumber} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span className="font-space font-semibold" style={{ color: '#0a0a0a', fontSize: '13px' }}>Unit {unit.unitNumber}: {unit.unitName}</span>
                            <span className="font-space" style={{ fontSize: '12px', color: '#06b6d4' }}>{unit.weightage}%</span>
                          </div>
                          <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px', marginBottom: '10px' }}>
                            <motion.div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }} initial={{ width: 0 }} animate={{ width: `${unit.weightage}%` }} transition={{ duration: 0.8 }} />
                          </div>
                          {unit.importantTopics?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {unit.importantTopics.map((t, i) => (
                                <span key={i} className="font-space" style={{ fontSize: '11px', color: '#555', background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '2px 10px', borderRadius: '100px' }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Tips */}
                {result.studyTips?.length > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                    <h4 className="font-space font-semibold" style={{ color: '#166534', fontSize: '13px', marginBottom: '8px' }}>AI Study Tips</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none', margin: 0, padding: 0 }}>
                      {result.studyTips.map((tip, i) => (
                        <li key={i} className="font-space" style={{ fontSize: '12px', color: '#166534', display: 'flex', gap: '8px' }}>
                          <span>→</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!processing && !result && (
          <p className="text-center font-space mt-5" style={{ fontSize: '12px', color: '#aaa' }}>
            Your data is processed securely — Results powered by Google Gemini AI
          </p>
        )}
      </div>
    </section>
  );
};

export default UploadSection;
