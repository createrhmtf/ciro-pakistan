import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface-container border-t border-primary/20 flex justify-around items-center px-baseline h-touch-target pb-safe">
      <NavLink
        to="/feed"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center rounded-xl px-3 py-1 active:scale-95 transition-transform ${
            isActive ? 'bg-primary-container text-on-primary-container' : 'text-outline hover:text-primary'
          }`
        }
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
        <span className="font-label-muted text-[10px] mt-0.5">Intel</span>
      </NavLink>

      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center rounded-xl px-3 py-1 active:scale-95 transition-transform ${
            isActive ? 'bg-primary-container text-on-primary-container' : 'text-outline hover:text-primary'
          }`
        }
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
        <span className="font-label-muted text-[10px] mt-0.5">Response</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center rounded-xl px-3 py-1 active:scale-95 transition-transform ${
            isActive ? 'bg-primary-container text-on-primary-container' : 'text-outline hover:text-primary'
          }`
        }
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
        <span className="font-label-muted text-[10px] mt-0.5">Map</span>
      </NavLink>

      <NavLink
        to="/alerts"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center rounded-xl px-3 py-1 active:scale-95 transition-transform ${
            isActive ? 'bg-primary-container text-on-primary-container' : 'text-outline hover:text-primary'
          }`
        }
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full border border-background"></span>
        </div>
        <span className="font-label-muted text-[10px] mt-0.5">Alerts</span>
      </NavLink>
    </nav>
  );
}
