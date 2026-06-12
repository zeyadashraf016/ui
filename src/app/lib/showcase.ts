import { useState, useEffect } from "react";
import { API_BASE } from "./api";

// Fallback values used only if the backend is unreachable, so the demo never
// shows an empty panel. When the backend responds, real data replaces these.
const FALLBACK = {
  margin: [
    { month: "Jan", margin: 0, revenue: 0 },
  ],
  customers: [
    { metric: "Active", value: 0 },
  ],
  stockout: [] as any[],
  demand: { analyzed: 0, declining: 0, growing: 0, forecast_90d: 0 },
  engines: {} as Record<string, { stat: string; label: string }>,
};

export interface ShowcaseData {
  margin: { month: string; margin: number; revenue: number }[];
  customers: { metric: string; value: number }[];
  stockout: { sku: string; stock: number; days: number; lead: number }[];
  demand: { analyzed: number; declining: number; growing: number; forecast_90d: number };
  engines: Record<string, { stat: string; label: string }>;
  loaded: boolean;
}

let _cache: ShowcaseData | null = null;

export function useShowcase(): ShowcaseData {
  const [data, setData] = useState<ShowcaseData>(
    _cache || { ...FALLBACK, loaded: false }
  );

  useEffect(() => {
    if (_cache) { setData(_cache); return; }
    let alive = true;
    fetch(`${API_BASE}/showcase`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j || j.status !== "ok") return;
        const next: ShowcaseData = {
          margin: j.margin?.length ? j.margin : FALLBACK.margin,
          customers: j.customers?.length ? j.customers : FALLBACK.customers,
          stockout: j.stockout?.length ? j.stockout : FALLBACK.stockout,
          demand: j.demand || FALLBACK.demand,
          engines: j.engines || FALLBACK.engines,
          loaded: true,
        };
        _cache = next;
        setData(next);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return data;
}
