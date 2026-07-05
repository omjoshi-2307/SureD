import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';

/* ── Icons (inline SVG, no extra deps) ── */
const Icon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
  {
    id: 'deposits', label: 'My Deposits',
    icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  },
  {
    id: 'escrow', label: 'Create Escrow',
    icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    id: 'history', label: 'Transaction History',
    icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />,
  },
  {
    id: 'profile', label: 'Profile',
    icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
  },
  {
    id: 'settings', label: 'Settings',
    icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  },
  {
    id: 'logout', label: 'Logout', isLogout: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

/* ── Mock data ── */
const STATS = [
  { label: 'Active Escrows', value: '3', sub: '+1 this month', icon: '🔐', color: '#E8734A' },
  { label: 'Completed Deposits', value: '7', sub: 'All released', icon: '✅', color: '#4ACF7A' },
  { label: 'Pending Deposits', value: '2', sub: 'Awaiting confirmation', icon: '⏳', color: '#F0A34A' },
  { label: 'Total Deposit Value', value: '£8,400', sub: 'Across all properties', icon: '💷', color: '#4ACFE8' },
];

const RECENT_ESCROWS = [
  { id: 'ESC-001', property: '14 Brunswick St, Leeds', landlord: 'James Carter', amount: '£1,500', status: 'Active', date: '01 Jul 2026' },
  { id: 'ESC-002', property: '8 Canal Rd, Manchester', landlord: 'Sarah Miles', amount: '£1,200', status: 'Active', date: '18 Jun 2026' },
  { id: 'ESC-003', property: '21 Park Ave, Sheffield', landlord: 'Tom Walsh', amount: '£950', status: 'Pending', date: '10 Jun 2026' },
  { id: 'ESC-004', property: '5 Queens Rd, Birmingham', landlord: 'Lisa Park', amount: '£1,100', status: 'Completed', date: '02 May 2026' },
  { id: 'ESC-005', property: '33 Elm Cl, Nottingham', landlord: 'Brian Stone', amount: '£800', status: 'Completed', date: '14 Mar 2026' },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  Active:    { background: 'rgba(74,207,122,0.12)', color: '#2AAF5C', border: '1px solid rgba(74,207,122,0.3)' },
  Pending:   { background: 'rgba(240,163,74,0.12)', color: '#C07A12', border: '1px solid rgba(240,163,74,0.3)' },
  Completed: { background: 'rgba(74,207,232,0.12)', color: '#0E87A0', border: '1px solid rgba(74,207,232,0.3)' },
};

const C = { orange: '#E8734A', orangeLight: '#F0956B', border: '#EEEEEE', textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA' };

/* ── Quick action button ── */
const QuickBtn = ({ label, icon, primary, onClick }: { label: string; icon: string; primary?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '11px 20px', borderRadius: 50, border: 'none',
      fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '0.83rem',
      cursor: 'pointer', transition: 'all 0.25s ease',
      ...(primary
        ? {
          background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeLight} 100%)`,
          color: '#fff', boxShadow: '0 6px 20px rgba(232,115,74,0.35)',
        }
        : {
          background: '#FFFFFF', color: C.textDark,
          border: `1.5px solid ${C.border}`,
        }),
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = primary
        ? '0 10px 28px rgba(232,115,74,0.45)'
        : '0 4px 14px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = primary ? '0 6px 20px rgba(232,115,74,0.35)' : 'none';
    }}
  >
    <span>{icon}</span> {label}
  </button>
);

/* ═════════════════════════════════════════════════════════════ */
const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('dashboard');

  const handleNavChange = (id: string) => {
    if (id === 'escrow') {
      navigate('/student/create-escrow');
    } else if (id === 'deposits') {
      navigate('/student/my-deposits');
    } else if (id === 'dashboard') {
      navigate('/student/dashboard');
    } else {
      setActiveId(id);
    }
  };

  return (
    <DashboardLayout
      role="student"
      userName="Alex Johnson"
      navItems={NAV_ITEMS}
      activeId={activeId}
      onNavChange={handleNavChange}
    >
      {/* ── Welcome Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeLight} 100%)`,
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        boxShadow: '0 8px 32px rgba(232,115,74,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: -30, top: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 60, bottom: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <div>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 800,
            fontSize: 'clamp(1.25rem, 3vw, 1.7rem)', color: '#fff',
            marginBottom: 6, letterSpacing: '-0.5px',
          }}>
            Welcome back, Alex 👋
          </h1>
          <p style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 400,
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)',
          }}>
            You have 2 pending deposits and 3 active escrows to manage.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <QuickBtn label="Create Escrow" icon="+" primary onClick={() => navigate('/student/create-escrow')} />
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{
            background: '#FFFFFF', borderRadius: 16, padding: '20px 22px',
            border: `1px solid ${C.border}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.25s, transform 0.25s',
            cursor: 'default',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
              (e.currentTarget as HTMLDivElement).style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{
                fontSize: '1.5rem', background: `${stat.color}18`,
                borderRadius: 10, width: 42, height: 42,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{stat.icon}</span>
              <span style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '0.68rem',
                fontWeight: 600, color: '#4ACF7A',
                background: 'rgba(74,207,122,0.1)', borderRadius: 50,
                padding: '3px 8px',
              }}>↑ Live</span>
            </div>
            <div style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 800,
              fontSize: '1.65rem', color: C.textDark, letterSpacing: '-1px', lineHeight: 1,
            }}>{stat.value}</div>
            <div style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 500,
              fontSize: '0.8rem', color: C.textMid, marginTop: 4,
            }}>{stat.label}</div>
            <div style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '0.72rem',
              color: C.textLight, marginTop: 4,
            }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{
        background: '#FFFFFF', borderRadius: 16, padding: '20px 24px',
        border: `1px solid ${C.border}`, marginBottom: 28,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <h3 style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: '0.95rem', color: C.textDark, marginBottom: 16,
        }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <QuickBtn label="Create New Escrow" icon="🔐" primary onClick={() => navigate('/student/create-escrow')} />
          <QuickBtn label="View All Deposits" icon="📋" />
          <QuickBtn label="Download Statement" icon="📥" />
          <QuickBtn label="Contact Support" icon="💬" />
        </div>
      </div>

      {/* ── Recent Escrow Table ── */}
      <div style={{
        background: '#FFFFFF', borderRadius: 16,
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <h3 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 700,
            fontSize: '0.95rem', color: C.textDark,
          }}>Recent Escrow Activity</h3>
          <button style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
            fontSize: '0.78rem', color: C.orange, background: 'none',
            border: 'none', cursor: 'pointer',
          }}>View all →</button>
        </div>

        {/* Table — scrollable on small screens */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Escrow ID', 'Property', 'Landlord', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{
                    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                    fontSize: '0.72rem', color: C.textLight, textAlign: 'left',
                    padding: '12px 20px', letterSpacing: '0.4px', whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ESCROWS.map((row, i) => (
                <tr key={row.id}
                  onClick={() => navigate(`/student/escrow/${row.id}`)}
                  style={{
                    borderTop: `1px solid ${C.border}`,
                    background: i % 2 === 0 ? '#FFFFFF' : '#FDFCFC',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,115,74,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FDFCFC')}
                >
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                      fontSize: '0.8rem', color: C.orange,
                    }}>{row.id}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif", fontWeight: 500,
                      fontSize: '0.83rem', color: C.textDark,
                    }}>{row.property}</span>
                  </td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif", fontSize: '0.83rem', color: C.textMid,
                    }}>{row.landlord}</span>
                  </td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                      fontSize: '0.83rem', color: C.textDark,
                    }}>{row.amount}</span>
                  </td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      ...STATUS_STYLE[row.status],
                      fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                      fontSize: '0.72rem', borderRadius: 50, padding: '4px 10px',
                      display: 'inline-block',
                    }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif", fontSize: '0.8rem', color: C.textLight,
                    }}>{row.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
