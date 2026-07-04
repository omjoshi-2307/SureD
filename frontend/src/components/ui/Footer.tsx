import React from 'react';
import { useScrollReveal } from '@/lib/useScrollReveal';

const Footer: React.FC = () => {
  const ref = useScrollReveal<HTMLElement>(0.1);

  return (
    <footer
      ref={ref}
      id="contact"
      aria-label="Footer"
      style={{
        background:   '#111111',
        color:        '#fff',
        paddingTop:   96,
        paddingBottom: 48,
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)',
        width:600, height:300, borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(232,115,74,0.08) 0%, transparent 70%)',
        filter:'blur(40px)', pointerEvents:'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', position:'relative', zIndex:1 }}>

        {/* Top: brand + CTA */}
        <div className="reveal-up" style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          textAlign:      'center',
          gap:            24,
          paddingBottom:  64,
          borderBottom:   '1px solid rgba(255,255,255,0.08)',
          marginBottom:   64,
        }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ fontSize:30, lineHeight:1 }}>🛡️</span>
            <span style={{ fontFamily:"'Poppins', sans-serif", fontWeight:800, fontSize:'1.8rem', color:'#fff', letterSpacing:'-0.5px', lineHeight:1 }}>Sure</span>
            <span style={{
              fontFamily:"'Poppins', sans-serif", fontWeight:800, fontSize:'1.8rem',
              background:'linear-gradient(135deg,#E8734A,#F0956B)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              letterSpacing:'-0.5px', lineHeight:1,
            }}>deposit</span>
          </div>

          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            fontSize:   '1rem',
            color:      'rgba(255,255,255,0.5)',
            lineHeight: 1.7,
            maxWidth:   420,
          }}>
            The UK's most trusted rental deposit protection service.
            Safe, fast, and completely transparent.
          </p>

          {/* Big CTA */}
          <a href="#pricing" className="btn-shimmer" style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            10,
            color:          '#fff',
            fontFamily:     "'Poppins', sans-serif",
            fontWeight:     700,
            fontSize:       '0.9rem',
            padding:        '14px 32px',
            borderRadius:   50,
            textDecoration: 'none',
            boxShadow:      '0 8px 28px rgba(232,115,74,0.4)',
            transition:     'transform 0.25s, box-shadow 0.25s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform = 'translateY(-3px)';
            el.style.boxShadow = '0 16px 40px rgba(232,115,74,0.55)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform = 'none';
            el.style.boxShadow = '0 8px 28px rgba(232,115,74,0.4)';
          }}>
            Start Protecting Today →
          </a>
        </div>

        {/* Navigation columns */}
        <div className="reveal-up delay-200" style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap:                 48,
          marginBottom:        64,
        }}>
          {[
            { heading: 'Product',  links: ['How It Works','Coverage','Pricing','For Landlords'] },
            { heading: 'Company',  links: ['About Us','Blog','Careers','Press'] },
            { heading: 'Support',  links: ['Help Center','Contact Us','FAQ','Status'] },
            { heading: 'Legal',    links: ['Privacy Policy','Terms of Service','Cookie Policy','Compliance'] },
          ].map(col => (
            <div key={col.heading} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
              <h4 style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize:   '0.88rem',
                color:      '#fff',
                letterSpacing:'0.5px',
              }}>{col.heading}</h4>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap: 12 }}>
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" style={{
                      fontFamily:     "'Poppins', sans-serif",
                      fontWeight:     400,
                      fontSize:       '0.85rem',
                      color:          'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                      transition:     'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E8734A')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="reveal-up delay-300" style={{
          display:        'flex',
          flexWrap:       'wrap',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            16,
          paddingTop:     24,
          borderTop:      '1px solid rgba(255,255,255,0.07)',
        }}>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            fontSize:   '0.8rem',
            color:      'rgba(255,255,255,0.3)',
          }}>
            © {new Date().getFullYear()} Suredeposit Ltd. All rights reserved. Authorised by the FCA.
          </p>

          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            {['🔒 SSL Secured', '🏦 FCA Authorised', '⭐ 4.9/5 Rated'].map(badge => (
              <span key={badge} style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize:   '0.72rem',
                color:      'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.08)',
                borderRadius: 50,
                padding:    '5px 12px',
                whiteSpace: 'nowrap',
              }}>{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
