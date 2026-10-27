// src/components/StatsCards.tsx
import React from "react";
import { Package, DollarSign, AlertTriangle, AlertCircle } from "lucide-react";
import type { InventoryStats } from "../types/inventory";

interface StatsCardsProps {
  stats: InventoryStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: "Active SKUs",
      value: stats.totalItems.toLocaleString(),
      subtext: "Catalog active items",
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Total Inventory Value",
      value: `$${stats.totalValuation.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Calculated at wholesale cost",
      icon: DollarSign,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
    },
    {
      label: "Low Stock Warnings",
      value: stats.lowStockCount,
      subtext: "At or below min threshold",
      icon: AlertTriangle,
      iconColor: stats.lowStockCount > 0 ? "text-amber-600" : "text-slate-400",
      iconBg: stats.lowStockCount > 0 ? "bg-amber-50" : "bg-slate-50",
      highlight: stats.lowStockCount > 0,
    },
    {
      label: "Critical Depletion",
      value: stats.outOfStockCount,
      subtext: "Zero stock on shelf",
      icon: AlertCircle,
      iconColor: stats.outOfStockCount > 0 ? "text-rose-600" : "text-slate-400",
      iconBg: stats.outOfStockCount > 0 ? "bg-rose-50" : "bg-slate-50",
      highlight: stats.outOfStockCount > 0,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div
                className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <p
                className={`text-2xl font-bold tracking-tight ${
                  card.highlight ? card.iconColor : "text-slate-900"
                }`}
              >
                {card.value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
};
