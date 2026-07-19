import React, { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface Stat {
  /** Numeric part that counts up */
  target: number;
  /** Rendered around the number */
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}

const STATS: Stat[] = [
  { target: 2.4, prefix: '₹', suffix: ' Cr+', decimals: 1, label: 'deposits secured' },
  { target: 1200, suffix: '+', label: 'escrows completed' },
  { target: 0, label: 'funds lost' },
  { target: 5, prefix: '~', suffix: 's', label: 'settlement' },
];

const PARTNERS = ['Stellar', 'Soroban', 'Freighter'];

/* Counts from 0 to target once the element scrolls into view */
const CountUp: React.FC<{ stat: Stat }> = ({ stat }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          observer.disconnect();
          if (reduced || stat.target === 0) {
            setValue(stat.target);
            return;
          }
          const duration = 1400;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(stat.target * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.target]);

  const formatted =
    stat.decimals !== undefined
      ? value.toFixed(stat.decimals)
      : Math.round(value).toLocaleString('en-IN');

  return (
    <span ref={ref}>
      {stat.prefix ?? ''}
      {formatted}
      {stat.suffix ?? ''}
    </span>
  );
};

const TrustBanner: React.FC = () => {
  const ref = useScrollReveal<HTMLElement>(0.2);

  return (
    <section
      ref={ref}
      id="security"
      aria-label="Trust statistics"
      className="dl-canvas"
      style={{ position: 'relative', padding: '72px 24px 64px' }}
    >
      {/* 1px gradient divider separating hero from stats */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.4) 50%, transparent 100%)',
        }}
      />

      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '40px 24px',
            textAlign: 'center',
          }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className={`reveal-up delay-${(i + 1) * 100}`}>
              <span
                className="text-hero-gradient"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.25rem)', letterSpacing: '-1px', display: 'block', lineHeight: 1.1 }}
              >
                <CountUp stat={stat} />
              </span>
              <span className="dl-stat-underline" aria-hidden="true" style={{ transitionDelay: `${0.2 + i * 0.15}s` }} />
              <span
                style={{
                  display: 'block',
                  marginTop: 10,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Powered by row */}
        <div
          className="reveal-fade delay-500"
          style={{
            marginTop: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(20px, 5vw, 48px)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            Powered by
          </span>
          {PARTNERS.map((name) => (
            <span
              key={name}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1.05rem',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '-0.02em',
                cursor: 'default',
                transition: 'color 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
