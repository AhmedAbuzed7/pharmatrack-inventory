// src/hooks/useInventory.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { InventoryItem } from "../types/inventory";
import { INITIAL_INVENTORY } from "../data/mockInventory";

const STORAGE_KEY = "pharma_inventory_data_v1";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Failed to retrieve inventory from localStorage:", err);
    }
    return INITIAL_INVENTORY;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to sync inventory to localStorage:", err);
    }
  }, [items]);

  const addItem = useCallback((itemData: Omit<InventoryItem, "id">) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: uuidv4(),
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<InventoryItem, "id">>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const adjustStock = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      }),
    );
  }, []);

  const resetToDefault = useCallback(() => {
    setItems(INITIAL_INVENTORY);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalValuation = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const lowStockItems = items.filter(
      (item) => item.quantity <= item.minThreshold,
    );
    const outOfStockItems = items.filter((item) => item.quantity === 0);

    return {
      totalItems,
      totalValuation,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
    };
  }, [items]);

  return {
    items,
    stats,
    addItem,
    updateItem,
    deleteItem,
    adjustStock,
    resetToDefault,
  };
}
