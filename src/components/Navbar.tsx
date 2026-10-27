// src/components/Navbar.tsx
import React from "react";
import {
  Pill,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Sparkles,
  Key,
  ShieldAlert,
} from "lucide-react";
import type { UserRole } from "../types/inventory";

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (targetRole: UserRole) => void;
  onResetData: () => void;
  onOpenRestockModal: () => void;
  onOpenInteractionModal: () => void;
  onOpenApiKeyModal: () => void;
  lowStockCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  onResetData,
  onOpenRestockModal,
  onOpenInteractionModal,
  onOpenApiKeyModal,
  lowStockCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base">
                PharmaTrack
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
                Ops Suite
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              AI-Assisted Pharmacy Inventory Management
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Drug Safety Interaction Checker */}
          <button
            onClick={onOpenInteractionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition shadow-xs"
            title="Screen drug combinations for contraindications"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Safety Checker</span>
          </button>

          {/* AI Restock Assistant Trigger */}
          <button
            onClick={onOpenRestockModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">AI Restock Email</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* AI Key Settings */}
          <button
            onClick={onOpenApiKeyModal}
            title="Configure Gemini API Key"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
          >
            <Key className="w-4 h-4" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            title="Reset sample inventory"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectRole("Admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentRole === "Admin"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => onSelectRole("Staff")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentRole === "Staff"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Staff</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
