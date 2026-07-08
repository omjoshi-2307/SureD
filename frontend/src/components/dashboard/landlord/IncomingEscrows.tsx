import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';
import { getEscrowsByLandlordDb } from '@/services/escrowService';

const C = {
  orange: '#E8734A', orangeLight: '#F0956B',
  bg: '#F4F6FA', white: '#FFFFFF', border: '#EEEEEE',
  textDark: '#1A1A1A', textMid: '#6B6B6B', textLight: '#AAAAAA',
};
const font = "'Poppins', sans-serif";

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
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

/* ── DB escrow shape ── */
interface DbEscrow {
  _id: string;
  escrowId?: number;
  propertyName: string;
  propertyAddress?: string;
  studentWallet: string;
  landlordWallet: string;
  depositAmount: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
  status: 'CREATED' | 'FUNDED' | 'PENDING_CONFIRMATION' | 'RELEASED' | 'DISPUTED' | 'CANCELLED';
  transactionHash?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  purpose?: string;
  contractId?: string;
  network?: string;
}

/* ── Status config — identical to student pages ── */
const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  CREATED:              { bg: 'rgba(74,144,226,0.12)',  color: '#2B6CB0', border: '1px solid rgba(74,144,226,0.3)' },
  FUNDED:               { bg: 'rgba(240,163,74,0.12)', color: '#C07A12', border: '1px solid rgba(240,163,74,0.3)' },
  PENDING_CONFIRMATION: { bg: 'rgba(155,89,182,0.12)', color: '#8E44AD', border: '1px solid rgba(155,89,182,0.3)' },
  RELEASED:             { bg: 'rgba(74,207,122,0.12)', color: '#2AAF5C', border: '1px solid rgba(74,207,122,0.3)' },
  DISPUTED:             { bg: 'rgba(234,67,53,0.12)',  color: '#C53030', border: '1px solid rgba(234,67,53,0.3)' },
  CANCELLED:            { bg: 'rgba(107,114,128,0.12)',color: '#4B5563', border: '1px solid rgba(107,114,128,0.3)' },
};

/* ── Reusable UI helpers ── */
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '24px 26px', ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ label }: { label: string }) => (
  <h3 style={{ font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 18 }}>{label}</h3>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 12 }}>
    <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{label}</span>
    <span style={{ font, fontWeight: 500, fontSize: '0.82rem', color: C.textDark, textAlign: 'right' }}>{value}</span>
  </div>
);

const MonoBlock = ({ value }: { value: string }) => (
  <div style={{ font, fontWeight: 600, fontSize: '0.76rem', color: C.textMid, background: '#FAFAFA', padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap', fontFamily: 'monospace', marginBottom: 10 }}>
    {value}
  </div>
);

const Toast = ({ visible, message }: { visible: boolean; message: string }) => (
  <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, background: 'linear-gradient(135deg, #1A1A2E, #2E2E4E)', color: '#fff', borderRadius: 14, padding: '14px 22px', font, fontWeight: 600, fontSize: '0.88rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.4s, transform 0.4s', pointerEvents: 'none' }}>
    <span style={{ fontSize: '1.1rem' }}>ℹ️</span> {message}
  </div>
);

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, animation: 'iePulse 1.5s infinite ease-in-out' }}>
    <div style={{ height: 14, width: 80, background: '#F0F0F0', borderRadius: 4, marginBottom: 10 }} />
    <div style={{ height: 16, width: 200, background: '#F0F0F0', borderRadius: 4, marginBottom: 8 }} />
    <div style={{ height: 14, width: 140, background: '#F0F0F0', borderRadius: 4 }} />
  </div>
);

