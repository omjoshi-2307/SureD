import React, { useRef } from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const plans = [
  {
    id: 1,
    name: 'Basic Plan',
    coverage: '12 Month Coverage',
    reviews: 70,
    price: '£9',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop',
    badge: 'Most Popular',
    badgeColor: '#E8734A',
  },
  {
    id: 2,
    name: 'Standard Plan',
    coverage: '12 Month Coverage',
    reviews: 70,
    price: '£19',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop',
    badge: null,
    badgeColor: '',
  },
  {
    id: 3,
    name: 'Premium Plan',
    coverage: '12 Month Coverage',
    reviews: 70,
    price: '£35',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop',
    badge: 'Best Value',
    badgeColor: '#9B59B6',
  },
  {
    id: 4,
    name: 'Enterprise Plan',
    coverage: '12 Month Coverage',
    reviews: 70,
    price: '£59',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
    badge: null,
    badgeColor: '',
  },
  {
    id: 5,
    name: 'Family Plan',
    coverage: '12 Month Coverage',
    reviews: 70,
    price: '£49',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop',
    badge: null,
    badgeColor: '',
  },
];

/* ─── Star Rating ─────────────────────────────────────────────────── */
const Stars: React.FC<{ count?: number; reviews: number }> = ({ count = 5, reviews }) => (
  <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
    <div style={{ display:'flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#E8734A" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
    <span style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 400,
      fontSize:   '0.75rem',
      color:      '#8A8A8A',
    }}>({reviews} Reviews)</span>
  </div>
);

/* ─── Plan Card ───────────────────────────────────────────────────── */
const PlanCard: React.FC<typeof plans[number]> = ({ name, coverage, reviews, price, image, badge, badgeColor }) => (
  <article
    className="card-hover"
    style={{
      flexShrink:   0,
      width:        300,
      background:   '#FFFFFF',
      borderRadius: 28,
      overflow:     'hidden',
      boxShadow:    '0 4px 28px rgba(0,0,0,0.08)',
      border:       '1px solid rgba(0,0,0,0.04)',
      scrollSnapAlign: 'start',
    }}
    aria-label={name}
  >
    {/* Image */}
    <div style={{ position:'relative', height: 196, overflow:'hidden' }}>
      <img
        src={image}
        alt={`${name} property`}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.5s ease' }}
        onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)')}
        onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
      />

      {/* Glass overlay at bottom of image */}
      <div style={{
        position:             'absolute',
        bottom:               0,
        left:                 0,
        right:                0,
        height:               56,
        background:           'linear-gradient(to top, rgba(0,0,0,0.35), transparent)',
        pointerEvents:        'none',
      }} />

      {/* Price glass pill */}
      <div style={{
        position:             'absolute',
        bottom:               14,
        left:                 14,
        background:           'rgba(255,255,255,0.78)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border:               '1px solid rgba(255,255,255,0.6)',
        borderRadius:         50,
        padding:              '5px 14px',
        fontFamily:           "'Poppins', sans-serif",
        fontWeight:           700,
        fontSize:             '0.85rem',
        color:                '#1A1A1A',
      }}>
        {price}<span style={{ fontWeight:400, fontSize:'0.7rem', color:'#6B6B6B' }}>/mo</span>
      </div>

      {badge && (
        <span style={{
          position:   'absolute',
          top:        14,
          right:      14,
          background: badgeColor,
          color:      '#fff',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          fontSize:   '0.65rem',
          padding:    '5px 12px',
          borderRadius: 50,
          letterSpacing:'0.3px',
          boxShadow:  '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {badge}
        </span>
      )}
    </div>

    {/* Card body */}
    <div style={{ padding: '24px 24px 28px', display:'flex', flexDirection:'column', gap: 12 }}>
      <div>
        <h3 style={{
          fontFamily:    "'Poppins', sans-serif",
          fontWeight:    700,
          fontSize:      '1.05rem',
          color:         '#1A1A1A',
          marginBottom:  4,
          letterSpacing: '-0.2px',
        }}>{name}</h3>
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 400,
          fontSize:   '0.82rem',
          color:      '#8A8A8A',
        }}>{coverage}</p>
      </div>

      <Stars reviews={reviews} />

      <div style={{ borderTop:'1px solid #F5F5F5', paddingTop: 16, marginTop: 4 }}>
        <button
          style={{
            background:     'none',
            border:         '1.5px solid #E8734A',
            borderRadius:   50,
            padding:        '10px 20px',
            width:          '100%',
            cursor:         'pointer',
            fontFamily:     "'Poppins', sans-serif",
            fontWeight:     600,
            fontSize:       '0.82rem',
            color:          '#E8734A',
            transition:     'all 0.25s',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            6,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'linear-gradient(135deg,#E8734A,#F0956B)';
            el.style.color      = '#fff';
            el.style.border     = '1.5px solid transparent';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'none';
            el.style.color      = '#E8734A';
            el.style.border     = '1.5px solid #E8734A';
          }}
          aria-label={`Select ${name}`}
        >
          Choose Plan
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  </article>
);

