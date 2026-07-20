import React, { useEffect, useRef, useState } from 'react';
import Sparkle from './Sparkle';
import LogoMark from './LogoMark';

/* Deterministic star field — fixed positions so render is stable */
const STARS: Array<{ top: string; left: string; size: number; delay: number }> = [
  { top: '14%', left: '12%', size: 2, delay: 0 },
  { top: '22%', left: '82%', size: 1, delay: 0.7 },
  { top: '9%', left: '55%', size: 1, delay: 1.4 },
  { top: '30%', left: '25%', size: 1, delay: 2.1 },
  { top: '18%', left: '68%', size: 2, delay: 0.4 },
  { top: '38%', left: '90%', size: 1, delay: 1.8 },
  { top: '42%', left: '8%', size: 2, delay: 1.1 },
  { top: '6%', left: '30%', size: 1, delay: 2.5 },
  { top: '26%', left: '45%', size: 1, delay: 3.0 },
  { top: '48%', left: '78%', size: 1, delay: 0.2 },
];

const STATUS_STEPS = [
  { label: 'Created', color: '#97A0B5', state: 'done' as const },
  { label: 'Funded', color: '#2E6BFF', state: 'active' as const },
  { label: 'Confirmed', color: '#F59E0B', state: 'todo' as const },
  { label: 'Released', color: '#10B981', state: 'todo' as const },
];

