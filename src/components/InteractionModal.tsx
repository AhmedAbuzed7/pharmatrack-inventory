// src/components/InteractionModal.tsx
import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Sparkles,
  Loader2,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { checkDrugInteractions, getStoredApiKey } from "../services/gemini";
import type { InventoryItem } from "../types/inventory";

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onOpenApiKeyModal: () => void;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  isOpen,
  onClose,
  items,
  onOpenApiKeyModal,
}) => {
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [report, setReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedMedications([]);
    setReport("");
    setErrorMessage(null);
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAddMed = (name: string) => {
    if (name && !selectedMedications.includes(name)) {
      setSelectedMedications((prev) => [...prev, name]);
      setReport("");
      setCopied(false);
    }
  };

  const handleRemoveMed = (name: string) => {
    setSelectedMedications((prev) => prev.filter((m) => m !== name));
    setReport("");
    setCopied(false);
  };

  const handleCheck = async () => {
    if (selectedMedications.length < 2) {
      setErrorMessage(
        "Please select at least 2 medications to screen for interactions.",
      );
      return;
    }

    if (!getStoredApiKey()) {
      setErrorMessage(
        "Gemini API key is required. Please set it in AI Settings.",
      );
      onOpenApiKeyModal();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await checkDrugInteractions(selectedMedications);
      setReport(result);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Interaction check failed";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Clinical Drug Interaction Checker
              </h3>
              <p className="text-xs text-slate-500">
                AI pharmacology screening powered by Google Gemini
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Medication Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Medications to Cross-Check (Min. 2)
              </label>
              {selectedMedications.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
            <select
              onChange={(e) => {
                handleAddMed(e.target.value);
                e.target.value = "";
              }}
              defaultValue=""
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700"
            >
              <option value="" disabled>
                -- Select a medication from your catalog --
              </option>
              {items.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Badges */}
          <div className="flex flex-wrap gap-2 min-h-10 items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            {selectedMedications.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                No medications selected yet. Pick from the dropdown above.
              </span>
            ) : (
              selectedMedications.map((med) => (
                <span
                  key={med}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 shadow-2xs"
                >
                  <span>{med}</span>
                  <button
                    onClick={() => handleRemoveMed(med)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* AI Analysis Report */}
          {report && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Screening Assessment
                </span>
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
                {report}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedMedications.length} drug
            {selectedMedications.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition"
            >
              Close
            </button>
            <button
              disabled={isLoading || selectedMedications.length < 2}
              onClick={handleCheck}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cross-Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Contraindications</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
