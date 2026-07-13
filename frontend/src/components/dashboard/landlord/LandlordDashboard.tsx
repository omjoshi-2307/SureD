import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';
import { getEscrowsByLandlordDb } from '@/services/escrowService';
import { connectWallet } from '@/services/walletService';
import { updateWallet } from '@/services/authService';

/* ── Icons ── */
const Icon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',         icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'properties',  label: 'My Properties',     icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'incoming',    label: 'Incoming Deposits',  icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'movein',      label: 'Confirm Move-in',   icon: <Icon d="M9 11l3 3L22 4" /> },
  { id: 'transactions',label: 'Transactions',       icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile',     label: 'Profile',            icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings',    label: 'Settings',           icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
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

/* ── Status config — matches student pages exactly ── */
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  CREATED:              { background: 'rgba(74,144,226,0.12)',  color: '#2B6CB0', border: '1px solid rgba(74,144,226,0.3)' },
  FUNDED:               { background: 'rgba(240,163,74,0.12)', color: '#C07A12', border: '1px solid rgba(240,163,74,0.3)' },
  PENDING_CONFIRMATION: { background: 'rgba(155,89,182,0.12)', color: '#8E44AD', border: '1px solid rgba(155,89,182,0.3)' },
  RELEASED:             { background: 'rgba(74,207,122,0.12)', color: '#2AAF5C', border: '1px solid rgba(74,207,122,0.3)' },
  DISPUTED:             { background: 'rgba(234,67,53,0.12)',  color: '#C53030', border: '1px solid rgba(234,67,53,0.3)' },
  CANCELLED:            { background: 'rgba(107,114,128,0.12)',color: '#4B5563', border: '1px solid rgba(107,114,128,0.3)' },
};

const C = {
  orange: '#E8734A', orangeLight: '#F0956B',
  border: '#EEEEEE', textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA',
};
const font = "'Poppins', sans-serif";

