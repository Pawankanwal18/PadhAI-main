import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiCpu, FiDatabase, FiZap, FiTarget, FiCheckCircle } from 'react-icons/fi';

const steps = [
  {
    step: '01', icon: FiFileText,
    title: 'Upload Your Syllabus',
    description: 'Drop your BIAS syllabus PDF. Our OCR engine extracts every topic, table, and bullet point with 99%+ accuracy — even from scanned images.',
    details: ['PDF parsing', 'Image-to-text OCR', 'Structure preservation', 'Noise filtering'],
  },
  {
    step: '02', icon: FiDatabase,
    title: 'AI Maps Your Topics',
    description: 'Topics are embedded into vector space and matched against 5+ years of BIAS past papers. Semantic similarity reveals which concepts keep appearing.',
    details: ['Topic embedding', 'Semantic clustering', 'Vector indexing', 'Similarity scoring'],
  },
  {
    step: '03', icon: FiCpu,
    title: 'LLM Finds the Patterns',
    description: 'A RAG-powered LLM cross-references your syllabus with historical papers, computing probability scores for every unit and identifying exam trends.',
    details: ['RAG retrieval', 'Pattern detection', 'Frequency analysis', 'Trend modeling'],
  },
  {
    step: '04', icon: FiTarget,
    title: 'Prediction Scores Generated',
    description: 'Every topic gets an AI probability score based on recency, frequency, unit weightage, and semantic overlap with historically tested concepts.',
    details: ['Probability scoring', 'Recency bias', 'Weightage analysis', 'Confidence intervals'],
  },
  {
    step: '05', icon: FiZap,
    title: 'Questions Are Written',
    description: 'GPT-4 Turbo writes probable exam questions at multiple difficulty levels — MCQs, short-answer, long-answer — matched to your BIAS syllabus structure.',
    details: ['MCQ generation', 'Descriptive Qs', 'Difficulty levels', 'Mark weightage'],
  },
  {
    step: '06', icon: FiCheckCircle,
    title: 'Your Dashboard Goes Live',
    description: 'Everything lands on your dashboard: heat maps, ranked predictions, AI-generated questions, and year-wise trend charts — ready in seconds.',
    details: ['Heat map viz', 'Topic ranking', 'Question bank', 'Export PDF'],
  },
];

// Lerp helper
const lerp = (a, b, t) => a + (b - a) * t;

const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0); // 0→1 within current step
  const [globalProgress, setGlobalProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top;
      const total = section.offsetHeight - window.innerHeight;
      const raw = Math.max(0, Math.min(1, scrolled / total));
      setGlobalProgress(raw);

      // Which step are we on?
      const stepFloat = raw * steps.length;
      const idx = Math.min(steps.length - 1, Math.floor(stepFloat));
      const within = stepFloat - idx; // 0→1 within this step
      setActiveStep(idx);
      setStepProgress(within);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const step = steps[activeStep];
  const Icon = step.icon;

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{ height: `${steps.length * 100}vh`, position: 'relative' }}
    >
      {/* ── Sticky viewport ── */}
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        {/* Top progress bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#1a1a1a', zIndex: 10 }}>
          <motion.div
            style={{
              height: '100%', background: '#fff',
              width: `${globalProgress * 100}%`,
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        {/* Main content area */}
        <div style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          position: 'relative', zIndex: 1,
        }}>

          {/* ── LEFT: Step number + indicator ── */}
          <div style={{
            borderRight: '1px solid #161616',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'flex-start',
            padding: '0 60px 0 80px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Background watermark number */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`bg-${activeStep}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 'clamp(180px, 28vw, 320px)',
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.025)',
                  lineHeight: 1,
                  right: '-40px', bottom: '-40px',
                  userSelect: 'none', pointerEvents: 'none',
                  letterSpacing: '-0.05em',
                }}
              >
                {step.step}
              </motion.div>
            </AnimatePresence>

            {/* Section label */}
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '10px',
              fontWeight: 800, color: '#333', letterSpacing: '0.18em',
              textTransform: 'uppercase', marginBottom: '28px',
            }}>
              AI Workflow · {step.step}/{steps.length.toString().padStart(2, '0')}
            </div>

            {/* Large step number */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`num-${activeStep}`}
                  initial={{ y: 60, opacity: 0, filter: 'blur(20px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -60, opacity: 0, filter: 'blur(20px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                    fontWeight: 900, color: '#fff',
                    lineHeight: 0.9, letterSpacing: '-0.03em',
                  }}
                >
                  {step.step}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step dots */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '36px' }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: '3px',
                    width: i === activeStep ? '28px' : '10px',
                    borderRadius: '2px',
                    background: i === activeStep ? '#fff' : i < activeStep ? '#444' : '#222',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              ))}
            </div>

            {/* Step mini-progress within current step */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '60px', height: '1px', background: '#1e1e1e', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  background: '#555',
                  width: `${stepProgress * 100}%`,
                  transition: 'width 0.05s linear',
                }} />
              </div>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', color: '#333', letterSpacing: '0.05em' }}>
                Keep scrolling
              </span>
            </div>
          </div>

          {/* ── RIGHT: Step content ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '0 80px 0 60px',
            position: 'relative', overflow: 'hidden',
          }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`content-${activeStep}`}
                initial={{ x: 80, opacity: 0, filter: 'blur(10px)' }}
                animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ x: -80, opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Icon */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: '#161616', border: '1px solid #252525',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '28px',
                }}>
                  <Icon style={{ color: '#fff', fontSize: '22px' }} />
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900, color: '#fff',
                  lineHeight: 1.15, marginBottom: '20px',
                  letterSpacing: '-0.02em',
                }}>
                  {step.title}
                </h2>

                {/* Description */}
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#555', fontSize: '15px', lineHeight: 1.8,
                  marginBottom: '32px', maxWidth: '480px',
                }}>
                  {step.description}
                </p>

                {/* Detail tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {step.details.map((d, di) => (
                    <motion.span
                      key={d}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + di * 0.07, duration: 0.4 }}
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '12px', fontWeight: 500, color: '#444',
                        background: '#141414', border: '1px solid #222',
                        borderRadius: '8px', padding: '6px 14px',
                      }}
                    >
                      {d}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Vertical step list on far right */}
            <div style={{
              position: 'absolute', right: '28px', top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '4px', height: '4px', borderRadius: '50%',
                    background: i === activeStep ? '#fff' : i < activeStep ? '#333' : '#1e1e1e',
                    transition: 'all 0.3s ease',
                    boxShadow: i === activeStep ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom label */}
        <div style={{
          padding: '16px 80px',
          borderTop: '1px solid #111',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 1,
        }}>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', fontWeight: 800, color: '#2a2a2a', letterSpacing: '0.18em' }}>
            PADHAI — HOW IT WORKS
          </span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px', color: '#2a2a2a' }}>
            Step {activeStep + 1} of {steps.length}
          </span>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
