import React from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

interface Plan {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  hero?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Student Basic',
    price: 'Free',
    cadence: '',
    features: ['Create escrows', 'Wallet payments', 'On-chain receipt'],
    cta: 'Start free',
  },
  {
    name: 'Standard',
    price: '₹499',
    cadence: 'per escrow',
    features: ['Priority support', 'Dispute assistance', 'PDF receipts'],
    cta: 'Choose Standard',
    hero: true,
  },
  {
    name: 'Landlord Pro',
    price: '₹1,999',
    cadence: '/yr',
    features: ['Unlimited incoming escrows', 'Analytics', 'Multi-property'],
    cta: 'Go Pro',
  },
];

const CheckIcon: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#A78BFA"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlanCard: React.FC<{ plan: Plan; index: number }> = ({ plan, index }) => {
  const card = (
    <article
      className={`dl-card-hover ${plan.hero ? '' : 'glass'}`}
      aria-label={plan.name}
      style={{
        borderRadius: 20,
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        height: '100%',
        ...(plan.hero
          ? {
              background:
                'linear-gradient(rgba(18,15,30,0.92), rgba(18,15,30,0.92)) padding-box, linear-gradient(135deg, #7C5CFF, #A78BFA) border-box',
              border: '1.5px solid transparent',
              boxShadow: 'inset 0 0 48px rgba(124,92,255,0.12), 0 0 40px rgba(124,92,255,0.18)',
              position: 'relative' as const,
            }
          : {}),
      }}
    >
      {plan.hero && (
        <span
          className="glass"
          style={{
            position: 'absolute',
            top: -13,
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: 999,
            padding: '5px 14px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            color: '#E0D7FF',
            whiteSpace: 'nowrap',
          }}
        >
          Most popular
        </span>
      )}

      <div>
        <h3
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 14,
          }}
        >
          {plan.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="text-hero-gradient" style={{ fontSize: '2.3rem', letterSpacing: '-1px', lineHeight: 1 }}>
            {plan.price}
          </span>
          {plan.cadence && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
              {plan.cadence}
            </span>
          )}
        </div>
        <p
          className="mono-addr"
          style={{ marginTop: 8, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}
        >
          + ₹0.001 network fee
        </p>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {plan.features.map((feature) => (
          <li
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>

      <a
        href="#hero"
        className={plan.hero ? 'btn-glow' : 'btn-glass'}
        style={{ width: '100%', padding: '13px', fontSize: '0.9rem' }}
        aria-label={`${plan.cta} — ${plan.name}`}
      >
        {plan.cta}
      </a>
    </article>
  );

  return (
    <div
      className={`reveal-up delay-${(index + 1) * 100}`}
      style={plan.hero ? { transform: 'scale(1.04)', zIndex: 1 } : undefined}
    >
      {card}
    </div>
  );
};

const PlansCarousel: React.FC = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.1);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      aria-label="Pricing"
      className="dl-canvas"
      style={{ position: 'relative', padding: 'clamp(72px, 10vw, 112px) 24px' }}
    >
      <div style={{ maxWidth: 1020, margin: '0 auto' }}>
        <div className="reveal-up" style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2
            className="text-hero-gradient"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}
          >
            Simple, honest fees.
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: 'rgba(255,255,255,0.55)' }}>
            Pay for support when you want it — the escrow itself costs almost nothing.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        <p
          className="reveal-fade delay-400"
          style={{
            marginTop: 40,
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          Every fee shown before you sign.
        </p>
      </div>
    </section>
  );
};

export default PlansCarousel;
