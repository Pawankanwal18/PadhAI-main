import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi2';

// ── Typewriter ─────────────────────────────────────────────────────────────────
const useTypewriter = (text, speed = 28, startDelay = 900) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), startDelay); return () => clearTimeout(t); }, [startDelay]);
  useEffect(() => {
    if (!started || displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed]);
  return { displayed, done: displayed.length >= text.length };
};

const tagline = 'Predict your next exam with the power of AI — built exclusively for BIAS students.';

// ── Kinetic word reveal (scroll-driven) ───────────────────────────────────────
const KineticWord = ({ word, progress, threshold, italic, gradient }) => {
  const t = Math.max(0, Math.min(1, (progress - threshold) / 0.18));
  const ease = 1 - Math.pow(1 - t, 3);
  const inner = italic ? (
    <span style={{
      fontStyle: 'italic',
      background: gradient || 'linear-gradient(135deg, #0a0a0a 0%, #555 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    }}>{word}</span>
  ) : word;
  return (
    <span style={{
      display: 'inline-block',
      transform: `translateY(${(1 - ease) * 60}px) rotate(${(1 - ease) * 3}deg)`,
      opacity: ease,
      marginRight: '0.22em',
      transformOrigin: 'bottom center',
    }}>
      {inner}
    </span>
  );
};

// ── Floating stat card ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, x, y, delay, progress }) => {
  const t = Math.max(0, Math.min(1, (progress - delay) / 0.2));
  const ease = 1 - Math.pow(1 - t, 4);
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transform: `translate(calc(-50% + ${x}), calc(-50% + ${y})) scale(${0.75 + ease * 0.25}) translateY(${(1 - ease) * 20}px)`,
      opacity: ease,
      background: 'rgba(255,255,255,0.92)',
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: '12px',
      padding: '10px 16px',
      textAlign: 'center',
      boxShadow: '0 6px 28px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(12px)',
      minWidth: '78px',
      transition: 'none',
    }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '14px', fontWeight: 900, color: '#0a0a0a', letterSpacing: '0.04em' }}>{value}</div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px', color: '#999', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>{label}</div>
    </div>
  );
};

// ── Rotating AI sphere ─────────────────────────────────────────────────────────
const AIOrb = ({ spinProgress }) => {
  const rotation = spinProgress * 360;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ring */}
      <div style={{
        position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.07)',
        transform: `rotate(${rotation}deg)`,
      }}>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div key={i} style={{
            position: 'absolute', width: '7px', height: '7px', borderRadius: '50%',
            background: i % 2 === 0 ? '#0a0a0a' : '#ccc',
            top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translateX(189px) translateY(-50%)`,
          }} />
        ))}
      </div>
      {/* Middle ring */}
      <div style={{
        position: 'absolute', width: '290px', height: '290px', borderRadius: '50%',
        border: '1px dashed rgba(0,0,0,0.10)',
        transform: `rotate(${-rotation * 0.75}deg)`,
      }} />
      {/* Inner ring */}
      <div style={{
        position: 'absolute', width: '240px', height: '240px', borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.04)',
        transform: `rotate(${rotation * 0.5}deg)`,
      }}>
        {[45, 135, 225, 315].map((deg, i) => (
          <div key={i} style={{
            position: 'absolute', width: '4px', height: '4px', borderRadius: '50%',
            background: '#e0e0e0',
            top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translateX(119px) translateY(-50%)`,
          }} />
        ))}
      </div>
      {/* Core sphere */}
      <div style={{
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #fff 0%, #e8e8e8 40%, #0a0a0a 100%)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 30px 80px rgba(0,0,0,0.22), inset 0 2px 8px rgba(255,255,255,0.6)',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', width: '80px', height: '80px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9), transparent)',
          top: '22%', left: '22%', filter: 'blur(6px)',
        }} />
        <span style={{
          fontFamily: 'Orbitron, monospace', fontSize: '22px', fontWeight: 900,
          color: '#fff', letterSpacing: '0.06em',
          textShadow: '0 0 20px rgba(255,255,255,0.4)',
          position: 'relative', zIndex: 1, mixBlendMode: 'overlay',
        }}>AI</span>
      </div>
      {/* Drop shadow */}
      <div style={{
        position: 'absolute', bottom: '-10%', left: '10%', right: '10%',
        height: '30px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.18), transparent 70%)',
        filter: 'blur(14px)',
      }} />
    </div>
  );
};

