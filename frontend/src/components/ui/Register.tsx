import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sparkle from './Sparkle';
import { ArrowLeft, ArrowRight, Building2, Check, Eye, EyeOff, GraduationCap, LoaderCircle, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import LogoMark from './LogoMark';
import { registerUser, googleLogin } from "../../services/authService";
import { initGoogleSignIn, setGoogleCallback, renderHiddenGoogleButton, clickGoogleSignIn, destroyHiddenGoogleButton } from '../../services/googleSignInService';

interface RegisterProps {
  onBack?: () => void;
  onSignIn?: () => void;
  /** Demo only: called with selected role on submit. Replace with real auth later. */
  onRegister?: (role: 'student' | 'landlord') => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.75)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px 13px 40px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  caretColor: '#A78BFA',
};

const iconWrap: React.CSSProperties = {
  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
  color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none',
};

const Register: React.FC<RegisterProps> = ({ onBack, onSignIn, onRegister }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  const handleGoSignIn = () => {
    if (onSignIn) onSignIn();
    else navigate('/login');
  };
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  void onRegister;

  /* ── Google Sign-In ── */
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    initGoogleSignIn(GOOGLE_CLIENT_ID);
    renderHiddenGoogleButton();
    setGoogleCallback(handleGoogleResponse);
    return () => {
      setGoogleCallback(null);
      destroyHiddenGoogleButton();
      if (googleTimeoutRef.current !== null) {
        window.clearTimeout(googleTimeoutRef.current);
        googleTimeoutRef.current = null;
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (response: any) => {
    if (googleTimeoutRef.current !== null) {
      window.clearTimeout(googleTimeoutRef.current);
      googleTimeoutRef.current = null;
    }
    if (!response?.credential) {
      setError('Google authentication failed. No credential received.');
      setGoogleLoading(false);
      return;
    }
    try {
      setGoogleLoading(true);
      setError('');
      const result = await googleLogin({ credential: response.credential });
      if (result.needsRole) {
        navigate('/auth/google-role-select', {
          state: {
            credential: response.credential,
            email: result.email,
            name: result.name,
            picture: result.picture,
          },
        });
        return;
      }
      if (result.token && result.user) {
        const userRole = result.user.role;
        if (userRole === 'student') navigate('/student/dashboard');
        else if (userRole === 'landlord') navigate('/landlord/dashboard');
        else setError('Unexpected user role returned.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Google login failed.';
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }
    if (!window.google?.accounts?.id) {
      setError('Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    setGoogleLoading(true);
    setError('');

    if (!clickGoogleSignIn()) {
      setError('Google Sign-In is not available. Please try again.');
      setGoogleLoading(false);
      return;
    }

    if (googleTimeoutRef.current !== null) {
      window.clearTimeout(googleTimeoutRef.current);
    }
    googleTimeoutRef.current = window.setTimeout(() => {
      setGoogleLoading(false);
      setError('Google Sign-In did not complete. Please try again.');
    }, 30000);
  };

  /* ── Real registration handler ── */
  const handleRegister = async () => {
    setError('');
    if (!firstName.trim()) { setError('Please enter your first name.'); return; }
    if (!lastName.trim()) { setError('Please enter your last name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }

    setLoading(true);
    try {
      const res = await registerUser({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
        role,
      });
      // On success: Navigate directly to dashboard
      const userRole = res?.user?.role || role;
      if (onRegister) {
        onRegister(userRole);
      } else {
        navigate(userRole === 'student' ? '/student/dashboard' : '/landlord/dashboard');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Password strength ── */
  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-4
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['rgba(255,255,255,0.15)', '#F87171', '#F59E0B', '#60A5FA', '#34D399'][strength];

  /* ── Input focus helpers ── */
  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#7C5CFF';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.18)';
    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
  };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
  };

  return (
    <div
      className="dl-canvas"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '88px 24px 48px',
      }}
    >
      {/* ── Atmosphere ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(800px, 110vw)',
          height: 'min(800px, 110vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.2) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div className="dl-horizon dl-horizon-left" aria-hidden="true" />
      <div className="dl-horizon dl-horizon-right" aria-hidden="true" />
      <div className="dl-vignette" aria-hidden="true" />

      {/* Sparkles */}
      <span style={{ position: 'absolute', top: '10%', left: '8%', zIndex: 2 }}>
        <Sparkle size={18} color="#A78BFA" />
      </span>
      <span style={{ position: 'absolute', bottom: '12%', right: '7%', zIndex: 2 }}>
        <Sparkle size={13} color="#7C5CFF" />
      </span>

      {/* ── Back Button ── */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20 }}>
        <button onClick={handleBack} className="btn-glass" style={{ padding: '9px 18px', fontSize: '0.82rem' }}>
          <ArrowLeft size={13} strokeWidth={2.5} aria-hidden="true" />
          Back to home
        </button>
      </div>

      {/* ══════════════════════════════════════════
          REGISTER CARD
      ══════════════════════════════════════════ */}
      <div
        className="glass dl-stagger"
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          borderTop: '1px solid rgba(224,215,255,0.28)',
          padding: 'clamp(28px, 5vw, 40px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(124,92,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── Brand ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={34} style={{ filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.5))', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.3px' }}>
              DepositSafe
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 className="text-hero-gradient" style={{ fontSize: '1.7rem', letterSpacing: '-0.8px', marginBottom: 6, lineHeight: 1.15 }}>
              Create your account
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              Escrow-protected deposits, on Stellar
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

        {/* ── Role Selector ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={labelStyle}>I am registering as a</span>
          <div
            style={{
              display: 'flex', gap: 4, padding: 4, borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            {(['student', 'landlord'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 0',
                  borderRadius: 999,
                  border: 'none',
                  background: role === r ? 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)' : 'transparent',
                  color: role === r ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  boxShadow: role === r ? '0 0 18px rgba(124,92,255,0.45)' : 'none',
                  textTransform: 'capitalize',
                }}
                onMouseEnter={e => {
                  if (role !== r) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  if (role !== r) e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                {r === 'student' ? (
                  <GraduationCap size={14} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Building2 size={14} strokeWidth={2} aria-hidden="true" />
                )}
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ── Name Row ── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* First Name */}
          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="reg-firstname" style={labelStyle}>First name</label>
            <div style={{ position: 'relative' }}>
              <span style={iconWrap}>
                <UserRound size={14} strokeWidth={2} aria-hidden="true" />
              </span>
              <input
                id="reg-firstname"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          </div>

          {/* Last Name */}
          <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="reg-lastname" style={labelStyle}>Last name</label>
            <div style={{ position: 'relative' }}>
              <span style={iconWrap}>
                <UserRound size={14} strokeWidth={2} aria-hidden="true" />
              </span>
              <input
                id="reg-lastname"
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          </div>
        </div>

        {/* ── Email ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="reg-email" style={labelStyle}>Email address</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrap}>
              <Mail size={15} strokeWidth={2} aria-hidden="true" />
            </span>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>
        </div>

        {/* ── Password ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="reg-password" style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrap}>
              <Lock size={15} strokeWidth={2} aria-hidden="true" />
            </span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
                padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#A78BFA')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Password strength bar */}
          {password.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 99,
                    background: i <= strength ? strengthColor : 'rgba(255,255,255,0.1)',
                    boxShadow: i <= strength ? `0 0 8px ${strengthColor}66` : 'none',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>
              <span className="mono-addr" style={{ fontSize: '0.68rem', fontWeight: 500, color: strengthColor }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* ── Confirm Password ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="reg-confirm" style={labelStyle}>Confirm password</label>
          <div style={{ position: 'relative' }}>
            <span style={iconWrap}>
              <ShieldCheck size={15} strokeWidth={2} aria-hidden="true" />
            </span>
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                ...inputStyle,
                paddingRight: 44,
                borderColor: confirm.length > 0
                  ? confirm === password ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.6)'
                  : 'rgba(255,255,255,0.12)',
              }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
                padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#A78BFA')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
                <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
          {confirm.length > 0 && confirm !== password && (
            <span style={{
              fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
              fontWeight: 500, color: '#F87171',
            }}>
              Passwords don't match
            </span>
          )}
        </div>

        {/* ── Terms checkbox ── */}
        <label
          htmlFor="terms"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)', fontWeight: 400, userSelect: 'none', lineHeight: 1.5,
          }}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            aria-label="I agree to the Terms of Service and Privacy Policy"
            onClick={() => setAgreed(v => !v)}
            style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, padding: 0, cursor: 'pointer',
              border: `1.5px solid ${agreed ? '#7C5CFF' : 'rgba(255,255,255,0.25)'}`,
              background: agreed ? '#7C5CFF' : 'transparent',
              boxShadow: agreed ? '0 0 10px rgba(124,92,255,0.5)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {agreed && (
              <Check size={10} strokeWidth={3.5} aria-hidden="true" style={{ color: '#fff' }} />
            )}
          </button>
          <span>
            I agree to the{' '}
            <a href="#" onClick={e => e.preventDefault()}
              style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" onClick={e => e.preventDefault()}
              style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>
              Privacy Policy
            </a>
          </span>
        </label>

        {/* ── Inline Error Message ── */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.8rem',
            color: '#FCA5A5',
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* ── Primary Register Button ── */}
        <button
          type="button"
          className="btn-glow"
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.92rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? 'Creating account…' : 'Create my account'}
          {!loading && (
            <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
          )}
        </button>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500,
          }}>or sign up with</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* ── Google SSO ── */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading}
          className="btn-glass"
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            opacity: googleLoading ? 0.6 : 1,
          }}
        >
          {googleLoading ? (
            <LoaderCircle size={16} strokeWidth={2.5} aria-hidden="true"
              style={{ color: '#A78BFA', animation: 'ringSpin 1s linear infinite' }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4"/>
              <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853"/>
              <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04"/>
              <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335"/>
            </svg>
          )}
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* ── Sign In Link ── */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.84rem', color: 'rgba(255,255,255,0.55)', fontWeight: 400,
        }}>
          Already have an account?{' '}
          <a
            href="#"
            onClick={e => { e.preventDefault(); handleGoSignIn(); }}
            style={{
              color: '#A78BFA', fontWeight: 600, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E0D7FF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A78BFA')}
          >
            Sign in
          </a>
        </p>

        {/* ── Trust chips ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, flexWrap: 'wrap',
        }}>
          {['On-chain escrow', 'Non-custodial', '~5s settlement'].map(badge => (
            <span key={badge} className="mono-addr" style={{
              fontSize: '0.62rem',
              color: 'rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 50, padding: '4px 10px', whiteSpace: 'nowrap',
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Register;
