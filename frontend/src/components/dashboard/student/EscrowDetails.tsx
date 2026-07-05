import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';

const C = { orange: '#E8734A', orangeLight: '#F0956B', border: '#EEEEEE', textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA', white: '#FFFFFF' };
const font = "'Poppins', sans-serif";

const Icon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',          icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'deposits',  label: 'My Deposits',         icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'escrow',    label: 'Create Escrow',       icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  { id: 'history',   label: 'Transaction History', icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile',   label: 'Profile',             icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings',  label: 'Settings',            icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
  {
    id: 'logout', label: 'Logout', isLogout: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

/* Mock escrow detail */
const MOCK_ESCROW = {
  id: `ESC-${Math.floor(Math.random() * 90000) + 10000}`,
  property: 'Green Residency Apartments',
  address: '42 Green Lane, Leeds LS1 4DZ',
  landlord: 'James Carter',
  amount: '£1,200',
  currency: 'XLM',
  start: '01 Aug 2026',
  end: '31 Jul 2027',
  purpose: 'Security Deposit',
  status: 'Active',
  created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
};

const EscrowDetails: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  return (
    <DashboardLayout
      role="student"
      userName="Alex Johnson"
      navItems={NAV_ITEMS}
      activeId="deposits"
      onNavChange={(id) => { if (id === 'dashboard') navigate('/student/dashboard'); if (id === 'escrow') navigate('/student/create-escrow'); }}
    >
      {/* Breadcrumb */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <button onClick={() => navigate('/student/create-escrow')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Create Escrow
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Escrow Details</span>
      </div>

      {/* Success Banner */}
      <div style={{
        ...fadeIn(60),
        background: 'linear-gradient(135deg, #1A2E1A, #2E4E2E)',
        borderRadius: 20, padding: '32px 36px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        boxShadow: '0 8px 32px rgba(26,78,26,0.2)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,207,122,0.2) 0%, transparent 70%)', pointerEvents: 'none',
        }} />
        <div style={{ fontSize: '3.5rem' }}>✅</div>
        <div>
          <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: '#fff', marginBottom: 6, letterSpacing: '-0.4px' }}>
            Escrow Created Successfully!
          </h1>
          <p style={{ font, fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>
            Your rental deposit is now locked in a secure escrow. Escrow ID:{' '}
            <span style={{ fontWeight: 700, color: '#4ACF7A' }}>{MOCK_ESCROW.id}</span>
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(74,207,122,0.2)', border: '1px solid rgba(74,207,122,0.4)',
            borderRadius: 50, padding: '5px 14px',
            font, fontWeight: 700, fontSize: '0.75rem', color: '#4ACF7A',
          }}>● Active &amp; Locked</span>
        </div>
      </div>

      {/* Detail Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, ...fadeIn(120) }}>
        {/* Escrow Info */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '22px 24px' }}>
          <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark, marginBottom: 18 }}>📋 Escrow Information</div>
          {[
            { label: 'Escrow ID',    value: MOCK_ESCROW.id,       bold: true, accent: true },
            { label: 'Property',     value: MOCK_ESCROW.property,  bold: true },
            { label: 'Address',      value: MOCK_ESCROW.address },
            { label: 'Landlord',     value: MOCK_ESCROW.landlord },
            { label: 'Purpose',      value: MOCK_ESCROW.purpose },
            { label: 'Created',      value: MOCK_ESCROW.created },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11, gap: 12 }}>
              <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{row.label}</span>
              <span style={{ font, fontWeight: row.bold ? 700 : 500, fontSize: '0.82rem', color: row.accent ? C.orange : C.textDark, textAlign: 'right' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Financial Info */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '22px 24px' }}>
          <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark, marginBottom: 18 }}>💰 Financial Summary</div>
          {[
            { label: 'Deposit Amount', value: MOCK_ESCROW.amount, highlight: true },
            { label: 'Currency',       value: MOCK_ESCROW.currency },
            { label: 'Start Date',     value: MOCK_ESCROW.start },
            { label: 'End Date',       value: MOCK_ESCROW.end },
            { label: 'Platform Fee',   value: '£25' },
            { label: 'Network Fee',    value: '£3' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11, gap: 12 }}>
              <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{row.label}</span>
              <span style={{ font, fontWeight: row.highlight ? 800 : 500, fontSize: row.highlight ? '0.95rem' : '0.82rem', color: row.highlight ? C.orange : C.textDark }}>{row.value}</span>
            </div>
          ))}
          <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark }}>Total Locked</span>
            <span style={{ font, fontWeight: 800, fontSize: '1rem', color: C.orange }}>£1,228</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ ...fadeIn(200), display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/student/dashboard')}
          style={{
            font, fontWeight: 700, fontSize: '0.88rem', color: '#fff', border: 'none',
            borderRadius: 50, padding: '13px 28px', cursor: 'pointer',
            background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
            boxShadow: '0 6px 20px rgba(232,115,74,0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(232,115,74,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(232,115,74,0.35)'; }}
        >
          🏠 Back to Dashboard
        </button>
        <button
          onClick={() => navigate('/student/create-escrow')}
          style={{
            font, fontWeight: 600, fontSize: '0.88rem', color: C.textMid, background: C.white,
            border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '13px 28px',
            cursor: 'pointer', transition: 'all 0.25s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid; }}
        >
          + Create Another Escrow
        </button>
      </div>
    </DashboardLayout>
  );
};

export default EscrowDetails;
