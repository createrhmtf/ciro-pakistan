import { useEffect, useState } from 'react';

export default function PageScroller({ sections }) {
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = (window.scrollY / docHeight) * 100;
        setScrollProgress(progress);
      }

      // Determine which section is currently active
      let currentSection = '';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the section is near or above the middle of the screen
          if (rect.top <= window.innerHeight * 0.4) {
            currentSection = section.id;
          }
        }
      }
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial trigger
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="fixed right-2 top-24 bottom-24 w-8 flex flex-col items-center justify-between z-40">
      {/* Scroll track line */}
      <div className="absolute top-2 bottom-2 w-1 bg-surface-container-high rounded-full overflow-hidden">
        {/* Progress fill */}
        <div 
          className="w-full bg-gradient-to-b from-primary via-secondary to-error rounded-full transition-all duration-75"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>

      {/* Section Dots */}
      <div className="absolute inset-y-2 flex flex-col justify-between items-center w-full py-4">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <div 
              key={section.id} 
              className="group relative flex items-center justify-center cursor-pointer"
              onClick={() => scrollToSection(section.id)}
            >
              {/* Dot */}
              <div className={`w-3.5 h-3.5 rounded-full z-10 flex items-center justify-center transition-all duration-300 border-2
                ${isActive 
                  ? 'bg-primary border-primary scale-125 shadow-[0_0_12px_rgba(29,158,117,0.8)]' 
                  : 'bg-surface border-outline-variant/60 hover:border-primary hover:scale-110'
                }`}
              >
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-background rounded-full animate-ping" />
                )}
              </div>

              {/* Tooltip Label */}
              <div className="absolute right-7 py-1 px-2.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 shadow-lg">
                <div className="flex items-center gap-1.5">
                  {section.icon && (
                    <span className="material-symbols-outlined text-[12px] text-primary">{section.icon}</span>
                  )}
                  {section.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
