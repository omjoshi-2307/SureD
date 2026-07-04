import React from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const stats = [
  { value: '£2B+',  label: 'Deposits Covered', icon: '💷' },
  { value: '100K+', label: 'Happy Renters',     icon: '😊' },
  { value: '99.8%', label: 'Success Rate',      icon: '✅' },
  { value: '24/7',  label: 'Dispute Support',   icon: '🛟' },
];

const TrustBanner: React.FC = () => {
  const ref = useScrollReveal<HTMLElement>(0.2);

  return (
    <section
      ref={ref}
      id="coverage"
      aria-label="Trust statistics"
      style={{
        background: 'linear-gradient(135deg, #E8734A 0%, #F0956B 100%)',
        padding:    '80px 0',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position:  'absolute', top:-60, left:-60,
        width:200, height:200, borderRadius:'50%',
        background:'rgba(255,255,255,0.08)', filter:'blur(40px)',
        pointerEvents:'none',
      }} />
      <div style={{
        position:  'absolute', bottom:-40, right:-40,
        width:160, height:160, borderRadius:'50%',
        background:'rgba(255,255,255,0.08)', filter:'blur(32px)',
        pointerEvents:'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap:                 32,
          textAlign:           'center',
        }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`reveal-up delay-${(i + 1) * 100}`}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 10 }}
            >
              {/* Glass icon pill */}
              <div style={{
                width:                60,
                height:               60,
                borderRadius:         20,
                background:           'rgba(255,255,255,0.18)',
                backdropFilter:       'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border:               '1px solid rgba(255,255,255,0.35)',
                display:              'flex',
                alignItems:           'center',
                justifyContent:       'center',
                fontSize:             26,
                marginBottom:         4,
              }}>
                {stat.icon}
              </div>
              <span style={{
                fontFamily:    "'Poppins', sans-serif",
                fontWeight:    800,
                fontSize:      'clamp(2rem, 4vw, 2.8rem)',
                color:         '#fff',
                letterSpacing: '-1.5px',
                lineHeight:    1,
              }}>
                {stat.value}
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize:   '0.92rem',
                color:      'rgba(255,255,255,0.8)',
                lineHeight: 1.4,
              }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
