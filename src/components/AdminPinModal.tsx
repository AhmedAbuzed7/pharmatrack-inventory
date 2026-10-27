// src/components/AdminPinModal.tsx
import React, { useState } from "react";
import { Lock, X, KeyRound, AlertCircle } from "lucide-react";

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_ADMIN_PIN = "8888";

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setPin("");
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === DEFAULT_ADMIN_PIN) {
      setPin("");
      setError(null);
      onSuccess();
    } else {
      setError("Incorrect administrator PIN. Access denied.");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Admin Authentication
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter the supervisor authorization PIN to unlock administrative
            CRUD, CSV import, and deletion privileges.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (Demo: 8888)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 tracking-widest font-mono text-center"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-1.5">
              Default demo credential:{" "}
              <code className="font-mono font-semibold text-slate-600">
                8888
              </code>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
            >
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
