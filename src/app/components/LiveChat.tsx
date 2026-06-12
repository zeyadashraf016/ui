import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, Database, AlertCircle, Loader2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ask, Visual, AskResponse, AskTimings, getRecent } from "../lib/api";

interface Turn {
  role: "user" | "eliara";
  text: string;
  visual?: Visual;
  endpoint?: string;
  error?: boolean;
  timings?: AskTimings;
}

const CHART_TOOLTIP = {
  contentStyle: {
    backgroundColor: "rgba(8,12,28,0.95)",
    border: "1px solid rgba(0,212,255,0.2)",
    borderRadius: 8,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#E8EDF8",
  },
};

const SUGGESTIONS = [
  "What's our margin?",
  "Profit by year",
  "Top customers",
  "How has V00011 behaved over the years",
  "Which customers are at risk",
  "Tell me about customer MERSIN TRADE",
];

// ── Visual renderer — maps the backend's visual block to a real chart/table ──
function VisualBlock({ visual }: { visual: Visual }) {
  if (!visual) return null;

  if (visual.type === "trend") {
    const data = visual.points.map((p) => ({ label: p.label, value: p.value }));
    return (
      <div
        className="mt-3 rounded-xl p-3"
        style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.12)" }}
      >
        {visual.title && (
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#6B7A9F", marginBottom: 8, textTransform: "uppercase" }}>
            {visual.title}
          </div>
        )}
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,212,255,0.06)" />
            <XAxis dataKey="label" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
            <YAxis stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
            <Tooltip {...CHART_TOOLTIP} />
            <Area type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} fill="url(#trendGrad)" dot={{ fill: "#00D4FF", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (visual.type === "bars") {
    const data = visual.bars.map((b) => ({ label: b.label, value: b.value }));
    return (
      <div
        className="mt-3 rounded-xl p-3"
        style={{ background: "rgba(123,97,255,0.04)", border: "1px solid rgba(123,97,255,0.12)" }}
      >
        {visual.title && (
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#6B7A9F", marginBottom: 8, textTransform: "uppercase" }}>
            {visual.title}
          </div>
        )}
        <ResponsiveContainer width="100%" height={Math.max(140, data.length * 34)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(123,97,255,0.06)" horizontal={false} />
            <XAxis type="number" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
            <YAxis type="category" dataKey="label" width={120} stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
            <Tooltip {...CHART_TOOLTIP} />
            <Bar dataKey="value" fill="#7B61FF" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // table
  return (
    <div
      className="mt-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(0,212,255,0.12)" }}
    >
      {visual.title && (
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "#6B7A9F", padding: "8px 12px", textTransform: "uppercase", background: "rgba(0,212,255,0.04)" }}>
          {visual.title}
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight: 260 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
          <thead>
            <tr>
              {visual.columns.map((col, i) => (
                <th key={i} style={{ textAlign: "left", padding: "7px 12px", color: "#00D4FF", borderBottom: "1px solid rgba(0,212,255,0.15)", whiteSpace: "nowrap" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "6px 12px", color: "#C8D2E8", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface LiveChatProps {
  onRealQuery?: (question: string, endpoint: string, timings: any) => void;
}

export function LiveChat({ onRealQuery }: LiveChatProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<{ question: string; endpoint: string; ms: number; at: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<Record<string, any>>({});

  useEffect(() => {
    getRecent().then(setRecent);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  async function submit(q?: string) {
    const question = (q ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setTurns((t) => [...t, { role: "user", text: question }]);
    setLoading(true);
    try {
      const history = turns.map((t) => ({
        role: t.role === "user" ? "user" : "assistant",
        content: t.text,
      }));
      const res: AskResponse = await ask(question, history, ctxRef.current);
      setTurns((t) => [
        ...t,
        { role: "eliara", text: res.answer, visual: res.visual, endpoint: res.endpoint_used, timings: res.timings },
      ]);
      getRecent().then(setRecent);
      // Feed the real query to the pipeline visualization
      onRealQuery?.(question, res.endpoint_used || "", res.timings);
    } catch (e: any) {
      setTurns((t) => [
        ...t,
        { role: "eliara", text: "I couldn't reach the engine. Check the connection and try again.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "rgba(8,12,28,0.4)" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,255,0.12)" }}>
          <Sparkles className="w-4 h-4" style={{ color: "#00D4FF" }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, color: "#E8EDF8", letterSpacing: "0.04em" }}>
            ASK ELIARA
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#6B7A9F" }}>
            grounded in your live database
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#00FF94" }}>
          <Database className="w-3 h-3" /> LIVE
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-3 space-y-3 min-h-0">
        {turns.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#6B7A9F", maxWidth: 320 }}>
              Ask anything about your inventory, customers, suppliers, or margins.
              Every answer is computed from your real data.
            </div>
            <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 420 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                  style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9FB2D0" }}
                >
                  {s}
                </button>
              ))}
            </div>

            {recent.length > 0 && (
              <div style={{ maxWidth: 460, width: "100%", marginTop: 18 }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", color: "#4A5878", textTransform: "uppercase", marginBottom: 8, textAlign: "left" }}>
                  Recently Asked
                </div>
                <div className="flex flex-col gap-1.5">
                  {recent.slice(0, 6).map((r, i) => (
                    <button
                      key={i}
                      onClick={() => submit(r.question)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg transition-all hover:bg-white/5 text-left"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#9FB2D0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
                        {r.question}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#00D4FF", flexShrink: 0, marginLeft: 8 }}>
                        {Math.round(r.ms)}ms
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={t.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className="rounded-xl px-3.5 py-2.5"
                style={{
                  maxWidth: t.role === "user" ? "75%" : "92%",
                  background: t.role === "user" ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
                  border: t.role === "user" ? "1px solid rgba(0,212,255,0.2)" : t.error ? "1px solid rgba(255,59,107,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {t.role === "eliara" && t.error && (
                  <AlertCircle className="w-4 h-4 mb-1" style={{ color: "#FF3B6B" }} />
                )}
                <div style={{ fontFamily: t.role === "user" ? "'JetBrains Mono', monospace" : "'Inter', sans-serif", fontSize: t.role === "user" ? 12 : 13, lineHeight: 1.6, color: t.role === "user" ? "#C8E8FF" : "#E8EDF8", whiteSpace: "pre-wrap" }}>
                  {t.text}
                </div>
                {t.role === "eliara" && t.visual && <VisualBlock visual={t.visual} />}
                {t.role === "eliara" && t.endpoint && (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#4A5878", marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span>engine · {t.endpoint}</span>
                    {t.timings && (
                      <span style={{ color: "#00D4FF" }}>
                        {Math.round(t.timings.total_ms)}ms total
                      </span>
                    )}
                    {t.timings?.stages?.filter(st => st.ms >= 1).map((st, si) => (
                      <span key={si} style={{ color: "#6B7A9F" }}>
                        {st.stage} {Math.round(st.ms)}ms
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="rounded-xl px-3.5 py-2.5 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00D4FF" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6B7A9F" }}>
                consulting the engines…
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Ask about margins, customers, suppliers, stock…"
            disabled={loading}
            className="flex-1 px-3 py-2.5 rounded-lg outline-none"
            style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#E8EDF8" }}
          />
          <button
            onClick={() => submit()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}
          >
            <Send className="w-4 h-4" style={{ color: "#00D4FF" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
