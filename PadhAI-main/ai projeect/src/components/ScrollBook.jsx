import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud, FiCpu, FiBookOpen,
  FiCheck, FiTrendingUp, FiTarget,
} from 'react-icons/fi';

const SCENES = [
  {
    id: 0, step: '01', tag: 'Upload',
    heading: 'Drop Your Syllabus PDF',
    sub: 'OCR · Extraction · Indexing',
    body: 'Our engine reads your BIAS syllabus PDF using high-accuracy OCR, then maps every topic, unit, and chapter into a structured knowledge graph in seconds.',
    icon: FiUploadCloud,
    bg: '#ffffff', fg: '#0a0a0a', mutedFg: '#999',
    visual: {
      label: 'SYLLABUS', sublabel: 'BIAS 2025',
      items: ['Unit 1 · Data Structures', 'Unit 2 · Algorithms', 'Unit 3 · OS Concepts', 'Unit 4 · Networks'],
    },
    badge: { text: '99% OCR Accuracy', icon: FiCheck },
  },
  {
    id: 1, step: '02', tag: 'AI Analysis',
    heading: 'AI Maps Every Topic',
    sub: 'LLM · Vector DB · Semantic RAG',
    body: 'PadhAI cross-references your syllabus against 10+ years of BIAS past papers stored in a vector database, scoring every topic by exam probability.',
    icon: FiCpu,
    bg: '#0a0a0a', fg: '#ffffff', mutedFg: '#555',
    visual: {
      label: 'HEATMAP', sublabel: 'Topic Frequency',
      items: ['🔴 Sorting Algorithms  91%', '🔴 Deadlocks & OS       87%', '🟡 Graph Traversal     72%', '🟢 Memory Management  45%'],
    },
    badge: { text: '94% Prediction Rate', icon: FiTrendingUp },
  },
  {
    id: 2, step: '03', tag: 'Results',
    heading: 'Get Your Question Bank',
    sub: 'MCQ · Short Ans · Descriptive',
    body: 'Receive a ranked bank of AI-generated probable exam questions — each with marks, difficulty level, and a likelihood score. Study what actually matters.',
    icon: FiBookOpen,
    bg: '#f5f5f5', fg: '#0a0a0a', mutedFg: '#999',
    visual: {
      label: 'QUESTION BANK', sublabel: 'AI Generated',
      items: ['Q1 · Explain Deadlock [5 marks]', 'Q2 · Compare BFS vs DFS [4 marks]', 'Q3 · Write Dijkstra algo [8 marks]', 'Q4 · OS scheduling [6 marks]'],
    },
    badge: { text: '127 Questions Ready', icon: FiTarget },
  },
];

/* ── Visual card on right ── */
const SceneCard = ({ scene }) => {
  const Icon = scene.icon;
  const BadgeIcon = scene.badge.icon;
  const isLight = scene.bg !== '#0a0a0a';

  return (
    <div style={{
      width: '300px',
      background: isLight ? '#0a0a0a' : '#ffffff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
    }}>
      <div style={{
        background: isLight ? '#111' : '#f5f5f5',
        padding: '20px 22px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '8px', fontWeight: 800, color: isLight ? '#555' : '#aaa', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '5px' }}>{scene.visual.sublabel}</div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '14px', fontWeight: 900, color: isLight ? '#fff' : '#0a0a0a', letterSpacing: '0.04em' }}>{scene.visual.label}</div>
        </div>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: isLight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon style={{ color: isLight ? '#fff' : '#0a0a0a', fontSize: '17px' }} />
        </div>
      </div>

      <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scene.visual.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              padding: '8px 12px', borderRadius: '9px',
              background: isLight ? (i === 0 ? '#1a1a1a' : '#151515') : (i === 0 ? '#f0f0f0' : '#f8f8f8'),
              border: `1px solid ${isLight ? '#252525' : 'rgba(0,0,0,0.06)'}`,
              fontFamily: 'Space Grotesk,sans-serif',
              fontSize: '11px', color: isLight ? (i === 0 ? '#fff' : '#888') : (i === 0 ? '#0a0a0a' : '#666'),
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {item}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: isLight ? '#fff' : '#0a0a0a',
            borderRadius: '100px', padding: '7px 14px', marginTop: '4px', width: 'fit-content',
          }}
        >
          <BadgeIcon style={{ color: isLight ? '#0a0a0a' : '#fff', fontSize: '10px' }} />
          <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '10px', color: isLight ? '#0a0a0a' : '#fff', fontWeight: 600 }}>
            {scene.badge.text}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

