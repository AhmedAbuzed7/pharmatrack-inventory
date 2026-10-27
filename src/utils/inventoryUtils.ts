// src/utils/inventoryUtils.ts
import type { InventoryItem } from "../types/inventory";

export type ExpiryStatus = "expired" | "expiring_soon" | "healthy" | "unknown";

export function getExpiryStatus(expiryDate?: string): ExpiryStatus {
  if (!expiryDate) return "unknown";
  const now = new Date();
  const target = new Date(expiryDate);
  if (isNaN(target.getTime())) return "unknown";

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring_soon";
  return "healthy";
}

// Convert Inventory Items to Downloadable CSV
export function exportToCSV(
  items: InventoryItem[],
  filename = "pharmacy-inventory.csv",
) {
  const headers = [
    "ID",
    "Name",
    "SKU",
    "Category",
    "Quantity",
    "MinThreshold",
    "UnitPrice",
    "Supplier",
    "Location",
    "ExpiryDate",
    "Description",
  ];

  const escapeField = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = items.map((item) => [
    escapeField(item.id),
    escapeField(item.name),
    escapeField(item.sku),
    escapeField(item.category),
    item.quantity,
    item.minThreshold,
    item.unitPrice,
    escapeField(item.supplier),
    escapeField(item.location),
    escapeField(item.expiryDate || ""),
    escapeField(item.description),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Parse uploaded CSV string into InventoryItem array
export function parseCSVToItems(csvText: string): Omit<InventoryItem, "id">[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  const items: Omit<InventoryItem, "id">[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser handling quotes
    const values: string[] = [];
    let insideQuotes = false;
    let currentVal = "";

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && line[c + 1] === '"') {
        currentVal += '"';
        c++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(currentVal.trim());
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    if (values.length >= 7) {
      // Expecting columns: Name, SKU, Category, Quantity, MinThreshold, UnitPrice, Supplier, Location, ExpiryDate, Description
      // If exported format has ID at index 0, shift index:
      const hasId = values[0].startsWith("med-") || values[0].length === 36;
      const offset = hasId ? 1 : 0;

      items.push({
        name: values[offset] || "Unnamed Item",
        sku: values[offset + 1] || `SKU-${Date.now().toString().slice(-4)}`,
        category: values[offset + 2] || "General",
        quantity: Math.max(0, parseInt(values[offset + 3], 10) || 0),
        minThreshold: Math.max(1, parseInt(values[offset + 4], 10) || 10),
        unitPrice: Math.max(0, parseFloat(values[offset + 5]) || 0),
        supplier: values[offset + 6] || "Local Supplier",
        location: values[offset + 7] || "Aisle 1",
        expiryDate: values[offset + 8] || "",
        description: values[offset + 9] || "",
        lastRestocked: new Date().toISOString().split("T")[0],
      });
    }
  }

  return items;
}
