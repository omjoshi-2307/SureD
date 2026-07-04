import React from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const steps = [
  {
    num: '01',
    emoji: '🏠',
    title: 'Register Your Tenancy',
    desc: 'Sign up and register your rental property details in under 2 minutes. No paperwork, no hassle — everything is digital.',
    color: 'rgba(232,115,74,0.1)',
    border: 'rgba(232,115,74,0.2)',
  },
  {
    num: '02',
    emoji: '📋',
    title: 'Choose Your Plan',
    desc: 'Select the coverage level that perfectly suits your deposit amount and tenancy length. Flexible options for every budget.',
    color: 'rgba(240,149,107,0.1)',
    border: 'rgba(240,149,107,0.2)',
  },
  {
    num: '03',
    emoji: '🛡️',
    title: 'Stay Protected',
    desc: 'Your deposit is legally protected from day one. If a dispute arises, our expert team handles every step for you.',
    color: 'rgba(232,115,74,0.1)',
    border: 'rgba(232,115,74,0.2)',
  },
  {
    num: '04',
    emoji: '💰',
    title: 'Get Your Money Back',
    desc: "At the end of tenancy, receive your full deposit back quickly — zero delays, zero stress, fully guaranteed.",
    color: 'rgba(240,149,107,0.1)',
    border: 'rgba(240,149,107,0.2)',
  },
];

const HowItWorks: React.FC = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.12);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-label="How it works"
      style={{
        background:    '#ffffff',
        paddingTop:    112,
        paddingBottom: 112,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        {/* ── Section header ── */}
        <div className="reveal-up" style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            8,
            background:     'rgba(232,115,74,0.1)',
            border:         '1px solid rgba(232,115,74,0.22)',
            color:          '#E8734A',
            fontFamily:     "'Poppins', sans-serif",
            fontWeight:     600,
            fontSize:       '0.78rem',
            padding:        '8px 18px',
            borderRadius:   50,
            marginBottom:   20,
            letterSpacing:  '0.3px',
          }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#E8734A', display:'inline-block' }} />
            Simple Process
          </div>

          <h2 style={{
            fontFamily:    "'Poppins', sans-serif",
            fontWeight:    800,
            fontSize:      'clamp(1.8rem, 4vw, 2.6rem)',
            color:         '#1A1A1A',
            letterSpacing: '-1px',
            lineHeight:    1.15,
            marginBottom:  16,
          }}>
            How{' '}
            <span className="gradient-text">Suredeposit</span>
            {' '}Works
          </h2>

          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            fontSize:   '1.05rem',
            color:      '#6B6B6B',
            lineHeight: 1.7,
            maxWidth:   520,
            margin:     '0 auto',
          }}>
            Four simple steps to keep your deposit protected and disputes resolved fast.
          </p>
        </div>

        {/* ── Steps grid ── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap:                 28,
        }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal-up delay-${(i + 1) * 100} card-hover`}
              style={{
                background:   '#FFFFFF',
                border:       `1px solid ${step.border}`,
                borderRadius: 28,
                padding:      '40px 32px',
                display:      'flex',
                flexDirection:'column',
                gap:          20,
                position:     'relative',
                overflow:     'hidden',
                boxShadow:    '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              {/* Background glow */}
              <div style={{
                position:  'absolute',
                top:       -20,
                right:     -20,
                width:     100,
                height:    100,
                borderRadius: '50%',
                background:step.color,
                filter:    'blur(24px)',
                pointerEvents:'none',
              }} />

              {/* Step number */}
              <span style={{
                fontFamily:    "'Poppins', sans-serif",
                fontWeight:    800,
                fontSize:      '0.7rem',
                color:         '#E8734A',
                letterSpacing: '2px',
                opacity:       0.6,
              }}>
                STEP {step.num}
              </span>

              {/* Emoji icon in glass pill */}
              <div style={{
                width:          60,
                height:         60,
                borderRadius:   18,
                background:     step.color,
                border:         `1px solid ${step.border}`,
                backdropFilter: 'blur(8px)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       26,
              }}>
                {step.emoji}
              </div>

              <h3 style={{
                fontFamily:  "'Poppins', sans-serif",
                fontWeight:  700,
                fontSize:    '1.05rem',
                color:       '#1A1A1A',
                lineHeight:  1.3,
              }}>
                {step.title}
              </h3>

              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize:   '0.9rem',
                color:      '#6B6B6B',
                lineHeight: 1.75,
              }}>
                {step.desc}
              </p>

              {/* Connector arrow (desktop only, not on last) */}
              {i < steps.length - 1 && (
                <div style={{
                  position:   'absolute',
                  right:      -18,
                  top:        '50%',
                  transform:  'translateY(-50%)',
                  width:      28,
                  height:     28,
                  borderRadius:'50%',
                  background: '#FFF0EA',
                  border:     '2px solid #F0956B',
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent:'center',
                  zIndex:     5,
                }} className="hidden lg:flex" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="#E8734A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
