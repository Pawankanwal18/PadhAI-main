import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiMail, FiMessageSquare, FiSend, FiMapPin, FiPhone } from 'react-icons/fi';

const ContactSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const inputStyle = {
    width: '100%',
    background: '#f9f9f9',
    border: '1px solid #e8e8e8',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    fontFamily: 'Space Grotesk, sans-serif',
    color: '#0a0a0a',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <section id="contact" className="section section-tinted dot-pattern" style={{ position: 'relative' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <span className="tag-chip mb-5 inline-flex">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0a0a0a' }} />
            Get in Touch
          </span>
          <h2 className="font-playfair" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 900, color: '#0a0a0a', marginTop: '14px' }}>
            Have Questions? <span style={{ fontStyle: 'italic' }}>Let&apos;s Talk</span>
          </h2>
          <p className="font-space" style={{ color: '#888', maxWidth: '480px', margin: '14px auto 0', fontSize: '14px', lineHeight: 1.7 }}>
            Whether you&apos;re a BIAS student, faculty member, or just curious about PadhAI — we&apos;re happy to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              { icon: FiMail,    label: 'Email',       value: 'padhai@bias.edu.in' },
              { icon: FiMapPin,  label: 'Institution', value: 'Birla Institute of Applied Sciences, Bhimtal' },
              { icon: FiPhone,   label: 'Support',     value: 'Available for BIAS students 24/7' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="white-card card-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: '#f5f5f5', border: '1px solid #e8e8e8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon style={{ color: '#0a0a0a', fontSize: '18px' }} />
                  </div>
                  <div>
                    <div className="font-space" style={{ fontSize: '11px', color: '#aaa', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                    <div className="font-space" style={{ fontWeight: 600, color: '#0a0a0a', fontSize: '13px' }}>{item.value}</div>
                  </div>
                </div>
              );
            })}

            {/* About box */}
            <div className="white-card" style={{ padding: '24px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0a0a0a' }} />
                <span className="font-space" style={{ fontWeight: 700, color: '#0a0a0a', fontSize: '14px' }}>Built Exclusively for BIAS</span>
              </div>
              <p className="font-space" style={{ color: '#666', fontSize: '13px', lineHeight: 1.75 }}>
                PadhAI is a student-driven AI project built specifically around the BIAS curriculum,
                past exam papers, and syllabus structure — not a generic tool.
              </p>
              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
                <span className="font-space" style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>Beta access open for all BIAS students</span>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="white-card"
            style={{ padding: '32px' }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-14"
              >
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
                <h3 className="font-space" style={{ fontWeight: 700, color: '#0a0a0a', fontSize: '20px', marginBottom: '8px' }}>Message Sent</h3>
                <p className="font-space" style={{ color: '#888', fontSize: '13px' }}>We&apos;ll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-space" style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Name</label>
                    <input
                      name="name" value={form.name} onChange={handleChange} required
                      placeholder="Your name" style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#0a0a0a'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; }}
                    />
                  </div>
                  <div>
                    <label className="font-space" style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Email</label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange} required
                      placeholder="your@bias.edu.in" style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#0a0a0a'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; }}
                    />
                  </div>
                </div>
                <div>
                  <label className="font-space" style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Subject</label>
                  <input
                    name="subject" value={form.subject} onChange={handleChange} required
                    placeholder="e.g. Question about Dashboard" style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#0a0a0a'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; }}
                  />
                </div>
                <div>
                  <label className="font-space" style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Message</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange} required rows={5}
                    placeholder="Tell us how we can help..."
                    style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                    onFocus={(e) => { e.target.style.borderColor = '#0a0a0a'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; }}
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-neon font-space w-full flex items-center justify-center gap-2"
                  style={{ padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
                >
                  <FiSend style={{ fontSize: '14px' }} />
                  Send Message
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
