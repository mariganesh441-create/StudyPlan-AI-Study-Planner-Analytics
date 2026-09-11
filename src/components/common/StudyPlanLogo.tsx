import React from 'react';

interface StudyPlanLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const StudyPlanLogo: React.FC<StudyPlanLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Abstract geometric mark combining Book, Calendar grid, Spark & Progress */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#0B1020] p-0.5 shadow-md shadow-[#7C3AED]/30 flex items-center justify-center shrink-0 border border-[#7C3AED]/40`}>
        <svg 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Open Book / Platform Base */}
          <path 
            d="M6 24.5C9.5 23 14 23 18 25C22 23 26.5 23 30 24.5V9.5C26.5 8 22 8 18 10C14 8 9.5 8 6 9.5V24.5Z" 
            stroke="#F1F5F9" 
            strokeWidth="1.75" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Center Spine */}
          <path 
            d="M18 10V25" 
            stroke="#2DD4BF" 
            strokeWidth="1.75" 
            strokeLinecap="round" 
          />
          {/* Progress / Calendar Notch */}
          <path 
            d="M10 14H14" 
            stroke="#2DD4BF" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />
          <path 
            d="M10 18H13" 
            stroke="#2DD4BF" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />
          {/* AI Sparkle / Star on top right */}
          <path 
            d="M26 6L26.8 7.8L28.6 8.6L26.8 9.4L26 11.2L25.2 9.4L23.4 8.6L25.2 7.8L26 6Z" 
            fill="#F472B6" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-white ${titleSizes[size]}`}>
              StudyPlan
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#7C3AED]/25 text-[#2DD4BF] border border-[#7C3AED]/40 tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Student Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
