import React, { useEffect, useRef } from 'react';
import Sparkle from './Sparkle';

/* ─── Dotted Journey Path ─────────────────────────────────────────── */
const DottedPath: React.FC = () => (
  <svg
    className="dotted-path"
    viewBox="0 0 500 460"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M 70 400 Q 140 310 200 220 Q 268 118 390 55"
      stroke="rgba(255,255,255,0.9)"
      strokeWidth="2.5"
      strokeDasharray="7 9"
      strokeLinecap="round"
      fill="none"
    />
    {[
      { cx: 110, cy: 350 },
      { cx: 168, cy: 262 },
      { cx: 244, cy: 165 },
      { cx: 316, cy: 105 },
    ].map((pt, i) => (
      <circle key={i} cx={pt.cx} cy={pt.cy} r="5.5" fill="white" opacity="0.85" />
    ))}
    {/* Start dot */}
    <circle cx="70" cy="400" r="12" fill="rgba(232,115,74,0.3)" />
    <circle cx="70" cy="400" r="8"  fill="#E8734A" />
    <circle cx="70" cy="400" r="4"  fill="white" />
    {/* End dot */}
    <circle cx="390" cy="55" r="8"  fill="rgba(255,255,255,0.5)" />
    <circle cx="390" cy="55" r="4"  fill="white" />
  </svg>
);

