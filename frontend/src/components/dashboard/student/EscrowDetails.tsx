import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';
import { getEscrowDb } from '@/services/escrowService';

const C = { orange: '#A78BFA', orangeLight: '#8B5CF6', border: 'rgba(255,255,255,0.08)', textDark: '#FFFFFF', textMid: 'rgba(255,255,255,0.64)', textLight: 'rgba(255,255,255,0.4)', white: '#FFFFFF' };
const font = "'Inter', sans-serif";

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

const SkeletonBlock = ({ w = '100%', h = 14, mb = 10 }: { w?: string | number; h?: number; mb?: number }) => (
  <div style={{ height: h, width: w, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: mb, animation: 'edPulse 1.4s infinite ease-in-out' }} />
);

const EscrowDetails: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const displayName = storedUser ? (JSON.parse(storedUser).name || "Student") : "Student";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const escrowId = searchParams.get('escrowId');
  const [mounted, setMounted] = useState(false);
  const [escrow, setEscrow] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(!!escrowId);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  useEffect(() => {
    if (escrowId) {
      getEscrowDb(escrowId)
        .then((data: any) => setEscrow(data.escrow || data))
        .catch(() => {})
        .finally(() => setFetchLoading(false));
    }
  }, [escrowId]);

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  const escrowLabel = escrow
    ? (escrow.escrowId !== undefined ? `ESC-${String(escrow.escrowId).padStart(3, '0')}` : 'Pending')
    : (escrowId ? `ESC-${String(escrowId).padStart(3, '0')}` : '—');

  const formattedDate = escrow
    ? new Date(escrow.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <DashboardLayout dark
      role="student"
      userName={displayName}
      navItems={NAV_ITEMS}
      activeId="deposits"
      onNavChange={(id) => {
        if (id === 'dashboard') navigate('/student/dashboard');
        if (id === 'escrow') navigate('/student/create-escrow');
        if (id === 'deposits') navigate('/student/my-deposits');
        if (id === 'history') navigate('/student/transactions');
        if (id === 'profile') navigate('/student/profile');
        if (id === 'settings') navigate('/student/settings');
      }}
    >
      <style>{`@keyframes edPulse{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}`}</style>

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

      {/* Loading */}
      {fetchLoading && (
        <div style={fadeIn(60)}>
          <SkeletonBlock h={120} mb={20} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SkeletonBlock h={200} /><SkeletonBlock h={200} />
          </div>
        </div>
      )}

      {/* Success Banner */}
      {!fetchLoading && (
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
            background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', pointerEvents: 'none',
          }} />
          <div style={{ fontSize: '3.5rem' }}>✅</div>
          <div>
            <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: '#fff', marginBottom: 6, letterSpacing: '-0.4px' }}>
              Escrow Created Successfully!
            </h1>
            <p style={{ font, fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>
              Your rental deposit is now locked in a secure escrow. Escrow ID:{' '}
              <span style={{ fontWeight: 700, color: '#10B981' }}>{escrowLabel}</span>
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: 50, padding: '5px 14px',
              font, fontWeight: 700, fontSize: '0.75rem', color: '#10B981',
            }}>● Active &amp; Locked</span>
          </div>
        </div>
      )}

      {/* Detail Cards */}
      {!fetchLoading && escrow && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, ...fadeIn(120) }}>
          {/* Escrow Info */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '22px 24px' }}>
            <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark, marginBottom: 18 }}>📋 Escrow Information</div>
            {[
              { label: 'Escrow ID', value: escrowLabel, bold: true, accent: true },
              { label: 'Property', value: escrow.propertyName, bold: true },
              { label: 'Address', value: escrow.propertyAddress || '—' },
              { label: 'Landlord Wallet', value: `${escrow.landlordWallet?.slice(0, 6)}…${escrow.landlordWallet?.slice(-4)}` },
              { label: 'Purpose', value: escrow.purpose || 'Security Deposit' },
              { label: 'Created', value: formattedDate },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11, gap: 12 }}>
                <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{row.label}</span>
                <span style={{ font, fontWeight: row.bold ? 700 : 500, fontSize: '0.82rem', color: row.accent ? C.orange : C.textDark, textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Financial Info */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '22px 24px' }}>
            <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark, marginBottom: 18 }}>💰 Financial Summary</div>
            {[
              { label: 'Deposit Amount', value: `${escrow.depositAmount} ${escrow.currency}`, highlight: true },
              { label: 'Currency', value: escrow.currency },
              { label: 'Start Date', value: escrow.rentalStartDate ? new Date(escrow.rentalStartDate).toLocaleDateString() : '—' },
              { label: 'End Date', value: escrow.rentalEndDate ? new Date(escrow.rentalEndDate).toLocaleDateString() : '—' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 11, gap: 12 }}>
                <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{row.label}</span>
                <span style={{ font, fontWeight: row.highlight ? 800 : 500, fontSize: row.highlight ? '0.95rem' : '0.82rem', color: row.highlight ? C.orange : C.textDark }}>{row.value}</span>
              </div>
            ))}
            <div style={{ height: 1, background: C.border, margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark }}>Total Locked</span>
              <span style={{ font, fontWeight: 800, fontSize: '1rem', color: C.orange }}>{escrow.depositAmount} {escrow.currency}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ ...fadeIn(200), display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/student/dashboard')}
          style={{
            font, fontWeight: 700, fontSize: '0.88rem', color: '#fff', border: 'none',
            borderRadius: 50, padding: '13px 28px', cursor: 'pointer',
            background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
            boxShadow: '0 6px 20px rgba(124,92,255,0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(124,92,255,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,92,255,0.35)'; }}
        >
          🏠 Back to Dashboard
        </button>
        <button
          onClick={() => navigate('/student/create-escrow')}
          style={{
            font, fontWeight: 600, fontSize: '0.88rem', color: C.textMid, background: 'rgba(255,255,255,0.04)',
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
