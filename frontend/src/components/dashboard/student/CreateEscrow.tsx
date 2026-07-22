import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { STUDENT_NAV_ITEMS as NAV_ITEMS } from '@/components/dashboard/navItems';
import {
  ArrowRight, Ban, BookOpen, Building2, Check, ChevronRight, CreditCard,
  HandCoins, Home, Lightbulb, LoaderCircle, Lock, MapPin, MessageCircle,
  RefreshCw, Scale, ScrollText, Search, ShieldCheck, Star, UserRound, Wallet,
} from 'lucide-react';
import { createEscrow } from '@/services/sorobanService';
import { createEscrowDb } from '@/services/escrowService';
import API from '@/api/axios';

/* ─── Design tokens (match index.css) ─────────────────────────── */
const C = {
  orange: '#A78BFA', orangeLight: '#8B5CF6',
  bg: '#0B0A10', white: '#FFFFFF', border: 'rgba(255,255,255,0.08)',
  textDark: '#FFFFFF', textMid: 'rgba(255,255,255,0.64)', textLight: 'rgba(255,255,255,0.4)',
};
const font = "'Inter', sans-serif";

/* ─── Mock property data ─────────────────────────────────────────── */
interface Property {
  id: number; name: string; address: string; city: string;
  rent: number; deposit: number; landlord: string; rating: number;
  available: string; type: string; lease: string; rooms: number;
}
const PROPERTIES: Property[] = [
  { id: 1, name: 'Green Residency Apartments', address: '42 Green Lane', city: 'Leeds LS1 4DZ', rent: 1200, deposit: 1200, landlord: 'James Carter', rating: 4.8, available: 'Immediate', type: 'Student Apartment', lease: '12 months', rooms: 2 },
  { id: 2, name: 'Skyline Student Housing',    address: '18 Canal Street',  city: 'Manchester M1 3WD', rent: 950,  deposit: 950,  landlord: 'Sarah Miles',   rating: 4.6, available: '1 Aug 2026',  type: 'Shared House',       lease: '10 months', rooms: 3 },
  { id: 3, name: 'Maple Residency',            address: '7 Maple Drive',    city: 'Sheffield S1 2AB', rent: 875,  deposit: 875,  landlord: 'Tom Walsh',     rating: 4.7, available: 'Immediate',  type: 'Studio Flat',        lease: '12 months', rooms: 1 },
  { id: 4, name: 'Urban Nest Apartments',      address: '34 Park Lane',     city: 'Birmingham B1 1AA', rent: 1100, deposit: 1100, landlord: 'Lisa Park',    rating: 4.5, available: '15 Jul 2026', type: 'Student Apartment', lease: '9 months',  rooms: 2 },
  { id: 5, name: 'Campus View Residence',      address: '5 University Rd',  city: 'Nottingham NG7 2RD', rent: 800,  deposit: 800,  landlord: 'Brian Stone',  rating: 4.9, available: 'Immediate',  type: 'En-suite Room',      lease: '12 months', rooms: 1 },
];

const PLATFORM_FEE = 25;
const NETWORK_FEE  = 3;

/* ─── Small reusable card shell ──────────────────────────────────── */
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

/* ─── Input field ────────────────────────────────────────────────── */
const inputBase: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: `1.5px solid ${C.border}`, font, fontSize: '0.88rem',
  outline: 'none', background: 'rgba(255,255,255,0.03)', color: C.textDark,
  colorScheme: 'dark', caretColor: '#A78BFA',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s', boxSizing: 'border-box',
};
const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = C.orange;
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(124,92,255,0.14)';
  e.currentTarget.style.background  = 'rgba(255,255,255,0.06)';
};
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.boxShadow   = 'none';
  e.currentTarget.style.background  = 'rgba(255,255,255,0.03)';
};
const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ font, fontWeight: 700, fontSize: '0.78rem', color: C.textMid, display: 'block', marginBottom: 7 }}>
    {children}
  </label>
);

