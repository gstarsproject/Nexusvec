import {
  BarChart3,
  Database,
  Users,
  Package,
  Box,
  Settings,
  Shield,
  LifeBuoy,
  Wallet,
  Activity,
  History,
  Store,
  ShoppingCart,
} from "lucide-react";

export const ROLE_NAVIGATION = {
  SUPER_OWNER: [
    {
      title: "Enterprise",
      items: [
        { label: "Global Dashboard", icon: BarChart3, path: "/" },
        { label: "Revenue & Finance", icon: Wallet, path: "/wallet" },
        { label: "All Transactions", icon: History, path: "/transactions" },
      ]
    },
    {
      title: "Platform Network",
      items: [
        { label: "Agencies & Tenants", icon: Store, path: "/agencies" },
        { label: "Global Suppliers", icon: Database, path: "/suppliers" },
      ]
    },
    {
      title: "System Config",
      items: [
        { label: "Core Settings", icon: Settings, path: "/settings" },
        { label: "System Health", icon: Shield, path: "/system" },
      ]
    }
  ],
  TENANT_OWNER: [
    {
      title: "Tenant Operations",
      items: [
        { label: "Overview", icon: BarChart3, path: "/" },
        { label: "Transactions", icon: History, path: "/transactions" },
        { label: "Agency Wallet", icon: Wallet, path: "/wallet" },
      ]
    },
    {
      title: "Reseller Network",
      items: [
        { label: "Manage Resellers", icon: Users, path: "/resellers" },
        { label: "Tier Configurations", icon: Activity, path: "/resellers/tiers" },
      ]
    },
    {
      title: "Catalog",
      items: [
        { label: "Product Markups", icon: Package, path: "/catalog" },
        { label: "Supplier Connections", icon: Database, path: "/suppliers" },
      ]
    },
    {
      title: "White-Label",
      items: [
        { label: "Brand Settings", icon: Store, path: "/settings" },
        { label: "Support Tickets", icon: LifeBuoy, path: "/support" },
      ]
    }
  ],
  ADMIN: [
    {
      title: "Admin Operations",
      items: [
        { label: "Overview", icon: BarChart3, path: "/" },
        { label: "Transactions", icon: History, path: "/transactions" },
        { label: "Agency Wallet", icon: Wallet, path: "/wallet" },
      ]
    },
    {
      title: "Reseller Network",
      items: [
        { label: "Manage Resellers", icon: Users, path: "/resellers" },
        { label: "Tier Configurations", icon: Activity, path: "/resellers/tiers" },
      ]
    },
    {
      title: "Catalog",
      items: [
        { label: "Product Markups", icon: Package, path: "/catalog" },
        { label: "Supplier Connections", icon: Database, path: "/suppliers" },
      ]
    },
    {
      title: "Settings & Support",
      items: [
        { label: "Brand Settings", icon: Store, path: "/settings" },
        { label: "Support Tickets", icon: LifeBuoy, path: "/support" },
      ]
    }
  ],
  SUPPLIER: [
    {
      title: "Provider Console",
      items: [
        { label: "Performance Overview", icon: BarChart3, path: "/" },
        { label: "API Integrations", icon: Database, path: "/api-settings" },
      ]
    },
    {
      title: "Inventory",
      items: [
        { label: "Product Stock", icon: Package, path: "/catalog" },
        { label: "Delivery Logs", icon: History, path: "/transactions" },
      ]
    }
  ],
  RESELLER: [
    {
      title: "Sales Hub",
      items: [
        { label: "Overview", icon: BarChart3, path: "/" },
        { label: "Buy Products", icon: ShoppingCart, path: "/buy" },
      ]
    },
    {
      title: "Finance",
      items: [
        { label: "Wallet Balance", icon: Wallet, path: "/wallet" },
        { label: "Order History", icon: History, path: "/transactions" },
      ]
    },
    {
      title: "Settings",
      items: [
        { label: "Profile", icon: Settings, path: "/settings" },
        { label: "Help & Support", icon: LifeBuoy, path: "/support" },
      ]
    }
  ],
  MEMBER: [
    {
      title: "Team Console",
      items: [
        { label: "Overview", icon: BarChart3, path: "/" },
        { label: "Product Markups", icon: Package, path: "/catalog" },
        { label: "Support Tickets", icon: LifeBuoy, path: "/support" },
      ]
    },
    {
      title: "Personal",
      items: [
        { label: "Profile", icon: Settings, path: "/settings" },
      ]
    }
  ]
};