/* ════════════════════════════════════════════════════════════════ */
const IncomingEscrows: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  /* Live data */
  const [escrows, setEscrows] = useState<DbEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedEscrow, setSelectedEscrow] = useState<DbEscrow | null>(null);

  /* Toolbar */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');

  /* Modals */
  const [confirmMoveInItem, setConfirmMoveInItem] = useState<DbEscrow | null>(null);
  const [rejectItem, setRejectItem] = useState<DbEscrow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [chatItem, setChatItem] = useState<DbEscrow | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);

    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.walletAddress) {
        getEscrowsByLandlordDb(parsed.walletAddress)
          .then((data: any) => {
            const sorted = (data.escrows || []).sort(
              (a: DbEscrow, b: DbEscrow) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setEscrows(sorted);
            if (sorted.length > 0) setSelectedEscrow(sorted[0]);
          })
          .catch((err: any) => {
            setFetchError(err?.response?.data?.message || err.message || 'Failed to load escrows.');
          })
          .finally(() => setLoading(false));
        return;
      }
    }
    setLoading(false);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  /* Demo-mode action handlers */
  const handleConfirmMoveIn = () => {
    if (!confirmMoveInItem) return;
    triggerToast('Move-in confirmed (Demo Mode — no blockchain call made)');
    setConfirmMoveInItem(null);
  };

  const handleReject = () => {
    if (!rejectItem) return;
    triggerToast('Escrow rejected (Demo Mode — no blockchain call made)');
    setRejectItem(null);
    setRejectReason('');
    if (selectedEscrow?._id === rejectItem._id) setSelectedEscrow(null);
  };

  /* Filter & sort */
  const filtered = escrows.filter(item => {
    const label = item.escrowId !== undefined ? `ESC-${String(item.escrowId).padStart(3,'0')}` : item._id;
    const matchSearch =
      label.toLowerCase().includes(search.toLowerCase()) ||
      item.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      item.studentWallet.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Newest First')    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'Oldest First')    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'Highest Deposit') return b.depositAmount - a.depositAmount;
    if (sortBy === 'Lowest Deposit')  return a.depositAmount - b.depositAmount;
    if (sortBy === 'Property Name')   return a.propertyName.localeCompare(b.propertyName);
    return 0;
  });

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  /* Aggregate stats */
  const totalCount    = escrows.length;
  const activeCount   = escrows.filter(e => ['CREATED','FUNDED'].includes(e.status)).length;
  const pendingCount  = escrows.filter(e => e.status === 'PENDING_CONFIRMATION').length;
  const releasedCount = escrows.filter(e => e.status === 'RELEASED').length;
  const disputedCount = escrows.filter(e => e.status === 'DISPUTED').length;

  /* Helpers */
  const escrowLabel = (e: DbEscrow) =>
    e.escrowId !== undefined ? `ESC-${String(e.escrowId).padStart(3,'0')}` : 'Pending';
  const targetId = (e: DbEscrow) =>
    e.escrowId !== undefined ? String(e.escrowId) : e._id;
  const ss = (status: string) => STATUS_STYLE[status] || STATUS_STYLE['CREATED'];

  return (
    <DashboardLayout
      role="landlord"
      userName="Landlord"
      navItems={NAV_ITEMS}
      activeId="incoming"
      onNavChange={(id) => {
        if (id === 'dashboard') navigate('/landlord/dashboard');
      }}
    >
      <style>{`@keyframes iePulse{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}`}</style>
      <Toast visible={toast} message={toastMsg} />

      {/* ── Confirm Move-In Modal ── */}
      {confirmMoveInItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 32, maxWidth: 440, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 12 }}>✅</div>
            <h2 style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, textAlign: 'center', marginBottom: 8 }}>Confirm Move-In</h2>
            <p style={{ font, fontSize: '0.85rem', color: C.textMid, textAlign: 'center', marginBottom: 20 }}>
              You are confirming move-in for <strong>{confirmMoveInItem.propertyName}</strong>. This action will be recorded in demo mode.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmMoveInItem(null)} style={{ flex: 1, font, fontWeight: 600, fontSize: '0.85rem', color: C.textDark, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '11px 0', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmMoveIn} style={{ flex: 1, font, fontWeight: 700, fontSize: '0.85rem', color: '#fff', background: 'linear-gradient(135deg, #4ACF7A, #2AAF5C)', border: 'none', borderRadius: 50, padding: '11px 0', cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,207,122,0.3)' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 32, maxWidth: 440, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <h2 style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, textAlign: 'center', marginBottom: 8 }}>Reject Escrow</h2>
            <p style={{ font, fontSize: '0.85rem', color: C.textMid, textAlign: 'center', marginBottom: 16 }}>
              Rejecting <strong>{rejectItem.propertyName}</strong>. Please provide a reason:
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              style={{ width: '100%', font, fontSize: '0.85rem', padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: 10, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }}
              onFocus={e => e.currentTarget.style.borderColor = C.orange}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setRejectItem(null); setRejectReason(''); }} style={{ flex: 1, font, fontWeight: 600, fontSize: '0.85rem', color: C.textDark, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '11px 0', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReject} style={{ flex: 1, font, fontWeight: 700, fontSize: '0.85rem', color: '#fff', background: 'linear-gradient(135deg, #ea4335, #f06b6b)', border: 'none', borderRadius: 50, padding: '11px 0', cursor: 'pointer', boxShadow: '0 4px 14px rgba(234,67,53,0.3)' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Modal ── */}
      {chatItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 32, maxWidth: 440, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 12 }}>💬</div>
            <h2 style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, textAlign: 'center', marginBottom: 8 }}>Contact Student</h2>
            <p style={{ font, fontSize: '0.85rem', color: C.textMid, textAlign: 'center', marginBottom: 16 }}>
              Student wallet: <span style={{ fontFamily: 'monospace', color: C.orange }}>{chatItem.studentWallet.slice(0,10)}…</span>
            </p>
            <p style={{ font, fontSize: '0.8rem', color: C.textLight, textAlign: 'center', marginBottom: 20 }}>
              In-app messaging will be available in a future release.
            </p>
            <button onClick={() => setChatItem(null)} style={{ width: '100%', font, fontWeight: 700, fontSize: '0.85rem', color: '#fff', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '11px 0', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/landlord/dashboard')} style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Dashboard</button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Incoming Deposits</span>
      </div>

      {/* ── Page Header & Stats ── */}
      <div style={{ ...fadeIn(50), marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.textDark, letterSpacing: '-0.6px', marginBottom: 6 }}>Incoming Deposits</h1>
          <p style={{ font, fontWeight: 400, fontSize: '0.9rem', color: C.textMid }}>Manage all escrow deposit requests assigned to your wallet.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: loading ? '…' : totalCount, color: C.textMid },
            { label: 'Active', value: loading ? '…' : activeCount, color: C.orange },
            { label: 'Pending', value: loading ? '…' : pendingCount, color: '#8E44AD' },
            { label: 'Released', value: loading ? '…' : releasedCount, color: '#2AAF5C' },
            { label: 'Disputed', value: loading ? '…' : disputedCount, color: '#C53030' },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 16px', minWidth: 80, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ font, fontSize: '0.68rem', color: C.textLight, fontWeight: 500 }}>{s.label}</div>
              <div style={{ font, fontWeight: 800, fontSize: '1.2rem', color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 2-column layout ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>

        {/* ════ LEFT — list + toolbar ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Toolbar */}
          <div style={fadeIn(100)}>
            <Card style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1, minWidth: 260 }}>
                  {/* Search */}
                  <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textLight, display: 'flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search by Escrow ID, Property or Wallet"
                      style={{ font, fontSize: '0.82rem', padding: '10px 12px 10px 34px', border: `1.5px solid ${C.border}`, borderRadius: 10, width: '100%', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                      onFocus={e => e.currentTarget.style.borderColor = C.orange}
                      onBlur={e => e.currentTarget.style.borderColor = C.border}
                    />
                  </div>

                  {/* Status filter */}
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ font, fontSize: '0.82rem', padding: '10px 14px', border: `1.5px solid ${C.border}`, borderRadius: 10, outline: 'none', background: '#FAFAFA', cursor: 'pointer' }}>
                    <option value="All">All Statuses</option>
                    <option value="CREATED">Created</option>
                    <option value="FUNDED">Funded</option>
                    <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                    <option value="RELEASED">Released</option>
                    <option value="DISPUTED">Disputed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  {/* Sort */}
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ font, fontSize: '0.82rem', padding: '10px 14px', border: `1.5px solid ${C.border}`, borderRadius: 10, outline: 'none', background: '#FAFAFA', cursor: 'pointer' }}>
                    <option value="Newest First">Newest First</option>
                    <option value="Oldest First">Oldest First</option>
                    <option value="Highest Deposit">Highest Deposit</option>
                    <option value="Lowest Deposit">Lowest Deposit</option>
                    <option value="Property Name">Property Name</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setSearch(''); setStatusFilter('All'); setSortBy('Newest First'); }}
                    style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textMid, border: `1.5px solid ${C.border}`, background: C.white, borderRadius: 10, padding: '9px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.orange}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >Reset</button>
                </div>
              </div>
            </Card>
          </div>

          {/* Escrow List */}
          <div style={fadeIn(140)}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4].map(k => <SkeletonCard key={k} />)}
              </div>
            ) : fetchError ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
                  <p style={{ font, fontWeight: 600, color: '#ea4335' }}>{fetchError}</p>
                </div>
              </Card>
            ) : sorted.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📭</div>
                  <div style={{ font, fontWeight: 700, fontSize: '1rem', color: C.textDark }}>No escrows assigned yet.</div>
                  <p style={{ font, fontSize: '0.8rem', color: C.textMid, marginTop: 6, maxWidth: 320, margin: '8px auto 0' }}>
                    {search || statusFilter !== 'All'
                      ? 'No escrows match your current filters.'
                      : 'Escrows assigned to your landlord wallet will appear here once students create them.'}
                  </p>
                  {(search || statusFilter !== 'All') && (
                    <button onClick={() => { setSearch(''); setStatusFilter('All'); }}
                      style={{ marginTop: 16, font, fontWeight: 700, fontSize: '0.8rem', color: C.orange, background: 'none', border: `1.5px solid rgba(232,115,74,0.4)`, borderRadius: 50, padding: '8px 20px', cursor: 'pointer' }}>
                      Clear Filters
                    </button>
                  )}
                </div>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sorted.map(item => {
                  const sty = ss(item.status);
                  const isSelected = selectedEscrow?._id === item._id;
                  const date = new Date(item.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedEscrow(item)}
                      style={{
                        background: isSelected ? 'rgba(232,115,74,0.04)' : C.white,
                        border: isSelected ? `1.5px solid ${C.orange}` : `1px solid ${C.border}`,
                        borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 18px rgba(232,115,74,0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                          <span style={{ font, fontWeight: 800, fontSize: '0.85rem', color: C.orange }}>{escrowLabel(item)}</span>
                          <span style={{ font, fontSize: '0.75rem', color: C.textLight, marginLeft: 8 }}>{date}</span>
                        </div>
                        <span style={{ background: sty.bg, color: sty.color, border: sty.border, font, fontWeight: 700, fontSize: '0.7rem', borderRadius: 50, padding: '3px 10px' }}>{item.status}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: '1.4rem' }}>🏠</span>
                        <div>
                          <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>{item.propertyName}</div>
                          {item.propertyAddress && <div style={{ font, fontSize: '0.75rem', color: C.textMid }}>📍 {item.propertyAddress}</div>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                        <div>
                          <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Student Wallet</div>
                          <div style={{ font, fontWeight: 600, fontSize: '0.78rem', color: C.textMid, fontFamily: 'monospace' }}>
                            {item.studentWallet.slice(0, 8)}…{item.studentWallet.slice(-4)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>Deposit</div>
                          <div style={{ font, fontWeight: 800, fontSize: '0.9rem', color: C.textDark }}>{item.depositAmount} {item.currency}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={e => { e.stopPropagation(); navigate(`/landlord/escrow/${targetId(item)}`); }}
                          style={{ flex: 1, font, fontWeight: 700, fontSize: '0.75rem', color: C.white, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '8px 0', cursor: 'pointer' }}>
                          View Details
                        </button>
                        <button onClick={e => { e.stopPropagation(); setConfirmMoveInItem(item); }}
                          style={{ flex: 1, font, fontWeight: 600, fontSize: '0.75rem', color: C.textDark, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '8px 0', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#4ACF7A'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                          Confirm Move-In
                        </button>
                        <button onClick={e => { e.stopPropagation(); setChatItem(item); }}
                          style={{ font, fontWeight: 600, fontSize: '0.75rem', color: C.textMid, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '8px 14px', cursor: 'pointer' }}>
                          💬
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ════ RIGHT — detail panel ════ */}
        <div style={{ ...fadeIn(120), position: 'sticky', top: 88 }}>
          {!selectedEscrow ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>👈</div>
                <div style={{ font, fontWeight: 700, fontSize: '0.92rem', color: C.textDark }}>Select an escrow</div>
                <p style={{ font, fontSize: '0.78rem', color: C.textMid, marginTop: 6 }}>Click any card on the left to view its details here.</p>
              </div>
            </Card>
          ) : (() => {
            const item = selectedEscrow;
            const sty = ss(item.status);
            const dateCreated = new Date(item.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header card */}
                <Card style={{ border: `1.5px solid rgba(232,115,74,0.25)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ font, fontWeight: 800, fontSize: '1rem', color: C.textDark }}>{item.propertyName}</div>
                      {item.propertyAddress && <div style={{ font, fontSize: '0.75rem', color: C.textMid, marginTop: 2 }}>📍 {item.propertyAddress}</div>}
                    </div>
                    <span style={{ background: sty.bg, color: sty.color, border: sty.border, font, fontWeight: 700, fontSize: '0.7rem', borderRadius: 50, padding: '4px 10px', flexShrink: 0 }}>{item.status}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <InfoRow label="Escrow ID" value={<span style={{ color: C.orange, fontWeight: 700 }}>{escrowLabel(item)}</span>} />
                    <InfoRow label="Deposit" value={`${item.depositAmount} ${item.currency}`} />
                    <InfoRow label="Network" value={item.network || 'Stellar Testnet'} />
                    <InfoRow label="Created" value={dateCreated} />
                  </div>
                </Card>

                {/* Wallets card */}
                <Card>
                  <SectionTitle label="🔑 Wallet Addresses" />
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Student</div>
                  <MonoBlock value={item.studentWallet} />
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Landlord (You)</div>
                  <MonoBlock value={item.landlordWallet} />
                </Card>

                {/* Transaction card */}
                {item.transactionHash && (
                  <Card>
                    <SectionTitle label="🔗 Transaction" />
                    <div style={{ font, fontSize: '0.72rem', color: C.textLight, marginBottom: 4 }}>Hash</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MonoBlock value={`${item.transactionHash.slice(0,14)}…${item.transactionHash.slice(-6)}`} />
                      <a href={`https://stellar.expert/explorer/testnet/tx/${item.transactionHash}`} target="_blank" rel="noopener noreferrer"
                        style={{ font, fontWeight: 700, fontSize: '0.72rem', color: C.orange, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        View ↗
                      </a>
                    </div>
                  </Card>
                )}

                {/* Actions card */}
                <Card>
                  <SectionTitle label="⚡ Actions" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      onClick={() => navigate(`/landlord/escrow/${targetId(item)}`)}
                      style={{ width: '100%', font, fontWeight: 700, fontSize: '0.85rem', color: C.white, background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '12px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,115,74,0.3)' }}>
                      View Full Details
                    </button>
                    <button
                      onClick={() => setConfirmMoveInItem(item)}
                      style={{ width: '100%', font, fontWeight: 600, fontSize: '0.85rem', color: C.white, background: 'linear-gradient(135deg, #4ACF7A, #2AAF5C)', border: 'none', borderRadius: 50, padding: '12px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,207,122,0.3)' }}>
                      ✅ Confirm Move-In (Demo)
                    </button>
                    <button
                      onClick={() => setRejectItem(item)}
                      style={{ width: '100%', font, fontWeight: 600, fontSize: '0.85rem', color: C.white, background: 'linear-gradient(135deg, #ea4335, #f06b6b)', border: 'none', borderRadius: 50, padding: '12px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(234,67,53,0.3)' }}>
                      ❌ Reject Escrow (Demo)
                    </button>
                    <button
                      onClick={() => setChatItem(item)}
                      style={{ width: '100%', font, fontWeight: 600, fontSize: '0.85rem', color: C.textDark, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 50, padding: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.orange}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      💬 Contact Student
                    </button>
                  </div>
                </Card>
              </div>
            );
          })()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IncomingEscrows;
