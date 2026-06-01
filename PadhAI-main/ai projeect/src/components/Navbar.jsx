import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';

const navLinks = [
  { label: 'Home',         href: '#home',         num: '01' },
  { label: 'Features',    href: '#features',     num: '02' },
  { label: 'How It Works', href: '#how-it-works', num: '03' },
  { label: 'Dashboard',   href: '#dashboard',    num: '04' },
  { label: 'Contact',     href: '#contact',      num: '05' },
];

// Animated 3-line → X icon
const HamburgerIcon = ({ open, lineColor = '#0a0a0a' }) => (
  <div style={{ width: '22px', height: '16px', position: 'relative', cursor: 'pointer' }}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        animate={
          open
            ? i === 0
              ? { rotate: 45,  y: 7,  width: '100%', opacity: 1, background: lineColor }
              : i === 1
              ? { opacity: 0,  x: -8, background: lineColor }
              : { rotate: -45, y: -7, width: '100%', opacity: 1, background: lineColor }
            : { rotate: 0, y: 0, x: 0, opacity: 1, width: i === 2 ? '65%' : '100%', background: lineColor }
        }
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        style={{
          display: 'block',
          position: 'absolute',
          height: '1.8px',
          background: lineColor,
          borderRadius: '2px',
          top: i === 0 ? '0px' : i === 1 ? '7px' : '14px',
          left: 0,
          transformOrigin: 'center',
        }}
      />
    ))}
  </div>
);

