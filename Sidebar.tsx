import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Globe } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { ROLE_NAVIGATION } from "../../config/navigation";
import { Logo } from './Logo';
import { PLATFORM_BRANDING } from '../../config/branding';

const NavGroup = ({
  title,
  isCollapsed = false,
  children,
}: {
  title: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
}) => (
  <div className="mb-6">
    {!isCollapsed ? (
      <h3 className="text-xs font-medium text-slate-500 px-5 mb-2 transition-all duration-300">
        {title}
      </h3>
    ) : (
      <div className="h-px bg-white/[0.04] mx-4 mb-4 transition-all duration-300" />
    )}
    <div className={cn("space-y-0.5", isCollapsed ? "px-2" : "px-3")}>{children}</div>
  </div>
);

const NavItem = ({
  label,
  icon: Icon,
  path,
  isActive,
  isCollapsed = false,
  onItemClick,
}: any) => {
  return (
    <Link
      to={path}
      onClick={onItemClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors group",
        isCollapsed ? "justify-center h-9 w-9 p-0 mx-auto" : "gap-3 px-3 py-2",
        isActive
          ? "bg-white/[0.06] text-white"
          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 transition-colors shrink-0",
          isActive
            ? "text-white"
            : "text-slate-500 group-hover:text-slate-300"
        )}
      />
      {!isCollapsed && <span className="truncate">{label}</span>}
      {isActive && !isCollapsed && (
        <div className="ml-auto w-1 h-1 rounded-full bg-white" />
      )}
    </Link>
  );
};

export const Sidebar = ({ 
  isCollapsed = false, 
  onToggleCollapse, 
  onItemClick 
}: { 
  isCollapsed?: boolean; 
  onToggleCollapse?: () => void; 
  onItemClick?: () => void; 
}) => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { tenant } = useTenant();
  const location = useLocation();

  const navigationGroups = role && ROLE_NAVIGATION[role as keyof typeof ROLE_NAVIGATION] 
    ? ROLE_NAVIGATION[role as keyof typeof ROLE_NAVIGATION] 
    : [];

  return (
    <aside className={cn(
      "bg-[#050505] border-r border-white/[0.04] flex flex-col h-full shrink-0 relative z-20 transition-all duration-300",
      isCollapsed ? "w-20" : "w-[260px]"
    )}>
      {/* Branding */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-transparent">
        <Link to="/" onClick={onItemClick} className="flex items-center gap-3 group">
          <Logo collapsed={isCollapsed} />
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        {navigationGroups.map((group, idx) => (
          <NavGroup key={idx} title={group.title} isCollapsed={isCollapsed}>
            {group.items.map((item, itemIdx) => (
              <NavItem
                key={itemIdx}
                label={item.label}
                icon={item.icon}
                path={item.path}
                isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                isCollapsed={isCollapsed}
                onItemClick={onItemClick}
              />
            ))}
          </NavGroup>
        ))}
      </div>

      {/* Tenant Context & Expand Button */}
      <div className="p-3 bg-[#0A0A0B] border-t border-white/[0.04]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-white/[0.08] hover:bg-white/[0.02] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-primary-brand/10 flex items-center justify-center text-primary-brand border border-primary-brand/20">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white truncate max-w-[120px]">
                  {tenant?.name || PLATFORM_BRANDING.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {tenant?.slug || "system-root"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
          </div>
        ) : (
          <div className="flex items-center justify-center p-2 rounded-lg" title={tenant?.name || "Global"}>
            <div className="w-6 h-6 rounded bg-primary-brand/10 flex items-center justify-center text-primary-brand border border-primary-brand/20">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden mt-2 lg:flex w-full items-center justify-center gap-2 py-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] rounded transition-all text-[11px] font-medium"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                <span>Collapse menu</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
