import React, { useState, useCallback, useEffect } from 'react';
import useAuth from '../auth/useAuth';
import { getFirebaseErrorMessage } from '../auth/authHelpers';
import GoogleLoginButton from './GoogleLoginButton';
import MicrosoftLoginButton from './MicrosoftLoginButton';
import EmailLoginForm from './EmailLoginForm';
import { useToast } from './ToastProvider';

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithGoogle, loginWithMicrosoft, loginWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setError('');
    setLoading(false);
    setVisible(false);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        toast.success(`Welcome, ${user.displayName || 'Agent'}!`, { icon: '🛡️' });
        handleClose();
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err?.code) || err?.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginWithMicrosoft();
      if (user) {
        toast.success(`Welcome, ${user.displayName || 'Officer'}!`, { icon: '🛡️' });
        handleClose();
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err?.code) || err?.message || 'Microsoft login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async ({ email, password, displayName }) => {
    setLoading(true);
    setError('');
    try {
      let user;
      if (activeTab === 'login') {
        user = await loginWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password, displayName);
      }
      if (user) {
        toast.success(
          activeTab === 'login'
            ? `Welcome back, ${user.displayName || 'Agent'}!`
            : `Account created! Welcome, ${user.displayName}!`,
          { icon: '🛡️' }
        );
        handleClose();
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err?.code) || err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    if (!email) {
      toast.error('Please enter your email first.');
      return;
    }
    try {
      await resetPassword(email);
      toast.success('Password reset email sent! Check your inbox.', { icon: '📧' });
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err?.code) || 'Failed to send reset email.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-[420px] rounded-2xl overflow-hidden transition-all duration-300
          ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        style={{
          background: 'linear-gradient(180deg, rgba(40,42,43,0.97) 0%, rgba(18,20,20,0.97) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Header */}
        <div className="p-6 pb-4 text-center relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
              text-outline/50 hover:text-on-surface hover:bg-white/[0.06] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_rgba(29,158,117,0.2)]">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <div className="text-left">
              <div className="text-[14px] font-bold text-on-surface tracking-tight">CIRO PAKISTAN</div>
              <div className="text-[9px] text-outline uppercase tracking-[0.15em] font-medium">Secure Authentication</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 rounded-xl p-1 border border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.02)' }}>
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-[12px] font-semibold uppercase tracking-wider transition-all duration-300
                  ${activeTab === tab
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(29,158,117,0.15)]'
                    : 'text-outline/60 hover:text-outline border border-transparent'
                  }`}
              >
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Social Buttons */}
          <div className="flex flex-col gap-2.5 mb-4">
            <GoogleLoginButton onClick={handleGoogleLogin} loading={loading} />
            <MicrosoftLoginButton onClick={handleMicrosoftLogin} loading={loading} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] text-outline/50 uppercase tracking-widest font-medium">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Email Form */}
          <EmailLoginForm
            mode={activeTab}
            onSubmit={handleEmailSubmit}
            onForgotPassword={handleForgotPassword}
            loading={loading}
            error={error}
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-0">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-outline/40">
            <span className="material-symbols-outlined text-[12px]">lock</span>
            <span>Protected by Firebase Authentication • 256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
