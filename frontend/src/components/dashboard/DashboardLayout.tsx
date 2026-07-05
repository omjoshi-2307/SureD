import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

/* ─── Brand colours (must stay in sync with index.css tokens) ─── */
const C = {
  orange: '#E8734A',
  orangeLight: '#F0956B',
  bg: '#F4F6FA',
  white: '#FFFFFF',
  sidebar: '#FFFFFF',
  border: '#EEEEEE',
  textDark: '#1A1A1A',
  textMid: '#6B6B6B',
  textLight: '#AAAAAA',
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  role, userName, navItems, activeId, onNavChange, children,
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (item: NavItem) => {
    if (item.isLogout) {
      navigate('/');
      return;
    }
    onNavChange(item.id);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800,
          fontSize: '1.2rem', color: C.textDark, letterSpacing: '-0.4px',
        }}>Sure</span>
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.2rem',
          background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeLight} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', letterSpacing: '-0.4px',
        }}>deposit</span>
      </div>

      {/* Role badge */}
      <div style={{ padding: '16px 24px 0' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(232,115,74,0.1)',
          border: '1px solid rgba(232,115,74,0.2)',
          borderRadius: 50, padding: '4px 12px',
          fontFamily: "'Poppins', sans-serif", fontSize: '0.72rem',
          fontWeight: 700, color: C.orange, textTransform: 'capitalize',
        }}>
          {role === 'student' ? '🎓' : '🏢'} {role}
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const isActive = item.id === activeId && !item.isLogout;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12, border: 'none',
                background: isActive
                  ? `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeLight} 100%)`
                  : 'transparent',
                color: isActive ? '#fff' : item.isLogout ? '#E85454' : C.textMid,
                fontFamily: "'Poppins', sans-serif", fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem', cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 14px rgba(232,115,74,0.35)' : 'none',
                marginTop: item.isLogout ? 'auto' : 0,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = item.isLogout
                    ? 'rgba(232,84,84,0.08)'
                    : 'rgba(232,115,74,0.07)';
                  e.currentTarget.style.color = item.isLogout ? '#E85454' : C.orange;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = item.isLogout ? '#E85454' : C.textMid;
                }
              }}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div style={{
        padding: '16px 20px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: '0.85rem', color: '#fff',
        }}>
          {userName.charAt(0)}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
            fontSize: '0.82rem', color: C.textDark,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{userName}</div>
          <div style={{
            fontFamily: "'Poppins', sans-serif", fontSize: '0.7rem',
            color: C.textLight, textTransform: 'capitalize',
          }}>{role} account</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}
        className="hidden md:flex"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 40, backdropFilter: 'blur(2px)',
            }}
          />
          <aside style={{
            position: 'fixed', left: 0, top: 0, bottom: 0, width: 260,
            background: C.sidebar, zIndex: 50,
            display: 'flex', flexDirection: 'column',
            boxShadow: '4px 0 32px rgba(0,0,0,0.15)',
          }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Navbar */}
        <header style={{
          background: C.white, borderBottom: `1px solid ${C.border}`,
          padding: '0 28px', height: 68,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: '0 1px 0 #EEEEEE',
        }}>
          {/* Left: hamburger + page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 4, padding: 4,
              }}
              aria-label="Open navigation"
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 22, height: 2,
                  borderRadius: 2, background: C.textDark,
                }} />
              ))}
            </button>
            <div>
              <h2 style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                fontSize: '1rem', color: C.textDark, lineHeight: 1.2,
              }}>
                {navItems.find(n => n.id === activeId)?.label ?? 'Dashboard'}
              </h2>
              <p style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: 400 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Right: notifications + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification bell */}
            <button style={{
              position: 'relative', background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 10, width: 38, height: 38, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.textMid, transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.orange;
                e.currentTarget.style.color = C.orange;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textMid;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Badge */}
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: C.orange, border: '1.5px solid #fff',
              }} />
            </button>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Poppins', sans-serif", fontWeight: 700,
              fontSize: '0.85rem', color: '#fff', cursor: 'pointer',
              flexShrink: 0,
            }}>
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
