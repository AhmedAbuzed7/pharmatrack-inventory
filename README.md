# PharmaTrack Ops Suite — AI-Assisted Pharmacy Inventory Management

A production-grade pharmacy operations and inventory control dashboard built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and the **Google Gen AI SDK** (`@google/genai`).

PharmaTrack streamlines daily pharmacy stock control, automates clinical documentation and supplier restock communications via Gemini, and guards patient safety through AI contraindication screening.

---

## ⚡ Core Features

- **Real-Time Inventory Operations**: Full CRUD lifecycle with stock level steppers, category filtering, search across drug names/SKUs/distributors, and localStorage persistence.
- **Role-Based Access Control (RBAC)**:
  - **Staff Mode**: Read-only audit view preventing accidental data mutations.
  - **Admin Mode**: Full catalog modification, deletion, and CSV import permissions protected behind an authorization passcode challenge (`8888`).
- **Automated Expiry & Depletion Tracking**: Dynamic visual indicators categorizing stock into active, Low Stock ($Q \le \text{Min}$), Critical Depletion ($Q = 0$), Near-Expiry ($< 30\text{ Days}$), and Expired states.
- **Enterprise CSV Tools**: Zero-dependency client-side CSV export and structured CSV manifest batch-importing with automatic field sanitization.
- **Destructive Action Confirmation**: Guarded SKU deletion workflows with contextual warning modals.
- **AI Clinical Intelligence (Google Gemini)**:
  - **Clinical Description Generator**: Automatically synthesizes pharmacological summaries and mechanism-of-action notes for new medications.
  - **AI Restock Procurement Drafter**: Scans depleted inventory and drafts formal purchase order emails to medical suppliers.
  - **Drug-Drug Contraindication Checker**: Cross-analyzes multi-drug combinations for CYP enzymatic competition, absorption conflicts, and clinical adverse risks.
  - **Fault-Tolerant AI Engine**: Multi-model fallback queue (`gemini-2.5-flash` / `gemini-1.5-flash`), 12-second hard timeouts, and in-app Bring-Your-Own-Key (BYOK) storage.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Build Tool**: Vite 8 (Rolldown engine with optimized chunk splitting for vendor, icons, and AI libraries)
- **AI Integration**: `@google/genai` (Google Gemini SDK)
- **Icons**: Lucide React
- **Persistence**: LocalStorage with factory-reset restoration

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone [https://github.com/AhmedAbuzed7/pharmatrack-inventory.git](https://github.com/AhmedAbuzed7/pharmatrack-inventory.git)
cd pharmatrack-inventory
npm install
```
