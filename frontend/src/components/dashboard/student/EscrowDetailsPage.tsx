import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';
import {
  getEscrowDb,
  fundEscrowDb,
  confirmEscrowDb,
} from '@/services/escrowService';
import { depositEscrow, confirmEscrow } from '@/services/sorobanService';

/* ─── Design tokens (match index.css) ─────────────────────────── */
const C = {
  orange: '#E8734A', orangeLight: '#F0956B',
  bg: '#F4F6FA', white: '#FFFFFF', border: '#EEEEEE',
  textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA',
};
const font = "'Poppins', sans-serif";

/* ─── Shared nav items ─────────────── */
const Icon = ({ d, size = 17 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'deposits', label: 'My Deposits', icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'escrow', label: 'Create Escrow', icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  { id: 'history', label: 'Transaction History', icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile', label: 'Profile', icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings', label: 'Settings', icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
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

/* ─── Status config ─────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CREATED: { label: 'Created', color: '#2B6CB0', bg: 'rgba(74,144,226,0.1)', border: 'rgba(74,144,226,0.3)' },
  FUNDED: { label: 'Funded', color: '#C07A12', bg: 'rgba(240,163,74,0.1)', border: 'rgba(240,163,74,0.3)' },
  PENDING_CONFIRMATION: { label: 'Pending Confirmation', color: '#8E44AD', bg: 'rgba(155,89,182,0.1)', border: 'rgba(155,89,182,0.3)' },
  RELEASED: { label: 'Released', color: '#2AAF5C', bg: 'rgba(74,207,122,0.1)', border: 'rgba(74,207,122,0.3)' },
  DISPUTED: { label: 'Disputed', color: '#C53030', bg: 'rgba(234,67,53,0.1)', border: 'rgba(234,67,53,0.3)' },
  CANCELLED: { label: 'Cancelled', color: '#4B5563', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
};

/* ─── Helper components ─────────────────────────── */
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '24px 26px',
    ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ label }: { label: string }) => (
  <h3 style={{ font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 18 }}>
    {label}
  </h3>
);

const InfoRow = ({ label, value, bold, accent }: { label: string; value: React.ReactNode; bold?: boolean; accent?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 12 }}>
    <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{label}</span>
    <span style={{ font, fontWeight: bold ? 700 : 500, fontSize: '0.82rem', color: accent ? C.orange : C.textDark, textAlign: 'right' }}>
      {value}
    </span>
  </div>
);

const MonoBlock = ({ value }: { value: string }) => (
  <div style={{
    font, fontWeight: 600, fontSize: '0.78rem', color: C.textMid,
    background: '#FAFAFA', padding: '6px 10px', borderRadius: 8,
    border: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap',
    fontFamily: 'monospace',
  }}>
    {value}
  </div>
);

const Toast = ({ visible, message, type = 'info' }: { visible: boolean; message: string; type?: 'info' | 'warning' | 'error' }) => {
  const bg = type === 'error' ? 'linear-gradient(135deg,#2E1A1A,#4E2E2E)'
    : type === 'warning' ? 'linear-gradient(135deg,#2E2210,#4E3A10)'
      : 'linear-gradient(135deg,#1A1A2E,#2E2E4E)';
  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: '#fff', borderRadius: 14, padding: '14px 22px',
      font, fontWeight: 600, fontSize: '0.88rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 10,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.4s, transform 0.4s',
      pointerEvents: 'none',
      maxWidth: 400,
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span> {message}
    </div>
  );
};

/* ─── Skeleton loader ─────── */
const SkeletonBlock = ({ w = '100%', h = 14, mb = 10 }: { w?: string | number; h?: number; mb?: number }) => (
  <div style={{ height: h, width: w, background: '#F0F0F0', borderRadius: 6, marginBottom: mb, animation: 'skPulse 1.4s infinite ease-in-out' }} />
);

