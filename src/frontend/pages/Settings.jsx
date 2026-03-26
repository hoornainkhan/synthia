import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Trash2,
  Shield,
  Info,
  CheckCircle,
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleClearData = () => {
    if (user) {
      localStorage.removeItem(`synthia_datasets_${user.id}`);
      setShowConfirm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in ml-8 px-4">
      <div>
        <div className="flex items-center ml-8 gap-2 mb-2">
          <SettingsIcon size={20} className="text-primary-400" />
          <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
            Settings
          </span>
        </div>
        <h1 className="text-2xl font-bold text-dark-50">Settings</h1>
        <p className="text-dark-400 text-sm mt-1.5">
          Manage your account and preferences
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-success-500/10 border border-success-500/20 text-success-400 text-sm">
          <CheckCircle size={16} /> Changes saved successfully
        </div>
      )}

      {/* App Info */}
      <div className="glass-card p-8">
        <h2 className="text-lg font-semibold text-dark-100 mb-6 flex items-center gap-2.5">
          <Info size={18} className="text-primary-400" /> About SYNTHIA
        </h2>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between text-dark-300">
            <span className="text-dark-400">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-dark-300">
            <span className="text-dark-400">AI Models</span>
            <span>Google Gemini 2.5</span>
          </div>
          <div className="flex justify-between text-dark-300">
            <span className="text-dark-400">Data Storage</span>
            <span>Local (Browser)</span>
          </div>
          <div className="flex items-center gap-2.5 pt-3 text-success-400">
            <Shield size={14} />
            <span className="text-xs">
              All data is synthetic — no real data is used or stored
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-8 border-danger-500/20">
        <h2 className="text-lg font-semibold text-danger-400 mb-5 flex items-center gap-2.5">
          <Trash2 size={18} /> Danger Zone
        </h2>
        <p className="text-sm text-dark-400 mb-5">
          Clear all generated datasets from your browser. This action cannot be
          undone.
        </p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-5 py-2.5 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm font-medium
              hover:bg-danger-500/20 transition-all"
          >
            Clear All Datasets
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm text-dark-300">Are you sure?</span>
            <button
              onClick={handleClearData}
              className="px-5 py-2.5 rounded-xl bg-danger-500 text-white text-sm font-medium hover:bg-danger-600 transition-all"
            >
              Yes, Clear Everything
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-3.5 text-danger-400 hover:bg-danger-500/10"
      >
        <User size={16} /> Logout
      </button>
    </div>
  );
}
