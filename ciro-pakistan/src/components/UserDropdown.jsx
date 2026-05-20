import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { getInitials } from '../auth/authHelpers';
import { useToast } from './ToastProvider';

export default function UserDropdown({ onClose }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDropdown = () => {
    setVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.', { icon: '👋' });
      closeDropdown();
    } catch (err) {
      toast.error('Logout failed. Try again.');
    }
  };

  const handleDashboard = () => {
    navigate('/');
    closeDropdown();
  };

  if (!user) return null;

  const initials = getInitials(user.displayName);
  const avatarUrl = user.photoURL;

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', onClick: handleDashboard },
    { icon: 'settings', label: 'Settings', onClick: () => { toast('Settings coming soon!', { icon: '⚙️' }); closeDropdown(); } },
    { divider: true },
    { icon: 'logout', label: 'Sign Out', onClick: handleLogout, danger: true },
  ];

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full right-0 mt-2 w-[280px] rounded-2xl overflow-hidden z-[100]
        transition-all duration-200
        ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'}`}
      style={{
        background: 'linear-gradient(180deg, rgba(40,42,43,0.98) 0%, rgba(18,20,20,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 16px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Top gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* User Profile Header */}
      <div className="p-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.displayName}
                className="w-11 h-11 rounded-full object-cover border-2 border-primary/30"
                onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className={`w-11 h-11 rounded-full bg-primary/20 border-2 border-primary/30 items-center justify-center text-primary font-bold text-[14px] ${avatarUrl ? 'hidden' : 'flex'}`}
            >
              {initials}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#30d158] border-2 border-surface-container-high" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-on-surface truncate">{user.displayName || 'Agent'}</div>
            <div className="text-[11px] text-outline/70 truncate">{user.email}</div>
            <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-[10px] text-primary">verified_user</span>
              <span className="text-[9px] text-primary font-bold uppercase tracking-wider">{user.role || 'operator'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1.5">
        {menuItems.map((item, i) => {
          if (item.divider) {
            return <div key={i} className="my-1.5 border-t border-white/[0.05]" />;
          }
          return (
            <button
              key={i}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200
                ${item.danger
                  ? 'text-error/80 hover:bg-error/[0.06] hover:text-error'
                  : 'text-on-surface/70 hover:bg-white/[0.04] hover:text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span className="text-[12px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[10px] text-outline/30">security</span>
        <span className="text-[9px] text-outline/30 font-medium">Session via {user.provider || 'firebase'}</span>
      </div>
    </div>
  );
}