/* ─── Star rating ─────────────────────────────────────────────────  */
const Stars = ({ rating }: { rating: number }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }} aria-label={`Rated ${rating} out of 5`}>
    {[1,2,3,4,5].map(s => (
      <Star
        key={s}
        size={12}
        strokeWidth={0}
        aria-hidden="true"
        fill={s <= Math.round(rating) ? '#F59E0B' : 'rgba(255,255,255,0.12)'}
      />
    ))}
    <span style={{ font, fontSize: '0.75rem', color: C.textMid, marginLeft: 4 }}>{rating}</span>
  </span>
);

/* ─── Skeleton shimmer ────────────────────────────────────────────── */
const Skeleton = ({ w = '100%', h = 16, br = 8 }: { w?: string | number; h?: number; br?: number }) => (
  <div style={{
    width: w, height: h, borderRadius: br, background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmerSkeleton 1.4s ease-in-out infinite',
  }} />
);

/* ─── Toast notification ──────────────────────────────────────────── */
const Toast = ({ visible, message, isError }: { visible: boolean; message: string; isError?: boolean }) => (
  <div role="status" aria-live="polite" style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: isError
      ? 'rgba(40,16,20,0.95)'
      : 'rgba(14,26,22,0.95)',
    color: '#fff', borderRadius: 14, padding: '14px 22px',
    font, fontWeight: 600, fontSize: '0.88rem',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', gap: 10,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.4s, transform 0.4s',
    pointerEvents: 'none',
    maxWidth: 420,
  }}>
    <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: isError ? '#F87171' : '#34D399', boxShadow: isError ? '0 0 10px rgba(248,113,113,0.8)' : '0 0 10px rgba(52,211,153,0.8)' }} />
    <span style={{ wordBreak: 'break-word' }}>{message}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */
