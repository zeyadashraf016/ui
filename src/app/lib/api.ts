// ============================================================================
// Eliara API client — connects the Command Center to the live backend.
// ============================================================================
// The backend base URL is read from VITE_API_URL at build time, falling back
// to the live Cloudflare tunnel. To point elsewhere (e.g. localhost), set
// VITE_API_URL in a .env file before building.
// ============================================================================

// API base resolution:
// - If VITE_API_URL is set to a non-empty value, use it (explicit override).
// - Otherwise use SAME-ORIGIN (empty string → relative /ask, /stats, …).
// This makes the UI work wherever the backend serves it — localhost, tunnel,
// or any domain — with no rebuild needed.
const _envUrl = (import.meta as any).env?.VITE_API_URL;
const API_BASE: string =
  _envUrl && String(_envUrl).trim() !== ""
    ? String(_envUrl).replace(/\/$/, "")
    : "";

// ── Types that mirror the backend response shape ────────────────────────────
export interface VisualTable {
  type: "table";
  title?: string;
  columns: string[];
  rows: string[][];
}
export interface VisualTrend {
  type: "trend";
  title?: string;
  points: { label: string; value: number }[];
}
export interface VisualBars {
  type: "bars";
  title?: string;
  max: number;
  bars: { label: string; value: number; band?: string }[];
}
export type Visual = VisualTable | VisualTrend | VisualBars | null;

export interface AskResponse {
  answer: string;
  domain: string;
  endpoint_used: string;
  visual: Visual;
}

export interface Stats {
  status: string;
  skus: number;
  customers: number;
  suppliers: number;
  purchase_orders: number;
  invoice_lines: number;
  dead_stock_items: number;
  margin_skus: number;
  total_revenue: number;
  years_covered: number;
}

// ── Ask a question (the real "talking to your database" call) ───────────────
export async function ask(
  message: string,
  history: { role: string; content: string }[] = [],
  sessionContext: Record<string, any> = {}
): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, session_context: sessionContext }),
  });
  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}`);
  }
  return (await res.json()) as AskResponse;
}

// ── Real headline numbers for the showcase ──────────────────────────────────
export async function getStats(): Promise<Stats | null> {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) return null;
    return (await res.json()) as Stats;
  } catch {
    return null;
  }
}

// ── Health / liveness ───────────────────────────────────────────────────────
export async function getHealth(): Promise<{ ok: boolean; model?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { ok: false };
    const j = await res.json();
    return { ok: j.status === "ok", model: j.model };
  } catch {
    return { ok: false };
  }
}

export { API_BASE };
