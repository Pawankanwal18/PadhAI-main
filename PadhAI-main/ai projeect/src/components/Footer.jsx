import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiMail } from 'react-icons/fi';

const footerLinks = {
  Product:   ['Features', 'Dashboard', 'How It Works', 'Upload', 'Pricing'],
  Resources: ['Documentation', 'API Reference', 'Release Notes', 'Status', 'Blog'],
  Institute: ['About BIAS', 'Faculty', 'Curriculum', 'Research', 'Contact'],
  Legal:     ['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'FERPA Compliance'],
};

const socials = [
  { icon: FiGithub,    label: 'GitHub',    href: '#' },
  { icon: FiTwitter,   label: 'Twitter',   href: '#' },
  { icon: FiLinkedin,  label: 'LinkedIn',  href: '#' },
  { icon: FiInstagram, label: 'Instagram', href: '#' },
  { icon: FiMail,      label: 'Email',     href: '#contact' },
];

const Footer = () => (
  <footer style={{ background: '#0a0a0a', paddingTop: '80px', paddingBottom: '32px', position: 'relative', overflow: 'hidden' }}>
    {/* Subtle grid */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
    }} />

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: '36px', height: '36px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-orbitron" style={{ color: '#0a0a0a', fontSize: '14px', fontWeight: 900 }}>P</span>
            </div>
            <div>
              <div className="font-orbitron" style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>PadhAI</div>
              <div className="font-space" style={{ fontSize: '9px', color: '#555', marginTop: '-1px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>BIAS Exclusive</div>
            </div>
          </div>
          <p className="font-space" style={{ color: '#666', fontSize: '13px', lineHeight: 1.75, marginBottom: '24px', maxWidth: '260px' }}>
            AI-powered exam predictor built exclusively for Birla Institute of Applied Sciences students.
          </p>
          <div className="flex gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <motion.a
                  key={s.label} href={s.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  style={{
                    width: '34px', height: '34px',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#161616', border: '1px solid #2a2a2a', color: '#666',
                    transition: 'color 0.2s, border-color 0.2s',
                    textDecoration: 'none',
                  }}
                  title={s.label}
                >
                  <Icon style={{ fontSize: '14px' }} />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <div className="font-space" style={{ fontWeight: 700, color: '#fff', fontSize: '12px', marginBottom: '16px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {title}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="font-space" style={{ color: '#555', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#aaa'}
                    onMouseLeave={(e) => e.target.style.color = '#555'}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: '#ffffff', borderRadius: '16px',
          padding: '48px', marginBottom: '40px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Dot pattern inside banner */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="tag-chip mb-5 inline-flex">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0a0a0a' }} />
            Free for all BIAS Students
          </span>
          <h3 className="font-playfair" style={{ fontSize: '2rem', fontWeight: 900, color: '#0a0a0a', margin: '12px 0 10px' }}>
            Ready to Predict Your Next Exam?
          </h3>
          <p className="font-space" style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
            Upload your syllabus and get AI-powered predictions in under 30 seconds.
          </p>
          <motion.a
            href="#upload"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon font-space inline-flex items-center gap-2"
            style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
          >
            Get Started — It's Free
          </motion.a>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px',
        paddingTop: '20px', borderTop: '1px solid #1a1a1a',
      }}>
        <div className="font-space" style={{ fontSize: '12px', color: '#444' }}>
          © 2024 PadhAI. Built for BIAS students. All rights reserved.
        </div>
        <div className="font-space flex items-center gap-1.5" style={{ fontSize: '12px', color: '#444' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          Powered by Google Gemini · React · Three.js
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
