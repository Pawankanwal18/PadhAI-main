import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FiUploadCloud, FiCpu, FiTarget, FiTrendingUp,
  FiLayers, FiGrid, FiFileText, FiZap
} from 'react-icons/fi';

const features = [
  { icon: FiUploadCloud, title: 'Syllabus Upload',          description: 'Drag & drop your PDF syllabus. Our OCR engine extracts text with 99%+ accuracy and maps it to structured topic graphs instantly.', num: '01', delay: 0 },
  { icon: FiCpu,         title: 'AI Topic Prediction',      description: 'LLM-powered semantic analysis scans your syllabus against historical papers to rank topics by probability of appearing in exams.', num: '02', delay: 0.08 },
  { icon: FiGrid,        title: 'Heat Map Visualization',   description: 'Visual heat maps reveal high-frequency topics across years. Instantly see which chapters are exam hotspots and allocate study time smartly.', num: '03', delay: 0.16 },
  { icon: FiFileText,    title: 'Question Generation',      description: 'Generate probable exam questions at multiple difficulty levels — MCQs, short answers, and essays — directly from your BIAS syllabus.', num: '04', delay: 0.24 },
  { icon: FiTrendingUp,  title: 'Year-Wise Trends',         description: 'Analyze 5+ years of BIAS past papers. Discover recurring patterns, topic weights, and predict which units are most likely to be tested.', num: '05', delay: 0.32 },
  { icon: FiLayers,      title: 'Semantic Mapping',         description: 'Vector embedding maps your syllabus topics in multi-dimensional space, uncovering hidden relationships between chapters and subtopics.', num: '06', delay: 0.40 },
  { icon: FiTarget,      title: 'Priority Topic Ranking',   description: 'AI ranks every topic by importance using frequency analysis, recency bias, and mark distribution patterns from BIAS exam history.', num: '07', delay: 0.48 },
  { icon: FiZap,         title: 'Instant AI Insights',      description: 'Real-time AI feedback while you study. Get contextual explanations, key formulas, and revision tips tied to high-probability topics.', num: '08', delay: 0.56 },
];

const FeatureCard = ({ feature }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: feature.delay, ease: [0.23, 1, 0.32, 1] }}
      className="card-hover white-card group"
      style={{ padding: '28px', cursor: 'default', borderRadius: '16px' }}
    >
      {/* Number + icon row */}
      <div className="flex items-start justify-between mb-5">
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ color: '#fff', fontSize: '18px' }} />
        </div>
        <span className="font-orbitron" style={{ fontSize: '11px', color: '#ddd', fontWeight: 800, letterSpacing: '0.08em' }}>
          {feature.num}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-space" style={{ fontSize: '15px', fontWeight: 700, color: '#0a0a0a', marginBottom: '10px' }}>
        {feature.title}
      </h3>

      {/* Description */}
      <p className="font-space" style={{ fontSize: '13px', color: '#666', lineHeight: 1.7 }}>
        {feature.description}
      </p>

      {/* Learn more */}
      <div className="font-space" style={{
        marginTop: '18px', fontSize: '12px', fontWeight: 600,
        color: '#0a0a0a', display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        Learn more
        <motion.span
          className="group-hover:translate-x-1"
          style={{ display: 'inline-block', transition: 'transform 0.2s' }}
        >
          &rarr;
        </motion.span>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="features" className="section section-tinted dot-pattern">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="tag-chip mb-6 inline-flex">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0a0a0a', flexShrink: 0 }} />
            AI-Powered Features
          </span>
          <h2 className="font-playfair" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 900, color: '#0a0a0a', margin: '16px 0 20px' }}>
            Everything You Need to{' '}
            <span style={{ fontStyle: 'italic' }}>Ace Your Exams</span>
          </h2>
          <p className="font-space" style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>
            PadhAI combines OCR, vector databases, and large language models to give BIAS students an unfair advantage in exam preparation.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => <FeatureCard key={f.title} feature={f} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