/* ── Quick action button ── */
const QuickBtn = ({
  label, icon, primary, onClick,
}: { label: string; icon: string; primary?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '11px 20px', borderRadius: 50, border: 'none',
      fontFamily: font, fontWeight: 600, fontSize: '0.83rem',
      cursor: 'pointer', transition: 'all 0.25s ease',
      ...(primary
        ? { background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeLight} 100%)`, color: '#fff', boxShadow: '0 6px 20px rgba(232,115,74,0.35)' }
        : { background: '#FFFFFF', color: C.textDark, border: `1.5px solid ${C.border}` }),
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = primary ? '0 10px 28px rgba(232,115,74,0.45)' : '0 4px 14px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = primary ? '0 6px 20px rgba(232,115,74,0.35)' : 'none';
    }}
  >
    <span>{icon}</span> {label}
  </button>
);

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr style={{ borderTop: `1px solid ${C.border}`, animation: 'ldPulse 1.5s infinite ease-in-out' }}>
    {[60, 80, 160, 80, 70, 80].map((w, i) => (
      <td key={i} style={{ padding: '14px 20px' }}>
        <div style={{ height: 15, width: w, background: '#F0F0F0', borderRadius: 4 }} />
      </td>
    ))}
  </tr>
);

const LandlordDashboard: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const displayName = storedUser ? (JSON.parse(storedUser).name || "Landlord") : "Landlord";
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('dashboard');
  const [walletAddress, setWalletAddress] = useState('');
  const [connecting, setConnecting] = useState(false);

  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (wallet: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEscrowsByLandlordDb(wallet);
      const sorted = (data.escrows || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEscrows(sorted);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load escrows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.walletAddress) {
        setWalletAddress(parsed.walletAddress);
        console.log("Landlord wallet:", parsed.walletAddress);
        loadData(parsed.walletAddress);
        return;
      }
    }
    setLoading(false);
  }, []);

  const handleNavChange = (id: string) => {
    if (id === 'incoming') navigate('/landlord/incoming-escrows');
    else if (id === 'profile') navigate('/landlord/profile');
    else if (id === 'settings') navigate('/landlord/settings');
    else if (id === 'dashboard') navigate('/landlord/dashboard');
    else setActiveId(id);
  };

  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      const address = await connectWallet();
      await updateWallet(address);
      setWalletAddress(address);
      await loadData(address);
    } catch (err: any) {
      alert(err.message || 'Failed to connect wallet.');
    } finally {
      setConnecting(false);
    }
  };

  /* ── Dynamic stats ── */
  const totalCount    = escrows.length;
  const activeCount   = escrows.filter(e => ['CREATED','FUNDED','PENDING_CONFIRMATION','DISPUTED'].includes(e.status)).length;
  const releasedCount = escrows.filter(e => e.status === 'RELEASED').length;
  const pendingCount  = escrows.filter(e => e.status === 'CREATED' || e.status === 'FUNDED').length;
  const totalValue    = escrows.reduce((s, e) => s + (e.depositAmount || 0), 0);

  const dynamicStats = [
    { label: 'Total Escrows',      value: loading ? '…' : String(totalCount),    sub: 'All assigned escrows',        icon: '🏠', color: '#E8734A' },
    { label: 'Active / Pending',   value: loading ? '…' : String(pendingCount),  sub: 'Created or Funded',           icon: '⏳', color: '#F0A34A' },
    { label: 'Released Deposits',  value: loading ? '…' : String(releasedCount), sub: 'Successfully completed',      icon: '✅', color: '#4ACF7A' },
    { label: 'Total Deposit Value',value: loading ? '…' : `${totalValue} XLM`,   sub: 'Across all properties',       icon: '💷', color: '#4ACFE8' },
  ];

  return (
    <DashboardLayout
      role="landlord"
      userName={displayName}
      navItems={NAV_ITEMS}
      activeId={activeId}
      onNavChange={handleNavChange}
    >
      <style>{`
        @keyframes ldPulse { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
      `}</style>

      {/* ── Welcome Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #2E2E4E 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        boxShadow: '0 8px 32px rgba(26,26,46,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glows */}
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,115,74,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '40%', bottom: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,149,107,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,115,74,0.2)', border: '1px solid rgba(232,115,74,0.35)', borderRadius: 50, padding: '4px 12px', fontFamily: font, fontSize: '0.7rem', fontWeight: 700, color: '#F0956B', marginBottom: 10 }}>
            🏢 Property Manager
          </div>
          <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: 'clamp(1.25rem, 3vw, 1.7rem)', color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>
            Welcome back 👋
          </h1>
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            {loading
              ? 'Loading escrow data…'
              : `${activeCount} active escrow${activeCount !== 1 ? 's' : ''} need${activeCount === 1 ? 's' : ''} your attention.`}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <QuickBtn
              label={connecting ? 'Connecting…' : walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
              icon={walletAddress ? '✅' : '🔗'}
              onClick={walletAddress ? undefined : handleConnectWallet}
            />
            <QuickBtn label="Incoming Deposits" icon="📥" primary onClick={() => navigate('/landlord/incoming-escrows')} />
          </div>
          {walletAddress && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50, padding: '5px 14px' }}>
              <span style={{ fontFamily: font, fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)' }}>Stellar:</span>
              <span style={{ fontFamily: font, fontWeight: 600, fontSize: '0.75rem', color: '#fff' }}>
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-6)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ background: '#FFF0F0', border: '1px solid #FFC0C0', borderRadius: 12, padding: '12px 18px', marginBottom: 16, fontFamily: font, fontSize: '0.85rem', color: '#C53030', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {dynamicStats.map(stat => (
          <div key={stat.label} style={{
            background: '#FFFFFF', borderRadius: 16, padding: '20px 22px',
            border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.25s, transform 0.25s', cursor: 'default',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '1.5rem', background: `${stat.color}18`, borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</span>
              <span style={{ fontFamily: font, fontSize: '0.68rem', fontWeight: 600, color: '#4ACF7A', background: 'rgba(74,207,122,0.1)', borderRadius: 50, padding: '3px 8px' }}>↑ Live</span>
            </div>
            <div style={{ fontFamily: font, fontWeight: 800, fontSize: '1.65rem', color: C.textDark, letterSpacing: '-1px', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: font, fontWeight: 500, fontSize: '0.8rem', color: C.textMid, marginTop: 4 }}>{stat.label}</div>
            <div style={{ fontFamily: font, fontSize: '0.72rem', color: C.textLight, marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '20px 24px', border: `1px solid ${C.border}`, marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <QuickBtn label="Incoming Deposits" icon="📥" primary onClick={() => navigate('/landlord/incoming-escrows')} />
          <QuickBtn label="Generate Report" icon="📊" />
          <QuickBtn label="Confirm Move-in" icon="✅" />
          <QuickBtn label="Contact Support" icon="💬" />
        </div>
      </div>

      {/* ── Recent Escrows Table ── */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark }}>
            Recent Escrow Assignments
          </h3>
          <button
            onClick={() => navigate('/landlord/incoming-escrows')}
            style={{ fontFamily: font, fontWeight: 600, fontSize: '0.78rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            View all →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Escrow ID', 'Property', 'Student Wallet', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ fontFamily: font, fontWeight: 700, fontSize: '0.72rem', color: C.textLight, textAlign: 'left', padding: '12px 20px', letterSpacing: '0.4px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : error ? (
                <tr><td colSpan={6} style={{ padding: '28px 20px', textAlign: 'center', fontFamily: font, fontWeight: 600, color: '#ea4335' }}>⚠️ {error}</td></tr>
              ) : escrows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📭</div>
                    <div style={{ fontFamily: font, fontWeight: 700, fontSize: '1rem', color: C.textDark }}>No escrows assigned yet.</div>
                    <p style={{ fontFamily: font, fontSize: '0.8rem', color: C.textMid, marginTop: 6, marginBottom: 14 }}>
                      Escrows assigned to your wallet address will appear here.
                    </p>
                    {!walletAddress && (
                      <button
                        onClick={handleConnectWallet}
                        style={{ fontFamily: font, fontWeight: 700, fontSize: '0.8rem', color: '#fff', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '8px 20px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,115,74,0.25)' }}
                      >
                        Connect Wallet to Load Data
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                escrows.slice(0, 5).map((row, i) => {
                  const targetId = row.escrowId !== undefined ? String(row.escrowId) : row._id;
                  const escrowLabel = row.escrowId !== undefined ? `ESC-${String(row.escrowId).padStart(3, '0')}` : 'Pending';
                  const formattedDate = new Date(row.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
                  const ss = STATUS_STYLE[row.status] || STATUS_STYLE['CREATED'];
                  return (
                    <tr
                      key={row._id}
                      onClick={() => navigate(`/landlord/escrow/${targetId}`)}
                      style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? '#FFFFFF' : '#FDFCFC', transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,115,74,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FDFCFC')}
                    >
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: font, fontWeight: 700, fontSize: '0.8rem', color: C.orange }}>{escrowLabel}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: font, fontWeight: 500, fontSize: '0.83rem', color: C.textDark }}>{row.propertyName}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 700, fontSize: '0.7rem', color: '#fff' }}>
                            S
                          </div>
                          <span style={{ fontFamily: `${font}, monospace`, fontSize: '0.8rem', color: C.textMid }}>
                            {row.studentWallet.slice(0, 6)}…{row.studentWallet.slice(-4)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: font, fontWeight: 700, fontSize: '0.83rem', color: C.textDark }}>{row.depositAmount} {row.currency}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ ...ss, fontFamily: font, fontWeight: 600, fontSize: '0.72rem', borderRadius: 50, padding: '4px 10px', display: 'inline-block' }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: font, fontSize: '0.8rem', color: C.textLight }}>{formattedDate}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LandlordDashboard;
