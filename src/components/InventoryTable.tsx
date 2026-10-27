// src/components/InventoryTable.tsx
import React from "react";
import {
  Edit2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";
import type { InventoryItem, UserRole } from "../types/inventory";
import { getExpiryStatus } from "../utils/inventoryUtils";

interface InventoryTableProps {
  items: InventoryItem[];
  currentRole: UserRole;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAdjustStock: (id: string, delta: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  currentRole,
  onEdit,
  onDelete,
  onAdjustStock,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <p className="text-sm font-medium">
          No inventory records match the current criteria.
        </p>
        <p className="text-xs mt-1">
          Adjust search terms or clear filters to view catalog items.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-3 px-4">Medication & SKU</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Stock Level</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4">Unit Price</th>
              <th className="py-3 px-4">Shelf Location</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item) => {
              const isOutOfStock = item.quantity === 0;
              const isLowStock =
                !isOutOfStock && item.quantity <= item.minThreshold;
              const expiryStatus = getExpiryStatus(item.expiryDate);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Name & SKU */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.sku}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {item.category}
                    </span>
                  </td>

                  {/* Stock Level with Quick Adjust Controls */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onAdjustStock(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold transition text-xs"
                        title="Decrement Stock"
                      >
                        -
                      </button>

                      <span
                        className={`w-12 text-center font-bold ${
                          isOutOfStock
                            ? "text-rose-600"
                            : isLowStock
                              ? "text-amber-600"
                              : "text-slate-800"
                        }`}
                      >
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onAdjustStock(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold transition text-xs"
                        title="Increment Stock"
                      >
                        +
                      </button>
                    </div>

                    {isOutOfStock && (
                      <div className="flex items-center justify-center gap-1 text-[11px] text-rose-600 font-semibold mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Out of stock</span>
                      </div>
                    )}
                    {isLowStock && (
                      <div className="flex items-center justify-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low (Min: {item.minThreshold})</span>
                      </div>
                    )}
                  </td>

                  {/* Expiration Date with Status Badge */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.expiryDate || "N/A"}</span>
                    </div>
                    {expiryStatus === "expired" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 mt-1">
                        <AlertCircle className="w-3 h-3" /> Expired
                      </span>
                    )}
                    {expiryStatus === "expiring_soon" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
                        <Clock className="w-3 h-3" /> &lt; 30 Days
                      </span>
                    )}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    ${item.unitPrice.toFixed(2)}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {item.location || "—"}
                  </td>

                  {/* Supplier */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {item.supplier || "—"}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {currentRole === "Admin" ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Edit Medication"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Medication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Read-only
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
