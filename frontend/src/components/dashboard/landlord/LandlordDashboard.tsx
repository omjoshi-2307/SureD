import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { LANDLORD_NAV_ITEMS as NAV_ITEMS } from '@/components/dashboard/navItems';
import {
  AlertTriangle, ArrowRight, Banknote, BarChart3, Building2, Check,
  CircleCheckBig, ClipboardCheck, Hourglass, Inbox, MessageCircle,
  TrendingUp, Wallet,
} from 'lucide-react';
import { getEscrowsByLandlordDb } from '@/services/escrowService';
import { connectWallet } from '@/services/walletService';
import { updateWallet } from '@/services/authService';

/* ── Status config — matches student pages exactly ── */
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  CREATED:              { background: 'rgba(151,160,181,0.12)',  color: '#97A0B5', border: '1px solid rgba(151,160,181,0.3)' },
  FUNDED:               { background: 'rgba(46,107,255,0.12)', color: '#6E9BFF', border: '1px solid rgba(46,107,255,0.3)' },
  PENDING_CONFIRMATION: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
  RELEASED:             { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' },
  DISPUTED:             { background: 'rgba(239,68,68,0.12)',  color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' },
  CANCELLED:            { background: 'rgba(107,114,128,0.12)',color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.3)' },
};

const C = {
  orange: '#A78BFA', orangeLight: '#8B5CF6',
  border: 'rgba(255,255,255,0.08)', textDark: '#FFFFFF', textMid: 'rgba(255,255,255,0.64)', textLight: 'rgba(255,255,255,0.4)',
};
const font = "'Inter', sans-serif";

/* ── Quick action button ── */
const QuickBtn = ({
  label, icon, primary, onClick,
}: { label: string; icon: React.ReactNode; primary?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="icon-anim"
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '11px 20px', borderRadius: 50, border: 'none',
      fontFamily: font, fontWeight: 600, fontSize: '0.83rem',
      cursor: 'pointer', transition: 'all 0.25s ease',
      ...(primary
        ? { background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeLight} 100%)`, color: '#fff', boxShadow: '0 6px 20px rgba(124,92,255,0.35)' }
        : { background: 'rgba(255,255,255,0.04)', color: C.textDark, border: `1.5px solid ${C.border}` }),
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = primary ? '0 10px 28px rgba(124,92,255,0.45)' : '0 4px 14px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = primary ? '0 6px 20px rgba(124,92,255,0.35)' : 'none';
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span> {label}
  </button>
);

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr style={{ borderTop: `1px solid ${C.border}`, animation: 'ldPulse 1.5s infinite ease-in-out' }}>
    {[60, 80, 160, 80, 70, 80].map((w, i) => (
      <td key={i} style={{ padding: '14px 20px' }}>
        <div style={{ height: 15, width: w, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
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
        loadData(parsed.walletAddress);
        return;
      }
    }
    setLoading(false);
  }, []);

  const handleNavChange = (id: string) => {
    if (id === 'incoming') navigate('/landlord/incoming-escrows');
    else if (id === 'transactions') navigate('/landlord/transactions');
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
      setError(err.message || 'Failed to connect wallet.');
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
    { label: 'Total Escrows',      value: loading ? '…' : String(totalCount),    sub: 'All assigned escrows',        icon: <Building2 size={20} strokeWidth={2} aria-hidden="true" />,       color: '#A78BFA' },
    { label: 'Active / Pending',   value: loading ? '…' : String(pendingCount),  sub: 'Created or Funded',           icon: <Hourglass size={20} strokeWidth={2} aria-hidden="true" />,       color: '#F59E0B' },
    { label: 'Released Deposits',  value: loading ? '…' : String(releasedCount), sub: 'Successfully completed',      icon: <CircleCheckBig size={20} strokeWidth={2} aria-hidden="true" />,  color: '#10B981' },
    { label: 'Total Deposit Value',value: loading ? '…' : `${totalValue} XLM`,   sub: 'Across all properties',       icon: <Banknote size={20} strokeWidth={2} aria-hidden="true" />,        color: '#60A5FA' },
  ];

  return (
    <DashboardLayout dark
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
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '1px solid rgba(224,215,255,0.25)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative glows */}
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,255,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '40%', bottom: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,97,245,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,92,255,0.2)', border: '1px solid rgba(124,92,255,0.35)', borderRadius: 50, padding: '4px 12px', fontFamily: font, fontSize: '0.7rem', fontWeight: 600, color: '#C4B5FD', marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 8px rgba(124,92,255,0.8)', display: 'inline-block' }} />
            Property Manager
          </div>
          <h1 style={{ fontFamily: font, fontWeight: 800, fontSize: 'clamp(1.25rem, 3vw, 1.7rem)', color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>
            Welcome back
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
              icon={walletAddress ? <Check size={14} strokeWidth={2.2} aria-hidden="true" /> : <Wallet size={14} strokeWidth={2} aria-hidden="true" />}
              onClick={walletAddress ? undefined : handleConnectWallet}
            />
            <QuickBtn label="Incoming Deposits" icon={<Inbox size={14} strokeWidth={2} aria-hidden="true" />} primary onClick={() => navigate('/landlord/incoming-escrows')} />
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
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 18px', marginBottom: 16, fontFamily: font, fontSize: '0.85rem', color: '#F87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" /> {error}
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {dynamicStats.map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '20px 22px',
            border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.25s, transform 0.25s', cursor: 'default',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ color: stat.color, background: `${stat.color}18`, border: `1px solid ${stat.color}40`, borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</span>
              <span style={{ fontFamily: font, fontSize: '0.68rem', fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.1)', borderRadius: 50, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}><TrendingUp size={11} strokeWidth={2.5} aria-hidden="true" />Live</span>
            </div>
            <div style={{ fontFamily: font, fontWeight: 800, fontSize: '1.65rem', color: C.textDark, letterSpacing: '-1px', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: font, fontWeight: 500, fontSize: '0.8rem', color: C.textMid, marginTop: 4 }}>{stat.label}</div>
            <div style={{ fontFamily: font, fontSize: '0.72rem', color: C.textLight, marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '20px 24px', border: `1px solid ${C.border}`, marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <QuickBtn label="Incoming Deposits" icon={<Inbox size={14} strokeWidth={2} aria-hidden="true" />} primary onClick={() => navigate('/landlord/incoming-escrows')} />
          <QuickBtn label="Generate Report" icon={<BarChart3 size={14} strokeWidth={2} aria-hidden="true" />} />
          <QuickBtn label="Confirm Move-in" icon={<ClipboardCheck size={14} strokeWidth={2} aria-hidden="true" />} />
          <QuickBtn label="Contact Support" icon={<MessageCircle size={14} strokeWidth={2} aria-hidden="true" />} />
        </div>
      </div>

      {/* ── Recent Escrows Table ── */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark }}>
            Recent Escrow Assignments
          </h3>
          <button
            onClick={() => navigate('/landlord/incoming-escrows')}
            className="dl-arrow-link"
            style={{ fontFamily: font, fontWeight: 600, fontSize: '0.78rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            View all
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Escrow ID', 'Property', 'Student Wallet', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ fontFamily: font, fontWeight: 700, fontSize: '0.72rem', color: C.textLight, textAlign: 'left', padding: '12px 20px', letterSpacing: '0.4px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : error ? (
                <tr><td colSpan={6} style={{ padding: '28px 20px', textAlign: 'center', fontFamily: font, fontWeight: 600, color: '#F87171' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} strokeWidth={2} aria-hidden="true" /> {error}</span></td></tr>
              ) : escrows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%', background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
                      <Inbox size={26} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div style={{ fontFamily: font, fontWeight: 700, fontSize: '1rem', color: C.textDark }}>No escrows assigned yet.</div>
                    <p style={{ fontFamily: font, fontSize: '0.8rem', color: C.textMid, marginTop: 6, marginBottom: 14 }}>
                      Escrows assigned to your wallet address will appear here.
                    </p>
                    {!walletAddress && (
                      <button
                        onClick={handleConnectWallet}
                        style={{ fontFamily: font, fontWeight: 700, fontSize: '0.8rem', color: '#fff', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '8px 20px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,92,255,0.25)' }}
                      >
                        Connect Wallet to Load Data
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                escrows.slice(0, 5).map((row) => {
                  const targetId = row.escrowId !== undefined ? String(row.escrowId) : row._id;
                  const escrowLabel = row.escrowId !== undefined ? `ESC-${String(row.escrowId).padStart(3, '0')}` : 'Pending';
                  const formattedDate = new Date(row.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
                  const ss = STATUS_STYLE[row.status] || STATUS_STYLE['CREATED'];
                  return (
                    <tr
                      key={row._id}
                      onClick={() => navigate(`/landlord/escrow/${targetId}`)}
                      style={{ borderTop: `1px solid ${C.border}`, background: 'transparent', transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,92,255,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