/* ── Each step panel — radially revealed ── */
const StepPanel = ({ scene, isActive, sceneIdx }) => {
  const Icon = scene.icon;
  const isLight = scene.bg !== '#0a0a0a';

  return (
    <motion.div
      key={scene.id}
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 1 }}
      animate={isActive
        ? { clipPath: 'circle(150% at 50% 50%)', opacity: 1 }
        : { clipPath: 'circle(0% at 50% 50%)', opacity: 1 }
      }
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: 'absolute', inset: 0,
        background: scene.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background watermark number */}
      <div style={{
        position: 'absolute',
        fontFamily: 'Orbitron,monospace',
        fontSize: 'clamp(200px, 30vw, 380px)',
        fontWeight: 900,
        color: isLight ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.04)',
        lineHeight: 1,
        right: '-40px', bottom: '-60px',
        userSelect: 'none', pointerEvents: 'none',
        letterSpacing: '-0.05em',
      }}>
        {scene.step}
      </div>

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: isLight
          ? 'linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)'
          : 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }} />

      {/* Two-column content */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 'clamp(48px, 8vw, 120px)',
        padding: '80px 60px 60px',
        width: '100%', maxWidth: '1100px',
        position: 'relative', zIndex: 2,
      }}>

        {/* LEFT — text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: '0 0 420px' }}
        >
          {/* Step pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.10)'}`,
            borderRadius: '100px', padding: '5px 14px', marginBottom: '26px',
          }}>
            <Icon style={{ color: scene.fg, fontSize: '11px' }} />
            <span style={{
              fontFamily: 'Space Grotesk,sans-serif', fontSize: '10px',
              fontWeight: 700, color: scene.mutedFg,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Step {scene.step} · {scene.tag}
            </span>
          </div>

          {/* Heading */}
          <h2 style={{
            fontFamily: 'Playfair Display,serif',
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            fontWeight: 900, color: scene.fg,
            lineHeight: 1.08, letterSpacing: '-0.025em',
            marginBottom: '10px',
          }}>
            {scene.heading}
          </h2>

          <div style={{
            fontFamily: 'Orbitron,monospace', fontSize: '9px',
            fontWeight: 800, color: scene.mutedFg,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '18px',
          }}>
            {scene.sub}
          </div>

          <div style={{
            width: '44px', height: '2px',
            background: scene.fg, borderRadius: '2px', marginBottom: '18px',
          }} />

          <p style={{
            fontFamily: 'Space Grotesk,sans-serif',
            fontSize: '14px', color: scene.mutedFg, lineHeight: 1.85, maxWidth: '380px',
            marginBottom: '32px',
          }}>
            {scene.body}
          </p>

          {/* Step tracker pills */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {SCENES.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                opacity: i === scene.id ? 1 : 0.3,
                transition: 'opacity 0.3s',
              }}>
                <div style={{
                  width: i === scene.id ? '24px' : '6px', height: '6px',
                  borderRadius: '3px',
                  background: i <= scene.id ? scene.fg : scene.mutedFg,
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                }} />
                {i === scene.id && (
                  <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '11px', color: scene.mutedFg, fontWeight: 600 }}>
                    {s.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: '0 0 auto' }}
        >
          <SceneCard scene={scene} />
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ── Main ScrollBook ── */
const ScrollBook = () => {
  const wrapperRef = useRef(null);
  const rafRef = useRef(null);
  const rawRef = useRef(0);
  const smoothRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - el.offsetTop;
      rawRef.current = Math.max(0, Math.min(1, scrolled / scrollable));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const LERP = 0.09;
    const dispatch = (dark) =>
      window.dispatchEvent(new CustomEvent('padhai-nav-dark', { detail: { dark } }));

    const loop = () => {
      const diff = rawRef.current - smoothRef.current;
      if (Math.abs(diff) > 0.0002) {
        smoothRef.current += diff * LERP;
        const p = smoothRef.current;
        setProgress(p);

        const newIdx = Math.min(SCENES.length - 1, Math.floor(p * SCENES.length));
        setSceneIdx(prev => {
          if (prev !== newIdx) setPrevIdx(prev);
          return newIdx;
        });

        // Tell Navbar: dark only when inside this section AND on the black step (id=1)
        const inSection = p > 0 && p < 1;
        dispatch(inSection && SCENES[newIdx].bg === '#0a0a0a');
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: '450vh', position: 'relative' }}>

      {/* ── Sticky viewport ── */}
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
      }}>
        {/* Render all panels; only active one is clip-revealed */}
        {SCENES.map((scene, i) => (
          <StepPanel
            key={scene.id}
            scene={scene}
            isActive={i === sceneIdx}
            sceneIdx={sceneIdx}
          />
        ))}

        {/* ── Top HUD ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 48px', zIndex: 30,
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '11px', fontWeight: 800, color: SCENES[sceneIdx].mutedFg, letterSpacing: '0.16em', transition: 'color 0.5s' }}>
              {String(sceneIdx + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
            </div>
            <div style={{ height: '1px', width: '40px', background: SCENES[sceneIdx].mutedFg, transition: 'background 0.5s', opacity: 0.4 }} />
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '11px', color: SCENES[sceneIdx].mutedFg, letterSpacing: '0.05em', transition: 'color 0.5s' }}>PADHAI</div>
          </div>

          {/* Pill nav */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {SCENES.map((s, i) => (
              <div key={i} style={{
                padding: '5px 12px', borderRadius: '100px',
                background: i === sceneIdx ? SCENES[sceneIdx].fg : 'transparent',
                border: `1px solid ${i === sceneIdx ? SCENES[sceneIdx].fg : SCENES[sceneIdx].mutedFg}`,
                fontFamily: 'Space Grotesk,sans-serif', fontSize: '10px', fontWeight: 600,
                color: i === sceneIdx ? SCENES[sceneIdx].bg : SCENES[sceneIdx].mutedFg,
                transition: 'all 0.35s ease',
                opacity: i === sceneIdx ? 1 : 0.4,
              }}>
                {s.tag}
              </div>
            ))}
          </div>
        </div>

        {/* ── Full progress bar ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', zIndex: 40, background: 'rgba(128,128,128,0.1)' }}>
          <div style={{
            height: '100%',
            background: SCENES[sceneIdx].fg,
            width: `${progress * 100}%`,
            transition: 'width 0.05s linear, background 0.5s ease',
          }} />
        </div>
      </div>
    </div>
  );
};

export default ScrollBook;
