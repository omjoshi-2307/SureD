import React, { useState } from 'react';
import { X, KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { requestPasswordReset, confirmPasswordReset } from '@/services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.otp) {
        setDemoOtpNotice(`Your verification code is: ${res.otp}`);
        setOtp(res.otp); // Autofill for convenience
      }
      setStep('verify');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to request reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await confirmPasswordReset({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Reset failed. Please verify your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAndReset = () => {
    setStep('request');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setDemoOtpNotice(null);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px 12px 38px',
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#FFF',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.86rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5, 5, 12, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'linear-gradient(145deg, #161423 0%, #0B0A11 100%)',
        border: '1px solid rgba(124, 92, 255, 0.25)',
        borderRadius: 24,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124, 92, 255, 0.2)',
        padding: 28,
        color: '#FFF',
        fontFamily: "'Inter', sans-serif",
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.2), rgba(167, 139, 250, 0.1))',
              border: '1px solid rgba(124, 92, 255, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#A78BFA'
            }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Reset Password</h3>
              <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
                {step === 'request' && 'Enter your email to receive a reset code'}
                {step === 'verify' && 'Enter verification code and your new password'}
                {step === 'success' && 'Password successfully updated'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAndReset}
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              width: 32, height: 32, borderRadius: 8, color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: '0.8rem', color: '#F87171',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <AlertCircle size={15} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {demoOtpNotice && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: '0.8rem', color: '#34D399',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <CheckCircle2 size={15} flexShrink={0} />
            <span>{demoOtpNotice}</span>
          </div>
        )}

        {/* Step 1: Request Code */}
        {step === 'request' && (
          <form onSubmit={handleRequestOtp}>
            <div style={{ marginBottom: 18, position: 'relative' }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>
                Account Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7C5CFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
                border: 'none', color: '#FFF', fontWeight: 700, fontSize: '0.86rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(124, 92, 255, 0.35)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification Code'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        )}

        {/* Step 2: Verify & Enter New Password */}
        {step === 'verify' && (
          <form onSubmit={handleResetSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>
                6-Digit Verification Code (OTP)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                style={{
                  ...inputStyle,
                  padding: '12px 14px',
                  textAlign: 'center',
                  letterSpacing: '6px',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>
                New Password (min 8 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7C5CFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7C5CFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep('request')}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFF', fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2, padding: '12px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
                  border: 'none', color: '#FFF', fontWeight: 700, fontSize: '0.86rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(124, 92, 255, 0.35)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Set New Password'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#34D399', margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={30} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: '#FFF' }}>Password Reset Complete</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Your password has been securely updated. You can now sign in to your SureDeposit account.
            </p>

            <button
              onClick={() => {
                handleCloseAndReset();
                if (onSuccess) onSuccess();
              }}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
                border: 'none', color: '#FFF', fontWeight: 700, fontSize: '0.86rem',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(124, 92, 255, 0.35)'
              }}
            >
              Sign In Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
