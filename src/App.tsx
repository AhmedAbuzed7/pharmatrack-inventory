// src/App.tsx
import React, { useState, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { StatsCards } from "./components/StatsCards";
import { FilterBar } from "./components/FilterBar";
import { InventoryTable } from "./components/InventoryTable";
import { ProductModal } from "./components/ProductModal";
import { RestockModal } from "./components/RestockModal";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { InteractionModal } from "./components/InteractionModal";
import { AdminPinModal } from "./components/AdminPinModal";
import { ToastProvider, useToast } from "./components/Toast";
import { useInventory } from "./hooks/useInventory";
import { exportToCSV, parseCSVToItems } from "./utils/inventoryUtils";
import type { InventoryItem, UserRole, Category } from "./types/inventory";

const CATEGORIES: Category[] = [
  "Antibiotics",
  "Analgesics",
  "Chronic Care",
  "Allergy",
  "Respiratory",
  "Gastrointestinal",
];

const AppContent: React.FC = () => {
  const {
    items,
    stats,
    addItem,
    updateItem,
    deleteItem,
    adjustStock,
    resetToDefault,
  } = useInventory();

  const { showToast } = useToast();

  // Role State (Admin vs Staff)
  const [currentRole, setCurrentRole] = useState<UserRole>("Admin");
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // Modal Visibility State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const handleSelectRole = (targetRole: UserRole) => {
    if (targetRole === currentRole) return;

    if (targetRole === "Admin") {
      // Require PIN challenge to upgrade from Staff -> Admin
      setIsAdminPinModalOpen(true);
    } else {
      // Demote to Staff freely
      setCurrentRole("Staff");
      showToast("Switched to Staff Mode (Read-Only)", "info");
    }
  };

  const handleAdminAuthSuccess = () => {
    setCurrentRole("Admin");
    setIsAdminPinModalOpen(false);
    showToast("Supervisor authenticated: Admin privileges granted", "success");
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (itemData: Omit<InventoryItem, "id">) => {
    if (editingItem) {
      updateItem(editingItem.id, itemData);
      showToast(`Updated "${itemData.name}" successfully`, "success");
    } else {
      addItem(itemData);
      showToast(`Added "${itemData.name}" to inventory`, "success");
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteRequest = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (target) {
      setItemToDelete(target);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      showToast(`Removed "${itemToDelete.name}" from inventory`, "info");
      setItemToDelete(null);
    }
  };

  const handleAdjustStock = (id: string, delta: number) => {
    adjustStock(id, delta);
  };

  const handleResetData = () => {
    resetToDefault();
    showToast("Reset inventory to factory demo catalog", "info");
  };

  const handleExportCSV = () => {
    exportToCSV(filteredItems);
    showToast(`Exported ${filteredItems.length} records to CSV`, "success");
  };

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const parsed = parseCSVToItems(text);
          if (parsed.length === 0) {
            showToast("No valid rows found in CSV file", "error");
            return;
          }
          parsed.forEach((item) => addItem(item));
          showToast(`Successfully imported ${parsed.length} items`, "success");
        } catch {
          showToast("Failed to parse CSV file", "error");
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplier &&
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      const matchesLowStock =
        !showOnlyLowStock || item.quantity <= item.minThreshold;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [items, searchQuery, selectedCategory, showOnlyLowStock]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onResetData={handleResetData}
        onOpenRestockModal={() => setIsRestockModalOpen(true)}
        onOpenInteractionModal={() => setIsInteractionModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        lowStockCount={stats.lowStockCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <StatsCards stats={stats} />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showOnlyLowStock={showOnlyLowStock}
          onToggleLowStock={() => setShowOnlyLowStock((prev) => !prev)}
          categories={CATEGORIES}
          currentRole={currentRole}
          onOpenAddModal={handleOpenAdd}
          onExportCSV={handleExportCSV}
          onImportCSV={handleImportCSV}
        />

        <InventoryTable
          items={filteredItems}
          currentRole={currentRole}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteRequest}
          onAdjustStock={handleAdjustStock}
        />
      </main>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingItem={editingItem}
        categories={CATEGORIES}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        lowStockItems={stats.lowStockItems}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <InteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        items={items}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Medication SKU"
        message={`Are you sure you want to delete "${itemToDelete?.name}" (${itemToDelete?.sku})? This record will be permanently removed from catalog persistence.`}
      />

      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