const EscrowDetailsPage: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const displayName = storedUser ? (JSON.parse(storedUser).name || "Student") : "Student";
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'info' | 'warning' | 'error'>('info');

  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  useEffect(() => {
    if (!id) {
      setFetchError('No escrow ID provided.');
      setLoading(false);
      return;
    }
    getEscrowDb(id)
      .then((data: any) => {
        setEscrow(data.escrow || data);
      })
      .catch((err: any) => {
        if (err?.response?.status === 404) {
          setFetchError('Escrow not found.');
        } else {
          setFetchError(err?.response?.data?.message || err.message || 'Failed to load escrow details.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadEscrow = async () => {
    if (!id) return;

    try {
      const data = await getEscrowDb(id);
      setEscrow(data.escrow || data);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string, type: 'info' | 'warning' | 'error' = 'info') => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleRaiseDispute = () => showToast('Dispute request submitted', 'warning');


  const handleConfirmMoveIn = async () => {
    if (!escrow?.escrowId) {
      showToast('Escrow ID not found', 'error');
      return;
    }

    try {
      const result = await confirmEscrow(escrow.escrowId);

      await confirmEscrowDb(escrow.escrowId, {
        txHash: result.txHash,
      });

      await loadEscrow();
      showToast('Move-in confirmed successfully', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Confirmation failed', 'error');
    }
  };

  const handleDeposit = async () => {
    console.log("Escrow object:", escrow);
    if (!escrow?.escrowId) {
      showToast("Escrow ID not found", "error");
      return;
    }

    try {
      setDepositing(true);

      console.log("========== ESCROW DEBUG ==========");
      console.log("Entire Escrow:", escrow);
      console.log("Mongo ID:", escrow._id);
      console.log("Contract Escrow ID:", escrow.escrowId);
      console.log("Status from DB:", escrow.status);
      console.log("Student Wallet:", escrow.studentWallet);
      console.log("=================================");

      const result = await depositEscrow(
        escrow.escrowId
      );

      await fundEscrowDb(
        escrow.escrowId,
        {
          txHash: result.txHash,
        }
      );

      await loadEscrow();

      showToast(
        "Deposit funded successfully!",
        "info"
      );

    } catch (err: any) {
      console.error(err);

      showToast(
        err?.message || "Deposit failed",
        "error"
      );

    } finally {
      setDepositing(false);
    }
  };

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  // Derived display values
  const statusCfg = escrow ? (STATUS_CONFIG[escrow.status] || STATUS_CONFIG['CREATED']) : null;
  const escrowLabel = escrow
    ? (escrow.escrowId !== undefined ? `ESC-${String(escrow.escrowId).padStart(3, '0')}` : 'Pending')
    : '';
  const formattedCreated = escrow
    ? new Date(escrow.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  // Progress % by status
  const progressByStatus: Record<string, number> = {
    CREATED: 20, FUNDED: 40, PENDING_CONFIRMATION: 60, RELEASED: 100, DISPUTED: 30, CANCELLED: 0,
  };
  const progressPct = escrow ? (progressByStatus[escrow.status] ?? 20) : 0;

  // Timeline steps
  const TIMELINE = [
    { key: 'CREATED', label: 'Escrow Created', icon: '🚀' },
    { key: 'FUNDED', label: 'Deposit Funded', icon: '💰' },
    { key: 'PENDING_CONFIRMATION', label: 'Awaiting Confirmation', icon: '⏳' },
    { key: 'RELEASED', label: 'Deposit Released', icon: '🔓' },
  ];
  const STATUS_ORDER = ['CREATED', 'FUNDED', 'PENDING_CONFIRMATION', 'RELEASED'];
  const currentIdx = escrow ? STATUS_ORDER.indexOf(escrow.status) : -1;

  const stellarExpertUrl = escrow?.transactionHash
    ? `https://stellar.expert/explorer/testnet/tx/${escrow.transactionHash}`
    : null;

  return (
    <DashboardLayout
      role="student"
      userName={displayName}
      navItems={NAV_ITEMS}
      activeId="deposits"
      onNavChange={(navId) => {
        if (navId === 'dashboard') navigate('/student/dashboard');
        if (navId === 'escrow') navigate('/student/create-escrow');
        if (navId === 'deposits') navigate('/student/my-deposits');
        if (navId === 'history') navigate('/student/transactions');
        if (navId === 'profile') navigate('/student/profile');
        if (navId === 'settings') navigate('/student/settings');
      }}
    >
      <style>{`
        @keyframes skPulse { 0% { opacity:0.6; } 50% { opacity:1; } 100% { opacity:0.6; } }
      `}</style>
      <Toast visible={toastVisible} message={toastMsg} type={toastType} />

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <button onClick={() => navigate('/student/my-deposits')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          My Deposits
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Escrow Details</span>
      </div>

      {/* ── Loading / Error states ── */}
      {loading && (
        <div style={{ ...fadeIn(50) }}>
          <div style={{ background: C.white, borderRadius: 20, padding: '28px 32px', marginBottom: 24, border: `1px solid ${C.border}` }}>
            <SkeletonBlock h={28} w="40%" mb={12} />
            <SkeletonBlock h={16} w="25%" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1, 2, 3].map(k => (
                <div key={k} style={{ background: C.white, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                  <SkeletonBlock h={18} w="50%" mb={16} />
                  {[1, 2, 3, 4].map(j => <SkeletonBlock key={j} h={14} mb={12} />)}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1, 2].map(k => (
                <div key={k} style={{ background: C.white, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                  <SkeletonBlock h={18} w="60%" mb={16} />
                  {[1, 2, 3].map(j => <SkeletonBlock key={j} h={14} mb={12} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && fetchError && (
        <div style={{ ...fadeIn(50), textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>😕</div>
          <h2 style={{ font, fontWeight: 800, fontSize: '1.3rem', color: C.textDark, marginBottom: 8 }}>
            {fetchError === 'Escrow not found.' ? 'Escrow Not Found' : 'Failed to Load'}
          </h2>
          <p style={{ font, fontSize: '0.88rem', color: C.textMid, marginBottom: 24 }}>{fetchError}</p>
          <button
            onClick={() => navigate('/student/my-deposits')}
            style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.white, background: `linear-gradient(135deg,${C.orange},${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '11px 24px', cursor: 'pointer' }}
          >
            Back to My Deposits
          </button>
        </div>
      )}

      {!loading && !fetchError && escrow && (
        <>
          {/* ── Page Header ── */}
          <div style={{
            ...fadeIn(50),
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 16, marginBottom: 28,
          }}>
            <div>
              <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.textDark, letterSpacing: '-0.6px', marginBottom: 6 }}>
                Escrow Details
              </h1>
              <p style={{ font, fontWeight: 500, fontSize: '0.9rem', color: C.textMid }}>
                Escrow ID: <span style={{ color: C.orange, fontWeight: 700 }}>{escrowLabel}</span>
              </p>
            </div>

            {/* Status Badge */}
            {statusCfg && (
              <div style={{
                background: statusCfg.bg,
                border: `1.5px solid ${statusCfg.border}`,
                borderRadius: 50, padding: '8px 18px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusCfg.color }} />
                <span style={{ font, fontWeight: 700, fontSize: '0.8rem', color: statusCfg.color }}>{statusCfg.label}</span>
              </div>
            )}
          </div>

          {/* ══ 2-column layout ══ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>

            {/* ════════════ LEFT COLUMN ════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Property Information Card */}
              <div style={fadeIn(100)}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    height: 150,
                    background: 'linear-gradient(135deg, rgba(232,115,74,0.15) 0%, rgba(240,149,107,0.08) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem',
                  }}>
                    🏠
                  </div>
                  <div style={{ padding: 24 }}>
                    <SectionTitle label="🏠 Property Information" />
                    <div style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, marginBottom: 4 }}>
                      {escrow.propertyName}
                    </div>
                    {escrow.propertyAddress && (
                      <div style={{ font, fontSize: '0.83rem', color: C.textMid, marginBottom: 18 }}>
                        📍 {escrow.propertyAddress}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                      <InfoRow label="Deposit Amount" value={`${escrow.depositAmount} ${escrow.currency}`} />
                      <InfoRow label="Network" value={escrow.network || 'Stellar Testnet'} />
                      <InfoRow label="Escrow Status" value={statusCfg?.label || escrow.status} />
                      <InfoRow label="Created At" value={formattedCreated} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Wallet Addresses */}
              <div style={{ ...fadeIn(140), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Student Card */}
                <Card>
                  <SectionTitle label="🎓 Student Information" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      font, fontWeight: 700, color: '#fff', fontSize: '1.2rem',
                    }}>
                      S
                    </div>
                    <div>
                      <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>Student Tenant</div>
                      <div style={{ font, fontSize: '0.75rem', color: C.textLight }}>Deposit Originator</div>
                    </div>
                  </div>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Wallet Address</div>
                  <MonoBlock value={escrow.studentWallet} />
                </Card>

                {/* Landlord Card */}
                <Card>
                  <SectionTitle label="🏢 Landlord Information" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      font, fontWeight: 700, color: '#fff', fontSize: '1.2rem',
                    }}>
                      L
                    </div>
                    <div>
                      <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>Landlord</div>
                      <div style={{ font, fontSize: '0.75rem', color: C.textLight }}>Deposit Recipient</div>
                    </div>
                  </div>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Wallet Address</div>
                  <MonoBlock value={escrow.landlordWallet} />
                </Card>
              </div>

              {/* Escrow Summary & Blockchain Info */}
              <div style={{ ...fadeIn(180), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Escrow Summary Card */}
                <Card>
                  <SectionTitle label="📝 Escrow Summary" />
                  <InfoRow label="Escrow ID" value={escrowLabel} bold accent />
                  <InfoRow label="MongoDB ID" value={`${escrow._id?.slice(0, 8)}…`} />
                  <InfoRow label="Deposit Amount" value={`${escrow.depositAmount} ${escrow.currency}`} />
                  <div style={{ height: 1, background: C.border, margin: '10px 0' }} />
                  <InfoRow label="Created" value={formattedCreated} />
                  <InfoRow label="Current Status" value={statusCfg?.label || escrow.status} bold />
                  <InfoRow label="Network" value={escrow.network || 'Stellar Testnet'} />
                  {escrow.contractId && <InfoRow label="Contract ID" value={`${escrow.contractId.slice(0, 10)}…`} />}
                </Card>

                {/* Blockchain Info Card */}
                <Card>
                  <SectionTitle label="🔗 Blockchain Information" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Student Wallet</div>
                      <MonoBlock value={escrow.studentWallet} />
                    </div>
                    <div>
                      <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Transaction Hash</div>
                      {escrow.transactionHash ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MonoBlock value={`${escrow.transactionHash.slice(0, 16)}…${escrow.transactionHash.slice(-8)}`} />
                          {stellarExpertUrl && (
                            <a
                              href={stellarExpertUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                font, fontWeight: 700, fontSize: '0.72rem', color: C.orange,
                                textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                              }}
                            >
                              View ↗
                            </a>
                          )}
                        </div>
                      ) : (
                        <MonoBlock value="Not yet recorded" />
                      )}
                    </div>
                    <InfoRow label="Network" value={escrow.network || 'Stellar Testnet'} />
                    <InfoRow label="Current State" value={statusCfg?.label || escrow.status} />
                    {stellarExpertUrl && (
                      <a
                        href={stellarExpertUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 8, font, fontWeight: 700, fontSize: '0.8rem', color: C.white,
                          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                          borderRadius: 50, padding: '10px 16px', textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(232,115,74,0.25)',
                          marginTop: 8,
                        }}
                      >
                        🔍 View on Stellar Expert
                      </a>
                    )}
                  </div>
                </Card>
              </div>

              {/* Action Section */}
              <div style={{ ...fadeIn(260), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Action Buttons */}
                <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionTitle label="⚡ Actions" />
                  {escrow.status === "CREATED" && (
                    <button
                      onClick={handleDeposit}
                      disabled={depositing}
                      style={{
                        width: "100%",
                        font,
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "#fff",
                        background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                        border: "none",
                        borderRadius: 50,
                        padding: "13px",
                        cursor: depositing ? "not-allowed" : "pointer",
                        opacity: depositing ? 0.7 : 1,
                        boxShadow: "0 6px 18px rgba(232,115,74,0.30)",
                        transition: "all 0.2s",
                      }}
                    >
                      {depositing ? "Processing..." : "💰 Deposit Funds"}
                    </button>
                  )}
                  {escrow.status === "FUNDED" && (
                    escrow.studentConfirmed ? (
                      <button
                        disabled
                        style={{
                          width: "100%",
                          font,
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: C.textMid,
                          background: "#F5F5F5",
                          border: `1.5px solid ${C.border}`,
                          borderRadius: 50,
                          padding: "13px",
                          cursor: "not-allowed",
                        }}
                      >
                        ✅ Waiting for landlord confirmation
                      </button>
                    ) : (
                      <button
                        onClick={handleConfirmMoveIn}
                        style={{
                          width: "100%",
                          font,
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: "#fff",
                          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                          border: "none",
                          borderRadius: 50,
                          padding: "13px",
                          cursor: "pointer",
                          boxShadow: "0 6px 18px rgba(232,115,74,0.30)",
                          transition: "all 0.2s",
                        }}
                      >
                        ✅ Confirm Move-In
                      </button>
                    )
                  )}
                  {escrow.status === "PENDING_CONFIRMATION" && escrow.studentConfirmed && escrow.landlordConfirmed && (
                    <>
                      <button
                        disabled
                        style={{
                          width: "100%",
                          font,
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: "#2AAF5C",
                          background: "rgba(74,207,122,0.1)",
                          border: "1.5px solid rgba(74,207,122,0.4)",
                          borderRadius: 50,
                          padding: "13px",
                          cursor: "not-allowed",
                        }}
                      >
                        ✓ Move-In Confirmed
                      </button>
                      <div style={{ font, fontSize: '0.72rem', color: C.textLight, textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
                        ⏳ Waiting for landlord to release deposit
                      </div>
                    </>
                  )}
                  {escrow.status === "RELEASED" && (
                    <button
                      disabled
                      style={{
                        width: "100%",
                        font,
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "#2AAF5C",
                        background: "rgba(74,207,122,0.1)",
                        border: "1.5px solid rgba(74,207,122,0.4)",
                        borderRadius: 50,
                        padding: "13px",
                        cursor: "not-allowed",
                      }}
                    >
                      ✅ Deposit Released
                    </button>
                  )}
                  <button
                    onClick={handleRaiseDispute}
                    style={{
                      width: '100%', font, fontWeight: 700, fontSize: '0.88rem', color: C.white,
                      background: 'linear-gradient(135deg, #ea4335 0%, #f06b6b 100%)', border: 'none',
                      borderRadius: 50, padding: '13px', cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(234,67,53,0.3)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(234,67,53,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(234,67,53,0.3)'; }}
                  >
                    🚨 Raise Dispute
                  </button>
                  <button style={{
                    width: '100%', font, fontWeight: 600, fontSize: '0.88rem', color: C.textDark,
                    background: C.white, border: `1.5px solid ${C.border}`,
                    borderRadius: 50, padding: '13px', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDark; }}
                  >
                    💬 Contact Landlord
                  </button>
                  <button
                    onClick={() => navigate('/student/my-deposits')}
                    style={{
                      width: '100%', font, fontWeight: 600, fontSize: '0.88rem', color: C.textMid,
                      background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '6px',
                    }}
                  >
                    ← Back to My Deposits
                  </button>
                </Card>

                {/* Need Assistance Card */}
                <Card style={{ background: 'linear-gradient(135deg, rgba(232,115,74,0.06), rgba(240,149,107,0.03))', border: `1px solid rgba(232,115,74,0.15)` }}>
                  <SectionTitle label="❓ Need Assistance?" />
                  <p style={{ font, fontSize: '0.8rem', color: C.textMid, lineHeight: 1.6, marginBottom: 18 }}>
                    DepositSafe keeps your rental deposit secure until move-in confirmation. If you face any issues, our dispute support is here 24/7.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ flex: 1, font, fontWeight: 600, fontSize: '0.78rem', color: C.orange, border: `1.5px solid rgba(232,115,74,0.4)`, borderRadius: 50, padding: '8px 0', background: 'transparent', cursor: 'pointer' }}>
                      FAQ
                    </button>
                    <button style={{ flex: 1, font, fontWeight: 600, fontSize: '0.78rem', color: C.white, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '8px 0', cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,115,74,0.25)' }}>
                      Support
                    </button>
                  </div>
                </Card>
              </div>
            </div>

            {/* ════════════ RIGHT COLUMN (Sidebar) ════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, ...fadeIn(120) }}>
              <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Progress Card */}
                <Card style={{ border: `1.5px solid rgba(232,115,74,0.22)` }}>
                  <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 12 }}>
                    ⚙️ Escrow Progress
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: '#EEEEEE', borderRadius: 10, height: 8, width: '100%', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: `linear-gradient(90deg, ${C.orange}, ${C.orangeLight})`, borderRadius: 10, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.textLight, marginBottom: 16 }}>
                    <span>Created</span>
                    <span style={{ color: C.orange, fontWeight: 700 }}>{progressPct}%</span>
                    <span>Released</span>
                  </div>

                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>Current Status</div>
                    <div style={{ font, fontWeight: 700, fontSize: '0.8rem', color: statusCfg?.color || C.textDark, marginTop: 2 }}>
                      {statusCfg?.label || escrow.status}
                    </div>
                  </div>

                  <div style={{ paddingTop: 10 }}>
                    <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>Deposit Amount</div>
                    <div style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.orange, marginTop: 2 }}>
                      {escrow.depositAmount} {escrow.currency}
                    </div>
                  </div>
                </Card>

                {/* Escrow Timeline */}
                <Card>
                  <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18 }}>
                    📅 Escrow Timeline
                  </div>
                  {TIMELINE.map((step, i, arr) => {
                    const stepIdx = STATUS_ORDER.indexOf(step.key);
                    const isCompleted = currentIdx >= stepIdx;
                    const isCurrent = currentIdx === stepIdx;
                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: isCompleted ? '#4ACF7A' : isCurrent ? C.orange : '#E0E0E0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                            transition: 'background 0.4s',
                          }}>
                            {isCompleted ? '✓' : step.icon}
                          </div>
                          {i < arr.length - 1 && (
                            <div style={{
                              width: 2, flex: 1, minHeight: 22,
                              background: isCompleted ? '#4ACF7A' : '#E0E0E0',
                              margin: '4px 0', transition: 'background 0.4s',
                            }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                          <div style={{
                            font, fontWeight: 700, fontSize: '0.78rem',
                            color: isCurrent ? C.orange : isCompleted ? C.textDark : C.textLight,
                          }}>
                            {step.label}
                          </div>
                          <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>
                            {isCompleted && step.key === 'CREATED'
                              ? formattedCreated
                              : isCompleted ? 'Completed'
                                : isCurrent ? 'In Progress'
                                  : 'Future Step'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Card>

                {/* Tips Card */}
                <Card style={{ background: 'rgba(74,207,122,0.04)', border: '1px solid rgba(74,207,122,0.2)' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: '1.25rem' }}>💡</span>
                    <div>
                      <div style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark, marginBottom: 3 }}>Tips</div>
                      <div style={{ font, fontSize: '0.75rem', color: C.textMid, lineHeight: 1.55 }}>
                        Always verify the property and lease agreement details physically before confirming your move-in.
                      </div>
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default EscrowDetailsPage;
