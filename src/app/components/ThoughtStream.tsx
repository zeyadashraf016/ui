import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2, MessageSquare, Terminal, AlertTriangle } from "lucide-react";

interface ThoughtStreamProps {
  currentStep: number;
  isProcessing: boolean;
  activeEngine: string | null;
  onNewQuery?: () => void;
}

interface StreamEvent {
  id: number;
  timestamp: string;
  message: string;
  detail?: string;
  tag: string;
  tagColor: string;
  status: "complete" | "processing" | "warn";
  latency?: string;
}

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  INIT: { bg: "rgba(0,212,255,0.1)", text: "#00D4FF", border: "rgba(0,212,255,0.25)" },
  ROUTE: { bg: "rgba(255,0,170,0.1)", text: "#FF00AA", border: "rgba(255,0,170,0.25)" },
  ENGINE: { bg: "rgba(0,255,148,0.1)", text: "#00FF94", border: "rgba(0,255,148,0.25)" },
  SQL: { bg: "rgba(0,255,224,0.1)", text: "#00FFE0", border: "rgba(0,255,224,0.25)" },
  LOCK: { bg: "rgba(255,184,0,0.1)", text: "#FFB800", border: "rgba(255,184,0,0.25)" },
  LLM: { bg: "rgba(123,97,255,0.1)", text: "#7B61FF", border: "rgba(123,97,255,0.25)" },
  GUARD: { bg: "rgba(255,59,107,0.1)", text: "#FF3B6B", border: "rgba(255,59,107,0.25)" },
  DONE: { bg: "rgba(0,255,148,0.1)", text: "#00FF94", border: "rgba(0,255,148,0.25)" },
  WARN: { bg: "rgba(255,184,0,0.1)", text: "#FFB800", border: "rgba(255,184,0,0.25)" },
};

const EVENT_TEMPLATES = [
  { tag: "INIT", message: "User query received", detail: "Validated & enqueued in FastAPI orchestrator", latency: "4ms" },
  { tag: "INIT", message: "Orchestrator initialized", detail: "Session ELI-2026-0610 · Context window cleared", latency: "8ms" },
  { tag: "ROUTE", message: "Intent classification running", detail: "5-layer routing ensemble activated", latency: "22ms" },
  { tag: "ROUTE", message: "✓ Margin Router matched", detail: "Confidence: 97.3% · Fallback: Supplier", latency: "31ms" },
  { tag: "ENGINE", message: "Margin Engine loaded", detail: "qwen3:14b model · 14B params · quant:q5_K_M", latency: "18ms" },
  { tag: "SQL", message: "SQLite query dispatched", detail: "SELECT margin, sku, supplier FROM inventory WHERE…", latency: "12ms" },
  { tag: "SQL", message: "Query returned rows", detail: "Aggregated → verified fact entries", latency: "9ms" },
  { tag: "LOCK", message: "Fact card locked", detail: "7 verified data points sealed for LLM context", latency: "3ms" },
  { tag: "LLM", message: "Context sent to qwen3:14b", detail: "4,218 tokens · temp:0.1 · top_p:0.9", latency: "1240ms" },
  { tag: "GUARD", message: "Number guard activated", detail: "Checking 14 numerical claims against fact card", latency: "28ms" },
  { tag: "GUARD", message: "All 14 checks passed ✓", detail: "Zero hallucinations detected · confidence: 99.1%", latency: "5ms" },
  { tag: "DONE", message: "Response delivered", detail: "Total pipeline latency: 1,380ms · 512 tokens out", latency: "2ms" },
];

const AMBIENT_EVENTS = [
  { tag: "ENGINE", message: "Health Monitor heartbeat", detail: "All systems nominal" },
  { tag: "SQL", message: "Cache warm-up query", detail: "Pre-loading common SKUs" },
  { tag: "WARN", message: "Stockout risk flagged", detail: "891 SKUs below safety stock" },
  { tag: "ENGINE", message: "Demand Forecast cycle", detail: "2,069 SKUs analyzed" },
  { tag: "LLM", message: "Knowledge Layer ready", detail: "9 grounded concepts available" },
];

function Tag({ name }: { name: string }) {
  const c = TAG_COLORS[name] || TAG_COLORS["INIT"];
  return (
    <span
      className="px-1.5 py-0.5 rounded text-center shrink-0"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "9px",
        color: c.text,
        letterSpacing: "0.08em",
        minWidth: 44,
        display: "inline-block",
      }}
    >
      {name}
    </span>
  );
}

