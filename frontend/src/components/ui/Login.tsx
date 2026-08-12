import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../../services/authService';
import { initGoogleSignIn, setGoogleCallback, renderHiddenGoogleButton, clickGoogleSignIn, destroyHiddenGoogleButton } from '../../services/googleSignInService';
import Sparkle from './Sparkle';
import { ArrowLeft, ArrowRight, Building2, Check, Eye, EyeOff, GraduationCap, LoaderCircle, Lock, Mail } from 'lucide-react';
import LogoMark from './LogoMark';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginProps {
  onBack?: () => void;
  onRegister?: () => void;
  /** Demo only: called with selected role on submit. Replace with real auth later. */
  onLogin?: (role: 'student' | 'landlord') => void;
}

/* ── Shared dark input styling ── */
const inputBase: React.CSSProperties = {
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

const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = '#7C5CFF';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.18)';
  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.75)',
};

const Login: React.FC<LoginProps> = ({ onBack, onRegister, onLogin }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  const handleGoRegister = () => {
    if (onRegister) onRegister();
    else navigate('/register');
  };
  const [role, setRole] = useState<'student' | 'landlord'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

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

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const response = await loginUser({ email: email.trim(), password });
      const userRole: string = response?.user?.role ?? '';
      if (userRole === 'student') {
        navigate('/student/dashboard');
      } else if (userRole === 'landlord') {
        navigate('/landlord/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Unknown role. Please contact support.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  void onLogin;

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
      {/* ── Atmosphere: violet glow, horizon streaks, vignette, stars ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(760px, 110vw)',
          height: 'min(760px, 110vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.22) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div className="dl-horizon dl-horizon-left" aria-hidden="true" />
      <div className="dl-horizon dl-horizon-right" aria-hidden="true" />
      {[
        { top: '12%', left: '14%', size: 2, delay: 0 },
        { top: '20%', left: '80%', size: 1, delay: 0.8 },
        { top: '72%', left: '10%', size: 1, delay: 1.6 },
        { top: '82%', left: '86%', size: 2, delay: 2.4 },
        { top: '8%', left: '55%', size: 1, delay: 3.0 },
      ].map((s, i) => (
        <span
          key={i}
          className="dl-star"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          aria-hidden="true"
        />
      ))}
      <div className="dl-vignette" aria-hidden="true" />

      {/* Sparkles */}
      <span style={{ position: 'absolute', top: '14%', left: '11%', zIndex: 2 }}>
        <Sparkle size={18} color="#A78BFA" />
      </span>
      <span style={{ position: 'absolute', bottom: '16%', right: '10%', zIndex: 2 }}>
        <Sparkle size={13} color="#7C5CFF" />
      </span>

      {/* ── Top-left back button ── */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20 }}>
        <button
          onClick={handleBack}
          className="btn-glass"
          style={{ padding: '9px 18px', fontSize: '0.82rem' }}
        >
          <ArrowLeft size={13} strokeWidth={2.5} aria-hidden="true" />
          Back to home
        </button>
      </div>

      {/* ══════════════════════════════════════════
          LOGIN CARD
      ══════════════════════════════════════════ */}
      <div
        className="glass dl-stagger"
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 24,
          borderTop: '1px solid rgba(224,215,255,0.28)',
          padding: 'clamp(28px, 5vw, 40px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(124,92,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── Brand ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark
              size={34}
              style={{ filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.5))', flexShrink: 0 }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.3px' }}>
              DepositSafe
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1
              className="text-hero-gradient"
              style={{ fontSize: '1.7rem', letterSpacing: '-0.8px', marginBottom: 6, lineHeight: 1.15 }}
            >
              Welcome back
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.86rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              Sign in to your DepositSafe account
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

        {/* ── Role Selector ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={labelStyle}>I am a</span>
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            {(['student', 'landlord'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 0',
                  borderRadius: 999,
                  border: 'none',
                  background: role === r ? 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)' : 'transparent',
                  color: role === r ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: role === r ? '0 0 18px rgba(124,92,255,0.45)' : 'none',
                  textTransform: 'capitalize',
                }}
                onMouseEnter={(e) => {
                  if (role !== r) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
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

        {/* ── Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="login-email" style={labelStyle}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              {/* Mail icon */}
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none',
              }}>
                <Mail size={15} strokeWidth={2} aria-hidden="true" />
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputBase}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="login-password" style={labelStyle}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              {/* Lock icon */}
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', pointerEvents: 'none',
              }}>
                <Lock size={15} strokeWidth={2} aria-hidden="true" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputBase, padding: '13px 44px 13px 40px' }}
                onFocus={focusInput}
                onBlur={blurInput}
              />
              {/* Show / hide toggle */}
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
                {showPassword
                  ? <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
                  : <Eye size={16} strokeWidth={2} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Remember Me + Forgot Password ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <label
            htmlFor="remember-me"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)', fontWeight: 500, userSelect: 'none',
            }}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              aria-label="Remember me"
              onClick={() => setRemember(v => !v)}
              style={{
                width: 18, height: 18, borderRadius: 5, padding: 0, cursor: 'pointer',
                border: `1.5px solid ${remember ? '#7C5CFF' : 'rgba(255,255,255,0.25)'}`,
                background: remember ? '#7C5CFF' : 'transparent',
                boxShadow: remember ? '0 0 10px rgba(124,92,255,0.5)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease', flexShrink: 0,
              }}
            >
              {remember && (
                <Check size={10} strokeWidth={3.5} aria-hidden="true" style={{ color: '#fff' }} />
              )}
            </button>
            Remember me
          </label>

          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              setShowForgotModal(true);
            }}
            style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 500,
              fontSize: '0.8rem', color: '#A78BFA', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E0D7FF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A78BFA')}
          >
            Forgot password?
          </a>
        </div>

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

        {/* ── Primary Login Button ── */}
        <button
          type="button"
          className="btn-glow"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.92rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
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
          }}>or continue with</span>
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
          {/* Google icon or spinner */}
          {googleLoading ? (
            <LoaderCircle
              size={16}
              strokeWidth={2.5}
              aria-hidden="true"
              style={{ color: '#A78BFA', animation: 'ringSpin 1s linear infinite' }}
            />
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

        {/* ── Register Link ── */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.84rem', color: 'rgba(255,255,255,0.55)', fontWeight: 400,
        }}>
          Don&apos;t have an account?{' '}
          <a
            href="#"
            onClick={e => { e.preventDefault(); handleGoRegister(); }}
            style={{
              color: '#A78BFA', fontWeight: 600, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E0D7FF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A78BFA')}
          >
            Register
          </a>
        </p>

        {/* Trust chips at the bottom of the card */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, flexWrap: 'wrap',
        }}>
          {['On-chain escrow', 'Non-custodial', '~5s settlement'].map(badge => (
            <span
              key={badge}
              className="mono-addr"
              style={{
                fontSize: '0.62rem',
                color: 'rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 50,
                padding: '4px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={() => setError('')}
      />
    </div>
  );
};

export default Login;
