import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English (en)
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enInfrastructure from './locales/en/infrastructure.json';
import enBilling from './locales/en/billing.json';
import enReseller from './locales/en/reseller.json';
import enSupplier from './locales/en/supplier.json';
import enNotifications from './locales/en/notifications.json';
import enSettings from './locales/en/settings.json';

// Indonesian (id)
import idAuth from './locales/id/auth.json';
import idDashboard from './locales/id/dashboard.json';
import idInfrastructure from './locales/id/infrastructure.json';
import idBilling from './locales/id/billing.json';
import idReseller from './locales/id/reseller.json';
import idSupplier from './locales/id/supplier.json';
import idNotifications from './locales/id/notifications.json';
import idSettings from './locales/id/settings.json';

// Vietnamese (vi)
import viAuth from './locales/vi/auth.json';
import viDashboard from './locales/vi/dashboard.json';
import viInfrastructure from './locales/vi/infrastructure.json';
import viBilling from './locales/vi/billing.json';
import viReseller from './locales/vi/reseller.json';
import viSupplier from './locales/vi/supplier.json';
import viNotifications from './locales/vi/notifications.json';
import viSettings from './locales/vi/settings.json';

// Thai (th)
import thAuth from './locales/th/auth.json';
import thDashboard from './locales/th/dashboard.json';
import thInfrastructure from './locales/th/infrastructure.json';
import thBilling from './locales/th/billing.json';
import thReseller from './locales/th/reseller.json';
import thSupplier from './locales/th/supplier.json';
import thNotifications from './locales/th/notifications.json';
import thSettings from './locales/th/settings.json';

// Chinese (zh)
import zhAuth from './locales/zh/auth.json';
import zhDashboard from './locales/zh/dashboard.json';
import zhInfrastructure from './locales/zh/infrastructure.json';
import zhBilling from './locales/zh/billing.json';
import zhReseller from './locales/zh/reseller.json';
import zhSupplier from './locales/zh/supplier.json';
import zhNotifications from './locales/zh/notifications.json';
import zhSettings from './locales/zh/settings.json';

const resources = {
  en: {
    auth: enAuth,
    dashboard: enDashboard,
    infrastructure: enInfrastructure,
    billing: enBilling,
    reseller: enReseller,
    supplier: enSupplier,
    notifications: enNotifications,
    settings: enSettings
  },
  id: {
    auth: idAuth,
    dashboard: idDashboard,
    infrastructure: idInfrastructure,
    billing: idBilling,
    reseller: idReseller,
    supplier: idSupplier,
    notifications: idNotifications,
    settings: idSettings
  },
  vi: {
    auth: viAuth,
    dashboard: viDashboard,
    infrastructure: viInfrastructure,
    billing: viBilling,
    reseller: viReseller,
    supplier: viSupplier,
    notifications: viNotifications,
    settings: viSettings
  },
  th: {
    auth: thAuth,
    dashboard: thDashboard,
    infrastructure: thInfrastructure,
    billing: thBilling,
    reseller: thReseller,
    supplier: thSupplier,
    notifications: thNotifications,
    settings: thSettings
  },
  zh: {
    auth: zhAuth,
    dashboard: zhDashboard,
    infrastructure: zhInfrastructure,
    billing: zhBilling,
    reseller: zhReseller,
    supplier: zhSupplier,
    notifications: zhNotifications,
    settings: zhSettings
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['auth', 'dashboard', 'infrastructure', 'billing', 'reseller', 'supplier', 'notifications', 'settings'],
    defaultNS: 'dashboard',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