const Navbar = ({ user, showAuth, onSignIn, onSignOut }) => {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [active,      setActive]      = useState('Home');
  const [hoveredIdx,  setHoveredIdx]  = useState(null);
  const [isDark,      setIsDark]      = useState(false);
  const menuRef = useRef(null);

  // ── Reliable dark-section detection ─────────────────────────────────────────
  // Strategy: check known dark section positions on every scroll tick,
  //           plus listen to a custom event from ScrollBook for its dynamic steps.
  useEffect(() => {
    // Sections whose background is always dark (add IDs here as needed)
    const DARK_SECTION_IDS = ['how-it-works'];
    let scrollBookDark = false;

    const updateDark = () => {
      // 1. Did ScrollBook signal dark?
      if (scrollBookDark) { setIsDark(true); return; }
      // 2. Is a static dark section behind the navbar (top 80px)?
      for (const id of DARK_SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          // Section overlaps navbar area (top ≤ navbar height, bottom still on screen)
          if (r.top <= 80 && r.bottom > 0) { setIsDark(true); return; }
        }
      }
      setIsDark(false);
    };

    // Listen for ScrollBook events (dark step 02 = black panel)
    const onNavDark = (e) => { scrollBookDark = e.detail.dark; updateDark(); };
    window.addEventListener('padhai-nav-dark', onNavDark);

    const onScroll = () => { setScrolled(window.scrollY > 50); updateDark(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateDark(); // run once on mount

    return () => {
      window.removeEventListener('padhai-nav-dark', onNavDark);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [menuOpen]);

  const containerVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1], staggerChildren: 0.055, delayChildren: 0.05 },
    },
    exit: {
      opacity: 0, y: -8, scale: 0.96,
      transition: { duration: 0.25, ease: [0.55, 0, 1, 0.45], staggerChildren: 0.03, staggerDirection: -1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -14, filter: 'blur(4px)' },
    visible: { opacity: 1, x: 0,   filter: 'blur(0px)', transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] } },
    exit:    { opacity: 0, x: -10, filter: 'blur(3px)', transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          transition: 'all 0.45s ease',
          background: isDark
            ? (scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.80)')
            : (scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.80)'),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`
            : '1px solid transparent',
          boxShadow: scrolled
            ? `0 2px 20px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.06)'}`
            : 'none',
          padding: scrolled ? '14px 0' : '22px 0',
        }}
      >
        <div style={{
          width: '100%',
          padding: '0 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <motion.a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }} whileHover={{ scale: 1.01 }}>
            <div style={{
              width: '36px', height: '36px',
              background: isDark ? '#ffffff' : '#0a0a0a',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.45s ease',
            }}>
              <span className="font-orbitron" style={{ color: isDark ? '#0a0a0a' : '#fff', fontSize: '14px', fontWeight: 900, transition: 'color 0.45s' }}>P</span>
            </div>
            <div>
              <div className="font-orbitron" style={{ fontSize: '16px', fontWeight: 900, color: isDark ? '#fff' : '#0a0a0a', letterSpacing: '-0.01em', transition: 'color 0.45s' }}>PadhAI</div>
              <div className="font-space" style={{ fontSize: '9px', color: isDark ? '#555' : '#aaa', marginTop: '-1px', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'color 0.45s' }}>BIAS Exclusive</div>
            </div>
          </motion.a>

          {/* Right side — auth + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Auth controls */}
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div
                  key="user-pill"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 14px 6px 8px', borderRadius: '12px',
                    background: isDark ? '#1a1a1a' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
                    boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'all 0.45s ease',
                  }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '8px',
                      background: isDark ? '#fff' : '#0a0a0a',
                      color: isDark ? '#0a0a0a' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 800, fontFamily: 'Orbitron, monospace', flexShrink: 0,
                      transition: 'all 0.45s ease',
                    }}>
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="font-space" style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#ddd' : '#0a0a0a', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.45s' }}>
                      {user.name}
                    </span>
                  </div>
                  <motion.button
                    onClick={onSignOut}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    title="Sign out"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '12px', cursor: 'pointer',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
                      background: 'transparent',
                      fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px',
                      fontWeight: 500, color: isDark ? '#888' : '#555',
                      transition: 'all 0.45s ease',
                    }}
                  >
                    <FiLogOut size={13} /> Sign Out
                  </motion.button>
                </motion.div>
              ) : !showAuth ? (
                <motion.button
                  key="sign-in"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  onClick={onSignIn}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '9px 22px', borderRadius: '12px', fontSize: '13px',
                    fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    background: isDark ? '#ffffff' : '#0a0a0a',
                    color: isDark ? '#0a0a0a' : '#ffffff',
                    border: 'none',
                    transition: 'all 0.45s ease',
                    boxShadow: isDark ? '0 4px 16px rgba(255,255,255,0.12)' : '0 4px 16px rgba(0,0,0,0.22)',
                  }}
                >
                  Sign In
                </motion.button>
              ) : null}
            </AnimatePresence>

            {/* Hamburger */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <motion.button
              id="nav-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '12px',
                border: menuOpen
                  ? `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'}`
                  : `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)'}`,
                background: menuOpen
                  ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
                  : 'transparent',
                cursor: 'pointer', transition: 'all 0.35s ease',
              }}
              aria-label="Toggle navigation menu"
            >
              <HamburgerIcon open={menuOpen} lineColor={isDark ? '#ffffff' : '#0a0a0a'} />
            </motion.button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '260px',
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.09)',
                    borderRadius: '20px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
                    overflow: 'hidden',
                    zIndex: 100,
                  }}
                >
                  {/* Header strip */}
                  <div style={{
                    padding: '16px 20px 12px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0a0a0a' }} />
                    <span className="font-orbitron" style={{ fontSize: '9px', fontWeight: 800, color: '#bbb', letterSpacing: '0.15em' }}>NAVIGATE</span>
                  </div>

                  {/* Links */}
                  <div style={{ padding: '10px 12px 12px' }}>
                    {navLinks.map((link, i) => (
                      <motion.a
                        key={link.label}
                        variants={itemVariants}
                        href={link.href}
                        onClick={() => { setActive(link.label); setMenuOpen(false); }}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '11px 12px', borderRadius: '12px',
                          textDecoration: 'none',
                          background: hoveredIdx === i ? 'rgba(0,0,0,0.04)' : active === link.label ? 'rgba(0,0,0,0.03)' : 'transparent',
                          transition: 'background 0.2s ease',
                          marginBottom: '2px',
                        }}
                      >
                        <span className="font-orbitron" style={{
                          fontSize: '9px', fontWeight: 800,
                          color: active === link.label ? '#0a0a0a' : '#ccc',
                          letterSpacing: '0.1em', minWidth: '20px',
                          transition: 'color 0.2s',
                        }}>
                          {link.num}
                        </span>
                        <span className="font-space" style={{
                          fontSize: '14px', fontWeight: active === link.label ? 600 : 500,
                          color: active === link.label ? '#0a0a0a' : '#444',
                          flex: 1,
                          transition: 'all 0.2s',
                        }}>
                          {link.label}
                        </span>
                        <motion.div
                          animate={{ x: hoveredIdx === i ? 0 : -4, opacity: hoveredIdx === i ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ color: '#0a0a0a' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6h8M6 2l4 4-4 4" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.div>
                      </motion.a>
                    ))}
                  </div>

                  {/* Footer strip */}
                  <div style={{
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    padding: '12px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span className="font-space" style={{ fontSize: '10px', color: '#ccc' }}>BIAS Exclusive Platform</span>
                    <div style={{ width: '20px', height: '20px', background: '#0a0a0a', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-orbitron" style={{ fontSize: '8px', color: '#fff', fontWeight: 900 }}>P</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>  {/* hamburger inner */}
          </div>  {/* right flex wrapper */}
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
