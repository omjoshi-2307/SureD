import React, { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Coverage',     href: '#coverage'     },
  { label: 'Pricing',      href: '#pricing'       },
  { label: 'For Landlords',href: '#landlords'     },
  { label: 'Contact',      href: '#contact'       },
];

const Navbar: React.FC = () => {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      style={{
        position:   'sticky',
        top:        0,
        zIndex:     100,
        /* Glassmorphism activates once user scrolls */
        background: scrolled
          ? 'rgba(255,255,255,0.82)'
          : 'rgba(255,255,255,0.98)',
        backdropFilter:         scrolled ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter:   scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom:           scrolled ? '1px solid rgba(232,115,74,0.12)' : '1px solid #F0F0F0',
        boxShadow:              scrolled ? '0 4px 32px rgba(0,0,0,0.08)' : 'none',
        transition:             'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      aria-label="Main navigation"
    >
      {/* ── Main nav bar ── */}
      <nav
        style={{
          maxWidth:       1280,
          margin:         '0 auto',
          padding:        '0 48px',
          height:         80,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            24,
        }}
      >
        {/* Logo */}
        <a
          href="#"
          aria-label="Suredeposit home"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 6, flexShrink: 0 }}
        >
          <span style={{ fontSize: 26, lineHeight: 1 }}>🛡️</span>
          <span style={{
            fontFamily:   "'Poppins', sans-serif",
            fontWeight:   800,
            fontSize:     '1.45rem',
            color:        '#1A1A1A',
            letterSpacing:'-0.5px',
            lineHeight:   1,
          }}>
            Sure
          </span>
          <span style={{
            fontFamily:   "'Poppins', sans-serif",
            fontWeight:   800,
            fontSize:     '1.45rem',
            background:   'linear-gradient(135deg,#E8734A 0%,#F0956B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
            letterSpacing:        '-0.5px',
            lineHeight:           1,
          }}>
            deposit
          </span>
        </a>

        {/* Desktop links */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: 36, listStyle: 'none', margin: 0, padding: 0 }}
            className="hidden md:flex">
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                style={{
                  fontFamily:     "'Poppins', sans-serif",
                  fontWeight:     500,
                  fontSize:       '0.92rem',
                  color:          '#3A3A3A',
                  textDecoration: 'none',
                  position:       'relative',
                  paddingBottom:  4,
                  transition:     'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E8734A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3A3A3A')}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#pricing"
          className="hidden md:inline-flex btn-shimmer"
          style={{
            alignItems:     'center',
            justifyContent: 'center',
            color:          '#fff',
            fontFamily:     "'Poppins', sans-serif",
            fontWeight:     700,
            fontSize:       '0.875rem',
            letterSpacing:  '0.3px',
            padding:        '12px 28px',
            borderRadius:   50,
            textDecoration: 'none',
            boxShadow:      '0 4px 20px rgba(232,115,74,0.4)',
            transition:     'transform 0.25s, box-shadow 0.25s',
            whiteSpace:     'nowrap',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform  = 'translateY(-2px) scale(1.02)';
            el.style.boxShadow  = '0 10px 30px rgba(232,115,74,0.5)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform  = 'none';
            el.style.boxShadow  = '0 4px 20px rgba(232,115,74,0.4)';
          }}
        >
          Get Protected
        </a>

        {/* Hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            padding:    8,
            display:    'flex',
            flexDirection: 'column',
            gap:        5,
          }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display:    'block',
              width:      24,
              height:     2,
              borderRadius: 2,
              background: '#1A1A1A',
              transition: 'all 0.3s',
              transformOrigin: 'center',
              transform: menuOpen
                ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
                : i === 1 ? 'scaleX(0)'
                : 'rotate(-45deg) translate(5px,-5px)'
                : 'none',
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* ── Mobile menu with glass ── */}
      {menuOpen && (
        <div style={{
          background:           'rgba(255,255,255,0.92)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop:            '1px solid rgba(232,115,74,0.1)',
          padding:              '20px 32px 28px',
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily:     "'Poppins', sans-serif",
                    fontWeight:     500,
                    fontSize:       '1rem',
                    color:          '#1A1A1A',
                    textDecoration: 'none',
                    display:        'block',
                    padding:        '8px 0',
                    borderBottom:   '1px solid #F5F5F5',
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li style={{ paddingTop: 8 }}>
              <a
                href="#pricing"
                onClick={() => setMenuOpen(false)}
                className="btn-shimmer"
                style={{
                  display:        'block',
                  textAlign:      'center',
                  color:          '#fff',
                  fontFamily:     "'Poppins', sans-serif",
                  fontWeight:     700,
                  fontSize:       '0.95rem',
                  padding:        '14px',
                  borderRadius:   50,
                  textDecoration: 'none',
                }}
              >
                Get Protected
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