/* ─── Hand-built dashboard mock (no images) ───────────────────────── */
const DashboardMock: React.FC = () => (
  <div
    style={{
      display: 'flex',
      background: '#0E0D15',
      borderRadius: '0 0 16px 16px',
      overflow: 'hidden',
      minHeight: 300,
      textAlign: 'left',
    }}
    aria-hidden="true"
  >
    {/* Slim sidebar */}
    <div
      className="hidden sm:flex"
      style={{
        width: 64,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        padding: '20px 0',
        flexShrink: 0,
      }}
    >
      <LogoMark size={26} style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.4))' }} />
      {[0.5, 0.25, 0.25, 0.25].map((op, i) => (
        <span
          key={i}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: `rgba(255,255,255,${op * 0.3})`,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </div>

    {/* Main pane */}
    <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          My escrows
        </span>
        <span
          className="mono-addr"
          style={{
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999,
            padding: '4px 10px',
          }}
        >
          GDKF…X4TQ
        </span>
      </div>

      {/* Escrow card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '0.82rem',
                color: '#fff',
              }}
            >
              Sunrise Residency, Pune
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>
              Security deposit · 11-month tenancy
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#fff',
                letterSpacing: '-0.3px',
              }}
            >
              ₹85,000
            </p>
            <p className="mono-addr" style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>
              ≈ 3,400 XLM
            </p>
          </div>
        </div>

        {/* 4-step status timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              {i > 0 && (
                <span
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      STATUS_STEPS[i - 1].state === 'done'
                        ? `linear-gradient(90deg, ${STATUS_STEPS[i - 1].color}, ${step.color})`
                        : 'rgba(255,255,255,0.12)',
                    minWidth: 12,
                  }}
                />
              )}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: step.state === 'todo' ? 'transparent' : step.color,
                    border: step.state === 'todo' ? `1.5px solid rgba(255,255,255,0.25)` : `1.5px solid ${step.color}`,
                    animation: step.state === 'active' ? 'statusPulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {step.state === 'done' && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0B0A10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span
                  className="mono-addr"
                  style={{
                    fontSize: '0.56rem',
                    color: step.state === 'todo' ? 'rgba(255,255,255,0.35)' : step.color,
                  }}
                >
                  {step.label}
                </span>
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Fee line */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
        Network fee <span className="mono-addr" style={{ color: '#A78BFA' }}>≈ ₹0.001</span> · settles in ~5s on Stellar
      </p>
    </div>
  </div>
);

/* ─── Hero ─────────────────────────────────────────────────────────── */
const Hero: React.FC = () => {
  const screenshotRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* Scroll-linked tilt: 18deg → 0 as the mock enters the viewport */
  useEffect(() => {
    const el = screenshotRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.style.transform = 'none';
      return;
    }
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the card's top is at the bottom of the screen, 1 when its center reaches ~60% viewport
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.75)));
      const angle = 18 * (1 - progress);
      el.style.transform = `perspective(1200px) rotateX(${angle}deg)`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const rise = (i: number): React.CSSProperties => ({
    animationDelay: `${i * 80}ms`,
    animationPlayState: mounted ? 'running' : 'paused',
  });

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="dl-canvas"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'clamp(48px, 8vh, 88px) 24px 0',
      }}
    >
      {/* Atmosphere: glow, horizon streaks, vignette, stars */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(900px, 120vw)',
          height: 'min(900px, 120vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.25) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div className="dl-horizon dl-horizon-left" aria-hidden="true" />
      <div className="dl-horizon dl-horizon-right" aria-hidden="true" />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="dl-star"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          aria-hidden="true"
        />
      ))}
      <div className="dl-vignette" aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* 1 — Announcement pill */}
        <div className="dl-stagger" style={rise(0)}>
          <div
            className="glass dl-shimmer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '8px 18px',
              marginBottom: 32,
            }}
          >
            <Sparkle size={13} color="#A78BFA" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
              New: Instant escrow on Stellar Soroban
            </span>
          </div>
        </div>

        {/* 2 — Headline */}
        <h1
          className="text-hero-gradient dl-stagger"
          style={{
            ...rise(1),
            fontSize: 'clamp(48px, 8vw, 88px)',
            lineHeight: 1.02,
            letterSpacing: '-3px',
            marginBottom: 24,
          }}
        >
          Your deposit.
          <br />
          Locked. Guaranteed.
        </h1>

        {/* 3 — Subhead */}
        <p
          className="dl-stagger"
          style={{
            ...rise(2),
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
            color: 'rgba(255,255,255,0.64)',
            lineHeight: 1.6,
            maxWidth: '60ch',
            marginBottom: 36,
          }}
        >
          DepositSafe holds student rental deposits in on-chain escrow — released only when both sides agree.
        </p>

        {/* 4 — CTA row */}
        <div className="dl-stagger" style={{ ...rise(3), display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          <a href="#how-it-works" className="btn-glow" style={{ fontSize: '0.95rem', padding: '14px 30px' }}>
            Start an escrow
          </a>
          <a href="#how-it-works" className="btn-glass" style={{ fontSize: '0.95rem', padding: '14px 26px' }}>
            See how it works
          </a>
        </div>
      </div>

        {/* 5 — THE VAULT */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(180px, 32vw, 300px)',
            marginTop: 8,
          }}
          aria-hidden="true"
        >
          <div
            className="dl-stagger"
            style={{
              ...rise(4),
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(520px, 80vw)',
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                animation: 'bloom 6s ease-in-out infinite',
              }}
            >
              {/* Violet bloom */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '55%',
                  transform: 'translate(-50%, -50%)',
                  width: '120%',
                  height: '150%',
                  background: 'radial-gradient(ellipse 60% 45% at center, rgba(124,92,255,0.5) 0%, rgba(124,92,255,0.18) 45%, transparent 70%)',
                  filter: 'blur(28px)',
                }}
              />
              {/* Intense white-violet horizontal light slit */}
              <div
                style={{
                  position: 'absolute',
                  left: '4%',
                  right: '4%',
                  top: '55%',
                  height: 6,
                  transform: 'translateY(-50%)',
                  borderRadius: 999,
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.85) 15%, #FFFFFF 50%, rgba(167,139,250,0.85) 85%, transparent 100%)',
                  boxShadow: '0 0 60px 12px rgba(124,92,255,0.6), 0 0 20px 4px rgba(224,215,255,0.8)',
                }}
              />
              {/* Secondary softer slit above, like an eclipse rim */}
              <div
                style={{
                  position: 'absolute',
                  left: '18%',
                  right: '18%',
                  top: '48%',
                  height: 2,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, transparent, rgba(224,215,255,0.5), transparent)',
                  filter: 'blur(2px)',
                }}
              />
            </div>

            {/* Spinning conic light ring */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '55%',
                width: 'min(400px, 62vw)',
                height: 'min(400px, 62vw)',
                marginLeft: 'calc(min(400px, 62vw) / -2)',
                marginTop: 'calc(min(400px, 62vw) / -2)',
                borderRadius: '50%',
                padding: 1,
                background:
                  'conic-gradient(from 0deg, transparent 0%, rgba(224,215,255,0.8) 10%, transparent 28%, transparent 55%, rgba(124,92,255,0.45) 72%, transparent 88%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: 'ringSpin 20s linear infinite',
              }}
            />

            {/* Ghost brand mark rising above the rim */}
            <LogoMark
              ghost
              size={92}
              style={{
                position: 'absolute',
                left: '50%',
                top: '8%',
                transform: 'translateX(-50%)',
                opacity: 0.12,
              }}
            />

            {/* Floating glass chips */}
            <div
              className="glass"
              style={{
                position: 'absolute',
                left: '2%',
                top: '18%',
                borderRadius: 999,
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E6BFF', boxShadow: '0 0 8px rgba(46,107,255,0.8)' }} />
              <span className="mono-addr" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)' }}>₹85,000 secured</span>
            </div>
            <div
              className="glass"
              style={{
                position: 'absolute',
                right: '2%',
                top: '30%',
                borderRadius: 999,
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                animation: 'float 4s ease-in-out 1.8s infinite',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="mono-addr" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)' }}>Released</span>
            </div>
          </div>
        </div>

        {/* 6 — Product screenshot emerging from the glow */}
        <div
          className="dl-stagger"
          style={{
            ...rise(5),
            width: 'min(860px, 100%)',
            marginTop: 'calc(clamp(180px, 32vw, 300px) * -0.28)',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <div
            ref={screenshotRef}
            style={{
              transform: 'perspective(1200px) rotateX(18deg)',
              transformOrigin: 'center top',
              willChange: 'transform',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              borderTop: '1px solid rgba(224,215,255,0.45)',
              background: 'rgba(255,255,255,0.03)',
              boxShadow: '0 -20px 80px rgba(124,92,255,0.25), 0 40px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Browser chrome bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
              }}
              aria-hidden="true"
            >
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
              <span
                className="mono-addr"
                style={{
                  margin: '0 auto',
                  fontSize: '0.62rem',
                  color: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 6,
                  padding: '3px 14px',
                }}
              >
                app.depositsafe.in
              </span>
            </div>
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
