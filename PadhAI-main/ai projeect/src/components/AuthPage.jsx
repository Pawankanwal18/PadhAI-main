import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiAtSign, FiEye, FiEyeOff, FiArrowLeft, FiArrowRight, FiCheck, FiAlertCircle, FiX } from 'react-icons/fi';

// ── Animated Puzzle Canvas ─────────────────────────────────────────────────────
const PuzzleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const COLS = 5, ROWS = 7;
    const pw = W / COLS, ph = H / ROWS;
    const TAB = 0.22;

    // Build pieces
    const pieces = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        pieces.push({
          c, r,
          x: c * pw + pw / 2, y: r * ph + ph / 2,
          tx: c * pw + pw / 2, ty: r * ph + ph / 2,
          ox: (Math.random() - 0.5) * W * 1.6,
          oy: (Math.random() - 0.5) * H * 1.6,
          delay: Math.random() * 2.5,
          placed: false,
          opacity: 0,
          // tab directions: 1=out, -1=in, 0=flat per side [top,right,bottom,left]
          tabs: [
            r === 0 ? 0 : (Math.random() > 0.5 ? 1 : -1),
            c === COLS - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
            r === ROWS - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
            c === 0 ? 0 : (Math.random() > 0.5 ? 1 : -1),
          ],
        });
      }
    }

    // Draw single puzzle piece path
    function drawPiece(ctx, cx, cy, w, h, tabs) {
      const [top, right, bottom, left] = tabs;
      const t = TAB;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, cy - h / 2);
      // top
      ctx.lineTo(cx - w * 0.25, cy - h / 2);
      if (top !== 0) { ctx.bezierCurveTo(cx - w * 0.15, cy - h / 2 - h * t * top, cx + w * 0.15, cy - h / 2 - h * t * top, cx + w * 0.25, cy - h / 2); }
      else { ctx.lineTo(cx + w * 0.25, cy - h / 2); }
      ctx.lineTo(cx + w / 2, cy - h / 2);
      // right
      ctx.lineTo(cx + w / 2, cy - h * 0.25);
      if (right !== 0) { ctx.bezierCurveTo(cx + w / 2 + w * t * right, cy - h * 0.15, cx + w / 2 + w * t * right, cy + h * 0.15, cx + w / 2, cy + h * 0.25); }
      else { ctx.lineTo(cx + w / 2, cy + h * 0.25); }
      ctx.lineTo(cx + w / 2, cy + h / 2);
      // bottom
      ctx.lineTo(cx + w * 0.25, cy + h / 2);
      if (bottom !== 0) { ctx.bezierCurveTo(cx + w * 0.15, cy + h / 2 + h * t * bottom, cx - w * 0.15, cy + h / 2 + h * t * bottom, cx - w * 0.25, cy + h / 2); }
      else { ctx.lineTo(cx - w * 0.25, cy + h / 2); }
      ctx.lineTo(cx - w / 2, cy + h / 2);
      // left
      ctx.lineTo(cx - w / 2, cy + h * 0.25);
      if (left !== 0) { ctx.bezierCurveTo(cx - w / 2 - w * t * left, cy + h * 0.15, cx - w / 2 - w * t * left, cy - h * 0.15, cx - w / 2, cy - h * 0.25); }
      else { ctx.lineTo(cx - w / 2, cy - h * 0.25); }
      ctx.lineTo(cx - w / 2, cy - h / 2);
      ctx.closePath();
    }

    let startTime = null;
    const ASSEMBLE_DUR = 4000;
    const HOLD_DUR = 1500;
    const SCATTER_DUR = 2000;
    let phase = 'assemble'; // assemble → hold → scatter → assemble

    function animate(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      ctx.clearRect(0, 0, W, H);

      // Gradient bg
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0a0a0a');
      bg.addColorStop(1, '#111118');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid dots
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let x = 0; x < W; x += 28) for (let y = 0; y < H; y += 28) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }

      let allPlaced = true;
      pieces.forEach(p => {
        const pieceElapsed = Math.max(0, elapsed - p.delay * 400);
        let prog = 0;

        if (phase === 'assemble') {
          prog = Math.min(1, pieceElapsed / ASSEMBLE_DUR);
          const ease = 1 - Math.pow(1 - prog, 3);
          p.x = p.ox + (p.tx - p.ox) * ease;
          p.y = p.oy + (p.ty - p.oy) * ease;
          p.opacity = Math.min(1, prog * 2);
          if (prog < 1) allPlaced = false;
        } else if (phase === 'scatter') {
          prog = Math.min(1, pieceElapsed / SCATTER_DUR);
          const ease = prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2;
          p.x = p.tx + (p.ox - p.tx) * ease;
          p.y = p.ty + (p.oy - p.ty) * ease;
          p.opacity = Math.max(0, 1 - prog * 1.5);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity * 0.85;
        drawPiece(ctx, p.x, p.y, pw * 0.92, ph * 0.92, p.tabs);
        ctx.clip();

        // Piece gradient fill
        const grad = ctx.createLinearGradient(p.x - pw / 2, p.y - ph / 2, p.x + pw / 2, p.y + ph / 2);
        grad.addColorStop(0, `hsl(${220 + p.c * 8 + p.r * 3},18%,16%)`);
        grad.addColorStop(1, `hsl(${230 + p.c * 8 + p.r * 3},14%,12%)`);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();

        // Stroke
        ctx.save();
        ctx.globalAlpha = p.opacity * 0.6;
        drawPiece(ctx, p.x, p.y, pw * 0.92, ph * 0.92, p.tabs);
        ctx.strokeStyle = `hsla(${220 + p.c * 10},40%,60%,0.25)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      // Phase transitions
      if (phase === 'assemble' && allPlaced && elapsed > ASSEMBLE_DUR + 500) {
        if (elapsed > ASSEMBLE_DUR + 500 + HOLD_DUR) {
          phase = 'scatter';
          startTime = ts;
          pieces.forEach(p => { p.ox = (Math.random() - 0.5) * W * 1.8; p.oy = (Math.random() - 0.5) * H * 1.8; });
        }
      } else if (phase === 'scatter' && elapsed > SCATTER_DUR + 300) {
        phase = 'assemble';
        startTime = ts;
        pieces.forEach(p => { p.x = p.ox; p.y = p.oy; });
      }

      requestAnimationFrame(animate);
    }
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

// ── Input Field ────────────────────────────────────────────────────────────────
const Field = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, toggle, showPw, onToggle, hint }) => (
  <div>
    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'Space Grotesk,sans-serif' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }}>
        <Icon size={14} />
      </div>
      <input
        type={toggle ? (showPw ? 'text' : 'password') : type}
        value={value} onChange={onChange} placeholder={placeholder} required
        style={{ width: '100%', paddingLeft: '40px', paddingRight: toggle ? '40px' : '14px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '10px', fontFamily: 'Space Grotesk,sans-serif', fontSize: '14px', color: '#0a0a0a', background: '#f9f9f9', border: '1.5px solid #e8e8e8', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s,box-shadow 0.2s' }}
        onFocus={e => { e.target.style.borderColor = '#0a0a0a'; e.target.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.07)'; }}
        onBlur={e => { e.target.style.borderColor = '#e8e8e8'; e.target.style.boxShadow = 'none'; }}
      />
      {toggle && (
        <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}>
          {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
      )}
    </div>
    {hint && <p style={{ fontSize: '10px', color: '#aaa', marginTop: '4px', fontFamily: 'Space Grotesk,sans-serif' }}>{hint}</p>}
  </div>
);

// ── Password strength ──────────────────────────────────────────────────────────
const PwStrength = ({ pw }) => {
  if (!pw) return null;
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= score ? colors[score] : '#e8e8e8', transition: 'background 0.3s' }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: '#aaa', fontFamily: 'Space Grotesk,sans-serif' }}>{'8+ chars · Uppercase · Number · Special'}</span>
        {score > 0 && <span style={{ fontSize: '10px', fontWeight: 700, color: colors[score], fontFamily: 'Space Grotesk,sans-serif' }}>{labels[score]}</span>}
      </div>
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
const AuthPage = ({ onClose, onLogin }) => {
  const [mode, setMode]       = useState('signin');
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: '', username: '', email: '', password: '', confirm: '' });

  const upd = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(''); };

  const validate = () => {
    if (mode === 'signup') {
      if (!form.name.trim()) return 'Enter your full name.';
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) return 'Username: 3-20 chars, letters/numbers/_ only.';
      if (!/^[^\s@]+@gmail\.com$/i.test(form.email)) return 'Only @gmail.com emails accepted.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirm) return 'Passwords do not match.';
    } else {
      if (!form.username.trim()) return 'Enter your username.';
      if (!form.password) return 'Enter your password.';
    }
    return null;
  };

  const submit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const url = mode === 'signup' ? '/api/register' : '/api/login';
      const body = mode === 'signup'
        ? { name: form.name, username: form.username, email: form.email, password: form.password }
        : { username: form.username, password: form.password };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await res.text();
      if (!text) throw new Error('Server returned empty response. Is the backend running?');
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('padhai_token', data.token);
      localStorage.setItem('padhai_user', JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onLogin?.(data.user); onClose?.(); }, 1000);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = m => { setMode(m); setError(''); setForm({ name: '', username: '', email: '', password: '', confirm: '' }); setShowPw(false); setShowCf(false); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(16px)' }}>

      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.23,1,0.32,1] }}
        style={{ display: 'flex', width: '900px', maxWidth: '96vw', height: '580px', maxHeight: '96vh', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}>

        {/* ── LEFT: Puzzle Panel ── */}
        <div style={{ flex: '0 0 42%', position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
          <PuzzleCanvas />

          {/* Overlay text */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '36px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '4px 12px', marginBottom: '14px', width: 'fit-content' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>BIAS EXCLUSIVE</span>
            </div>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '10px' }}>
              Piece together<br /><span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>your exam success</span>
            </h2>
            <p style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              AI-powered predictions built from 10+ years of BIAS past papers.
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              {[['2.4K+','Students'],['94%','Accuracy'],['Free','Forever']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '14px', fontWeight: 800, color: '#fff' }}>{v}</div>
                  <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#0a0a0a', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '10px', color: '#fff', fontWeight: 800 }}>P</span>
              </div>
              <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '13px', fontWeight: 800, color: '#0a0a0a' }}>PadhAI</span>
            </div>
            {onClose && (
              <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '0', margin: '20px 28px 0', background: '#f5f5f5', borderRadius: '10px', padding: '3px' }}>
            {[['signin','Sign In'],['signup','Sign Up']].map(([id,lbl]) => (
              <button key={id} onClick={() => switchMode(id)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk,sans-serif', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: mode === id ? '#0a0a0a' : 'transparent', color: mode === id ? '#fff' : '#888' }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Form body */}
          <div style={{ padding: '24px 28px 28px', flex: 1 }}>
            {/* Heading */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '22px', fontWeight: 900, color: '#0a0a0a', marginBottom: '4px' }}>
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '12px', color: '#999' }}>
                {mode === 'signin' ? 'Sign in with your username & password' : 'Join BIAS students using AI exam intelligence'}
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                  <FiAlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '12px', color: '#dc2626' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.form key={mode} onSubmit={submit} initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {mode === 'signup' && (
                  <Field icon={FiUser} label="Full Name" value={form.name} onChange={upd('name')} placeholder="Your full name" />
                )}

                <Field icon={FiAtSign} label="Username" value={form.username} onChange={upd('username')} placeholder={mode === 'signup' ? 'e.g. rahul_sharma' : 'your_username'}
                  hint={mode === 'signup' ? '3-20 chars — letters, numbers, _ only' : undefined} />

                {mode === 'signup' && (
                  <Field icon={FiMail} label="Email" type="email" value={form.email} onChange={upd('email')} placeholder="yourname@gmail.com" hint="Only @gmail.com accepted" />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Field icon={FiLock} label="Password" toggle showPw={showPw} onToggle={() => setShowPw(p => !p)} value={form.password} onChange={upd('password')} placeholder={mode === 'signup' ? 'Create a strong password' : 'Your password'} />
                  {mode === 'signup' && <PwStrength pw={form.password} />}
                </div>

                {mode === 'signup' && (
                  <Field icon={FiLock} label="Confirm Password" toggle showPw={showCf} onToggle={() => setShowCf(p => !p)} value={form.confirm} onChange={upd('confirm')} placeholder="Re-enter password" />
                )}

                {mode === 'signin' && (
                  <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                    <button type="button" style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '11px', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <motion.button type="submit" disabled={loading || success} whileTap={{ scale: 0.98 }}
                  style={{ marginTop: '4px', padding: '13px', borderRadius: '10px', border: 'none', cursor: loading || success ? 'not-allowed' : 'pointer', background: success ? '#22c55e' : '#0a0a0a', color: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.3s' }}>
                  {loading ? (
                    <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Processing...</>
                  ) : success ? (
                    <><FiCheck /> Done!</>
                  ) : (
                    <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <FiArrowRight /></>
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: '10px', color: '#ccc' }}>SECURE · ENCRYPTED</span>
              <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AuthPage;
