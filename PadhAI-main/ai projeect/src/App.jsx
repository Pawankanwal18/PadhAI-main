import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import ErrorBoundary from './components/ErrorBoundary';
import ParticleCanvas from './components/ParticleCanvas';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ScrollBook from './components/ScrollBook';
import FeaturesSection from './components/FeaturesSection';
import UploadSection from './components/UploadSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  // ── Restore session ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('padhai_user');
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // ── Lenis smooth scroll — the buttery inertia effect from the video ──────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,          // Higher = more inertia / slower damping
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
      smooth: true,
      smoothTouch: false,     // Keep native touch scroll on mobile
      touchMultiplier: 2,
    });

    // Lenis needs to tick on every animation frame
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    // Sync Lenis scroll position to global scroll events (for our scroll listeners)
    lenis.on('scroll', ({ scroll }) => {
      // Dispatch a synthetic scroll event so our components can listen normally
      window.dispatchEvent(new Event('scroll'));
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // ── Scroll-reveal IntersectionObserver ──────────────────────────────────
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
    const targets = document.querySelectorAll(selectors);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleLogin  = (userData) => { setUser(userData); setShowAuth(false); };
  const handleLogout = () => {
    localStorage.removeItem('padhai_token');
    localStorage.removeItem('padhai_user');
    setUser(null);
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      {/* Particle background */}
      <ErrorBoundary><ParticleCanvas /></ErrorBoundary>

      {/* Auth overlay */}
      {showAuth && (
        <ErrorBoundary>
          <AuthPage onClose={() => setShowAuth(false)} onLogin={handleLogin} />
        </ErrorBoundary>
      )}

      {/* ── Page content ── */}
      <div className="relative z-10 w-full">
        <ErrorBoundary>
          <Navbar
            user={user}
            showAuth={showAuth}
            onSignIn={() => setShowAuth(true)}
            onSignOut={handleLogout}
          />
        </ErrorBoundary>
        <ErrorBoundary><HeroSection /></ErrorBoundary>

        {/* ── Sticky scroll-driven book section (the Lenis + scroll animation) ── */}
        <ErrorBoundary><ScrollBook /></ErrorBoundary>

        <ErrorBoundary><FeaturesSection /></ErrorBoundary>
        <ErrorBoundary><UploadSection /></ErrorBoundary>
        <ErrorBoundary><HowItWorksSection /></ErrorBoundary>
        <ErrorBoundary><TestimonialsSection /></ErrorBoundary>
        <ErrorBoundary><ContactSection /></ErrorBoundary>
        <ErrorBoundary><Footer /></ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
