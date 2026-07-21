import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleLogin } from '../../services/authService';
import LogoMark from './LogoMark';
import { AlertTriangle, Building2, Check, GraduationCap } from 'lucide-react';

const font = "'Inter', sans-serif";

const CheckIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <Check size={size} strokeWidth={2.5} aria-hidden="true" style={{ color: '#A78BFA' }} />
);

const StudentIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <GraduationCap size={20} strokeWidth={1.8} aria-hidden="true"
    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)' }} />
);

const LandlordIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <Building2 size={20} strokeWidth={1.8} aria-hidden="true"
    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)' }} />
);

const GoogleRoleSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  const [selectedRole, setSelectedRole] = useState<'student' | 'landlord' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!state?.credential || !state?.email) {
    return (
      <div className="dl-canvas" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: 20, position: 'relative', overflow: 'hidden' }}>
        <div className="dl-vignette" aria-hidden="true" />
        <div className="glass" style={{ borderRadius: 20, padding: 40, maxWidth: 400, textAlign: 'center', position: 'relative', borderTop: '1px solid rgba(224,215,255,0.28)' }}>
          <div style={{
            width: 52, height: 52, margin: '0 auto 16px', borderRadius: '50%',
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} strokeWidth={2} aria-hidden="true" style={{ color: '#F59E0B' }} />
          </div>
          <h2 style={{ fontFamily: font, fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>Session expired</h2>
          <p style={{ fontFamily: font, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 1.5 }}>
            Your Google sign-in session has expired. Please try again.
          </p>
          <button onClick={() => navigate('/')} className="btn-glow" style={{ fontSize: '0.85rem', padding: '11px 24px' }}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedRole) { setError('Please select an account type.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const result = await googleLogin({
        credential: state.credential,
        name: state.name,
        email: state.email,
        role: selectedRole,
      });
      if (result.token && result.user) {
        const role = result.user.role;
        navigate(role === 'student' ? '/student/dashboard' : '/landlord/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleCard = (
    role: 'student' | 'landlord',
    title: string,
    desc: string,
    icon: React.ReactNode,
  ) => {
    const active = selectedRole === role;
    return (
      <button
        onClick={() => { setSelectedRole(role); setError(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
          borderRadius: 16,
          border: `1.5px solid ${active ? 'rgba(124,92,255,0.7)' : 'rgba(255,255,255,0.1)'}`,
          background: active ? 'rgba(124,92,255,0.1)' : 'rgba(255,255,255,0.03)',
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
          boxShadow: active ? '0 0 24px rgba(124,92,255,0.25)' : 'none',
          width: '100%',
        }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: active ? 'linear-gradient(135deg,#7C5CFF,#A78BFA)' : 'rgba(255,255,255,0.05)',
          border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: active ? '0 0 16px rgba(124,92,255,0.45)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: font, fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: 2 }}>{title}</div>
          <div style={{ fontFamily: font, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
            {desc}
          </div>
        </div>
        {active && <CheckIcon />}
      </button>
    );
  };

  return (
    <div className="dl-canvas" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 'min(700px, 110vw)', height: 'min(700px, 110vw)', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.2) 0%, transparent 65%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }}
      />
      <div className="dl-vignette" aria-hidden="true" />

      <div className="glass dl-stagger" style={{ borderRadius: 24, padding: 'clamp(28px, 5vw, 40px)', maxWidth: 440, width: '100%', position: 'relative', zIndex: 2, borderTop: '1px solid rgba(224,215,255,0.28)', boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(124,92,255,0.12)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <LogoMark size={30} style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.45))' }} />
          </div>
          {state.picture ? (
            <img src={state.picture} alt="" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 12px', display: 'block', border: '2px solid rgba(124,92,255,0.5)', boxShadow: '0 0 18px rgba(124,92,255,0.35)' }} />
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 12px', background: 'linear-gradient(135deg,#7C5CFF,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', fontWeight: 700, fontFamily: font, boxShadow: '0 0 18px rgba(124,92,255,0.4)' }}>
              {state.name?.charAt(0) || '?'}
            </div>
          )}
          <h1 className="text-hero-gradient" style={{ fontSize: '1.4rem', letterSpacing: '-0.5px', marginBottom: 6 }}>
            Choose account type
          </h1>
          <p style={{ fontFamily: font, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Welcome, <strong style={{ color: '#fff' }}>{state.name || state.email}</strong>.<br />
            Select how you'll use DepositSafe.
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {roleCard('student', 'Student',
            "I'm a tenant looking to secure my rental deposit on the blockchain.",
            <StudentIcon active={selectedRole === 'student'} />)}
          {roleCard('landlord', 'Landlord',
            "I'm a property manager receiving deposit payments from my tenants.",
            <LandlordIcon active={selectedRole === 'landlord'} />)}
        </div>

        {error && (
          <div style={{
            fontFamily: font, fontSize: '0.82rem', color: '#FCA5A5', textAlign: 'center', marginBottom: 16,
            padding: '9px 14px', borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedRole || submitting}
          className={selectedRole ? 'btn-glow' : undefined}
          style={{
            width: '100%', fontFamily: font, fontWeight: 600, fontSize: '0.9rem',
            color: selectedRole ? '#fff' : 'rgba(255,255,255,0.35)',
            border: selectedRole ? 'none' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999, padding: '13px',
            background: selectedRole ? undefined : 'rgba(255,255,255,0.04)',
            cursor: selectedRole && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {submitting ? 'Creating account…' : 'Continue'}
        </button>

        <p style={{ textAlign: 'center', fontFamily: font, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 16, lineHeight: 1.5 }}>
          This role can be changed later in your profile settings.
        </p>
      </div>
    </div>
  );
};

export default GoogleRoleSelect;
