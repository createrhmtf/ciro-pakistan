/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-background": "#e2e2e2",
        "on-tertiary-fixed": "#131c26",
        "on-primary": "#003827",
        "tertiary": "#bec7d5",
        "surface-container-highest": "#333535",
        "surface-dim": "#121414",
        "tertiary-container": "#88919e",
        "surface-variant": "#333535",
        "on-primary-fixed": "#002115",
        "outline-variant": "#3d4943",
        "surface-container-high": "#282a2b",
        "on-tertiary-container": "#222a35",
        "primary-fixed": "#86f8c9",
        "inverse-on-surface": "#2f3131",
        "on-tertiary": "#28313c",
        "on-secondary-container": "#adb9d1",
        "on-primary-container": "#003121",
        "on-surface": "#e2e2e2",
        "surface": "#121414",
        "surface-tint": "#68dbae",
        "surface-container": "#1e2020",
        "error-container": "#93000a",
        "primary-container": "#26a37a",
        "on-secondary-fixed-variant": "#3c475b",
        "inverse-surface": "#e2e2e2",
        "on-error-container": "#ffdad6",
        "secondary-container": "#3e495e",
        "secondary": "#bbc7df",
        "error": "#ffb4ab",
        "primary-fixed-dim": "#68dbae",
        "on-tertiary-fixed-variant": "#3f4753",
        "on-primary-fixed-variant": "#00513a",
        "tertiary-fixed": "#dae3f1",
        "background": "#0A1628", // Splash background override
        "tertiary-fixed-dim": "#bec7d5",
        "surface-container-lowest": "#0c0f0f",
        "on-error": "#690005",
        "on-secondary-fixed": "#101c2e",
        "on-secondary": "#253144",
        "surface-container-low": "#1a1c1c",
        "inverse-primary": "#006c4e",
        "secondary-fixed-dim": "#bbc7df",
        "outline": "#87948c",
        "on-surface-variant": "#bccac1",
        "primary": "#1D9E75", // Updated primary for stitch
        "surface-bright": "#37393a",
        "secondary-fixed": "#d7e3fc",
        
        // Retain semantic alias colors for crises to avoid breaking data components initially
        "crisis-red": "#ff2d55",
        "crisis-orange": "#ff6b35",
        "crisis-yellow": "#ffd60a",
        "crisis-green": "#30d158",
        "crisis-blue": "#0a84ff",
        "crisis-purple": "#bf5af2",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "stack-gap": "12px",
        "baseline": "4px",
        "section-margin": "24px",
        "container-padding": "16px",
        "touch-target": "48px"
      },
      fontFamily: {
        "headline-md": ["Public Sans", "sans-serif"],
        "headline-lg": ["Public Sans", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "title-sm": ["Inter", "sans-serif"],
        "label-muted": ["Inter", "sans-serif"],
        "data-mono": ["JetBrains Mono", "monospace"],
        "display": ["Public Sans", "sans-serif"], // Alias to preserve older components temporarily
      },
      fontSize: {
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "title-sm": ["18px", {"lineHeight": "24px", "fontWeight": "600"}],
        "label-muted": ["13px", {"lineHeight": "18px", "fontWeight": "500"}],
        "data-mono": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "400"}],
      },
      animation: {
        'pulse-icon': 'pulse-icon 2s infinite ease-in-out',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'pulse-red': 'pulseRed 2s infinite',
        'slide-in-up': 'slideInUp 0.3s ease-out forwards',
      },
      keyframes: {
        'pulse-icon': {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 8px rgba(29, 158, 117, 0.4))', opacity: '1' },
          '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 16px rgba(29, 158, 117, 0.7))', opacity: '0.9' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRed: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}