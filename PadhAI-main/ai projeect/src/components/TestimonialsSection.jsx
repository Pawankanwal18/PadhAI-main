import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView as useIOInView } from 'react-intersection-observer';
import { FiUsers, FiFileText, FiTarget, FiStar, FiAward, FiTrendingUp } from 'react-icons/fi';

const useCountUp = (end, duration = 2000, decimals = 0, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, end, duration, decimals]);
  return count;
};

const stats = [
  { value: 500,   suffix: '+',  label: 'BIAS Students',        icon: FiUsers,    delay: 0 },
  { value: 10000, suffix: '+',  label: 'Questions Generated',  icon: FiFileText, delay: 0.06 },
  { value: 94,    suffix: '%',  label: 'Prediction Accuracy',  icon: FiTarget,   delay: 0.12 },
  { value: 50,    suffix: '+',  label: 'Past Papers Analyzed', icon: FiFileText, delay: 0.18 },
  { value: 4.9,   suffix: '/5', label: 'Student Rating',       icon: FiStar,     decimals: 1, delay: 0.24 },
  { value: 3,     suffix: 'x',  label: 'Better Exam Scores',   icon: FiTrendingUp, delay: 0.30 },
];

const testimonials = [
  {
    name: 'Aryan Sharma',
    role: 'BCA 4th Year · BIAS',
    text: 'PadhAI predicted 7 out of 10 questions in my DBMS exam. The heat map literally showed me exactly which units to focus on. Scored 87/100.',
    rating: 5, avatar: 'AS',
  },
  {
    name: 'Priya Kumari',
    role: 'B.Tech CSE 3rd Year · BIAS',
    text: 'I uploaded my OS syllabus and got a ranked list of 48 topics with probability scores. The AI-generated questions were spot on — just like the actual paper.',
    rating: 5, avatar: 'PK',
  },
  {
    name: 'Rohit Verma',
    role: 'BCA 2nd Year · BIAS',
    text: 'The drag-and-drop upload is seamless. Within 30 seconds I had a heat map of my entire semester syllabus. This is literally the future of exam prep.',
    rating: 5, avatar: 'RV',
  },
  {
    name: 'Sneha Patel',
    role: 'B.Tech IT 4th Year · BIAS',
    text: 'The year-wise trend analysis showed that Unit 4 has appeared in every paper for 5 years. I focused there and got 20/20 in that section.',
    rating: 5, avatar: 'SP',
  },
];

const StatCard = ({ stat, index }) => {
  const [ref, inView] = useIOInView({ triggerOnce: true, threshold: 0.3 });
  const Icon = stat.icon;
  const count = useCountUp(stat.value, 2000, stat.decimals || 0, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: stat.delay }}
      className="white-card card-hover text-center"
      style={{ padding: '28px 16px' }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: '#f5f5f5', border: '1px solid #e8e8e8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <Icon style={{ color: '#0a0a0a', fontSize: '18px' }} />
      </div>
      <div className="font-orbitron" style={{ fontSize: '2rem', fontWeight: 900, color: '#0a0a0a', lineHeight: 1 }}>
        {inView ? `${count}${stat.suffix}` : '—'}
      </div>
      <div className="font-space" style={{ fontSize: '12px', color: '#888', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {stat.label}
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const [ref, inView] = useIOInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section section-light stripe-bg" style={{ position: 'relative' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <span className="tag-chip mb-5 inline-flex">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0a0a0a' }} />
            Real Impact at BIAS
          </span>
          <h2 className="font-playfair" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 900, color: '#0a0a0a', marginTop: '14px' }}>
            Numbers That <span style={{ fontStyle: 'italic' }}>Speak for Themselves</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
          {stats.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>

        {/* Testimonials header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-playfair" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: '#0a0a0a' }}>
            What <span style={{ fontStyle: 'italic' }}>BIAS Students</span> Say
          </h2>
          <p className="font-space" style={{ color: '#888', marginTop: '12px', fontSize: '14px' }}>
            Real feedback from students who aced their exams using PadhAI.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="white-card card-hover"
              style={{ padding: '28px' }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                {Array(t.rating).fill(0).map((_, idx) => (
                  <span key={idx} style={{ color: '#0a0a0a', fontSize: '14px' }}>&#9733;</span>
                ))}
              </div>
              {/* Quote */}
              <p className="font-space" style={{ color: '#444', fontSize: '14px', lineHeight: 1.75, marginBottom: '20px', fontStyle: 'italic' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Orbitron, monospace', fontWeight: 800, fontSize: '11px', color: '#fff',
                  flexShrink: 0,
                }}>{t.avatar}</div>
                <div>
                  <div className="font-space" style={{ fontWeight: 700, color: '#0a0a0a', fontSize: '14px' }}>{t.name}</div>
                  <div className="font-space" style={{ fontSize: '11px', color: '#888' }}>{t.role}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <FiAward style={{ color: '#ccc', fontSize: '18px' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
