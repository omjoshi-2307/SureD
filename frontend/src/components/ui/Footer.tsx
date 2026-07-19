import React from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const COLUMNS: Array<{ heading: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Security', href: '#security' },
      { label: 'For Landlords', href: '#landlords' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Docs', href: '#', external: true },
      { label: 'Smart contract on GitHub', href: 'https://github.com', external: true },
      { label: 'Stellar Explorer', href: 'https://stellar.expert', external: true },
      { label: 'FAQs', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Refund policy', href: '#' },
    ],
  },
];

const SOCIALS = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
];

const ShieldMark: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2.5 L20 5.5 V11.5 C20 16.5 16.6 20.4 12 21.8 C7.4 20.4 4 16.5 4 11.5 V5.5 Z"
      fill="rgba(255,255,255,0.95)"
    />
    <path d="M9.2 11.8 L11.2 13.8 L15 9.6" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Footer: React.FC = () => {
  const ref = useScrollReveal<HTMLElement>(0.08);

  return (
    <footer
      ref={ref}
      id="landlords"
      aria-label="Footer"
      className="dl-canvas"
      style={{ position: 'relative', overflow: 'hidden', paddingTop: 88 }}
    >
      {/* ── Slim CTA band ── */}
      <div
        className="reveal-up"
        style={{
          position: 'relative',
          maxWidth: 1080,
          margin: '0 auto 72px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 24,
        }}
      >
        {/* Miniature vault glow behind the button */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(480px, 90vw)',
            height: 220,
            background: 'radial-gradient(ellipse 55% 45% at center, rgba(124,92,255,0.28) 0%, transparent 70%)',
            filter: 'blur(28px)',
            animation: 'bloom 6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '58%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(300px, 70vw)',
            height: 2,
            borderRadius: 999,
            background: 'linear-gradient(90deg, transparent, rgba(224,215,255,0.7), transparent)',
            filter: 'blur(1px)',
            pointerEvents: 'none',
          }}
        />

        <h2
          className="text-hero-gradient"
          style={{ fontSize: 'clamp(1.7rem, 4.5vw, 2.5rem)', letterSpacing: '-1px', lineHeight: 1.15, position: 'relative' }}
        >
          Ready to secure your deposit?
        </h2>
        <a href="#hero" className="btn-glow" style={{ fontSize: '0.95rem', padding: '14px 32px', position: 'relative' }}>
          Start an escrow
        </a>
      </div>

      {/* ── Columns ── */}
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '56px 24px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="reveal-up delay-100"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px 32px',
            marginBottom: 64,
          }}
        >
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(124,92,255,0.4)',
                }}
              >
                <ShieldMark />
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>
                DepositSafe
              </span>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 240 }}>
              Student rental deposits, held in on-chain escrow until both sides agree.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="glass"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.55)',
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h4
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="dl-link"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', width: 'fit-content', display: 'inline-block' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="reveal-fade delay-200"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '24px 0 32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
            © 2026 DepositSafe · Built on Stellar
          </p>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px rgba(16,185,129,0.8)',
              }}
            />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