/* ─── Glass Floating Card ─────────────────────────────────────────── */
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: string;
}> = ({ children, className = '', style, delay = '0s' }) => (
  <div
    className={`glass ${className}`}
    style={{
      position:             'absolute',
      borderRadius:         20,
      padding:              '14px 18px',
      display:              'flex',
      alignItems:           'center',
      gap:                  12,
      animation:            `float 4s ease-in-out ${delay} infinite`,
      boxShadow:            '0 12px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.8)',
      zIndex:               10,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ─── Hero Section ────────────────────────────────────────────────── */
const Hero: React.FC = () => {
  const leftRef  = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  /* Trigger hero animations on mount */
  useEffect(() => {
    const timer = setTimeout(() => {
      leftRef.current?.classList.add('animated');
      setTimeout(() => rightRef.current?.classList.add('animated'), 200);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero"
      style={{
        maxWidth:    1280,
        margin:      '0 auto',
        padding:     '100px 48px 80px',
      }}
    >
      {/* ═══ Two-column flex layout ═══ */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            72,
        flexWrap:       'wrap',
      }}>

        {/* ════ LEFT COLUMN ════ */}
        <div
          ref={leftRef}
          className="reveal-left"
          style={{
            flex:         '1 1 420px',
            maxWidth:     520,
            display:      'flex',
            flexDirection:'column',
            gap:          32,
          }}
        >
          {/* Eyebrow pill */}
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            8,
            background:     'rgba(232,115,74,0.1)',
            border:         '1px solid rgba(232,115,74,0.25)',
            color:          '#E8734A',
            fontFamily:     "'Poppins', sans-serif",
            fontWeight:     600,
            fontSize:       '0.8rem',
            padding:        '8px 18px',
            borderRadius:   50,
            width:          'fit-content',
            backdropFilter: 'blur(8px)',
            letterSpacing:  '0.3px',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#E8734A',
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(232,115,74,0.2)',
            }} />
            #1 Deposit Protection Service
          </div>

          {/* Main heading — centered vertically between top & image */}
          <div style={{ position: 'relative' }}>
            {/* Decorative sparkles */}
            <span style={{ position: 'absolute', top: -24, left: -12 }}>
              <Sparkle size={18} color="#E8734A" />
            </span>
            <span style={{ position: 'absolute', top: 0, right: 24 }}>
              <Sparkle size={11} color="#F0956B" />
            </span>

            <h1 style={{
              fontFamily:    "'Poppins', sans-serif",
              fontWeight:    900,
              fontSize:      'clamp(3rem, 5.5vw, 4.2rem)',
              lineHeight:    1.08,
              color:         '#1A1A1A',
              letterSpacing: '-2px',
            }}>
              Renting &amp;
              <br />
              <span className="gradient-text">Deposits</span>
            </h1>
          </div>

          {/* Sub-heading */}
          <p style={{
            fontFamily:  "'Poppins', sans-serif",
            fontWeight:  400,
            fontSize:    '1.125rem',
            color:       '#5A5A5A',
            lineHeight:  1.75,
            maxWidth:    400,
          }}>
            A perfect guide to keeping your rental deposit safe, transparent,
            and fully protected — every step of the way.
          </p>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <a
              href="#pricing"
              className="btn-shimmer"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            12,
                color:          '#fff',
                fontFamily:     "'Poppins', sans-serif",
                fontWeight:     700,
                fontSize:       '0.95rem',
                letterSpacing:  '0.4px',
                padding:        '16px 16px 16px 28px',
                borderRadius:   50,
                textDecoration: 'none',
                boxShadow:      '0 8px 28px rgba(232,115,74,0.45)',
                transition:     'transform 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(-3px) scale(1.02)';
                el.style.boxShadow = '0 16px 40px rgba(232,115,74,0.55)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'none';
                el.style.boxShadow = '0 8px 28px rgba(232,115,74,0.45)';
              }}
            >
              GET STARTED
              <span style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                width:           40,
                height:          40,
                borderRadius:    '50%',
                background:      'rgba(255,255,255,0.25)',
                backdropFilter:  'blur(8px)',
                flexShrink:      0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </a>

            <a
              href="#how-it-works"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            8,
                fontFamily:     "'Poppins', sans-serif",
                fontWeight:     600,
                fontSize:       '0.9rem',
                color:          '#3A3A3A',
                textDecoration: 'none',
                transition:     'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E8734A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3A3A3A')}
            >
              <span style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                width:           36,
                height:          36,
                borderRadius:    '50%',
                border:          '2px solid #E0E0E0',
                transition:      'border-color 0.2s',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              How it works
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display:       'flex',
            alignItems:    'center',
            gap:           0,
            marginTop:     8,
            paddingTop:    24,
            borderTop:     '1px solid #ECECEC',
          }}>
            {[
              { val: '100K+', label: 'Protected' },
              { val: '£2B+',  label: 'Covered'   },
              { val: '4.9★',  label: 'Rating'     },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && (
                  <div style={{ width: 1, height: 36, background: '#ECECEC', margin: '0 28px' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{
                    fontFamily:    "'Poppins', sans-serif",
                    fontWeight:    800,
                    fontSize:      '1.25rem',
                    color:         '#1A1A1A',
                    letterSpacing: '-0.5px',
                  }}>{s.val}</span>
                  <span style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize:   '0.75rem',
                    color:      '#8A8A8A',
                    letterSpacing: '0.3px',
                  }}>{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div
          ref={rightRef}
          className="reveal-right"
          style={{
            flex:        '1 1 400px',
            maxWidth:    520,
            position:    'relative',
            minHeight:   460,
          }}
        >
          {/* Background glow blob */}
          <div style={{
            position:     'absolute',
            top:          -40,
            right:        -40,
            width:        300,
            height:       300,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(232,115,74,0.18) 0%, transparent 70%)',
            filter:       'blur(40px)',
            pointerEvents:'none',
            zIndex:       0,
          }} />
          <div style={{
            position:     'absolute',
            bottom:       -20,
            left:         -20,
            width:        200,
            height:       200,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(240,149,107,0.12) 0%, transparent 70%)',
            filter:       'blur(32px)',
            pointerEvents:'none',
            zIndex:       0,
          }} />

          {/* Sparkles */}
          <span style={{ position:'absolute', top: -16, right: 60, zIndex: 12 }}>
            <Sparkle size={22} color="#E8734A" />
          </span>
          <span style={{ position:'absolute', top: 40, right: -12, zIndex: 12 }}>
            <Sparkle size={13} color="#F0956B" />
          </span>
          <span style={{ position:'absolute', bottom: 60, left: -20, zIndex: 12 }}>
            <Sparkle size={17} color="#E8734A" />
          </span>
          <span style={{ position:'absolute', bottom: -8, left: '40%', zIndex: 12 }}>
            <Sparkle size={10} color="#F0956B" />
          </span>

          {/* Main image */}
          <div style={{
            position:     'relative',
            borderRadius: '40px 40px 40px 96px',
            overflow:     'hidden',
            boxShadow:    '0 32px 80px rgba(0,0,0,0.18)',
            zIndex:       2,
          }}>
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=900&auto=format&fit=crop"
              alt="Modern apartment building"
              style={{
                width:      '100%',
                height:     460,
                objectFit:  'cover',
                display:    'block',
              }}
            />
            {/* Inner gradient overlay */}
            <div style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(145deg, rgba(26,26,26,0.15) 0%, rgba(0,0,0,0.3) 100%)',
              pointerEvents:'none',
            }} />

            {/* Dotted journey path */}
            <DottedPath />
          </div>

          {/* ── Floating glass card: Deposit Protected ── */}
          <GlassCard
            delay="0s"
            style={{ top: 32, right: -24, minWidth: 195 }}
          >
            {/* Orange pulse dot */}
            <span style={{
              width:      10,
              height:     10,
              borderRadius: '50%',
              background: '#E8734A',
              boxShadow:  '0 0 0 4px rgba(232,115,74,0.2)',
              flexShrink: 0,
            }} />
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=80&h=80&auto=format&fit=crop&crop=face"
              alt="Renter"
              style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover', border:'2.5px solid #fff', flexShrink:0 }}
            />
            <div>
              <p style={{
                fontFamily:  "'Poppins', sans-serif",
                fontWeight:  700,
                fontSize:    '0.82rem',
                color:       '#1A1A1A',
                lineHeight:  1.2,
                whiteSpace:  'nowrap',
              }}>Deposit Protected</p>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize:   '0.75rem',
                color:      '#6B6B6B',
              }}>$2,000</p>
            </div>
          </GlassCard>

          {/* ── Floating glass card: 100k renters ── */}
          <GlassCard
            delay="1.8s"
            style={{ bottom: 32, right: -20, minWidth: 210 }}
          >
            {/* Stacked avatars */}
            <div style={{ display:'flex', alignItems:'center' }}>
              {[
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=80&h=80&auto=format&fit=crop&crop=face',
              ].map((src, i) => (
                <img key={i} src={src} alt={`Renter ${i+1}`}
                  style={{
                    width:      30,
                    height:     30,
                    borderRadius:'50%',
                    objectFit:  'cover',
                    border:     '2.5px solid white',
                    marginLeft:  i === 0 ? 0 : -9,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            <div>
              <p style={{
                fontFamily:    "'Poppins', sans-serif",
                fontWeight:    800,
                fontSize:      '1rem',
                color:         '#1A1A1A',
                lineHeight:    1.1,
                letterSpacing: '-0.3px',
              }}>100k+</p>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize:   '0.72rem',
                color:      '#6B6B6B',
                whiteSpace: 'nowrap',
              }}>Deposits protected</p>
            </div>
          </GlassCard>

          {/* ── Floating glass card: Live protection badge ── */}
          <GlassCard
            delay="0.9s"
            style={{ top: '42%', left: -28, zIndex:11 }}
          >
            <span style={{ fontSize: 20 }}>🔒</span>
            <div>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize:   '0.78rem',
                color:      '#1A1A1A',
                whiteSpace: 'nowrap',
              }}>Live Protection</p>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize:   '0.68rem',
                color:      '#6B6B6B',
                whiteSpace: 'nowrap',
              }}>Active coverage 24/7</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default Hero;
