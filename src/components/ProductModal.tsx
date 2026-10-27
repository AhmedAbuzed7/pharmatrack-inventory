// src/components/ProductModal.tsx
import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import type { InventoryItem, Category } from "../types/inventory";
import {
  generateProductDescription,
  getStoredApiKey,
} from "../services/gemini";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, "id">) => void;
  editingItem: InventoryItem | null;
  categories: Category[];
  onOpenApiKeyModal: () => void;
}

interface FormState {
  name: string;
  sku: string;
  category: Category | string;
  quantity: string | number;
  minThreshold: string | number;
  unitPrice: string | number;
  supplier: string;
  location: string;
  description: string;
  lastRestocked: string;
  expiryDate: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  categories,
  onOpenApiKeyModal,
}) => {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    sku: "",
    category: categories[0] || "General",
    quantity: "",
    minThreshold: "",
    unitPrice: "",
    supplier: "",
    location: "",
    description: "",
    lastRestocked: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        sku: editingItem.sku,
        category: editingItem.category,
        quantity: editingItem.quantity,
        minThreshold: editingItem.minThreshold,
        unitPrice: editingItem.unitPrice,
        supplier: editingItem.supplier,
        location: editingItem.location,
        description: editingItem.description,
        lastRestocked: editingItem.lastRestocked,
        expiryDate: editingItem.expiryDate || "",
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        category: categories[0] || "General",
        quantity: "",
        minThreshold: "",
        unitPrice: "",
        supplier: "",
        location: "",
        description: "",
        lastRestocked: new Date().toISOString().split("T")[0],
        expiryDate: "",
      });
    }
    setFormError(null);
    setIsGeneratingDesc(false);
  }, [editingItem, isOpen, categories]);

  if (!isOpen) return null;

  const handleAiDescription = async () => {
    if (!formData.name.trim()) {
      setFormError(
        "Please enter a Medication Name first before clicking Auto-Write.",
      );
      return;
    }

    if (!getStoredApiKey()) {
      setFormError("Gemini API key is required. Please set it in AI Settings.");
      onOpenApiKeyModal();
      return;
    }

    setIsGeneratingDesc(true);
    setFormError(null);
    try {
      const generated = await generateProductDescription(
        formData.name,
        String(formData.category),
        formData.sku || "N/A",
      );
      setFormData((prev) => ({ ...prev, description: generated }));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate description";
      setFormError(msg);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setFormError("Product Name and SKU are mandatory.");
      return;
    }

    onSave({
      ...formData,
      quantity: formData.quantity === "" ? 0 : Number(formData.quantity),
      minThreshold:
        formData.minThreshold === "" ? 10 : Number(formData.minThreshold),
      unitPrice:
        formData.unitPrice === ""
          ? 0
          : parseFloat(String(formData.unitPrice)) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {editingItem
                ? "Edit Medication Record"
                : "Register New Inventory SKU"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in product specifications, shelf location, and supply
              parameters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Ciprofloxacin 500mg"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU Identifier *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="e.g., RX-CIP-500"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Wholesale Price ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Quantity
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Threshold
              </label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="10"
                value={formData.minThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, minThreshold: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="e.g., PharmaCore Logistics"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Storage Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Shelf B-2, Fridge 1"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Description / Clinical Notes
              </label>
              <button
                type="button"
                onClick={handleAiDescription}
                disabled={isGeneratingDesc}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 transition disabled:opacity-50"
              >
                {isGeneratingDesc ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Consulting Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Write with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Dosage form, usage guidelines, storage conditions (or click 'Auto-Write with AI' above)..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{editingItem ? "Update Item" : "Save Item"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
