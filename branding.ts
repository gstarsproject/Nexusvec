export const PLATFORM_BRANDING = {
  name: 'NexusCore',
  companyName: 'NexusCore Technologies',
  tagline: 'Enterprise Connectivity Infrastructure',
  colors: {
    primary: '#0ea5e9', // Tailwind sky-500
    primaryDark: '#0284c7', // Tailwind sky-600
    background: '#020617', // Tailwind slate-950
    card: '#0a0a0b',
  },
  typography: {
    heading: 'font-display',
    body: 'font-sans',
    mono: 'font-mono',
  },
  environment: {
    // Dynamically detect or set environment
    env: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1') || window.location.hostname.includes('dev-') || window.location.hostname.includes('pre-'))) ? 'DEV' : 'PROD',
  }
};
