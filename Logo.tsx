import React from 'react';
import { cn } from '../../utils/cn';
import { useTenant } from '../../contexts/TenantContext';
import { PLATFORM_BRANDING } from '../../config/branding';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'auth';
  collapsed?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'full', collapsed = false }) => {
  const { tenant } = useTenant();
  const isIcon = variant === 'icon' || collapsed;
  
  const name = tenant?.name || PLATFORM_BRANDING.name;
  const logoUrl = tenant?.logoUrl;
  const primaryColor = tenant?.theme?.primary || PLATFORM_BRANDING.colors.primary;

  return (
    <div className={cn("flex flex-col select-none", className)}>
      <div className={cn("flex items-center", isIcon ? "justify-center" : "gap-3", variant === 'auth' && "flex-col")}>
        
        {/* Logo Instance */}
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={name} 
            className={cn(
              "object-contain",
              variant === 'auth' ? "w-16 h-16 mb-4" : "w-7 h-7"
            )}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={cn(
            "relative flex items-center justify-center shrink-0",
            variant === 'auth' ? "w-16 h-16 mb-6" : "w-10 h-10"
          )}>
            {/* Highly Polished Official Vector Logo Icon */}
            <svg viewBox="0 0 140 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nexus-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="40%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0ea5e9" floodOpacity="0.15" />
                </filter>
              </defs>
              
              <g filter="url(#glow)">
                {/* Left Wing / Stylized Angle of 'N' */}
                <path d="M 15 45 L 45 15 L 45 35 L 25 52 L 45 70 L 45 90 Z" fill="url(#nexus-blue)" />
                {/* Inner Connector Fold */}
                <path d="M 45 35 L 68 50 L 45 70 Z" fill="url(#nexus-blue)" opacity="0.9" />
                {/* Center Highlight Shield */}
                <path d="M 52 50 L 68 38 L 84 50 L 68 62 Z" fill="#ffffff" opacity="0.85" />
                {/* Right Stem with loop bend */}
                <path d="M 68 50 L 92 35 L 92 55 L 68 70 Z" fill="url(#nexus-blue)" />
                
                {/* Integrated i with dot matching the upload */}
                <rect x="103" y="42" width="9" height="34" rx="2.5" fill="url(#nexus-blue)" />
                <circle cx="107.5" cy="28" r="5" fill="url(#nexus-blue)" />
              </g>
            </svg>
          </div>
        )}

        {/* Text Wordmark Part */}
        {!isIcon && (
          <div className={cn(
            "flex flex-col justify-center", 
            variant === 'auth' ? "items-center text-center mt-2" : "items-start"
          )}>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "font-sans font-extrabold tracking-[0.03em] uppercase bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent leading-none",
                variant === 'auth' ? "text-3xl" : "text-lg"
              )}>
                NEXUS
              </span>
              <span className={cn(
                "font-sans font-extrabold tracking-[0.03em] uppercase bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent leading-none",
                variant === 'auth' ? "text-3xl" : "text-lg"
              )}>
                CORE
              </span>
              
              {(!tenant) && variant !== 'auth' && (
                <div className="hidden sm:inline-flex items-center justify-center px-1.5 py-[3px] rounded text-[9px] font-mono font-bold tracking-wider bg-white/10 text-white leading-none uppercase mt-0.5">
                  {PLATFORM_BRANDING.environment.env}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 w-full mt-1.5">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-blue-500/30" />
              <span className="text-[8px] tracking-[0.25em] text-blue-400 font-sans font-bold leading-none uppercase">
                TECHNOLOGIES
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-blue-500/30" />
            </div>

            {(!tenant?.name || tenant?.siteTitle) && variant === 'auth' && (
              <span className="font-sans font-medium text-slate-400 mt-4 text-sm">
                {tenant?.siteTitle || PLATFORM_BRANDING.tagline}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

