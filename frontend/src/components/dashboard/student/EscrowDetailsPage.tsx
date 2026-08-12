import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { STUDENT_NAV_ITEMS as NAV_ITEMS } from '@/components/dashboard/navItems';
import {
  Activity, AlertTriangle, ArrowLeft, Building2, CalendarDays, Check,
  ChevronRight, CircleCheckBig, Coins, ExternalLink, FileQuestion, FileText,
  GraduationCap, HandCoins, HelpCircle, Home, Hourglass, Info, Lightbulb,
  Link2, MapPin, MessageCircle, Rocket, Unlock, XCircle, Zap,
} from 'lucide-react';
import {
  getEscrowDb,
  fundEscrowDb,
  confirmEscrowDb,
} from '@/services/escrowService';
import { depositEscrow, confirmEscrow } from '@/services/sorobanService';
import { FiatValue } from '@/components/ui/FiatValue';
import { StellarExplorerLink } from '@/components/ui/StellarExplorerLink';
import { InspectionPhotoVault } from '@/components/ui/InspectionPhotoVault';

/* ─── Design tokens (match index.css) ─────────────────────────── */
const C = {
  orange: '#A78BFA', orangeLight: '#8B5CF6',
  bg: '#0B0A10', white: '#FFFFFF', border: 'rgba(255,255,255,0.08)',
  textDark: '#FFFFFF', textMid: 'rgba(255,255,255,0.64)', textLight: 'rgba(255,255,255,0.4)',
};
const font = "'Inter', sans-serif";

