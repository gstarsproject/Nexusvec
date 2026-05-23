import React from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { cn } from "../../utils/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Topbar = () => {
  const { t } = useTranslation();
  const { role, user, isSimulated } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="h-16 border-b border-white/[0.04] bg-[#050505] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Simulation Banner */}
      {isSimulated && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500 animate-[pulse_2s_ease-in-out_infinite]" />
      )}

      {/* Breadcrumbs / Search Area */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-sm w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
          <input
            type="text"
            placeholder="Search platform..."
            className="w-full bg-[#0A0A0B] border border-white/[0.06] rounded-md py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-white/[0.12] transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Utility Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-white/[0.06]">
          <LanguageSwitcher />
          <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/[0.04] relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-brand rounded-full" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex flex-col text-right hidden md:flex">
            <span className="text-sm font-medium text-white transition-colors">
              {user?.email?.split("@")[0] || "System User"}
            </span>
            <span className="text-[10px] text-slate-500 capitalize">
              {role?.replace("_", " ").toLowerCase() || "guest"}
            </span>
          </div>

          <div className="w-8 h-8 rounded-md bg-[#0A0A0B] border border-white/[0.06] flex items-center justify-center overflow-hidden group-hover:border-white/[0.12] transition-colors">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-[#0A0A0B] border border-white/[0.06] rounded-md text-slate-500 hover:text-rose-400 hover:bg-white/[0.02] hover:border-white/[0.12] transition-all shadow-sm ml-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
