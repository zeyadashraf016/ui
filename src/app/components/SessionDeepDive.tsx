import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { getRecent } from "../lib/api";
import { useShowcase } from "../lib/showcase";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Activity, Clock, Cpu, Database, TrendingUp, Zap, AlertTriangle, CheckCircle } from "lucide-react";

const LATENCY_SERIES = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  latency: 60 + Math.sin(i * 0.5) * 30 + Math.random() * 20,
  p99: 100 + Math.sin(i * 0.5) * 40 + Math.random() * 30,
}));

// ENGINE_USAGE now computed from real showcase data

const QUERY_FLOW = Array.from({ length: 30 }, (_, i) => ({
  min: i * 2,
  queries: 8 + Math.floor(Math.sin(i * 0.4) * 4 + Math.random() * 6),
  errors: Math.random() > 0.85 ? 1 : 0,
}));

// RECENT_SESSIONS now fetched live from /recent

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: "rgba(8,12,28,0.95)",
    border: "1px solid rgba(0,212,255,0.2)",
    borderRadius: 8,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#E8EDF8",
  },
};

function GlassPanel({ children, className = "", style = {} }: any) {
  return (
    <div
      className={`rounded-xl p-4 ${className}`}
      style={{
        background: "rgba(13,20,45,0.6)",
        border: "1px solid rgba(0,212,255,0.1)",
        backdropFilter: "blur(16px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PanelTitle({ children }: { children: string }) {
  return (
    <div
      className="mb-3"
      style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", color: "#6B7A9F" }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon: Icon, delta }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4"
      style={{
        background: `linear-gradient(135deg, ${color}10, ${color}04)`,
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
        </div>
        {delta && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: delta.startsWith("+") ? "#00FF94" : "#FF3B6B" }}>
            {delta}
          </span>
        )}
      </div>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "26px", color: "#E8EDF8", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: color, marginTop: 2 }}>{sub}</div>}
    </motion.div>
  );
}

export function SessionDeepDive({ queryCount, latency }: { queryCount: number; latency: number }) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const { engines: liveEngines } = useShowcase();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      getRecent().then((rq) => {
        if (rq && rq.length > 0) {
          setRecentSessions(rq.map((r, i) => ({
            id: `ELI-${Date.now().toString(36).slice(-4)}-${i}`,
            query: r.question,
            engine: (r.endpoint || "—").split(":")[0].replace("_", " "),
            latency: `${Math.round(r.ms).toLocaleString()}ms`,
            status: r.ms > 5000 ? "warn" : "ok",
            time: r.at,
          })));
        }
      }).catch(() => {});
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  // Real engine call volume from live showcase data
  const ENGINE_USAGE = [
    { name: "Margin",     calls: parseInt((liveEngines?.margin?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#00FFE0" },
    { name: "Customer",   calls: parseInt((liveEngines?.customer?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#FF00AA" },
    { name: "Health",     calls: parseInt((liveEngines?.health?.stat || "0").replace(/[^0-9.]/g, "")) || 0, color: "#00FF94" },
    { name: "Demand",     calls: parseInt((liveEngines?.demand?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#00D4FF" },
    { name: "Dead Stock", calls: parseInt((liveEngines?.deadstock?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#FFB800" },
    { name: "Stockout",   calls: parseInt((liveEngines?.stockout?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#FF3B6B" },
    { name: "PO Brain",   calls: parseInt((liveEngines?.po?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#00D4FF" },
    { name: "Supplier",   calls: parseInt((liveEngines?.supplier?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#FFB800" },
    { name: "Knowledge",  calls: parseInt((liveEngines?.knowledge?.stat || "0").replace(/[^0-9]/g, "")) || 0, color: "#7B61FF" },
  ].filter(e => e.calls > 0);

  // Fall back to a clear "no queries yet" line if /recent is empty
  const RECENT_SESSIONS = recentSessions.length > 0 ? recentSessions : [
    { id: "—", query: "No queries yet. Ask something on the Ask Eliara tab.",
      engine: "—", latency: "—", status: "ok", time: "—" },
  ];

  return (
    <div className="p-6 min-h-full" style={{ background: "#0B1020" }}>
      {/* Header */}
      <div className="mb-6">
        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #00D4FF, #7B61FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          SESSION DEEP DIVE
        </h1>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#6B7A9F", marginTop: 4 }}>
          Session ELI-2026-0610 · June 10, 2026 · 14:00 – 15:00 UTC
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Queries" value={queryCount.toLocaleString()} delta="+284" color="#00D4FF" icon={Activity} />
        <StatCard label="Avg Latency" value={`${latency}ms`} delta="-12ms" color="#00FFE0" icon={Clock} />
        <StatCard label="P99 Latency" value="3.2s" color="#7B61FF" icon={Zap} sub="within SLA" />
        <StatCard label="DB Queries" value="84.2K" delta="+2.1K" color="#FFB800" icon={Database} />
        <StatCard label="Accuracy" value="99.1%" delta="+0.3%" color="#00FF94" icon={CheckCircle} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Latency over time */}
        <GlassPanel className="col-span-2">
          <PanelTitle>LATENCY OVER TIME · 24H</PanelTitle>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={LATENCY_SERIES}>
              <defs>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="p99Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,212,255,0.05)" />
              <XAxis dataKey="hour" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }} interval={3} />
              <YAxis stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }} unit="ms" />
              <Tooltip {...CHART_STYLE} />
              <Area type="monotone" dataKey="p99" stroke="#7B61FF" strokeWidth={1.5} fill="url(#p99Grad)" name="P99" strokeDasharray="3 2" />
              <Area type="monotone" dataKey="latency" stroke="#00D4FF" strokeWidth={2} fill="url(#latGrad)" name="Avg" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassPanel>

        {/* Engine usage */}
        <GlassPanel>
          <PanelTitle>ENGINE CALL VOLUME</PanelTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ENGINE_USAGE} layout="vertical">
              <XAxis type="number" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }} />
              <YAxis type="category" dataKey="name" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }} width={60} />
              <Tooltip {...CHART_STYLE} />
              <Bar dataKey="calls" radius={[0, 3, 3, 0]}>
                {ENGINE_USAGE.map((e, i) => (
                  <Cell key={i} fill={e.color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      {/* Query flow + recent sessions */}
      <div className="grid grid-cols-3 gap-4">
        <GlassPanel className="col-span-1">
          <PanelTitle>QUERY THROUGHPUT · 1H</PanelTitle>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={QUERY_FLOW}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,212,255,0.05)" />
              <XAxis dataKey="min" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }} interval={4} unit="m" />
              <YAxis stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }} />
              <Tooltip {...CHART_STYLE} />
              <Bar dataKey="queries" fill="#00D4FF" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
              <Bar dataKey="errors" fill="#FF3B6B" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>

        <GlassPanel className="col-span-2">
          <PanelTitle>RECENT SESSION LOG</PanelTitle>
          <div className="space-y-2">
            {RECENT_SESSIONS.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                style={{
                  background: selectedSession === s.id ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selectedSession === s.id ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.05)"}`,
                }}
                onClick={() => setSelectedSession(selectedSession === s.id ? null : s.id)}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: s.status === "ok" ? "#00FF94" : "#FFB800",
                    boxShadow: `0 0 6px ${s.status === "ok" ? "#00FF94" : "#FFB800"}`,
                  }}
                />
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F", minWidth: 55 }}>
                  {s.time}
                </div>
                <div
                  className="px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)" }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#00D4FF" }}>{s.engine}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#C8D4E8" }} className="line-clamp-1">
                    {s.query}
                  </span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F", flexShrink: 0 }}>
                  {s.latency}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

