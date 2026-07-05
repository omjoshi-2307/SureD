import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout, { NavItem } from '@/components/dashboard/DashboardLayout';

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
  { id: 'dashboard',    label: 'Dashboard',           icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'properties',   label: 'My Properties',       icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { id: 'incoming',     label: 'Incoming Deposits',   icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
  { id: 'movein',       label: 'Confirm Move-in',     icon: <Icon d="M9 11l3 3L22 4" /> },
  { id: 'transactions', label: 'Transactions',        icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
  { id: 'profile',      label: 'Profile',             icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> },
  { id: 'settings',     label: 'Settings',            icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
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

const MOCK_PROPERTIES = [
  { id: 'ESC-001', name: 'Green Residency Apartments', address: '14 Brunswick St, Leeds LS2 7AB', type: 'Student Apartment', rent: 1500, deposit: 500, lease: '12 months', moveIn: '01 Aug 2026', moveOut: '31 Jul 2027', emoji: '🏢', student: 'Alex Johnson', university: 'University of Leeds', email: 'alex.j@university.ac.uk' },
  { id: 'ESC-002', name: 'Campus View Residence', address: '8 Canal Rd, Manchester M1 3WD', type: 'Shared House', rent: 1200, deposit: 750, lease: '10 months', moveIn: '18 Jun 2026', moveOut: '17 Apr 2027', emoji: '🎓', student: 'Sophia Davis', university: 'Leeds Beckett University', email: 's.davis@beckett.ac.uk' },
  { id: 'ESC-003', name: 'Skyline Student Housing', address: '21 Park Ave, Sheffield S10 2NG', type: 'Studio Flat', rent: 950, deposit: 650, lease: '12 months', moveIn: '10 Jun 2026', moveOut: '09 Jun 2027', emoji: '🏙️', student: 'Daniel White', university: 'University of Manchester', email: 'd.white@manchester.ac.uk' },
  { id: 'ESC-004', name: 'Urban Nest Apartments', address: '5 Queens Rd, Birmingham B15 2TT', type: 'Student Apartment', rent: 1100, deposit: 450, lease: '9 months', moveIn: '02 May 2026', moveOut: '01 Feb 2027', emoji: '🏗️', student: 'Emily Brown', university: 'Birmingham City University', email: 'e.brown@bcu.ac.uk' },
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

const InfoRow = ({ label, value, bold, accent }: { label: string; value: React.ReactNode; bold?: boolean; accent?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 12 }}>
    <span style={{ font, fontSize: '0.78rem', color: C.textLight, flexShrink: 0 }}>{label}</span>
    <span style={{ font, fontWeight: bold ? 700 : 500, fontSize: '0.82rem', color: accent ? C.orange : C.textDark, textAlign: 'right' }}>
      {value}
    </span>
  </div>
);

const SectionTitle = ({ label }: { label: string }) => (
  <h3 style={{ font, fontWeight: 700, fontSize: '0.95rem', color: C.textDark, marginBottom: 18 }}>
    {label}
  </h3>
);

const Toast = ({ visible, message }: { visible: boolean; message: string }) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: 'linear-gradient(135deg, #1A1A2E, #2E2E4E)',
    color: '#fff', borderRadius: 14, padding: '14px 22px',
    font, fontWeight: 600, fontSize: '0.88rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center', gap: 10,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.4s, transform 0.4s',
    pointerEvents: 'none',
  }}>
    <span style={{ fontSize: '1.1rem' }}>ℹ️</span> {message}
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */
const LandlordEscrowDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [status, setStatus] = useState<'Locked' | 'Released'>('Locked');
  const [confirmModal, setConfirmModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const escrowId = id || 'ESC-001';
  const prop = MOCK_PROPERTIES.find(p => p.id === escrowId) || MOCK_PROPERTIES[0];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  const handleConfirmMoveIn = () => {
    setStatus('Released');
    setConfirmModal(false);
    triggerToast('Move-in confirmed successfully (Demo Mode)');
  };

  const handleReject = () => {
    setRejectModal(false);
    setRejectReason('');
    triggerToast('Escrow request rejected (Demo Mode)');
    setTimeout(() => navigate('/landlord/incoming-escrows'), 1500);
  };

  const fadeIn = (delay = 0): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  return (
    <DashboardLayout
      role="landlord"
      userName="James Carter"
      navItems={NAV_ITEMS}
      activeId="incoming"
      onNavChange={(navId) => {
        if (navId === 'dashboard') navigate('/landlord/dashboard');
        if (navId === 'incoming') navigate('/landlord/incoming-escrows');
      }}
    >
      <Toast visible={toast} message={toastMsg} />

      {/* Confirm Move-in Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: C.white, borderRadius: 20, width: '100%', maxWidth: 440,
            padding: 32, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', font,
          }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: C.textDark, marginBottom: 12 }}>
              Confirm Student Move-in?
            </h3>
            <p style={{ fontSize: '0.88rem', color: C.textMid, lineHeight: 1.6, marginBottom: 24 }}>
              By confirming the move-in, the escrow will be marked as completed and the deposit will be released to your wallet once blockchain integration is active.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmModal(false)}
                style={{
                  font, fontWeight: 600, fontSize: '0.82rem', color: C.textMid,
                  border: `1.5px solid ${C.border}`, background: C.white,
                  borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button onClick={handleConfirmMoveIn}
                style={{
                  font, fontWeight: 700, fontSize: '0.82rem', color: C.white,
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                  border: 'none', borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(232,115,74,0.25)',
                }}>
                Confirm Move-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: C.white, borderRadius: 20, width: '100%', maxWidth: 440,
            padding: 32, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', font,
          }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ea4335', marginBottom: 12 }}>
              Reject Escrow Request?
            </h3>
            <p style={{ fontSize: '0.88rem', color: C.textMid, lineHeight: 1.6, marginBottom: 16 }}>
              Specify the reason for rejecting student <strong>{prop.student}</strong>'s request.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection…"
              style={{
                width: '100%', height: 80, borderRadius: 12, border: `1.5px solid ${C.border}`,
                padding: 12, font, fontSize: '0.82rem', outline: 'none', background: '#FAFAFA',
                boxSizing: 'border-box', marginBottom: 20, resize: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#ea4335'}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(false)}
                style={{
                  font, fontWeight: 600, fontSize: '0.82rem', color: C.textMid,
                  border: `1.5px solid ${C.border}`, background: C.white,
                  borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button onClick={handleReject}
                style={{
                  font, fontWeight: 700, fontSize: '0.82rem', color: C.white,
                  background: '#ea4335', border: 'none',
                  borderRadius: 50, padding: '10px 22px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234,67,53,0.25)',
                }}>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div style={{ ...fadeIn(0), display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => navigate('/landlord/dashboard')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Dashboard
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <button onClick={() => navigate('/landlord/incoming-escrows')}
          style={{ font, fontWeight: 500, fontSize: '0.8rem', color: C.orange, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Incoming Escrow Requests
        </button>
        <span style={{ color: C.textLight, fontSize: '0.8rem' }}>›</span>
        <span style={{ font, fontWeight: 600, fontSize: '0.8rem', color: C.textDark }}>Escrow Details</span>
      </div>

      {/* ── Page Header ── */}
      <div style={{ ...fadeIn(50), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
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
          background: status === 'Released' ? 'rgba(74,207,122,0.1)' : 'rgba(232,115,74,0.1)',
          border: `1.5px solid ${status === 'Released' ? 'rgba(74,207,122,0.3)' : 'rgba(232,115,74,0.3)'}`,
          borderRadius: 50, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'Released' ? '#4ACF7A' : C.orange }} />
          <span style={{ font, fontWeight: 700, fontSize: '0.8rem', color: status === 'Released' ? '#4ACF7A' : C.orange }}>
            {status}
          </span>
        </div>
      </div>

      {/* ══ 2-column layout ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}
        className="lg:grid-cols-[1fr_320px]">

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Property Card */}
          <div style={fadeIn(100)}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 140, background: 'linear-gradient(135deg, rgba(232,115,74,0.15) 0%, rgba(240,149,107,0.08) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem',
              }}>
                {prop.emoji}
              </div>
              <div style={{ padding: 24 }}>
                <SectionTitle label="🏠 Property Information" />
                <div style={{ font, fontWeight: 800, fontSize: '1.1rem', color: C.textDark, marginBottom: 4 }}>{prop.name}</div>
                <div style={{ font, fontSize: '0.83rem', color: C.textMid, marginBottom: 18 }}>📍 {prop.address}</div>
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
          <div style={{ ...fadeIn(140), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Student Card */}
            <Card>
              <SectionTitle label="🎓 Student Tenant Information" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font, fontWeight: 700, color: '#fff', fontSize: '1.2rem',
                }}>{prop.student.charAt(0)}</div>
                <div>
                  <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>{prop.student}</div>
                  <div style={{ font, fontSize: '0.75rem', color: C.textLight }}>{prop.university}</div>
                </div>
              </div>
              <InfoRow label="Email" value={prop.email} />
              <InfoRow label="Phone Number" value="+44 7700 900077" />
              <InfoRow label="Student ID (Demo)" value="STU-8829-19" />
            </Card>

            {/* Landlord Card */}
            <Card>
              <SectionTitle label="🏢 Landlord Details" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font, fontWeight: 700, color: '#fff', fontSize: '1.2rem',
                }}>J</div>
                <div>
                  <div style={{ font, fontWeight: 700, fontSize: '0.88rem', color: C.textDark }}>James Carter</div>
                  <div style={{ font, fontSize: '0.75rem', color: C.textLight }}>★ 4.8 Partner Rating</div>
                </div>
              </div>
              <InfoRow label="Email" value="james.carter@depositsafe-partner.com" />
              <InfoRow label="Phone Number" value="+44 7700 900144" />
              <InfoRow label="Verification Status" value="Verified" />
            </Card>
          </div>

          {/* Action Card Section */}
          <div style={fadeIn(180)}>
            <Card>
              <SectionTitle label="⚡ Escrow Request Management" />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setConfirmModal(true)}
                  disabled={status === 'Released'}
                  style={{
                    font, fontWeight: 700, fontSize: '0.85rem', color: C.white,
                    background: status === 'Released' ? '#CCCCCC' : `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                    border: 'none', borderRadius: 50, padding: '12px 28px', cursor: status === 'Released' ? 'not-allowed' : 'pointer',
                    boxShadow: status === 'Released' ? 'none' : '0 6px 18px rgba(232,115,74,0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (status !== 'Released') e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                  {status === 'Released' ? 'Move-in Confirmed' : 'Confirm Student Move-in'}
                </button>
                <button
                  onClick={() => setRejectModal(true)}
                  disabled={status === 'Released'}
                  style={{
                    font, fontWeight: 600, fontSize: '0.85rem', color: '#ea4335',
                    background: C.white, border: '1.5px solid rgba(234,67,53,0.3)',
                    borderRadius: 50, padding: '11px 28px', cursor: status === 'Released' ? 'not-allowed' : 'pointer',
                    opacity: status === 'Released' ? 0.5 : 1,
                  }}
                >
                  Reject Escrow Request
                </button>
                <button
                  onClick={() => navigate('/landlord/incoming-escrows')}
                  style={{
                    font, fontWeight: 600, fontSize: '0.85rem', color: C.textMid,
                    background: C.white, border: `1.5px solid ${C.border}`,
                    borderRadius: 50, padding: '11px 28px', cursor: 'pointer',
                  }}
                >
                  Back to Requests
                </button>
              </div>
            </Card>
          </div>

        </div>

        {/* ════════════ RIGHT COLUMN (Sidebar) ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, ...fadeIn(120) }}>
          
          <Card>
            <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 12 }}>
              ⚙️ Escrow Progress
            </div>
            <div style={{ background: '#EEEEEE', borderRadius: 10, height: 8, width: '100%', overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: status === 'Released' ? '100%' : '50%', height: '100%', background: `linear-gradient(90deg, ${C.orange}, ${C.orangeLight})`, borderRadius: 10 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.textLight, marginBottom: 16 }}>
              <span>Locked ({status === 'Released' ? '100%' : '50%'})</span>
              <span>Released (100%)</span>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ font, fontSize: '0.7rem', color: C.textLight }}>Next Action</div>
              <div style={{ font, fontWeight: 700, fontSize: '0.8rem', color: C.textDark, marginTop: 2 }}>
                {status === 'Released'
                  ? 'None. Deposit released to landlord wallet.'
                  : 'Awaiting landlord move-in confirmation.'}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ font, fontWeight: 800, fontSize: '0.92rem', color: C.textDark, marginBottom: 16 }}>
              🕒 Recent Activity
            </div>
            {[
              { title: status === 'Released' ? 'Deposit Released' : 'Waiting for Move-in', desc: status === 'Released' ? 'ESC completed successfully' : 'Move-in confirmation pending', time: '10:16 AM', date: '01 Jul 2026', icon: status === 'Released' ? '🔓' : '⏳' },
              { title: 'Deposit Locked', desc: 'ESC funds confirmed locked', time: '09:44 AM', date: '01 Jul 2026', icon: '🔒' },
              { title: 'Agreement Accepted', desc: 'Student accepted escrow terms', time: '09:40 AM', date: '01 Jul 2026', icon: '🚀' },
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
    </DashboardLayout>
  );
};

export default LandlordEscrowDetails;
