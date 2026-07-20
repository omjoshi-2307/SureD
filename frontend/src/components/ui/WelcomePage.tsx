import React, { useCallback, useEffect, useRef } from 'react';
import LogoMark from './LogoMark';

interface WelcomePageProps {
  onEnterLanding: () => void;
}

/**
 * Splash — a ~2s dark brand moment: the vault ring blooms out of black,
 * the wordmark fades in beneath it, then we auto-advance to the landing.
 * Click anywhere or press Escape to skip instantly.
 */
const WelcomePage: React.FC<WelcomePageProps> = ({ onEnterLanding }) => {
  const firedRef = useRef(false);

  const advance = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onEnterLanding();
  }, [onEnterLanding]);

  useEffect(() => {
    const timer = setTimeout(advance, 2200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') advance();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [advance]);

  return (
    <div
      onClick={advance}
      role="button"
      tabIndex={0}
      aria-label="DepositSafe — click to continue"
      className="dl-canvas"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'center',
        padding: 24,
      }}
    >
      {/* Edge vignette to black */}
      <div className="dl-vignette" />

      {/* The vault ring, blooming in from black */}
      <div
        style={{
          position: 'relative',
          width: 'min(360px, 70vw)',
          height: 'min(360px, 70vw)',
          animation: 'vaultBloomIn 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
          opacity: 0,
        }}
      >
        {/* Outer violet bloom */}
        <div
          style={{
            position: 'absolute',
            inset: '-30%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(124,92,255,0.35) 0%, rgba(124,92,255,0.12) 45%, transparent 70%)',
            filter: 'blur(24px)',
            animation: 'bloom 6s ease-in-out infinite',
          }}
        />
        {/* Horizontal light slit */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '-6%',
            right: '-6%',
            height: 5,
            transform: 'translateY(-50%)',
            borderRadius: 999,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.9) 18%, #FFFFFF 50%, rgba(167,139,250,0.9) 82%, transparent 100%)',
            boxShadow: '0 0 40px 8px rgba(124,92,255,0.55)',
            filter: 'blur(0.5px)',
          }}
        />
        {/* Thin spinning conic light ring */}
        <div
          style={{
            position: 'absolute',
            inset: '8%',
            borderRadius: '50%',
            padding: 1.5,
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(224,215,255,0.9) 12%, transparent 30%, transparent 60%, rgba(124,92,255,0.5) 75%, transparent 90%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'ringSpin 20s linear infinite',
          }}
        />
        {/* Brand mark at the heart of the ring */}
        <LogoMark
          size={96}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -54%)',
            filter: 'drop-shadow(0 0 22px rgba(168,85,247,0.65))',
          }}
        />
      </div>

      {/* Wordmark + tagline */}
      <div
        className="dl-stagger"
        style={{ animationDelay: '450ms', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 2 }}
      >
        <h1
          className="text-hero-gradient"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 3.6rem)', letterSpacing: '-1.5px', lineHeight: 1.05 }}
        >
          DepositSafe
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: 'rgba(255,255,255,0.64)',
          }}
        >
          Deposits, locked in trust.
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
