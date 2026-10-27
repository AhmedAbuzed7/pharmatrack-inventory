// src/services/gemini.ts
import { GoogleGenAI } from "@google/genai";
import type { InventoryItem } from "../types/inventory";

const API_KEY_STORAGE_KEY = "pharma_gemini_api_key";
const MODEL_STORAGE_KEY = "pharma_gemini_selected_model";

export const AVAILABLE_MODELS = [
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash-Lite (Fastest & Stable)",
    desc: "Lowest latency, high capacity",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash (High Intelligence)",
    desc: "Advanced reasoning",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash (Legacy Fallback)",
    desc: "Backup model",
  },
];

export function getStoredApiKey(): string {
  return (
    localStorage.getItem(API_KEY_STORAGE_KEY) ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    ""
  );
}

export function saveStoredApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

export function getSelectedModel(): string {
  return localStorage.getItem(MODEL_STORAGE_KEY) || "gemini-3.1-flash-lite";
}

export function saveSelectedModel(modelId: string): void {
  localStorage.setItem(MODEL_STORAGE_KEY, modelId);
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error(
      "Google Gemini API key is missing. Please set it in AI Settings.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

// Timeout helper to prevent infinite hanging
function timeoutPromise<T>(
  promise: Promise<T>,
  ms: number,
  errorMsg: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Executes generateContent with failover and maximum 12s per model attempt
 */
async function generateWithFallback(
  prompt: string,
  onStatusUpdate?: (status: string) => void,
  maxTokens: number = 500,
): Promise<string> {
  const ai = getGeminiClient();
  const preferredModel = getSelectedModel();

  const modelQueue = [
    preferredModel,
    ...AVAILABLE_MODELS.map((m) => m.id).filter((id) => id !== preferredModel),
  ];

  let lastError: unknown = null;

  for (let i = 0; i < modelQueue.length; i++) {
    const currentModel = modelQueue[i];

    try {
      if (i > 0 && onStatusUpdate) {
        onStatusUpdate(`Switched to alternate model: ${currentModel}...`);
      }

      const apiCall = ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          maxOutputTokens: maxTokens,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      // 12 second hard timeout per call
      const response = await timeoutPromise(
        apiCall,
        12000,
        `Request timed out on ${currentModel}`,
      );

      if (response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);

      const isRetryable =
        errMsg.includes("503") ||
        errMsg.includes("timed out") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("404") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("NOT_FOUND");

      if (isRetryable && i < modelQueue.length - 1) {
        console.warn(
          `[Gemini SDK] ${currentModel} failed: ${errMsg}. Trying next...`,
        );
        continue;
      }

      throw cleanErrorMessage(err);
    }
  }

  throw cleanErrorMessage(lastError);
}

function cleanErrorMessage(err: any): Error {
  const raw = err?.message || String(err);

  if (raw.includes("timed out")) {
    return new Error(
      "Request timed out. Google AI server took too long to reply. Please try again.",
    );
  }
  if (
    raw.includes("503") ||
    raw.includes("high demand") ||
    raw.includes("UNAVAILABLE")
  ) {
    return new Error(
      "Google AI servers are momentarily busy. Please try again in a few seconds.",
    );
  }
  if (raw.includes("429")) {
    return new Error(
      "Rate limit reached. Please pause a moment before retrying.",
    );
  }
  if (raw.includes("API_KEY_INVALID") || raw.includes("403")) {
    return new Error(
      "Invalid API Key. Please verify your credentials in AI Settings.",
    );
  }

  return new Error(raw.replace(/\{"error":.*?"message":"([^"]+)".*\}/, "$1"));
}

export async function generateProductDescription(
  name: string,
  category: string,
  sku: string,
  onStatusUpdate?: (status: string) => void,
): Promise<string> {
  const prompt = `You are a clinical pharmacist.
Write a concise, professional 2-sentence summary for pharmacy inventory:
- Name: 
${name}
- Category: 
${category}
- SKU: 
${sku}

Include therapeutic use and storage temperature.
Do not add pleasantries or headings. Output plain text summary only.`;

  return generateWithFallback(prompt, onStatusUpdate, 200);
}

export async function generateRestockEmail(
  lowStockItems: InventoryItem[],
  pharmacyName: string = "PharmaTrack Community Pharmacy",
  onStatusUpdate?: (status: string) => void,
): Promise<string> {
  const itemsListFormatted = lowStockItems
    .map(
      (item) =>
        `- ${item.name} (SKU: ${item.sku}) | On Hand: ${item.quantity} | Min Threshold: ${item.minThreshold} | Preferred Supplier: ${item.supplier || "Primary Distributor"}`,
    )
    .join("\n");

  const prompt = `You are an operations procurement manager at ${pharmacyName}.
Draft an urgent, professional purchase order requisition email to pharmaceutical distributors for medications below critical thresholds:

${itemsListFormatted}

The email must include:
1. Urgent Subject line with order reference.
2. Formal body requesting expedited quotation and lead times.
3. Clean table or bullet list specifying SKU, medication name, and calculated order quantity (restore stock to 3x minimum threshold).
4. Signature block for ${pharmacyName} Procurement Team.

Return only the complete email ready to send.`;

  return generateWithFallback(prompt, onStatusUpdate, 600);
}

export async function checkDrugInteractions(
  drugs: string[],
  onStatusUpdate?: (status: string) => void,
): Promise<string> {
  const drugList = drugs.map((d) => `- ${d}`).join("\n");

  const prompt = `You are a clinical pharmacologist.
Analyze possible drug-drug interactions, contraindications, and patient risks between the following medications:

${drugList}

Format your response strictly as follows:
1. **Severity Rating**: (None / Mild / Moderate / Severe / Life-Threatening)
2. **Clinical Mechanism**: Explain briefly how these active compounds interact.
3. **Key Risks & Symptoms**: What should clinical staff monitor?
4. **Pharmacist Action / Advisory**: Clear recommendation (e.g., monitor dosing, separate ingestion times by X hours, or substitute medication).

Keep it clinical, factual, and formatted with clear headings.`;

  return generateWithFallback(prompt, onStatusUpdate, 650);
}
