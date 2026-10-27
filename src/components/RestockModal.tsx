// src/components/RestockModal.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  Mail,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  generateRestockEmail,
  getStoredApiKey,
  getSelectedModel,
} from "../services/gemini";
import { useToast } from "./Toast";
import type { InventoryItem } from "../types/inventory";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockItems: InventoryItem[];
  onOpenApiKeyModal: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  lowStockItems,
  onOpenApiKeyModal,
}) => {
  const [emailBody, setEmailBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setEmailBody("");
      setIsLoading(false);
      setStatusMessage(null);
      setErrorMessage(null);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentModel = getSelectedModel();

  const handleGenerate = async () => {
    const key = getStoredApiKey();
    if (!key) {
      setErrorMessage("Please configure a valid Google Gemini API Key first.");
      return;
    }

    if (lowStockItems.length === 0) {
      setErrorMessage("No low-stock items detected to restock.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const generated = await generateRestockEmail(
        lowStockItems,
        "PharmaTrack Community Pharmacy",
        (status) => setStatusMessage(status),
      );
      setEmailBody(generated);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate email";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  const handleCopy = () => {
    if (!emailBody) return;
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    showToast("Requisition draft copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>AI Restock Order Assistant</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {currentModel}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {lowStockItems.length} medications currently below minimum stock
                threshold
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={onOpenApiKeyModal}
                className="underline font-semibold ml-2 hover:text-rose-900"
              >
                Change Model / Key
              </button>
            </div>
          )}

          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Quick List Preview of Items Being Restocked */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
              Target Requisition SKUs ({lowStockItems.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {lowStockItems.map((item) => (
                <span
                  key={item.id}
                  className="text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>{item.name}</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    ({item.quantity}/{item.minThreshold})
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Draft Email View */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Generated Supplier Email
              </label>
              {emailBody && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? "Copied to Clipboard" : "Copy Text"}</span>
                </button>
              )}
            </div>

            <textarea
              readOnly
              rows={11}
              value={emailBody}
              placeholder="Click 'Draft Restock Email with Gemini' below to compose a formal supplier requisition using real-time stock levels..."
              className="w-full p-3.5 text-xs font-mono bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none resize-none placeholder:text-slate-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onOpenApiKeyModal}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Model & Key Settings
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition"
            >
              Close
            </button>
            <button
              disabled={isLoading || lowStockItems.length === 0}
              onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Order...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft Restock Email with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
