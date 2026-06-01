import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiTrendingUp, FiTarget, FiList, FiFileText, FiBarChart2 } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

// ---- Data ----
// eslint-disable-next-line no-unused-vars
const fallbackTopics = [
  { name: 'Data Structures & Algorithms', score: 94, freq: 8, tags: ['High Priority', 'Very Likely'] },
  { name: 'DBMS – Normalization', score: 88, freq: 7, tags: ['High Priority'] },
  { name: 'Operating Systems – Scheduling', score: 82, freq: 6, tags: ['Likely'] },
  { name: 'Computer Networks – TCP/IP', score: 78, freq: 6, tags: ['Likely'] },
  { name: 'Software Engineering – SDLC', score: 73, freq: 5, tags: ['Moderate'] },
  { name: 'OOP Concepts in Java', score: 68, freq: 5, tags: ['Moderate'] },
  { name: 'Theory of Computation', score: 62, freq: 4, tags: ['Moderate'] },
  { name: 'Web Technologies – HTML/CSS', score: 55, freq: 3, tags: ['Low'] },
];

const importantFallbackTopics = [
  { name: 'DATA ANALYTICS', score: 96, freq: 34, tags: ['High Priority', 'Most Important'] },
  { name: 'ARTIFICIAL INTELLIGENCE', score: 91, freq: 24, tags: ['High Priority', '24x Seen'] },
  { name: 'COMPUTER NETWORKS', score: 86, freq: 22, tags: ['High Priority', '22x Seen'] },
  { name: 'ANALYSIS OF ALGORITHMS', score: 81, freq: 13, tags: ['Likely', '13x Seen'] },
  { name: 'GRAPHICS', score: 76, freq: 13, tags: ['Likely', '13x Seen'] },
  { name: 'DATABASE MANAGEMENT SYSTEM', score: 71, freq: 10, tags: ['Likely', '10x Seen'] },
  { name: 'CONSTITUTION OF INDIA', score: 66, freq: 6, tags: ['Moderate', '6x Seen'] },
];

const fallbackHeatmap = [
  { topic: 'Data Analytics', values: [9, 8, 9, 9], questionCount: 34 },
  { topic: 'Artificial Intelligence', values: [6, 6, 8, 8], questionCount: 24 },
  { topic: 'Computer Networks', values: [6, 5, 8, 8], questionCount: 22 },
  { topic: 'Analysis of Algorithms', values: [4, 3, 7, 7], questionCount: 13 },
  { topic: 'Computer Graphics', values: [4, 3, 7, 7], questionCount: 13 },
];

const fallbackHeatmapColumns = ['Frequency', 'Share', 'Priority', 'Confidence'];

const fallbackQuestions = [
  { question: 'b) Describe map reduce framework in detail?', topic: 'Data Analytics', difficulty: 'Medium', marks: 7, likelihood: 92 },
  { question: 'Define "Heuristic Search". Explain the steps in "Best First Search" and illustrate it.', topic: 'Artificial Intelligence', difficulty: 'Hard', marks: 10, likelihood: 89 },
  { question: 'a) What are two reasons for using layered protocols?', topic: 'Computer Networks', difficulty: 'Easy', marks: 5, likelihood: 86 },
  { question: 'a) What is dynamic programming?', topic: 'Analysis of Algorithms', difficulty: 'Easy', marks: 5, likelihood: 83 },
  { question: 'Define windowing and viewport. Derive window to viewport transformation.', topic: 'Computer Graphics', difficulty: 'Medium', marks: 7, likelihood: 80 },
];

const tabs = [
  { id: 'heatmap', label: 'Heat Map', icon: FiBarChart2 },
  { id: 'topics', label: 'Topic Ranks', icon: FiList },
  { id: 'questions', label: 'AI Questions', icon: FiFileText },
  { id: 'trends', label: 'Trends', icon: FiTrendingUp },
];

const heatColor = (v) => {
  if (v <= 2) return 'rgba(59,130,246,0.2)';
  if (v <= 4) return 'rgba(139,92,246,0.4)';
  if (v <= 6) return 'rgba(236,72,153,0.5)';
  if (v <= 8) return 'rgba(239,68,68,0.65)';
  return 'rgba(220,38,38,0.85)';
};

const diffColor = (d) => {
  if (d === 'Easy') return 'text-green-400 bg-green-500/10 border-green-500/30';
  if (d === 'Medium') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  return 'text-red-400 bg-red-500/10 border-red-500/30';
};