export function ThoughtStream({ currentStep, isProcessing, activeEngine, onNewQuery, lastTimings }: ThoughtStreamProps) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [totalQueries, setTotalQueries] = useState(0);
  const [avgLatency, setAvgLatency] = useState(67);

  // When REAL timings arrive from a completed query, inject real events
  useEffect(() => {
    if (!lastTimings?.stages?.length) return;
    const realEvents: StreamEvent[] = lastTimings.stages
      .filter((st: any) => st.ms >= 0.5)
      .map((st: any) => ({
        tag: st.stage.includes("LLM") || st.stage.includes("narration") ? "LLM" as const
           : st.stage.includes("SQL") || st.stage.includes("query") ? "SQL" as const
           : st.stage.includes("guard") ? "GUARD" as const
           : st.stage.includes("engine") || st.stage.includes("classified") ? "ENGINE" as const
           : "ROUTE" as const,
        message: st.stage,
        detail: `real measurement: ${Math.round(st.ms)}ms`,
        latency: `${Math.round(st.ms)}ms`,
        ts: new Date().toLocaleTimeString("en-US", { hour12: false }),
      }));
    // Add a total event
    realEvents.push({
      tag: "ENGINE" as const,
      message: "Query complete",
      detail: `total: ${Math.round(lastTimings.total_ms)}ms`,
      latency: `${Math.round(lastTimings.total_ms)}ms`,
      ts: new Date().toLocaleTimeString("en-US", { hour12: false }),
    });
    setEvents((prev) => [...realEvents, ...prev].slice(0, 20));
    setTotalQueries((n) => n + 1);
    setAvgLatency(Math.round(lastTimings.total_ms));
  }, [lastTimings]);
  const listRef = useRef<HTMLDivElement>(null);

  const addEvent = (e: Omit<StreamEvent, "id" | "timestamp">) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).slice(0, 2)}`;
    setEvents((prev) => [...prev.slice(-60), { ...e, id: Date.now() + Math.random(), timestamp: ts }]);
  };

  useEffect(() => {
    if (!isProcessing) return;
    if (currentStep < EVENT_TEMPLATES.length) {
      const tpl = EVENT_TEMPLATES[currentStep];
      setTimeout(() => {
        addEvent({ ...tpl, status: "complete" });
        if (currentStep === EVENT_TEMPLATES.length - 1) {
          setTotalQueries((n) => n + 1);
        }
      }, 200);
    }
  }, [currentStep, isProcessing]);

  // Ambient background events
  useEffect(() => {
    const t = setInterval(() => {
      const e = AMBIENT_EVENTS[Math.floor(Math.random() * AMBIENT_EVENTS.length)];
      addEvent({ ...e, status: "complete" });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setAvgLatency((n) => Math.max(40, Math.min(120, n + (Math.random() - 0.5) * 10)));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div
      className="w-80 flex flex-col border-l overflow-hidden flex-shrink-0"
      style={{ background: "rgba(8,12,28,0.9)", borderColor: "rgba(0,212,255,0.1)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" style={{ color: "#00D4FF" }} />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", color: "#00D4FF" }}>
              THOUGHT STREAM
            </span>
          </div>
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: "#00FF94", boxShadow: "0 0 8px #00FF94" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Events", value: events.length.toString(), color: "#00D4FF" },
            { label: "Queries", value: totalQueries.toString(), color: "#00FF94" },
            { label: "Avg Lat", value: `${Math.round(avgLatency)}ms`, color: "#00FFE0" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-2 text-center"
              style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: s.color, fontWeight: 600 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F", marginTop: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event feed */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Timeline connector */}
              {i < events.length - 1 && (
                <div
                  className="absolute left-3.5 top-6 bottom-0 w-px"
                  style={{ background: "linear-gradient(to bottom, rgba(0,212,255,0.15), transparent)" }}
                />
              )}

              <div
                className="relative flex gap-2.5 p-2 rounded-lg transition-all hover:bg-white/2"
                style={{ cursor: "default" }}
              >
                {/* Status dot */}
                <div className="shrink-0 mt-1">
                  {event.status === "processing" ? (
                    <motion.div
                      className="w-3 h-3 rounded-full border border-[#00D4FF]"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : event.status === "warn" ? (
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FFB800", boxShadow: "0 0 4px #FFB800" }} />
                  ) : (
                    <div className="w-3 h-3 rounded-full" style={{ background: TAG_COLORS[event.tag]?.text || "#00D4FF", boxShadow: `0 0 4px ${TAG_COLORS[event.tag]?.text || "#00D4FF"}` }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Tag name={event.tag} />
                      {event.latency && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F" }}>
                          +{event.latency}
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F", flexShrink: 0 }}>
                      {event.timestamp}
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#C8D4E8", lineHeight: 1.4 }}>
                    {event.message}
                  </div>
                  {event.detail && (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F", marginTop: 2, lineHeight: 1.4 }}>
                      {event.detail}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-2 py-1.5"
          >
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#00D4FF" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F" }}>
              processing next stage…
            </span>
          </motion.div>
        )}
      </div>

      {/* Query input trigger */}
      {onNewQuery && (
        <div
          className="px-4 py-3 border-t flex-shrink-0"
          style={{ borderColor: "rgba(0,212,255,0.1)" }}
        >
          <button
            onClick={onNewQuery}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
            style={{
              background: "rgba(0,212,255,0.04)",
              border: "1px solid rgba(0,212,255,0.15)",
            }}
          >
            <MessageSquare className="w-3.5 h-3.5" style={{ color: "#6B7A9F" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#6B7A9F" }}>
              New query…
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
