import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';

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
  { id: 'dashboard',   label: 'Dashboard',           icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'deposits',    label: 'My Deposits',          icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'escrow',      label: 'Create Escrow',        icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  { id: 'history',     label: 'Transaction History',  icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile',     label: 'Profile',              icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings',    label: 'Settings',             icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
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

/* ─── Mock property database to match ID or default ─── */
const MOCK_PROPERTIES = [
  { id: 'ESC-001', name: 'Green Residency Apartments', address: '14 Brunswick St, Leeds LS2 7AB', type: 'Student Apartment', rent: 1500, deposit: 1500, lease: '12 months', moveIn: '01 Aug 2026', moveOut: '31 Jul 2027', emoji: '🏢', landlord: 'James Carter', rating: 4.8 },
  { id: 'ESC-002', name: 'Skyline Student Housing', address: '8 Canal Rd, Manchester M1 3WD', type: 'Shared House', rent: 1200, deposit: 1200, lease: '10 months', moveIn: '18 Jun 2026', moveOut: '17 Apr 2027', emoji: '🏙️', landlord: 'Sarah Miles', rating: 4.6 },
  { id: 'ESC-003', name: 'Maple Residency', address: '21 Park Ave, Sheffield S10 2NG', type: 'Studio Flat', rent: 950, deposit: 950, lease: '12 months', moveIn: '10 Jun 2026', moveOut: '09 Jun 2027', emoji: '🏠', landlord: 'Tom Walsh', rating: 4.7 },
  { id: 'ESC-004', name: 'Urban Nest Apartments', address: '5 Queens Rd, Birmingham B15 2TT', type: 'Student Apartment', rent: 1100, deposit: 1100, lease: '9 months', moveIn: '02 May 2026', moveOut: '01 Feb 2027', emoji: '🏗️', landlord: 'Lisa Park', rating: 4.5 },
  { id: 'ESC-005', name: 'Campus View Residence', address: '33 Elm Cl, Nottingham NG7 2RD', type: 'En-suite Room', rent: 800, deposit: 800, lease: '12 months', moveIn: '14 Mar 2026', moveOut: '13 Mar 2027', emoji: '🎓', landlord: 'Brian Stone', rating: 4.9 },
];

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

const Toast = ({ visible, message }: { visible: boolean; message: string }) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: 'linear-gradient(135deg, #2E1A1A, #4E2E2E)',
    color: '#fff', borderRadius: 14, padding: '14px 22px',
    font, fontWeight: 600, fontSize: '0.88rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center', gap: 10,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.4s, transform 0.4s',
    pointerEvents: 'none',
  }}>
    <span style={{ fontSize: '1.1rem' }}>⚠️</span> {message}
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */
const EscrowDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const escrowId = id || 'ESC-2025-001';

  // Find properties or default to first
  const prop = MOCK_PROPERTIES.find(p => p.id === escrowId) || MOCK_PROPERTIES[0];

  const handleRaiseDispute = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

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
      onNavChange={(navId) => {
        if (navId === 'dashboard') navigate('/student/dashboard');
        if (navId === 'escrow') navigate('/student/create-escrow');
        if (navId === 'deposits') navigate('/student/my-deposits');
      }}
    >
      <Toast visible={toastVisible} message="Dispute request submitted successfully (Demo Mode)" />

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <button onClick={() => navigate('/student/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          My Escrows
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Escrow Details</span>
      </div>

      {/* ── Page Header ── */}
      <div style={{
        ...fadeIn(50),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <h1 style={{ font, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: C.textDark, letterSpacing: '-0.6px', marginBottom: 6 }}>
            Escrow Details
          </h1>
          <p style={{ font, fontWeight: 500, fontSize: '0.9rem', color: C.textMid }}>
            Escrow ID: <span style={{ color: C.orange, fontWeight: 700 }}>{escrowId}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div style={{
          background: 'rgba(232,115,74,0.1)',
          border: `1.5px solid rgba(232,115,74,0.3)`,
          borderRadius: 50,
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />
          <span style={{ font, fontWeight: 700, fontSize: '0.8rem', color: C.orange }}>Locked</span>
        </div>
      </div>

      {/* ══ 2-column layout ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}
        className="lg:grid-cols-[1fr_320px]">

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Property Information Card */}
          <div style={fadeIn(100)}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 150,
                background: 'linear-gradient(135deg, rgba(232,115,74,0.15) 0%, rgba(240,149,107,0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4.5rem',
              }}>
                {prop.emoji}
              </div>
              <div style={{ padding: 24 }}>
                <SectionTitle label="🏠 Property Information" />
                <div style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, marginBottom: 4 }}>
                  {prop.name}
                </div>
                <div style={{ font, fontSize: '0.83rem', color: C.textMid, marginBottom: 18 }}>
                  📍 {prop.address}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <InfoRow label="Property Type" value={prop.type} />
                  <InfoRow label="Lease Duration" value={prop.lease} />
                  <InfoRow label="Monthly Rent" value={`£${prop.rent}`} />
                  <InfoRow label="Deposit Amount" value={`£${prop.deposit}`} />
                  <InfoRow label="Move-in Date" value={prop.moveIn} />
                  <InfoRow label="Move-out Date" value={prop.moveOut} />
                </div>
              </div>
            </Card>
          </div>

          {/* Student & Landlord Details */}
          <div style={{
            ...fadeIn(140),
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
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
                  A
                </div>
                <div>
                  <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>Alex Johnson</div>
                  <div style={{ font, fontSize: '0.75rem', color: C.textLight }}>Student Tenant</div>
                </div>
              </div>
              <InfoRow label="Email" value="alex.j@university.ac.uk" />
              <InfoRow label="Phone Number" value="+44 7700 900077" />
              <InfoRow label="Student ID (Demo)" value="STU-8829-19" />
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
                  {prop.landlord.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>{prop.landlord}</div>
                    <span style={{ fontSize: '0.88rem', color: '#4ACF7A' }} title="Verified Landlord">✓</span>
                  </div>
                  <div style={{ font, fontSize: '0.75rem', color: C.textLight }}>
                    ★ {prop.rating} Rating
                  </div>
                </div>
              </div>
              <InfoRow label="Email" value={`${prop.landlord.toLowerCase().replace(' ', '.')}@depositsafe-partner.com`} />
              <InfoRow label="Phone Number" value="+44 7700 900144" />
              <InfoRow label="Verified Badge" value="Yes" />
            </Card>
          </div>

          {/* Escrow Summary & Blockchain Info */}
          <div style={{
            ...fadeIn(180),
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {/* Escrow Summary Card */}
            <Card>
              <SectionTitle label="📝 Escrow Summary" />
              <InfoRow label="Escrow ID" value={escrowId} bold accent />
              <InfoRow label="Deposit Amount" value={`£${prop.deposit}`} />
              <InfoRow label="Platform Fee" value="£25" />
              <InfoRow label="Network Fee" value="£3" />
              <div style={{ height: 1, background: C.border, margin: '10px 0' }} />
              <InfoRow label="Total Locked Amount" value={`£${prop.deposit + 28}`} bold />
              <InfoRow label="Escrow Created Date" value="01 Jul 2026" />
              <InfoRow label="Current Status" value="Locked" />
              <InfoRow label="Network" value="Stellar Testnet" />
              <InfoRow label="Smart Contract" value="Demo Mode" />
            </Card>

            {/* Blockchain Info Card */}
            <Card>
              <SectionTitle label="🔗 Blockchain Information" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>Wallet Address</div>
                  <div style={{ font, fontWeight: 600, fontSize: '0.78rem', color: C.textMid, background: '#FAFAFA', padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    Not Connected
                  </div>
                </div>
                <div>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>Transaction Hash</div>
                  <div style={{ font, fontWeight: 600, fontSize: '0.78rem', color: C.textMid, background: '#FAFAFA', padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    Will appear after blockchain integration
                  </div>
                </div>
                <div>
                  <div style={{ font, fontSize: '0.72rem', color: C.textLight }}>Contract Address</div>
                  <div style={{ font, fontWeight: 600, fontSize: '0.78rem', color: C.textMid, background: '#FAFAFA', padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    Pending Deployment
                  </div>
                </div>
                <InfoRow label="Network" value="Stellar Testnet" />
                <InfoRow label="Block Confirmation" value="Demo Mode" />
                <InfoRow label="Current State" value="Locked" />
              </div>
            </Card>
          </div>

          {/* Rental Agreement & Payment Breakdown */}
          <div style={{
            ...fadeIn(220),
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {/* Rental Agreement Card */}
            <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <SectionTitle label="📄 Rental Agreement" />
                <InfoRow label="Agreement Number" value="AGR-99827-26" />
                <InfoRow label="Agreement Date" value="28 Jun 2026" />
                <InfoRow label="Tenant" value="Alex Johnson" />
                <InfoRow label="Landlord" value={prop.landlord} />
                <InfoRow label="Lease Duration" value={prop.lease} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button style={{
                  flex: 1, font, fontWeight: 600, fontSize: '0.78rem', color: C.textDark,
                  border: `1.5px solid ${C.border}`, background: C.white, borderRadius: 50, padding: '9px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.orange}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  View Agreement
                </button>
                <button style={{
                  flex: 1, font, fontWeight: 600, fontSize: '0.78rem', color: C.white,
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, border: 'none', borderRadius: 50, padding: '9px',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,115,74,0.25)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  Download PDF
                </button>
              </div>
            </Card>

            {/* Payment Breakdown Card */}
            <Card>
              <SectionTitle label="📊 Payment Breakdown" />
              <InfoRow label="Monthly Rent" value={`£${prop.rent}`} />
              <InfoRow label="Security Deposit" value={`£${prop.deposit}`} />
              <InfoRow label="Platform Fee" value="£25" />
              <InfoRow label="Network Fee" value="£3" />
              <div style={{ height: 1, background: C.border, margin: '10px 0' }} />
              <InfoRow label="Total Locked Amount" value={`£${prop.deposit + 28}`} bold />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <span style={{ font, fontSize: '0.78rem', color: C.textLight }}>Status</span>
                <span style={{ font, fontWeight: 700, fontSize: '0.75rem', color: '#2AAF5C', background: 'rgba(74,207,122,0.1)', padding: '4px 10px', borderRadius: 50, border: '1px solid rgba(74,207,122,0.3)' }}>
                  Locked
                </span>
              </div>
            </Card>
          </div>

          {/* Action Section & Help Card */}
          <div style={{
            ...fadeIn(260),
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {/* Action Buttons */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SectionTitle label="⚡ Actions" />
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
                onClick={() => navigate('/student/dashboard')}
                style={{
                  width: '100%', font, fontWeight: 600, fontSize: '0.88rem', color: C.textMid,
                  background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
                  padding: '6px',
                }}
              >
                Back to Dashboard
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

          {/* Escrow Progress Summary Card */}
          <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card style={{ border: `1.5px solid rgba(232,115,74,0.22)` }}>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 12 }}>
                ⚙️ Escrow Progress
              </div>

              {/* Progress bar */}
              <div style={{ background: '#EEEEEE', borderRadius: 10, height: 8, width: '100%', overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ width: '25%', height: '100%', background: `linear-gradient(90deg, ${C.orange}, ${C.orangeLight})`, borderRadius: 10 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.textLight, marginBottom: 16 }}>
                <span>Created (25%)</span>
                <span>Released (100%)</span>
              </div>

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>Next Action</div>
                <div style={{ font, fontWeight: 700, fontSize: '0.8rem', color: C.textDark, marginTop: 2 }}>
                  Waiting for landlord to confirm move-in.
                </div>
              </div>

              <div style={{ paddingTop: 10 }}>
                <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>Estimated Release</div>
                <div style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.orange, marginTop: 2 }}>
                  After move-in confirmation
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card style={{ background: 'rgba(74,207,122,0.04)', border: '1px solid rgba(74,207,122,0.2)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: '1.25rem' }}>💡</span>
                <div>
                  <div style={{ font, fontWeight: 700, fontSize: '0.82rem', color: C.textDark, marginBottom: 3 }}>Tips Card</div>
                  <div style={{ font, fontSize: '0.75rem', color: C.textMid, lineHeight: 1.55 }}>
                    Always verify the property and lease agreement details physically before confirming your move-in.
                  </div>
                </div>
              </div>
            </Card>

            {/* Escrow Timeline */}
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18 }}>
                📅 Escrow Timeline
              </div>
              {[
                { step: 1, title: 'Escrow Created', status: 'completed', info: '01 Jul 2026, 10:14 AM' },
                { step: 2, title: 'Deposit Locked', status: 'completed', info: '01 Jul 2026, 10:16 AM' },
                { step: 3, title: 'Waiting for Move-in Confirmation', status: 'current', info: 'Awaiting landlord' },
                { step: 4, title: 'Deposit Released', status: 'pending', info: 'Future Step' },
              ].map((s, i, arr) => (
                <div key={s.step} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: s.status === 'completed'
                        ? '#4ACF7A'
                        : s.status === 'current'
                          ? '#4A90E2'
                          : '#E0E0E0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                    }}>
                      {s.status === 'completed' ? '✓' : s.step}
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{
                        width: 2, flex: 1, minHeight: 20,
                        background: s.status === 'completed' ? '#4ACF7A' : '#E0E0E0',
                        margin: '4px 0',
                      }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                    <div style={{
                      font, fontWeight: 700, fontSize: '0.78rem',
                      color: s.status === 'current' ? '#4A90E2' : C.textDark,
                    }}>
                      {s.title}
                    </div>
                    <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>
                      {s.info}
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Recent Activity */}
            <Card>
              <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 18 }}>
                🕒 Recent Activity
              </div>
              {[
                { title: 'Waiting for Confirmation', date: '01 Jul 2026', time: '10:16 AM', icon: '⏳' },
                { title: 'Deposit Locked', date: '01 Jul 2026', time: '10:16 AM', icon: '🔒' },
                { title: 'Agreement Accepted', date: '01 Jul 2026', time: '10:15 AM', icon: '📝' },
                { title: 'Escrow Created', date: '01 Jul 2026', time: '10:14 AM', icon: '🚀' },
              ].map(act => (
                <div key={act.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1rem' }}>{act.icon}</span>
                    <div>
                      <div style={{ font, fontWeight: 600, fontSize: '0.78rem', color: C.textDark }}>{act.title}</div>
                      <div style={{ font, fontSize: '0.68rem', color: C.textLight }}>{act.date}</div>
                    </div>
                  </div>
                  <span style={{ font, fontSize: '0.68rem', color: C.textLight }}>{act.time}</span>
                </div>
              ))}
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default EscrowDetailsPage;
