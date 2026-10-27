// src/types/inventory.ts

export type Category =
  | "Antibiotics"
  | "Analgesics"
  | "Chronic Care"
  | "Allergy"
  | "Respiratory"
  | "Gastrointestinal"
  | "General";

export type UserRole = "Admin" | "Staff";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: Category | string;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  supplier: string;
  location: string;
  description: string;
  lastRestocked: string;
  expiryDate?: string; // YYYY-MM-DD
}

export interface InventoryStats {
  totalItems: number;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: InventoryItem[];
  expiringSoonCount?: number;
}
