import React, { useState } from 'react';
import useAuth from '../auth/useAuth';
import { getInitials } from '../auth/authHelpers';
import AuthModal from './AuthModal';
import UserDropdown from './UserDropdown';

export default function ProfileButton() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleClick = () => {
    if (user) {
      setShowDropdown((prev) => !prev);
    } else {
      setShowModal(true);
    }
  };

  if (user) {
    const initials = getInitials(user.displayName);
    const avatarUrl = user.photoURL;

    return (
      <div className="relative">
        <button
          onClick={handleClick}
          className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary/40 hover:border-primary
            transition-all duration-300 hover:shadow-[0_0_12px_rgba(29,158,117,0.3)] active:scale-90 group"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.displayName}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className={`w-full h-full bg-primary/20 items-center justify-center text-primary font-bold text-[12px]
              ${avatarUrl ? 'hidden' : 'flex'}`}
          >
            {initials}
          </div>
          {/* Online dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#30d158] border-[1.5px] border-background" />
        </button>

        {/* Dropdown */}
        {showDropdown && <UserDropdown onClose={() => setShowDropdown(false)} />}
      </div>
    );
  }

  // Not logged in - show icon button that opens auth modal
  return (
    <>
      <button
        onClick={handleClick}
        className="p-1 text-outline hover:text-primary active:scale-90 transition-all duration-200 ml-1
          hover:drop-shadow-[0_0_8px_rgba(29,158,117,0.4)]"
      >
        <span className="material-symbols-outlined text-[24px]">account_circle</span>
      </button>

      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
