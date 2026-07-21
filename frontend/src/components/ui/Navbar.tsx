import React, { useState, useEffect } from 'react';
import LogoMark from './LogoMark';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'For Landlords', href: '#landlords' },
];

interface NavbarProps {
  onSignIn?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSignIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className="dl-fade"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(11,10,16,0.7)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
      aria-label="Main navigation"
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <nav
          style={{
            width: '100%',
            height: 64,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 16,
          }}
        >
        {/* LEFT: logomark + wordmark */}
        <a
          href="#"
          aria-label="DepositSafe home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <LogoMark
            size={32}
            style={{ filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.5))', flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '1.1rem',
              color: '#fff',
              letterSpacing: '-0.3px',
            }}
          >
            DepositSafe
          </span>
        </a>

        {/* CENTER: floating glass pill (desktop) */}
        <ul
          className="hidden lg:flex glass"
          style={{
            justifySelf: 'center',
            alignItems: 'center',
            gap: 4,
            listStyle: 'none',
            margin: 0,
            padding: '4px 6px',
            borderRadius: 999,
          }}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.label} style={{ position: 'relative' }}>
              <a
                href={link.href}
                onMouseEnter={() => setHovered(link.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'block',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  color: hovered === link.label ? '#fff' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: 999,
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </a>
              {/* Violet glow dot under the hovered link */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 1,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#A78BFA',
                  boxShadow: '0 0 8px 2px rgba(124,92,255,0.8)',
                  transform: 'translateX(-50%)',
                  opacity: hovered === link.label ? 1 : 0,
                  transition: 'opacity 0.25s ease',
                  pointerEvents: 'none',
                }}
              />
            </li>
          ))}
        </ul>

        {/* RIGHT: login + CTA (desktop) / hamburger (mobile) */}
        <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 18 }}>
            <button
              onClick={onSignIn}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.7)',
                transition: 'color 0.2s ease',
                padding: '8px 4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >
              Login
            </button>
            <button
              onClick={onSignIn}
              className="btn-glow"
              style={{ fontSize: '0.875rem', padding: '10px 22px' }}
            >
              Get started
            </button>
          </div>
          {/* Hamburger (mobile only) */}
          <button
            className="flex lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              flexDirection: 'column',
              gap: 5,
              zIndex: 210,
              position: 'relative',
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: 22,
                  height: 2,
                  borderRadius: 2,
                  background: '#fff',
                  transition: 'all 0.3s',
                  transformOrigin: 'center',
                  transform: menuOpen
                    ? i === 0
                      ? 'rotate(45deg) translate(5px,5px)'
                      : i === 1
                        ? 'scaleX(0)'
                        : 'rotate(-45deg) translate(5px,-5px)'
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>
      </div>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(11,10,16,0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '96px 32px 32px',
          }}
        >
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0 }}>
            {NAV_LINKS.map((link, i) => (
              <li key={link.label} className="dl-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1.6rem',
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="dl-stagger" style={{ animationDelay: `${NAV_LINKS.length * 80}ms` }}>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSignIn?.();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.6rem',
                  color: 'rgba(255,255,255,0.85)',
                  padding: '14px 0',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                Login
              </button>
            </li>
          </ul>

          {/* Glowing CTA pinned to the bottom */}
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => {
                setMenuOpen(false);
                onSignIn?.();
              }}
              className="btn-glow"
              style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
            >
              Get started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
