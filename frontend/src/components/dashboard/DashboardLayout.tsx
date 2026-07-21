import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoMark from '@/components/ui/LogoMark';
import { Bell, Building2, GraduationCap } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isLogout?: boolean;
}

interface DashboardLayoutProps {
  role: 'student' | 'landlord';
  userName: string;
  navItems: NavItem[];
  activeId: string;
  onNavChange: (id: string) => void;
  children: React.ReactNode;
  /** Opt-in dark violet theme (used by the main dashboard). Defaults to the original light look. */
  dark?: boolean;
}

/* ─── Light brand colours (original, kept for all other pages) ─── */
const LIGHT = {
  accent: '#E8734A',
  accentLight: '#F0956B',
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  border: '#EEEEEE',
  textDark: '#1A1A1A',
  textMid: '#6B6B6B',
  textLight: '#AAAAAA',
  font: "'Poppins', sans-serif",
  logoutHover: 'rgba(232,84,84,0.08)',
  navHover: 'rgba(232,115,74,0.07)',
  activeShadow: '0 4px 14px rgba(232,115,74,0.35)',
  glassBg: 'rgba(255,255,255,0.72)',
  glassBorder: '1px solid rgba(26,26,26,0.07)',
  glassShadow: '0 8px 24px rgba(17,24,39,0.08)',
  menuBg: 'rgba(255,255,255,0.85)',
  menuShadow: '0 24px 60px rgba(17,24,39,0.16)',
};