/*  CREATE ESCROW PAGE                                               */
/* ══════════════════════════════════════════════════════════════════ */
const CreateEscrow: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const displayName = parsedUser?.name || "Student";
  const navigate = useNavigate();

  /* ── landlord wallet (fetched from backend) ── */
  const [landlordWallet, setLandlordWallet] = useState<string>('');
  const [walletLoading,  setWalletLoading]  = useState(true);

  /* ── form state ── */
  const [search,         setSearch]        = useState('');
  const [dropdownOpen,   setDropdownOpen]  = useState(false);
  const [selectedProp,   setSelectedProp]  = useState<Property | null>(null);
  const [propLoading,    setPropLoading]   = useState(false);
  const [depositAmt,     setDepositAmt]    = useState('');
  const [currency,       setCurrency]      = useState('XLM');
  const [startDate,      setStartDate]     = useState('');
  const [endDate,        setEndDate]       = useState('');
  const [purpose,        setPurpose]       = useState('security');
  const [agreed,         setAgreed]        = useState(false);
  const [toast,          setToast]         = useState(false);
  const [toastMsg,       setToastMsg]      = useState('');
  const [toastError,     setToastError]    = useState(false);
  const [submitting,     setSubmitting]    = useState(false);
  const [mounted,        setMounted]       = useState(false);

  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  /* Fetch the landlord wallet from backend */
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/user/landlord-wallet");
        if (res.data.success && res.data.walletAddress) {
          setLandlordWallet(res.data.walletAddress);
        } else {
          console.error("Failed to get landlord wallet:", res.data.message);
        }
      } catch (err: any) {
        console.error("Error fetching landlord wallet:", err?.response?.data?.message || err.message);
      } finally {
        setWalletLoading(false);
      }
    })();
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredProps = PROPERTIES.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const selectProperty = (p: Property) => {
    setDropdownOpen(false);
    setSearch(p.name);
    setPropLoading(true);
    setSelectedProp(null);
    setTimeout(() => { setSelectedProp(p); setDepositAmt(String(p.deposit)); setPropLoading(false); }, 900);
  };

  const deposit    = parseFloat(depositAmt) || 0;
  const total      = deposit + PLATFORM_FEE + NETWORK_FEE;
  const canSubmit  = agreed && selectedProp && deposit > 0 && startDate && endDate && !walletLoading;

  const showToast = (message: string, isError = false) => {
    setToastMsg(message);
    setToastError(isError);
    setToast(true);
    setTimeout(() => setToast(false), isError ? 4000 : 2000);
  };

  const handleCreate = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (!landlordWallet) {
        showToast("Landlord wallet not loaded. Please wait and try again.", true);
        setSubmitting(false);
        return;
      }
      // 1. Blockchain execution
      const result = await createEscrow({
        landlordAddress: landlordWallet,
        amountXlm: deposit,
      });

      // 2. Database persistence
      try {
        await createEscrowDb({
          escrowId: result.escrowId,
          transactionHash: result.txHash,
          studentWallet: result.studentWallet,
          landlordWallet: landlordWallet,
          propertyName: selectedProp!.name,
          propertyAddress: `${selectedProp!.address}, ${selectedProp!.city}`,
          depositAmount: deposit,
          currency: "XLM",
          rentalStartDate: startDate,
          rentalEndDate: endDate,
          purpose: purpose,
          contractId: result.contractId,
          blockchainNetwork: "Testnet",
        });

        // 3. Both succeeded
        showToast("Escrow Created Successfully!");
        const targetId = result.escrowId !== undefined ? String(result.escrowId) : "ESC-001";
        setTimeout(() => navigate(`/student/payment-journey/${targetId}`, {
          state: {
            depositAmount: deposit * 86.40, // convert standard XLM to INR-like visual values
            propertyName: selectedProp!.name,
            propertyAddress: `${selectedProp!.address}, ${selectedProp!.city}`
          }
        }), 2000);

      } catch (dbErr) {
        console.error("Database save failed:", dbErr);
        // Blockchain succeeded, backend failed -> warning toast
        showToast("Escrow created on-chain but failed to save in the application database.", true);
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      // User rejected the wallet signature
      if (
        msg.toLowerCase().includes('user declined') ||
        msg.toLowerCase().includes('rejected') ||
        msg.toLowerCase().includes('cancel')
      ) {
        showToast('Transaction cancelled — wallet signature rejected.', true);
      } else {
        showToast(msg, true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── card fade-in animation ── */
  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? undefined : 'translateY(24px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  /* ── shimmer keyframe (injected once) ── */
  const skeletonStyle = `
    @keyframes shimmerSkeleton {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;

  return (
    <DashboardLayout dark
      role="student"
      userName={displayName}
      navItems={NAV_ITEMS}
      activeId="escrow"
      onNavChange={(id) => {
        if (id === 'dashboard') navigate('/student/dashboard');
        if (id === 'escrow') navigate('/student/create-escrow');
        if (id === 'deposits') navigate('/student/my-deposits');
        if (id === 'history') navigate('/student/transactions');
        if (id === 'profile') navigate('/student/profile');
        if (id === 'settings') navigate('/student/settings');
      }}
    >
      <style>{skeletonStyle}</style>
      <Toast visible={toast} message={toastMsg} isError={toastError} />

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <ChevronRight size={13} strokeWidth={2} aria-hidden="true" style={{ color: C.textLight }} />
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Create Escrow</span>
      </div>

      {/* ── Page Header ── */}
      <div style={{ ...fadeIn(60), marginBottom: 28 }}>
        <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.textDark, letterSpacing: '-0.6px', marginBottom: 8 }}>
          Create Rental Escrow
        </h1>
        <p style={{ font, fontWeight: 400, fontSize: '0.9rem', color: C.textMid, maxWidth: 620, lineHeight: 1.6 }}>
          Secure your rental deposit using DepositSafe's blockchain-powered escrow system.
          Your funds remain safely locked until move-in confirmation.
        </p>
      </div>

      {/* ══ 2-column layout ══ */}
      <div style={{ display: 'grid', gap: 24, alignItems: 'start' }}
        className="grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── 1. Property Selection ── */}
          <div style={fadeIn(100)}>
            <Card>
              <SectionTitle label={<><Home size={15} strokeWidth={2} aria-hidden="true" /> Select Property</>} />

              {/* Search + dropdown */}
              <div ref={ddRef} style={{ position: 'relative' }}>
                <Label>Search Property</Label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: C.textLight, pointerEvents: 'none', display: 'flex',
                  }}>
                    <Search size={15} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
                    placeholder="Search by property name or city…"
                    style={{ ...inputBase, paddingLeft: 38 }}
                    onFocus={e => { setDropdownOpen(true); focusIn(e); }}
                    onBlur={focusOut}
                  />
                </div>

                {/* Dropdown */}
                {dropdownOpen && filteredProps.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: '#16141F', border: '1px solid rgba(255,255,255,0.12)',
                    borderTop: '1px solid rgba(224,215,255,0.25)',
                    borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 32px rgba(124,92,255,0.12)',
                    marginTop: 6,
                    maxHeight: 320, overflowY: 'auto',
                    animation: 'fadeUpCard 0.25s ease',
                  }}>
                    {filteredProps.map((p, i) => {
                      return (
                      <button
                        key={p.id}
                        onMouseDown={() => selectProperty(p)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          width: '100%', padding: '12px 16px', border: 'none',
                          background: 'transparent', cursor: 'pointer', textAlign: 'left',
                          borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                          transition: 'background 0.15s',
                          font,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,92,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.3)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={16} strokeWidth={2} aria-hidden="true" /></span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.textDark }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: C.textMid }}>{p.address}, {p.city}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.82rem', color: C.orange, flexShrink: 0 }}>
                          £{p.rent}/mo
                        </div>
                      </button>
                    );
                      })}
                  </div>
                )}
              </div>

              {/* ── Property Detail Card (skeleton / result) ── */}
              {propLoading && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Skeleton h={140} br={12} />
                  <Skeleton w="60%" h={18} />
                  <Skeleton w="40%" h={14} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 4 }}>
                    {[0,1,2].map(i => <Skeleton key={i} h={60} br={10} />)}
                  </div>
                </div>
              )}

              {selectedProp && !propLoading && (
                <div style={{
                  marginTop: 20, border: `1.5px solid rgba(124,92,255,0.25)`,
                  borderRadius: 14, overflow: 'hidden',
                  animation: 'fadeUpCard 0.5s ease forwards',
                }}>
                  <style>{`@keyframes fadeUpCard { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>

                  {/* Property "image" banner */}
                  <div style={{
                    height: 130, background: `linear-gradient(135deg, rgba(124,92,255,0.22), rgba(233,97,245,0.12))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  }}>
                    <Building2 size={56} strokeWidth={1.4} aria-hidden="true" style={{ color: 'rgba(224,215,255,0.85)', filter: 'drop-shadow(0 4px 12px rgba(124,92,255,0.45))' }} />
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      background: '#10B981', color: '#fff',
                      font, fontWeight: 700, fontSize: '0.7rem',
                      borderRadius: 50, padding: '4px 10px',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}><span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block' }} /> {selectedProp.available}</span>
                  </div>

                  <div style={{ padding: '16px 18px' }}>
                    {/* Name + address */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ font, fontWeight: 800, fontSize: '1rem', color: C.textDark, marginBottom: 3 }}>
                        {selectedProp.name}
                      </div>
                      <div style={{ font, fontSize: '0.8rem', color: C.textMid, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={12} strokeWidth={2} aria-hidden="true" /> {selectedProp.address}, {selectedProp.city}
                      </div>
                    </div>

                    {/* Stat pills */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                      {[
                        { label: 'Monthly Rent', value: `£${selectedProp.rent}` },
                        { label: 'Deposit',       value: `£${selectedProp.deposit}` },
                        { label: 'Lease',         value: selectedProp.lease },
                      ].map(s => (
                        <div key={s.label} style={{
                          background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                          borderRadius: 10, padding: '10px 12px', textAlign: 'center',
                        }}>
                          <div style={{ font, fontWeight: 800, fontSize: '0.9rem', color: C.textDark }}>{s.value}</div>
                          <div style={{ font, fontSize: '0.68rem', color: C.textLight, marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Landlord row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          font, fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0,
                        }}>{selectedProp.landlord.charAt(0)}</div>
                        <div>
                          <div style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>{selectedProp.landlord}</div>
                          <Stars rating={selectedProp.rating} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ font, fontSize: '0.72rem', fontWeight: 600, color: C.textMid, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 50, padding: '4px 10px' }}>
                          {selectedProp.type}
                        </span>
                        <span style={{ font, fontSize: '0.72rem', fontWeight: 600, color: C.textMid, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 50, padding: '4px 10px' }}>
                          {selectedProp.rooms} {selectedProp.rooms === 1 ? 'Room' : 'Rooms'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* ── 2. Deposit Details ── */}
          <div style={fadeIn(160)}>
            <Card>
              <SectionTitle label={<><CreditCard size={15} strokeWidth={2} aria-hidden="true" /> Deposit Details</>} />
              <div className="grid-cols-1 sm:grid-cols-2" style={{ display: 'grid', gap: 16 }}>

                {/* Deposit Amount */}
                <div>
                  <Label>Deposit Amount</Label>
                  <input
                    type="number" min="0" placeholder="e.g. 1200"
                    value={depositAmt}
                    onChange={e => setDepositAmt(e.target.value)}
                    style={inputBase}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                </div>

                {/* Currency */}
                <div>
                  <Label>Currency</Label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    style={{ ...inputBase, cursor: 'pointer', background: '#16141F' }}
                    onFocus={focusIn} onBlur={focusOut}>
                    <option value="XLM">XLM — Stellar Lumens</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="USDC">USDC — USD Coin</option>
                  </select>
                </div>

                {/* Rental Start */}
                <div>
                  <Label>Rental Start Date</Label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Rental End */}
                <div>
                  <Label>Rental End Date</Label>
                  <input type="date" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)}
                    style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Purpose */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <Label>Purpose of Deposit</Label>
                  <select value={purpose} onChange={e => setPurpose(e.target.value)}
                    style={{ ...inputBase, cursor: 'pointer', background: '#16141F' }}
                    onFocus={focusIn} onBlur={focusOut}>
                    <option value="security">Security Deposit</option>
                    <option value="advance">Advance Rent</option>
                    <option value="booking">Booking Deposit</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* ── 3. Escrow Agreement ── */}
          <div style={fadeIn(220)}>
            <Card>
              <SectionTitle label={<><ScrollText size={15} strokeWidth={2} aria-hidden="true" /> Escrow Agreement</>} />

              {/* Agreement clauses */}
              {[
                { icon: <Lock size={16} strokeWidth={2} aria-hidden="true" />, title: 'Secure Smart Contract', text: 'Your deposit will be securely locked in a Stellar Soroban smart contract, audited and tamper-proof.' },
                { icon: <Ban size={16} strokeWidth={2} aria-hidden="true" />, title: 'Landlord Access Restricted', text: 'The landlord cannot access the funds until the move-in is confirmed by both parties.' },
                { icon: <Scale size={16} strokeWidth={2} aria-hidden="true" />, title: 'Dispute Protection',        text: 'If a dispute occurs, funds remain locked until the DepositSafe dispute resolution process is completed.' },
                { icon: <RefreshCw size={16} strokeWidth={2} aria-hidden="true" />, title: 'Transparent Release',       text: 'All deposit movements are recorded on-chain and fully auditable at any time.' },
              ].map(clause => (
                <div key={clause.title} style={{
                  display: 'flex', gap: 14, padding: '14px 16px',
                  borderRadius: 12, background: 'rgba(124,92,255,0.04)',
                  border: `1px solid rgba(124,92,255,0.12)`,
                  marginBottom: 10,
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, marginTop: 1, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{clause.icon}</span>
                  <div>
                    <div style={{ font, fontWeight: 700, fontSize: '0.85rem', color: C.textDark, marginBottom: 3 }}>{clause.title}</div>
                    <div style={{ font, fontSize: '0.8rem', color: C.textMid, lineHeight: 1.55 }}>{clause.text}</div>
                  </div>
                </div>
              ))}

              {/* Checkbox */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18,
                cursor: 'pointer', userSelect: 'none', font, fontSize: '0.83rem', color: C.textMid,
              }}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreed}
                  aria-label="I agree to the DepositSafe Escrow Terms"
                  onClick={() => setAgreed(v => !v)}
                  style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, padding: 0, cursor: 'pointer',
                    border: `2px solid ${agreed ? C.orange : 'rgba(255,255,255,0.25)'}`,
                    background: agreed ? C.orange : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {agreed && (
                    <Check size={11} strokeWidth={3.5} aria-hidden="true" style={{ color: '#fff' }} />
                  )}
                </button>
                <span style={{ lineHeight: 1.55 }}>
                  I have read and agree to the{' '}
                  <a href="#" onClick={e => e.preventDefault()}
                    style={{ color: C.orange, fontWeight: 700, textDecoration: 'none' }}>
                    DepositSafe Escrow Terms
                  </a>
                  {' '}and understand that this is a demo with no real blockchain transactions.
                </span>
              </label>
            </Card>
          </div>

          {/* ── 4. Help Section ── */}
          <div style={fadeIn(280)}>
            <Card style={{ background: 'linear-gradient(135deg, rgba(124,92,255,0.08), rgba(233,97,245,0.04))', border: `1px solid rgba(124,92,255,0.18)` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ font, fontWeight: 800, fontSize: '0.95rem', color: C.textDark, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lightbulb size={15} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> Need Help?
                  </div>
                  <p style={{ font, fontSize: '0.82rem', color: C.textMid, maxWidth: 420, lineHeight: 1.6, marginBottom: 14 }}>
                    DepositSafe uses blockchain escrow (Stellar Soroban) to protect both students and landlords.
                    Funds are never held by DepositSafe directly — only by the smart contract.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a href="#" onClick={e => e.preventDefault()} style={{
                      font, fontWeight: 600, fontSize: '0.8rem', color: C.orange,
                      border: `1.5px solid rgba(124,92,255,0.4)`,
                      borderRadius: 50, padding: '7px 16px', textDecoration: 'none',
                      transition: 'all 0.2s',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,92,255,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <BookOpen size={13} strokeWidth={2} aria-hidden="true" /> View FAQ
                    </a>
                    <button style={{
                      font, fontWeight: 600, fontSize: '0.8rem', color: C.white,
                      background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                      border: 'none', borderRadius: 50, padding: '7px 16px',
                      cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,92,255,0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,92,255,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,92,255,0.3)'; }}
                    >
                      <MessageCircle size={13} strokeWidth={2} aria-hidden="true" /> Contact Support
                    </button>
                  </div>
                </div>
                <ShieldCheck size={56} strokeWidth={1.2} aria-hidden="true" style={{ color: '#A78BFA', opacity: 0.55, flexShrink: 0 }} />
              </div>
            </Card>
          </div>

          {/* ── 5. Action Buttons ── */}
          <div style={{ ...fadeIn(340), display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Cancel */}
            <button
              onClick={() => navigate('/student/dashboard')}
              style={{
                font, fontWeight: 600, fontSize: '0.88rem', color: C.textMid,
                background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${C.border}`,
                borderRadius: 50, padding: '13px 28px', cursor: 'pointer',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid; }}
            >
              Cancel
            </button>

            {/* Create Escrow */}
            <button
              onClick={handleCreate}
              disabled={!canSubmit || submitting}
              className={canSubmit && !submitting ? 'btn-glow' : ''}
              style={{
                font, fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.3px',
                color: '#fff', border: 'none', borderRadius: 50, padding: '13px 32px',
                cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
                opacity: canSubmit && !submitting ? 1 : 0.45,
                background: canSubmit && !submitting ? undefined : 'rgba(255,255,255,0.15)',
                boxShadow: canSubmit && !submitting ? '0 8px 28px rgba(124,92,255,0.4)' : 'none',
                transition: 'opacity 0.3s, transform 0.25s, box-shadow 0.25s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (canSubmit && !submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(124,92,255,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = canSubmit && !submitting ? '0 8px 28px rgba(124,92,255,0.4)' : 'none'; }}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={14} strokeWidth={2.5} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} />
                  Waiting for Wallet…
                </>
              ) : (
                <>
                  Create Escrow
                  <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ════════════ RIGHT COLUMN ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, ...fadeIn(120) }}>

          {/* ── Payment Summary (sticky) ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <Card style={{ border: `1.5px solid rgba(124,92,255,0.22)` }}>
              <div style={{ font, fontWeight: 800, fontSize: '0.95rem', color: C.textDark, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={15} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> Payment Summary
              </div>

              {/* Line items */}
              {[
                { label: 'Monthly Rent',    value: selectedProp ? `£${selectedProp.rent}` : '—' },
                { label: 'Deposit Amount',  value: deposit > 0 ? `${currency} ${deposit.toLocaleString()}` : '—' },
                { label: 'Platform Fee',    value: `£${PLATFORM_FEE}` },
                { label: 'Network Fee',     value: `£${NETWORK_FEE}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ font, fontSize: '0.82rem', color: C.textMid }}>{row.label}</span>
                  <span className="mono-addr" style={{ fontWeight: 500, fontSize: '0.85rem', color: C.textDark }}>{row.value}</span>
                </div>
              ))}

              {/* Divider */}
              <div style={{ height: 1, background: C.border, margin: '14px 0' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ font, fontWeight: 700, fontSize: '0.9rem', color: C.textDark }}>Estimated Total</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#E0D7FF', letterSpacing: '-0.3px' }}>{deposit > 0 ? `${currency} ${total.toLocaleString()}` : '—'}</span>
              </div>

              {/* Escrow Status Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px', borderRadius: 10,
                background: agreed && selectedProp && deposit > 0
                  ? 'rgba(16,185,129,0.1)'
                  : 'rgba(46,107,255,0.1)',
                border: `1px solid ${agreed && selectedProp && deposit > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(46,107,255,0.3)'}`,
              }}>
                {agreed && selectedProp && deposit > 0 ? (
                  <Check size={13} strokeWidth={3} aria-hidden="true" style={{ color: '#10B981' }} />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6E9BFF', animation: 'statusPulse 2s ease-in-out infinite', display: 'inline-block' }} />
                )}
                <span style={{
                  font, fontWeight: 700, fontSize: '0.78rem',
                  color: agreed && selectedProp && deposit > 0 ? '#10B981' : '#6E9BFF',
                }}>
                  {agreed && selectedProp && deposit > 0 ? 'Ready to Lock' : 'Awaiting Details'}
                </span>
              </div>
            </Card>

            {/* ── How Escrow Works (timeline) ── */}
            <Card style={{ marginTop: 20 }}>
              <div style={{ font, fontWeight: 800, fontSize: '0.95rem', color: C.textDark, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={15} strokeWidth={2} aria-hidden="true" style={{ color: '#A78BFA' }} /> How Escrow Works
              </div>

              {[
                { step: 1, title: 'Student Creates Escrow',       desc: 'Fill out this form and confirm the agreement.',        icon: <UserRound size={15} strokeWidth={2} aria-hidden="true" /> },
                { step: 2, title: 'Deposit is Securely Locked',   desc: 'Funds are held in a Soroban smart contract.',           icon: <Lock size={15} strokeWidth={2} aria-hidden="true" /> },
                { step: 3, title: 'Student Moves In',             desc: 'Move-in confirmed by both parties on the platform.',    icon: <Home size={15} strokeWidth={2} aria-hidden="true" /> },
                { step: 4, title: 'Landlord Receives Funds',      desc: 'Deposit is automatically released to the landlord.',    icon: <HandCoins size={15} strokeWidth={2} aria-hidden="true" /> },
              ].map((s, i, arr) => (
                <div key={s.step} style={{ display: 'flex', gap: 12 }}>
                  {/* Left column: circle + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      font, fontWeight: 700, fontSize: '0.8rem', color: '#fff',
                      boxShadow: '0 3px 10px rgba(124,92,255,0.35)',
                    }}>
                      {s.icon}
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 28, background: 'linear-gradient(180deg, rgba(124,92,255,0.4), rgba(124,92,255,0.1))', margin: '4px 0' }} />
                    )}
                  </div>

                  {/* Right content */}
                  <div style={{ paddingBottom: i < arr.length - 1 ? 18 : 0 }}>
                    <div style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark, marginBottom: 3 }}>
                      Step {s.step}: {s.title}
                    </div>
                    <div style={{ font, fontSize: '0.76rem', color: C.textMid, lineHeight: 1.5 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEscrow;
