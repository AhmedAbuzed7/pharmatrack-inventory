// src/data/mockInventory.ts
import type { InventoryItem } from "../types/inventory";

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "med-001",
    name: "Amoxicillin 500mg",
    sku: "RX-AMX-500",
    category: "Antibiotics",
    quantity: 14,
    minThreshold: 25,
    unitPrice: 12.5,
    supplier: "PharmaCore Logistics",
    location: "Shelf A-3",
    description:
      "Broad-spectrum penicillin antibiotic capsules for bacterial infections.",
    lastRestocked: "2026-09-15",
    expiryDate: "2026-11-15", // Expiring within 30 days
  },
  {
    id: "med-002",
    name: "Paracetamol 500mg Tablets",
    sku: "OTC-PCM-500",
    category: "Analgesics",
    quantity: 140,
    minThreshold: 40,
    unitPrice: 4.2,
    supplier: "MedSupply Direct",
    location: "Aisle 2, Bin 12",
    description:
      "First-line antipyretic and pain relief formulation for everyday OTC use.",
    lastRestocked: "2026-10-02",
    expiryDate: "2027-08-30", // Healthy
  },
  {
    id: "med-003",
    name: "Metformin 850mg",
    sku: "RX-MET-850",
    category: "Chronic Care",
    quantity: 6,
    minThreshold: 30,
    unitPrice: 9.75,
    supplier: "Apex Bio-Distribution",
    location: "Shelf B-1",
    description:
      "Oral biguanide anti-hyperglycemic agent for managing type 2 diabetes mellitus.",
    lastRestocked: "2026-08-20",
    expiryDate: "2026-10-15", // Already Expired
  },
  {
    id: "med-004",
    name: "Cetirizine 10mg",
    sku: "OTC-CTZ-010",
    category: "Allergy",
    quantity: 85,
    minThreshold: 20,
    unitPrice: 6.9,
    supplier: "MedSupply Direct",
    location: "Aisle 1, Shelf C",
    description:
      "Second-generation antihistamine used to relieve seasonal allergy symptoms.",
    lastRestocked: "2026-10-18",
    expiryDate: "2027-12-01",
  },
  {
    id: "med-005",
    name: "Salbutamol Inhaler 100mcg",
    sku: "RX-SBT-100",
    category: "Respiratory",
    quantity: 3,
    minThreshold: 15,
    unitPrice: 18.0,
    supplier: "PharmaCore Logistics",
    location: "Secure Fridge Bay 2",
    description:
      "Short-acting beta-2 adrenergic agonist for rapid relief of acute bronchospasm.",
    lastRestocked: "2026-09-01",
    expiryDate: "2026-11-05", // Expiring soon
  },
  {
    id: "med-006",
    name: "Omeprazole 20mg Delayed-Release",
    sku: "OTC-OMP-020",
    category: "Gastrointestinal",
    quantity: 52,
    minThreshold: 25,
    unitPrice: 11.3,
    supplier: "Apex Bio-Distribution",
    location: "Shelf C-4",
    description:
      "Proton pump inhibitor (PPI) targeting gastric acid hypersecretion and GERD.",
    lastRestocked: "2026-10-10",
    expiryDate: "2027-04-20",
  },
];
