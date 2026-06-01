import React, { useEffect, useRef } from 'react';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const activeRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    const handleResize = () => setSize();
    window.addEventListener('resize', handleResize);

    // Pause when tab is hidden — prevents GPU overload
    const handleVisibility = () => {
      activeRef.current = document.visibilityState === 'visible';
      if (activeRef.current && !animationRef.current) draw();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Reduced counts — 18 nodes, 30 particles
    const nodes = Array.from({ length: 16 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.2 + 0.4,
      color: '0,0,0',
      phase: Math.random() * Math.PI * 2,
    }));

    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(Math.random() * 0.22 + 0.04),
      r: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.10 + 0.03,
      color: '0,0,0',
      life: Math.random(),
      decay: Math.random() * 0.002 + 0.0006,
    }));

    const draw = () => {
      if (!activeRef.current) {
        animationRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,0,0,${(1 - d / 160) * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        n.phase += 0.016;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = canvas.width;
        if (n.x > canvas.width) n.x = 0;
        if (n.y < 0) n.y = canvas.height;
        if (n.y > canvas.height) n.y = 0;
        n.vx *= 0.999;
        n.vy *= 0.999;

        const pulsedR = Math.max(0.1, n.r + Math.sin(n.phase) * 0.8);
        const alpha = 0.10 + Math.sin(n.phase) * 0.06;
        const glowR = Math.max(0.1, pulsedR * 4);

        // Soft glow (smaller radius)
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        g.addColorStop(0, `rgba(${n.color},${alpha})`);
        g.addColorStop(1, `rgba(${n.color},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulsedR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},${alpha + 0.15})`;
        ctx.fill();
      });

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0 || p.y < -10) {
          particles[i] = {
            x: Math.random() * canvas.width,
            y: canvas.height + 5,
            vx: (Math.random() - 0.5) * 0.18,
            vy: -(Math.random() * 0.3 + 0.05),
            r: Math.random() * 1.0 + 0.2,
            opacity: Math.random() * 0.10 + 0.03,
            color: '0,0,0',
            life: 1,
            decay: Math.random() * 0.002 + 0.0006,
          };
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity * p.life})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default ParticleCanvas;
