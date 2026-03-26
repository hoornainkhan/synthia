import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Menu, LogOut, User } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-xl flex items-center justify-between px-6 z-20">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden text-dark-400 hover:text-dark-200 transition-colors"
      >
        <Menu size={20} />
      </button>
<h1></h1>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <User size={14} className="text-white" />
        </div>
        <span className="text-sm text-dark-300 font-medium hidden sm:block">
          {user?.name || "User"}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 mr-3 rounded-xl text-dark-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all duration-200"
          title="Logout"
        >
          <LogOut size={16} />
          <span className="text-sm hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
