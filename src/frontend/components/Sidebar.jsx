import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Database,
  FolderOpen,
  LayoutTemplate,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
} from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/generate", icon: Sparkles, label: "Generate Dataset" },
  { to: "/datasets", icon: FolderOpen, label: "My Datasets" },
  { to: "/templates", icon: LayoutTemplate, label: "Templates" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"} 
        h-screen flex flex-col border-r border-dark-800/50 transition-all duration-300 ease-in-out
        bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950 relative z-30`}
    >
      {/* Logo */}
      <div
        className={`flex items-center ${collapsed ? "justify-center" : "px-6"} h-16 border-b border-dark-800/50`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">SYNTHIA</span>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 flex flex-col justify-evenly items-center h-full gap-y-6">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
              ${
                isActive
                  ? "bg-gradient-to-r from-primary-600/20 to-accent-600/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5"
                  : "text-dark-400 hover:text-dark-200 hover:bg-dark-800/50"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Icon
              size={24}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            {!collapsed && (
              <span className="text-[0.95rem] font-medium">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Privacy Badge */}
      {!collapsed && (
        <div className="px-4 pb-6">
          <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-success-500/10 border border-success-500/20">
            <Shield size={15} className="text-success-400" />
            <span className="text-xs text-success-400 font-medium">
              Privacy Safe
            </span>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-800 border border-dark-600 
          flex items-center justify-center text-dark-400 hover:text-primary-400 
          hover:border-primary-500 transition-all duration-200 z-40"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
