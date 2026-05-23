import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card = ({ children, className = "", glow = false }: CardProps) => (
  <section className={cn(
    "bg-slate-900/40 rounded-lg border border-white/[0.04] p-4 transition-all duration-300 relative overflow-hidden group",
    glow && "ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
    "hover:border-slate-700 hover:bg-slate-950/60",
    className
  )}>
    {children}
  </section>
);
