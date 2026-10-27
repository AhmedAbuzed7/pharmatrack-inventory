// src/components/FilterBar.tsx
import React, { useRef } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import type { Category, UserRole } from "../types/inventory";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  showOnlyLowStock: boolean;
  onToggleLowStock: () => void;
  categories: Category[];
  currentRole: UserRole;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onImportCSV: (file: File) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showOnlyLowStock,
  onToggleLowStock,
  categories,
  currentRole,
  onOpenAddModal,
  onExportCSV,
  onImportCSV,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCSV(file);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search drug name, SKU, or supplier..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition placeholder:text-slate-400"
        />
      </div>

      {/* Filter & Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Low Stock Toggle Button */}
        <button
          onClick={onToggleLowStock}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border transition ${
            showOnlyLowStock
              ? "bg-amber-500 text-white border-amber-600 shadow-xs"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Only</span>
        </button>

        {/* CSV Export Button */}
        <button
          onClick={onExportCSV}
          title="Export CSV"
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* CSV Import Button (Admin Only) */}
        {currentRole === "Admin" && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import CSV"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </>
        )}

        {/* Add Product Button (Admin Only) */}
        {currentRole === "Admin" && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        )}
      </div>
    </div>
  );
};