/* ─── Status config ─────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CREATED: { label: 'Created', color: '#97A0B5', bg: 'rgba(151,160,181,0.1)', border: 'rgba(151,160,181,0.3)' },
  FUNDED: { label: 'Funded', color: '#6E9BFF', bg: 'rgba(46,107,255,0.1)', border: 'rgba(46,107,255,0.3)' },
  PENDING_CONFIRMATION: { label: 'Pending Confirmation', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  RELEASED: { label: 'Released', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  DISPUTED: { label: 'Disputed', color: '#F87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  CANCELLED: { label: 'Cancelled', color: '#9CA3AF', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
};

/* ─── Helper components ─────────────────────────── */
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: `1px solid ${C.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '24px 26px',
    ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ label }: { label: React.ReactNode }) => (
  <h3 style={{ font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
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
    background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: 8,
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
  const icon = type === 'error' ? <XCircle size={16} strokeWidth={2} aria-hidden="true" />
    : type === 'warning' ? <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
      : <Info size={16} strokeWidth={2} aria-hidden="true" />;
  return (
    <div role="status" aria-live="polite" style={{
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
      <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span> {message}
    </div>
  );
};

/* ─── Skeleton loader ─────── */
const SkeletonBlock = ({ w = '100%', h = 14, mb = 10 }: { w?: string | number; h?: number; mb?: number }) => (
  <div style={{ height: h, width: w, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: mb, animation: 'skPulse 1.4s infinite ease-in-out' }} />
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

  const handleDeposit = () => {
    if (!escrow?.escrowId) {
      showToast("Escrow ID not found", "error");
      return;
    }

    const rawAmt = escrow.depositAmount || 20000;
    const visualAmt = rawAmt < 5000 ? Math.round(rawAmt * 86.40) : rawAmt;

    navigate(`/student/payment-journey/${escrow.escrowId}`, {
      state: {
        depositAmount: visualAmt,
        propertyName: escrow.propertyName || 'Green Residency Apartments',
        propertyAddress: escrow.propertyAddress || '42 Green Lane'
      }
    });
  };

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? undefined : 'translateY(20px)',
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
    { key: 'CREATED', label: 'Escrow Created', icon: <Rocket size={13} strokeWidth={2} aria-hidden="true" /> },
    { key: 'FUNDED', label: 'Deposit Funded', icon: <Coins size={13} strokeWidth={2} aria-hidden="true" /> },
    { key: 'PENDING_CONFIRMATION', label: 'Awaiting Confirmation', icon: <Hourglass size={13} strokeWidth={2} aria-hidden="true" /> },
    { key: 'RELEASED', label: 'Deposit Released', icon: <Unlock size={13} strokeWidth={2} aria-hidden="true" /> },
  ];
  const STATUS_ORDER = ['CREATED', 'FUNDED', 'PENDING_CONFIRMATION', 'RELEASED'];
  const currentIdx = escrow ? STATUS_ORDER.indexOf(escrow.status) : -1;

  const stellarExpertUrl = escrow?.transactionHash
    ? `https://stellar.expert/explorer/testnet/tx/${escrow.transactionHash}`
    : null;

  return (
    <DashboardLayout dark
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
        <ChevronRight size={13} strokeWidth={2} aria-hidden="true" style={{ color: C.textLight }} />
        <button onClick={() => navigate('/student/my-deposits')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          My Deposits
        </button>
        <ChevronRight size={13} strokeWidth={2} aria-hidden="true" style={{ color: C.textLight }} />
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Escrow Details</span>
      </div>

      {/* ── Loading / Error states ── */}
      {loading && (
        <div style={{ ...fadeIn(50) }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, border: `1px solid ${C.border}` }}>
            <SkeletonBlock h={28} w="40%" mb={12} />
            <SkeletonBlock h={16} w="25%" />
          </div>
          <div className="grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ display: 'grid', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1, 2, 3].map(k => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                  <SkeletonBlock h={18} w="50%" mb={16} />
                  {[1, 2, 3, 4].map(j => <SkeletonBlock key={j} h={14} mb={12} />)}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1, 2].map(k => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
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
          <div style={{ width: 72, height: 72, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
            <FileQuestion size={32} strokeWidth={1.8} aria-hidden="true" />
          </div>
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
          <div className="grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>

            {/* ════════════ LEFT COLUMN ════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Property Information Card */}
              <div style={fadeIn(100)}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    height: 150,
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(233,97,245,0.08) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(224,215,255,0.85)',
                  }}>
                    <Home size={56} strokeWidth={1.4} aria-hidden="true" style={{ filter: 'drop-shadow(0 4px 12px rgba(124,92,255,0.45))' }} />
                  </div>
                  <div style={{ padding: 24 }}>
                    <SectionTitle label={<><Home size={15} strokeWidth={2} aria-hidden="true" /> Property Information</>} />
                    <div style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, marginBottom: 4 }}>
                      {escrow.propertyName}
                    </div>
                    {escrow.propertyAddress && (
                      <div style={{ font, fontSize: '0.83rem', color: C.textMid, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={12} strokeWidth={2} aria-hidden="true" /> {escrow.propertyAddress}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                      <InfoRow label="Deposit Amount" value={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{`${escrow.depositAmount} ${escrow.currency}`} <FiatValue amountXlm={escrow.depositAmount} /></span>} />
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
                  <SectionTitle label={<><GraduationCap size={15} strokeWidth={2} aria-hidden="true" /> Student Information</>} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2E6BFF, #60A5FA)',
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
                  <SectionTitle label={<><Building2 size={15} strokeWidth={2} aria-hidden="true" /> Landlord Information</>} />
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
                  <SectionTitle label={<><FileText size={15} strokeWidth={2} aria-hidden="true" /> Escrow Summary</>} />
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
                  <SectionTitle label={<><Link2 size={15} strokeWidth={2} aria-hidden="true" /> Blockchain Information</>} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Student Wallet</div>
                      <MonoBlock value={escrow.studentWallet} />
                    </div>
                    <div>
                      <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Transaction Hash</div>
                      {escrow.transactionHash ? (
                        <div style={{ marginTop: 4 }}>
                          <StellarExplorerLink txHash={escrow.transactionHash} network={escrow.network} />
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
                          boxShadow: '0 4px 12px rgba(124,92,255,0.25)',
                          marginTop: 8,
                        }}
                      >
                        <ExternalLink size={14} strokeWidth={2} aria-hidden="true" /> View on Stellar Expert
                      </a>
                    )}
                  </div>
                </Card>
              </div>

              {/* Action Section */}
              <div style={{ ...fadeIn(260), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Action Buttons */}
                <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionTitle label={<><Zap size={15} strokeWidth={2} aria-hidden="true" /> Actions</>} />
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
                        boxShadow: "0 6px 18px rgba(124,92,255,0.30)",
                        transition: "all 0.2s",
                      }}
                    >
                      {depositing ? "Processing…" : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><HandCoins size={15} strokeWidth={2} aria-hidden="true" /> Deposit Funds</span>}
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
                          background: "rgba(255,255,255,0.06)",
                          border: `1.5px solid ${C.border}`,
                          borderRadius: 50,
                          padding: "13px",
                          cursor: "not-allowed",
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Check size={14} strokeWidth={2.2} aria-hidden="true" /> Waiting for landlord confirmation</span>
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
                          boxShadow: "0 6px 18px rgba(124,92,255,0.30)",
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Check size={14} strokeWidth={2.2} aria-hidden="true" /> Confirm Move-In</span>
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
                          color: "#10B981",
                          background: "rgba(16,185,129,0.1)",
                          border: "1.5px solid rgba(16,185,129,0.4)",
                          borderRadius: 50,
                          padding: "13px",
                          cursor: "not-allowed",
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Check size={14} strokeWidth={2.2} aria-hidden="true" /> Move-In Confirmed</span>
                      </button>
                      <div style={{ font, fontSize: '0.72rem', color: C.textLight, textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Hourglass size={12} strokeWidth={2} aria-hidden="true" /> Waiting for landlord to release deposit</span>
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
                        color: "#10B981",
                        background: "rgba(16,185,129,0.1)",
                        border: "1.5px solid rgba(16,185,129,0.4)",
                        borderRadius: 50,
                        padding: "13px",
                        cursor: "not-allowed",
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><CircleCheckBig size={14} strokeWidth={2.2} aria-hidden="true" /> Deposit Released</span>
                    </button>
                  )}
                  <button
                    onClick={handleRaiseDispute}
                    style={{
                      width: '100%', font, fontWeight: 700, fontSize: '0.88rem', color: C.white,
                      background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', border: 'none',
                      borderRadius: 50, padding: '13px', cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(239,68,68,0.3)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(239,68,68,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(239,68,68,0.3)'; }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={14} strokeWidth={2.2} aria-hidden="true" /> Raise Dispute</span>
                  </button>
                  <button style={{
                    width: '100%', font, fontWeight: 600, fontSize: '0.88rem', color: C.textDark,
                    background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${C.border}`,
                    borderRadius: 50, padding: '13px', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDark; }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><MessageCircle size={14} strokeWidth={2} aria-hidden="true" /> Contact Landlord</span>
                  </button>
                  <button
                    onClick={() => navigate('/student/my-deposits')}
                    style={{
                      width: '100%', font, fontWeight: 600, fontSize: '0.88rem', color: C.textMid,
                      background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '6px',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={13} strokeWidth={2} aria-hidden="true" /> Back to My Deposits</span>
                  </button>
                </Card>

                {/* Need Assistance Card */}
                <Card style={{ background: 'linear-gradient(135deg, rgba(124,92,255,0.06), rgba(233,97,245,0.03))', border: `1px solid rgba(124,92,255,0.15)` }}>
                  <SectionTitle label={<><HelpCircle size={15} strokeWidth={2} aria-hidden="true" /> Need Assistance?</>} />
                  <p style={{ font, fontSize: '0.8rem', color: C.textMid, lineHeight: 1.6, marginBottom: 18 }}>
                    DepositSafe keeps your rental deposit secure until move-in confirmation. If you face any issues, our dispute support is here 24/7.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ flex: 1, font, fontWeight: 600, fontSize: '0.78rem', color: C.orange, border: `1.5px solid rgba(124,92,255,0.4)`, borderRadius: 50, padding: '8px 0', background: 'transparent', cursor: 'pointer' }}>
                      FAQ
                    </button>
                    <button style={{ flex: 1, font, fontWeight: 600, fontSize: '0.78rem', color: C.white, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '8px 0', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,92,255,0.25)' }}>
                      Support
                    </button>
                  </div>
                </Card>
              </div>

              {/* Condition & Inspection Photo Vault (IPFS) */}
              <div style={fadeIn(300)}>
                <InspectionPhotoVault escrowId={escrow.escrowId || escrow._id} userRole="student" />
              </div>
            </div>

            {/* ════════════ RIGHT COLUMN (Sidebar) ════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, ...fadeIn(120) }}>
              <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Progress Card */}
                <Card style={{ border: `1.5px solid rgba(124,92,255,0.22)` }}>
                  <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={15} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> Escrow Progress
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, height: 8, width: '100%', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #7C5CFF, #A78BFA)', boxShadow: '0 0 12px rgba(124,92,255,0.7)', borderRadius: 10, transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)' }} />
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
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#E0D7FF', letterSpacing: '-0.2px', marginTop: 2 }}>
                      {escrow.depositAmount} {escrow.currency}
                    </div>
                  </div>
                </Card>

                {/* Escrow Timeline */}
                <Card>
                  <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarDays size={15} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> Escrow Timeline
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
                            background: isCompleted ? '#10B981' : isCurrent ? C.orange : 'rgba(255,255,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                            transition: 'background 0.4s',
                          }}>
                            {isCompleted ? <Check size={13} strokeWidth={2.5} aria-hidden="true" /> : step.icon}
                          </div>
                          {i < arr.length - 1 && (
                            <div style={{
                              width: 2, flex: 1, minHeight: 22,
                              background: isCompleted ? '#10B981' : 'rgba(255,255,255,0.12)',
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
                <Card style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Lightbulb size={18} strokeWidth={2} aria-hidden="true" style={{ color: '#10B981', flexShrink: 0 }} />
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