// ── HeroSection ────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const wrapperRef = useRef(null);
  const [rawProgress, setRawProgress] = useState(0);
  const { displayed, done } = useTypewriter(tagline, 26, 800);

  // Smooth lerp target
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - el.offsetTop;
      targetProgress.current = Math.max(0, Math.min(1, scrolled / scrollable));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Lerp loop — smoothly chases targetProgress
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      const prev = currentProgress.current;
      const next = lerp(prev, targetProgress.current, 0.09);
      if (Math.abs(next - prev) > 0.0001) {
        currentProgress.current = next;
        setRawProgress(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Derived transforms ─────────────────────────────────────────────────────

  // Phase 1 (0→0.55): morph centered → split layout
  // Phase 2 (0.55→1): fade out + transition
  const p = rawProgress;

  // Orb — starts center, drifts right and slightly up
  const orbX    = p < 0.6 ? `${p * 58}%` : '34.8%';
  const orbScale = p < 0.6 ? 1 - p * 0.25 : 0.85;
  const orbY    = p < 0.6 ? `${-p * 6}%` : '-3.6%';
  // Orb spin based on scroll
  const orbSpin = p;

  // Text — starts center, moves left
  const textX   = p < 0.6 ? `${-p * 42}%` : '-25.2%';
  const textAlign = p > 0.18 ? 'left' : 'center';
  const textOpac = p > 0.82 ? 1 - (p - 0.82) * 5.88 : 1;

  // CTA + stats
  const ctaOpac = p < 0.18 ? p * 5.56 : p > 0.82 ? 1 - (p - 0.82) * 5.88 : 1;

  // Background radial follows orb
  const bgOpac  = 0.03 + p * 0.05;

  // Scroll indicator
  const scrollCueOpac = Math.max(0, 1 - p * 10);

  // Section opacity at end
  const sectionOpac = p > 0.92 ? 1 - (p - 0.92) * 12.5 : 1;

  // Stat cards: appear once split layout forms
  const statProgress = Math.max(0, (p - 0.2) / 0.5);

  return (
    <div ref={wrapperRef} style={{ height: '280vh', position: 'relative' }} id="home">

      {/* ── Sticky viewport ── */}
      <div
        style={{
          position: 'sticky', top: 0,
          height: '100vh', overflow: 'hidden',
          background: '#fff',
          opacity: sectionOpac,
        }}
      >
        {/* Grid BG */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        {/* Radial glow that tracks scroll */}
        <div style={{
          position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(0,0,0,${bgOpac}) 0%, transparent 65%)`,
          top: '50%', left: `${50 + p * 20}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', transition: 'left 0.1s linear',
        }} />

        {/* Corner decoration — top-left */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '180px', height: '180px', pointerEvents: 'none', opacity: 0.25 }}>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <line x1="0" y1="90" x2="90" y2="0" stroke="#0a0a0a" strokeWidth="0.5" />
            <line x1="0" y1="140" x2="140" y2="0" stroke="#0a0a0a" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="50" y2="0" stroke="#0a0a0a" strokeWidth="0.5" />
          </svg>
        </div>
        {/* Corner — bottom-right */}
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '180px', height: '180px', pointerEvents: 'none', opacity: 0.25, transform: 'rotate(180deg)' }}>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <line x1="0" y1="90" x2="90" y2="0" stroke="#0a0a0a" strokeWidth="0.5" />
            <line x1="0" y1="140" x2="140" y2="0" stroke="#0a0a0a" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="50" y2="0" stroke="#0a0a0a" strokeWidth="0.5" />
          </svg>
        </div>

        {/* ── Main centering flex ── */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* ── TEXT block ── */}
          <div style={{
            position: 'relative', zIndex: 2,
            width: '500px', flexShrink: 0,
            textAlign: textAlign,
            transform: `translateX(${textX})`,
            opacity: textOpac,
            padding: '0 24px',
          }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="tag-chip" style={{
                marginBottom: '28px', display: 'inline-flex',
                justifyContent: p > 0.18 ? 'flex-start' : 'center',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0a0a0a', flexShrink: 0 }} />
                Exclusively for BIAS Students
              </span>
            </motion.div>

            {/* Kinetic headline — word-by-word scroll reveal */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="font-playfair"
              style={{
                fontSize: `clamp(2.8rem, ${p < 0.3 ? 9 - p * 10 : 6}vw, ${p < 0.3 ? 7 : 5.2}rem)`,
                fontWeight: 900, color: '#0a0a0a',
                lineHeight: 1.04, letterSpacing: '-0.025em',
                marginBottom: '14px',
                transition: 'font-size 0.06s linear',
                overflow: 'hidden',
              }}
            >
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <KineticWord word="Predict" progress={1} threshold={0} />
              </span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <KineticWord word="Exams." progress={1} threshold={0} italic gradient="linear-gradient(135deg, #0a0a0a 0%, #555 100%)" />
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="font-orbitron"
              style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1.15rem)', fontWeight: 700, color: '#333', letterSpacing: '0.05em', marginBottom: '18px' }}
            >
              Smarter with AI
            </motion.div>

            {/* Animated rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.95, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              style={{
                width: '56px', height: '2px', background: '#0a0a0a',
                borderRadius: '2px', marginBottom: '22px',
                transformOrigin: p > 0.18 ? 'left' : 'center',
                marginLeft: p > 0.18 ? 0 : 'auto',
                marginRight: p > 0.18 ? 0 : 'auto',
                transition: 'margin 0.15s',
              }}
            />

            {/* Typewriter tagline */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.4 }}
              className="font-space"
              style={{ fontSize: '1rem', color: '#555', lineHeight: 1.82, maxWidth: '480px', minHeight: '3.2rem', marginBottom: '32px' }}
            >
              {displayed}
              {!done && <span className="cursor-blink" style={{ color: '#0a0a0a', fontWeight: 700 }}>|</span>}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: ctaOpac, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: p > 0.18 ? 'flex-start' : 'center', marginBottom: '36px' }}
            >
              <motion.a
                href="#upload"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-neon font-space font-semibold flex items-center gap-2"
                style={{ padding: '13px 28px', borderRadius: '10px', fontSize: '14px' }}
              >
                Start Predicting <HiArrowRight />
              </motion.a>
              <motion.a
                href="#features"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-outline-neon font-space font-semibold flex items-center gap-2"
                style={{ padding: '13px 28px', borderRadius: '10px', fontSize: '14px' }}
              >
                Explore Features
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: ctaOpac, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              style={{
                display: 'flex', gap: '28px', flexWrap: 'wrap',
                justifyContent: p > 0.18 ? 'flex-start' : 'center',
                paddingTop: '20px', borderTop: '1px solid #ebebeb',
              }}
            >
              {[{ value: '94%', label: 'Accuracy' }, { value: '10K+', label: 'Questions' }, { value: '500+', label: 'Students' }].map((s) => (
                <div key={s.label} style={{ textAlign: p > 0.18 ? 'left' : 'center' }}>
                  <div className="font-orbitron" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0a0a0a' }}>{s.value}</div>
                  <div className="font-space" style={{ fontSize: '10px', color: '#aaa', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── ORB block ── */}
          <div style={{
            position: 'absolute',
            width: '460px', height: '460px',
            transform: `translateX(${orbX}) translateY(${orbY}) scale(${orbScale})`,
            zIndex: 1, pointerEvents: 'none',
          }}>
            <AIOrb spinProgress={orbSpin} />

            {/* Floating stat cards — appear once split forms */}
            <StatCard label="Accuracy"   value="94%"  x="-80%" y="-60%" delay={0}    progress={statProgress} />
            <StatCard label="Questions"  value="10K+" x="68%"  y="-45%" delay={0.15} progress={statProgress} />
            <StatCard label="Students"   value="500+" x="62%"  y="58%"  delay={0.3}  progress={statProgress} />
            <StatCard label="Syllabus AI" value="Live" x="-85%" y="52%" delay={0.45} progress={statProgress} />
          </div>
        </div>

        {/* ── Scroll progress bar ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#f0f0f0', zIndex: 10 }}>
          <div style={{
            height: '100%', width: `${p * 100}%`, background: '#0a0a0a',
            transition: 'width 0.05s linear', transformOrigin: 'left',
          }} />
        </div>

        {/* ── Phase label — top-left ── */}
        <div style={{ position: 'absolute', top: '28px', left: '36px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <div className="font-orbitron" style={{ fontSize: '10px', fontWeight: 800, color: '#ccc', letterSpacing: '0.15em' }}>PADHAI</div>
          <div style={{ height: '1px', width: '40px', background: '#e0e0e0' }} />
          <div className="font-space" style={{ fontSize: '10px', color: '#ccc' }}>HERO</div>
        </div>


        {/* ── Mid-scroll side label ── */}
        <AnimatePresence>
          {p > 0.18 && p < 0.85 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute', right: '36px', top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10,
              }}
            >
              {['Upload', 'Analyze', 'Predict'].map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: p > 0.18 + i * 0.25 ? '#0a0a0a' : '#e0e0e0',
                    transition: 'background 0.3s',
                  }} />
                  <span className="font-space" style={{
                    fontSize: '11px',
                    color: p > 0.18 + i * 0.25 ? '#333' : '#ccc',
                    fontWeight: p > 0.18 + i * 0.25 ? 600 : 400,
                    transition: 'all 0.3s',
                  }}>{label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroSection;