/* ─── Dark violet theme (DepositSafe dark landing system) ─── */
const DARK = {
  accent: '#7C5CFF',
  accentLight: '#A78BFA',
  bg: '#0B0A10',
  surface: '#12101B',
  border: 'rgba(255,255,255,0.08)',
  textDark: '#FFFFFF',
  textMid: 'rgba(255,255,255,0.64)',
  textLight: 'rgba(255,255,255,0.4)',
  font: "'Inter', sans-serif",
  logoutHover: 'rgba(239,68,68,0.12)',
  navHover: 'rgba(124,92,255,0.12)',
  activeShadow: '0 0 20px rgba(124,92,255,0.45)',
  glassBg: 'rgba(18,16,27,0.72)',
  glassBorder: '1px solid rgba(255,255,255,0.1)',
  glassShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
  menuBg: 'rgba(18,16,27,0.88)',
  menuShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(124,92,255,0.12)',
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role, userName, navItems, activeId, onNavChange, children, dark = false,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const C = dark ? DARK : LIGHT;

  const handleNav = (item: NavItem) => {
    setMenuOpen(false);
    if (item.isLogout) {
      navigate('/');
      return;
    }
    onNavChange(item.id);
  };

  /* Close the dropdown on outside click / Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        hamburgerRef.current && !hamburgerRef.current.contains(t)
      ) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const gradient = `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font }}>

      {/* ── Top navbar — scrolls naturally with the page (not fixed/sticky) ── */}
      <div style={{ position: 'relative', zIndex: 50, padding: 'clamp(12px, 2vw, 20px) clamp(16px, 3vw, 28px) 0' }}>
        <header
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            height: 64, padding: '0 clamp(12px, 2vw, 20px)',
            background: C.glassBg,
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: C.glassBorder,
            borderTop: dark ? '1px solid rgba(224,215,255,0.22)' : C.glassBorder,
            borderRadius: 18,
            boxShadow: C.glassShadow,
          }}
        >
          {/* LEFT: hamburger + brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <button
              ref={hamburgerRef}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="dashboard-nav-menu"
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5,
                width: 40, height: 40, padding: 9, flexShrink: 0,
                background: menuOpen ? C.navHover : 'transparent',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : C.border}`,
                borderRadius: 12, cursor: 'pointer',
                transition: 'background 0.25s ease, border-color 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.navHover; }}
              onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    display: 'block', width: 20, height: 2, borderRadius: 2,
                    background: C.textDark,
                    transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s',
                    transformOrigin: 'center',
                    transform: menuOpen
                      ? i === 0 ? 'translateY(7px) rotate(45deg)'
                        : i === 1 ? 'scaleX(0)'
                          : 'translateY(-7px) rotate(-45deg)'
                      : 'none',
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>

            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: dark ? 10 : 8, minWidth: 0 }}>
              {dark ? (
                <>
                  <LogoMark
                    size={28}
                    style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.45))', flexShrink: 0 }}
                  />
                  <span style={{
                    fontFamily: C.font, fontWeight: 600, fontSize: '1.02rem',
                    color: '#fff', letterSpacing: '-0.3px', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>DepositSafe</span>
                </>
              ) : (
                <>
                  <span style={{
                    fontFamily: C.font, fontWeight: 800,
                    fontSize: '1.15rem', color: C.textDark, letterSpacing: '-0.4px',
                  }}>Sure</span>
                  <span style={{
                    fontFamily: C.font, fontWeight: 800, fontSize: '1.15rem',
                    background: gradient,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', letterSpacing: '-0.4px', marginLeft: -6,
                  }}>deposit</span>
                </>
              )}
            </div>

            {/* Role chip (hidden on small screens) */}
            <span className="hidden md:inline-flex" style={{
              alignItems: 'center', gap: 6,
              background: dark ? 'rgba(124,92,255,0.12)' : 'rgba(232,115,74,0.1)',
              border: dark ? '1px solid rgba(124,92,255,0.35)' : '1px solid rgba(232,115,74,0.2)',
              borderRadius: 50, padding: '4px 12px',
              fontFamily: C.font, fontSize: '0.7rem',
              fontWeight: dark ? 600 : 700,
              color: dark ? C.accentLight : C.accent, textTransform: 'capitalize',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {dark ? (
                <span aria-hidden="true" style={{
                  width: 6, height: 6, borderRadius: '50%', background: C.accentLight,
                  boxShadow: '0 0 8px rgba(124,92,255,0.8)', display: 'inline-block',
                }} />
              ) : (
                role === 'student'
                  ? <GraduationCap size={12} strokeWidth={2.2} aria-hidden="true" />
                  : <Building2 size={12} strokeWidth={2.2} aria-hidden="true" />
              )}
              {role}
            </span>
          </div>

          {/* RIGHT: notifications + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button aria-label="Notifications" className="icon-anim" style={{
              position: 'relative', background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 10, width: 38, height: 38, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.textMid, transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = dark ? 'rgba(124,92,255,0.6)' : C.accent;
                e.currentTarget.style.color = dark ? C.accentLight : C.accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textMid;
              }}
            >
              <Bell size={16} strokeWidth={2} aria-hidden="true" />
              <span aria-hidden="true" style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: C.accent,
                border: dark ? '1.5px solid #0B0A10' : '1.5px solid #fff',
                boxShadow: dark ? '0 0 8px rgba(124,92,255,0.8)' : 'none',
              }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div aria-hidden="true" style={{
                width: 36, height: 36, borderRadius: '50%',
                background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: C.font, fontWeight: 700,
                fontSize: '0.85rem', color: '#fff', flexShrink: 0,
                boxShadow: dark ? '0 0 14px rgba(124,92,255,0.4)' : 'none',
              }}>
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block" style={{ overflow: 'hidden', maxWidth: 160 }}>
                <div style={{
                  fontFamily: C.font, fontWeight: 600,
                  fontSize: '0.82rem', color: C.textDark, lineHeight: 1.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{userName}</div>
                <div style={{
                  fontFamily: C.font, fontSize: '0.68rem',
                  color: C.textLight, textTransform: 'capitalize', whiteSpace: 'nowrap',
                }}>{role} account</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Glassmorphism dropdown menu ── */}
        <nav
          ref={menuRef}
          id="dashboard-nav-menu"
          aria-label="Dashboard navigation"
          aria-hidden={!menuOpen}
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: 10,
            left: 'clamp(16px, 3vw, 28px)',
            width: 'min(300px, calc(100vw - 32px))',
            maxHeight: 'min(70vh, 520px)',
            overflowY: 'auto',
            padding: 8,
            background: C.menuBg,
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: C.glassBorder,
            borderTop: dark ? '1px solid rgba(224,215,255,0.25)' : C.glassBorder,
            borderRadius: 18,
            boxShadow: C.menuShadow,
            zIndex: 60,
            transformOrigin: 'top left',
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
            visibility: menuOpen ? 'visible' : 'hidden',
            pointerEvents: menuOpen ? 'auto' : 'none',
            transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.25s',
          }}
        >
          {navItems.map(item => {
            const isActive = item.id === activeId && !item.isLogout;
            const logoutColor = dark ? '#F87171' : '#E85454';
            return (
              <React.Fragment key={item.id}>
                {item.isLogout && (
                  <div aria-hidden="true" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : C.border}`, margin: '6px 4px' }} />
                )}
                <button
                  onClick={() => handleNav(item)}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 12, border: 'none',
                    background: isActive ? gradient : 'transparent',
                    color: isActive ? '#fff' : item.isLogout ? logoutColor : C.textMid,
                    fontFamily: C.font, fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem', cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? C.activeShadow : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = item.isLogout ? C.logoutHover : C.navHover;
                      e.currentTarget.style.color = item.isLogout
                        ? logoutColor
                        : dark ? '#fff' : C.accent;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = item.isLogout ? logoutColor : C.textMid;
                    }
                  }}
                >
                  <span style={{ flexShrink: 0, display: 'flex', opacity: isActive ? 1 : 0.75 }}>{item.icon}</span>
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* ── Page content ── */}
      <main style={{ padding: 'clamp(16px, 3vw, 28px)' }}>
        {/* Page heading (previously shown in the sticky header) */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{
            fontFamily: C.font, fontWeight: 700,
            fontSize: '1rem', color: C.textDark, lineHeight: 1.2,
          }}>
            {navItems.find(n => n.id === activeId)?.label ?? 'Dashboard'}
          </h2>
          <p style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 400, marginTop: 2 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