// Mini Bar Chart for Trends tab
const TrendsChart = () => {
  const data = [
    { year: '2020', dsa: 4, dbms: 2, os: 3, cn: 2 },
    { year: '2021', dsa: 5, dbms: 3, os: 4, cn: 3 },
    { year: '2022', dsa: 6, dbms: 5, os: 5, cn: 4 },
    { year: '2023', dsa: 7, dbms: 6, os: 6, cn: 5 },
    { year: '2024', dsa: 8, dbms: 7, os: 7, cn: 6 },
  ];
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f472b6'];
  const legends = ['DSA', 'DBMS', 'OS', 'Networks'];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        {legends.map((l, i) => (
          <div key={l} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: colors[i] }} />
            <span className="text-xs font-space text-slate-400">{l}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-3 h-52">
        {data.map((d) => (
          <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 w-full h-40">
              {[d.dsa, d.dbms, d.os, d.cn].map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="flex-1 rounded-t-sm"
                  style={{ background: `${colors[i]}90` }}
                />
              ))}
            </div>
            <span className="text-xs font-space text-slate-500">{d.year}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 font-space text-center">Question frequency per topic across years (mock data for BIAS)</p>
    </div>
  );
};

const DashboardSection = ({ user }) => {
  const [activeTab, setActiveTab] = useState('heatmap');
  const [topicRanks, setTopicRanks] = useState(importantFallbackTopics);
  const [heatmapRows, setHeatmapRows] = useState(fallbackHeatmap);
  const [heatmapColumns, setHeatmapColumns] = useState(fallbackHeatmapColumns);
  const [questionList, setQuestionList] = useState(fallbackQuestions);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  useEffect(() => {
    let mounted = true;

    fetch('/api/dashboard-insights')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load dashboard insights');
        return res.json();
      })
      .then((data) => {
        if (!mounted || !Array.isArray(data.topics) || data.topics.length === 0) return;
        setTopicRanks(data.topics.map((item, index) => ({
          name: item.topic,
          score: item.probability ?? item.score,
          freq: item.questionCount,
          percentage: item.percentage,
          tags: [
            item.priorityLabel === 'High' ? 'High Priority' : item.priorityLabel === 'Medium' ? 'Likely' : 'Low Priority',
            index === 0 ? 'Most Important' : `${item.questionCount}x Seen`,
          ],
        })));
        if (Array.isArray(data.heatmap) && data.heatmap.length > 0) setHeatmapRows(data.heatmap);
        if (Array.isArray(data.heatmapColumns) && data.heatmapColumns.length > 0) setHeatmapColumns(data.heatmapColumns);
        if (Array.isArray(data.questions) && data.questions.length > 0) setQuestionList(data.questions);
      })
      .catch(() => {
        if (mounted) setTopicRanks(importantFallbackTopics);
        if (mounted) setHeatmapRows(fallbackHeatmap);
        if (mounted) setHeatmapColumns(fallbackHeatmapColumns);
        if (mounted) setQuestionList(fallbackQuestions);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Build label for the title bar — use real user data if logged in
  const dashboardLabel = user
    ? `${user.name}'s Dashboard${user.username ? ' · @' + user.username : ''}`
    : 'padhai-dashboard / BCA_Sem4';

  return (
    <section id="dashboard" className="section relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-blue-500/30 mb-6">
            <FiTarget className="text-blue-400 text-sm" />
            <span className="text-xs font-space font-medium text-blue-300 tracking-wider uppercase">Student Dashboard</span>
          </div>
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-white mb-4">
            Your <span className="gradient-text">AI Intelligence</span> Panel
          </h2>
          {user ? (
            <p className="text-slate-400 font-space max-w-2xl mx-auto">
              Welcome back, <span className="text-white font-semibold">{user.name}</span>! Your personalised exam insights are ready below.
            </p>
          ) : (
            <p className="text-slate-400 font-space max-w-2xl mx-auto">
              Visualize topic heat maps, ranked priority lists, and AI-generated questions — all in one cinematic dashboard.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="glass-strong rounded-3xl overflow-hidden neon-border-blue"
        >
          {/* Dashboard header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-space text-slate-400 truncate max-w-xs">{dashboardLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-space text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              AI Analysis Active
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 px-6 pt-4 border-b border-white/5 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-space font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500/15 text-blue-400 border-b-2 border-blue-500'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="text-sm" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6 min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeTab === 'heatmap' && (
                <motion.div
                  key="heatmap"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-space font-semibold text-white mb-1">Topic Frequency Heat Map</h3>
                  <p className="text-xs text-slate-500 font-space mb-6">High and low probability topics from extracted previous-year questions</p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-space text-slate-500 pb-3 pr-4 min-w-56">Topic</th>
                          {heatmapColumns.map(column => (
                            <th key={column} className="text-center text-xs font-space text-slate-500 pb-3 px-2">{column}</th>
                          ))}
                          <th className="text-center text-xs font-space text-slate-500 pb-3 px-2">Questions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapRows.map((row) => {
                          const avg = (row.values.reduce((a, b) => a + b, 0) / row.values.length).toFixed(1);
                          return (
                            <tr key={row.topic}>
                              <td className="py-2 pr-4 text-sm font-space font-medium text-slate-300">{row.topic}</td>
                              {row.values.map((v, i) => (
                                <td key={i} className="py-2 px-2">
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="w-12 h-10 rounded-lg flex items-center justify-center mx-auto text-xs font-orbitron font-bold text-white cursor-pointer hover:scale-105 transition-transform"
                                    style={{ background: heatColor(v) }}
                                    title={`${heatmapColumns[i]} score: ${v}/9`}
                                  >
                                    {v}
                                  </motion.div>
                                </td>
                              ))}
                              <td className="py-2 px-2">
                                <div className="w-12 h-10 rounded-lg flex items-center justify-center mx-auto text-xs font-orbitron font-bold text-white"
                                  style={{ background: heatColor(parseFloat(avg)) }}>
                                  {row.questionCount}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-3 mt-6 flex-wrap">
                    <span className="text-xs text-slate-500 font-space">Frequency:</span>
                    {[
                      { label: '1-2 (Low)', color: 'rgba(59,130,246,0.4)' },
                      { label: '3-4 (Medium)', color: 'rgba(139,92,246,0.6)' },
                      { label: '5-7 (High)', color: 'rgba(236,72,153,0.7)' },
                      { label: '8-9 (Very High)', color: 'rgba(239,68,68,0.85)' },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-5 h-3 rounded" style={{ background: l.color }} />
                        <span className="text-xs text-slate-500 font-space">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'topics' && (
                <motion.div
                  key="topics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <h3 className="font-space font-semibold text-white mb-1">AI Priority Topic Rankings</h3>
                  <p className="text-xs text-slate-500 font-space mb-4">Top 30 topics ranked from highest to lowest probability</p>
                  {topicRanks.map((t, i) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 glass px-4 py-3 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="font-orbitron text-2xl font-bold text-slate-600 w-8 text-center">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-space font-medium text-white text-sm">{t.name}</span>
                          {t.tags.map(tag => (
                            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-space ${
                              tag === 'High Priority' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                              tag === 'Very Likely' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                              tag === 'Likely' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                              'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                            }`}>{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${t.score}%` }}
                              transition={{ duration: 1, delay: i * 0.08 }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, #3b82f6, ${t.score > 80 ? '#ec4899' : t.score > 60 ? '#8b5cf6' : '#06b6d4'})` }}
                            />
                          </div>
                          <span className="text-xs font-orbitron font-bold text-blue-400 w-10 text-right">{t.score}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 font-space">Seen</div>
                        <div className="font-orbitron font-bold text-purple-400 text-sm">{t.freq}x</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'questions' && (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-space font-semibold text-white">Exact Previous-Year Questions</h3>
                      <p className="text-xs text-slate-500 font-space mt-0.5">Minimum 30 exact questions from previous papers, sorted from higher to lower probability</p>
                    </div>
                    <div className="glass px-3 py-1.5 rounded-lg border border-blue-500/20">
                      <span className="text-xs font-space text-blue-400">{questionList.length} shown</span>
                    </div>
                  </div>
                  {questionList.map((q, i) => (
                    <motion.div
                      key={`${q.question}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass px-5 py-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="font-orbitron text-sm font-bold text-slate-600 mt-1 w-6">Q{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-orbitron shrink-0">#{i + 1}</span>
                            <p className="font-space text-slate-200 text-sm leading-relaxed">{q.question}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-space ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-space">{q.topic}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 font-space">{q.marks} Marks</span>
                            {q.year && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-space">{q.year}</span>}
                            <div className="ml-auto flex items-center gap-1">
                              <HiSparkles className="text-yellow-400 text-xs" />
                              <span className="text-[10px] font-orbitron font-bold text-yellow-400">{q.likelihood}% likely</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'trends' && (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-space font-semibold text-white mb-1">Year-Wise Topic Trend Analysis</h3>
                  <p className="text-xs text-slate-500 font-space mb-6">Question count per subject over 5 years of BIAS exam papers</p>
                  <TrendsChart />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardSection;