/* ─── Arrow Button ────────────────────────────────────────────────── */
const ArrowBtn: React.FC<{ direction:'left'|'right'; onClick:()=>void }> = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    aria-label={direction === 'left' ? 'Previous' : 'Next'}
    style={{
      width:          52,
      height:         52,
      borderRadius:   '50%',
      background:     'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border:         '1.5px solid rgba(232,115,74,0.2)',
      cursor:         'pointer',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexShrink:     0,
      boxShadow:      '0 4px 20px rgba(0,0,0,0.1)',
      transition:     'all 0.25s',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLButtonElement;
      el.style.background  = 'linear-gradient(135deg,#E8734A,#F0956B)';
      el.style.border      = '1.5px solid transparent';
      el.style.transform   = 'scale(1.08)';
      el.style.boxShadow   = '0 8px 28px rgba(232,115,74,0.35)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLButtonElement;
      el.style.background  = 'rgba(255,255,255,0.85)';
      el.style.border      = '1.5px solid rgba(232,115,74,0.2)';
      el.style.transform   = 'scale(1)';
      el.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.1)';
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'inherit', transition:'color 0.25s' }}
      aria-hidden="true">
      {direction === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  </button>
);

/* ─── Plans Carousel Section ──────────────────────────────────────── */
const PlansCarousel: React.FC = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.1);
  const trackRef   = useRef<HTMLDivElement>(null);
  const SCROLL_AMT = 316 * 1.5;

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'left' ? -SCROLL_AMT : SCROLL_AMT, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="pricing"
      aria-label="Protection plans"
      style={{
        background:    '#FAFAFA',
        paddingTop:    112,
        paddingBottom: 112,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        {/* ── Header row ── */}
        <div className="reveal-up" style={{
          display:        'flex',
          alignItems:     'flex-end',
          justifyContent: 'space-between',
          gap:            24,
          flexWrap:       'wrap',
          marginBottom:   56,
        }}>
          <div>
            <div style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           8,
              background:    'rgba(232,115,74,0.1)',
              border:        '1px solid rgba(232,115,74,0.22)',
              color:         '#E8734A',
              fontFamily:    "'Poppins', sans-serif",
              fontWeight:    600,
              fontSize:      '0.78rem',
              padding:       '8px 18px',
              borderRadius:  50,
              marginBottom:  18,
              letterSpacing: '0.3px',
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#E8734A', display:'inline-block' }} />
              Our Plans
            </div>

            <h2 style={{
              fontFamily:    "'Poppins', sans-serif",
              fontWeight:    800,
              fontSize:      'clamp(1.8rem, 4vw, 2.6rem)',
              color:         '#1A1A1A',
              letterSpacing: '-1px',
              lineHeight:    1.15,
              marginBottom:  12,
            }}>
              Choose Your{' '}
              <span className="gradient-text">Protection Plan</span>
            </h2>

            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
              fontSize:   '1rem',
              color:      '#6B6B6B',
              lineHeight: 1.65,
              maxWidth:   460,
            }}>
              All plans include full deposit coverage, dispute support, and 24/7 assistance.
            </p>
          </div>

          <div style={{ display:'flex', gap: 12 }}>
            <ArrowBtn direction="left"  onClick={() => scroll('left')} />
            <ArrowBtn direction="right" onClick={() => scroll('right')} />
          </div>
        </div>

        {/* ── Carousel track ── */}
        <div
          ref={trackRef}
          className="carousel-track reveal-fade delay-200"
          style={{
            display:         'flex',
            gap:             20,
            overflowX:       'auto',
            paddingBottom:   20,
            scrollSnapType:  'x mandatory',
          }}
          role="list"
          aria-label="Protection plan cards"
        >
          {plans.map(plan => (
            <div key={plan.id} role="listitem">
              <PlanCard {...plan} />
            </div>
          ))}
        </div>

        {/* ── Dot indicators ── */}
        <div className="reveal-up delay-300" style={{ display:'flex', justifyContent:'center', gap: 8, marginTop: 28 }}
          aria-hidden="true">
          {plans.map((_, i) => (
            <button
              key={i}
              onClick={() => trackRef.current?.scrollTo({ left: i * 316, behavior:'smooth' })}
              aria-label={`Go to plan ${i + 1}`}
              style={{
                width:      i === 0 ? 24 : 8,
                height:     8,
                borderRadius: 4,
                background: i === 0 ? '#E8734A' : '#E0E0E0',
                border:     'none',
                cursor:     'pointer',
                padding:    0,
                transition: 'all 0.25s',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansCarousel;
