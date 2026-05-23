import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', local: 'English' },
  { code: 'id', label: 'Indonesian', local: 'Bahasa Indonesia' },
  { code: 'vi', label: 'Vietnamese', local: 'Tiếng Việt' },
  { code: 'th', label: 'Thai', local: 'ไทย' },
  { code: 'zh', label: 'Chinese', local: '简体中文' }
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize current language to match our expected code list
  const getNormalizeLangCode = () => {
    if (!i18n.language) return 'en';
    const lang = i18n.language.substring(0, 2).toLowerCase();
    return ['en', 'id', 'vi', 'th', 'zh'].includes(lang) ? lang : 'en';
  };

  const currentLangCode = getNormalizeLangCode();
  const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070913] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all text-slate-300 hover:text-white cursor-pointer group font-mono text-xs font-semibold"
      >
        <Globe className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
        <span>{currentLang.local}</span>
        <ChevronDown 
          className="w-3 h-3 text-slate-500 transition-transform duration-200 group-hover:text-slate-300" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 origin-top-right rounded-xl bg-[#030612] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)] py-1.5 z-50 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-100">
          <div className="px-3 py-1 border-b border-white/[0.04] mb-1 font-mono">
            <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase block">Select Language</span>
          </div>
          {LANGUAGES.map((lang) => {
            const isActive = currentLangCode === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium font-sans text-left transition-colors cursor-pointer ${
                  isActive ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
                }`}
              >
                <div className="leading-tight">
                  <p>{lang.local}</p>
                  <p className="text-[9px] text-slate-500 font-mono font-normal">{lang.label}</p>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
