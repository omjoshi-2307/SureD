import React, { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface Step {
  num: string;
  status: string;
  color: string;
  title: string;
  icon: React.ReactNode;
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const STEPS: Step[] = [
  {
    num: '01',
    status: 'CREATED',
    color: '#97A0B5',
    title: 'Student picks a property & opens the escrow',
    icon: (
      <svg {...iconProps} stroke="#97A0B5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="12" x2="12" y2="18" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    num: '02',
    status: 'FUNDED',
    color: '#2E6BFF',
    title: 'Deposit locks into the Stellar smart contract',
    icon: (
      <svg {...iconProps} stroke="#2E6BFF">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    num: '03',
    status: 'CONFIRMED',
    color: '#F59E0B',
    title: 'Landlord confirms the tenancy',
    icon: (
      <svg {...iconProps} stroke="#F59E0B">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
  {
    num: '04',
    status: 'RELEASED',
    color: '#10B981',
    title: 'The contract releases funds automatically',
    icon: (
      <svg {...iconProps} stroke="#10B981">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    ),
  },
];

/* Dotted connector that draws itself on scroll, with a glowing traveling dot */
const ConnectorPath: React.FC<{ drawn: boolean; animate: boolean }> = ({ drawn, animate }) => (
  <svg
    viewBox="0 0 1000 40"
    preserveAspectRatio="none"
    aria-hidden="true"
    style={{
      position: 'absolute',
      top: 56,
      left: '10%',
      width: '80%',
      height: 40,
      overflow: 'visible',
      pointerEvents: 'none',
    }}
  >
    <path
      d="M 0 20 C 170 -8, 330 48, 500 20 C 670 -8, 830 48, 1000 20"
      stroke="rgba(124,92,255,0.45)"
      strokeWidth="2"
      strokeDasharray="1 14"
      strokeLinecap="round"
      fill="none"
      pathLength={1000}
      style={{
        // Second dash layer controls the draw: mask via dashoffset over full length
        strokeDashoffset: drawn ? 0 : 1000,
        transition: 'stroke-dashoffset 2.2s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    />
    {animate && (
      <circle r="4" fill="#E0D7FF" style={{ filter: 'drop-shadow(0 0 6px rgba(124,92,255,0.9))' }}>
        <animateMotion
          dur="7s"
          repeatCount="indefinite"
          path="M 0 20 C 170 -8, 330 48, 500 20 C 670 -8, 830 48, 1000 20"
        />
      </circle>
    )}
  </svg>
);

const HowItWorks: React.FC = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.12);
  const pathAnchorRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    setMotionOk(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = pathAnchorRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setDrawn(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-label="How it works"
      className="dl-canvas"
      style={{ position: 'relative', padding: 'clamp(72px, 10vw, 112px) 24px' }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Header */}
        <div className="reveal-up" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            className="glass"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '7px 16px',
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#A78BFA',
                boxShadow: '0 0 8px rgba(124,92,255,0.8)',
              }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              HOW IT WORKS
            </span>
          </div>

          <h2
            className="text-hero-gradient"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-1.5px', lineHeight: 1.1 }}
          >
            Four steps. Zero trust required.
          </h2>
        </div>

        {/* Steps row + connector */}
        <div ref={pathAnchorRef} style={{ position: 'relative' }}>
          <div className="hidden lg:block">
            <ConnectorPath drawn={drawn} animate={motionOk && drawn} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 20,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`glass dl-card-hover reveal-up delay-${(i + 1) * 100}`}
                style={{
                  borderRadius: 20,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Icon in a status-tinted glow circle */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${step.color}22 0%, transparent 70%)`,
                    border: `1px solid ${step.color}44`,
                    boxShadow: `0 0 20px ${step.color}33, 0 0 32px rgba(124,92,255,0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step.icon}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mono-addr" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                    {step.num}
                  </span>
                  <span
                    className="mono-addr"
                    style={{ fontSize: '0.7rem', fontWeight: 600, color: step.color, letterSpacing: '0.1em' }}
                  >
                    {step.status}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.55,
                  }}
                >
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer line */}
        <div
          className="reveal-up delay-500"
          style={{
            marginTop: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: 'rgba(255,255,255,0.64)' }}>
            Neither party can touch funds mid-escrow. Not even us.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="dl-arrow-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '0.9rem',
              color: '#A78BFA',
              textDecoration: 'none',
            }}
          >
            Read the contract
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
