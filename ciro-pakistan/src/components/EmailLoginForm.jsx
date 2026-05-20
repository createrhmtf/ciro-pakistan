import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../auth/authHelpers';

export default function EmailLoginForm({ mode, onSubmit, onForgotPassword, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(password)) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (isRegister && !displayName.trim()) {
      setLocalError('Please enter your display name.');
      return;
    }

    onSubmit({ email, password, displayName: displayName.trim() });
  };

  const fieldClass = `w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10
    text-on-surface text-[13px] placeholder-outline/50 outline-none
    focus:border-primary/50 focus:bg-primary/[0.03] focus:ring-1 focus:ring-primary/20
    transition-all duration-300`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      {isRegister && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline/50">badge</span>
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`${fieldClass} pl-10`}
            autoComplete="name"
          />
        </div>
      )}

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline/50">mail</span>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${fieldClass} pl-10`}
          autoComplete="email"
        />
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline/50">lock</span>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${fieldClass} pl-10 pr-10`}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/50 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>

      {isRegister && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline/50">lock</span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${fieldClass} pl-10`}
            autoComplete="new-password"
          />
        </div>
      )}

      {/* Error display */}
      {(localError || error) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20">
          <span className="material-symbols-outlined text-[16px] text-error">error</span>
          <span className="text-[11px] text-error font-medium">{localError || error}</span>
        </div>
      )}

      {/* Forgot password link */}
      {!isRegister && onForgotPassword && (
        <button
          type="button"
          onClick={() => onForgotPassword(email)}
          className="text-[11px] text-primary/70 hover:text-primary self-end transition-colors font-medium"
        >
          Forgot Password?
        </button>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-[13px]
          uppercase tracking-wider hover:shadow-[0_0_20px_rgba(29,158,117,0.3)]
          active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">
              {isRegister ? 'person_add' : 'login'}
            </span>
            {isRegister ? 'Create Account' : 'Sign In'}
          </>
        )}
      </button>
    </form>
  );
}
