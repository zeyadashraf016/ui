import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useShowcase } from "../lib/showcase";
import {
  Heart, AlertTriangle, Archive, TrendingUp, FileText,
  Users, DollarSign, User, Brain, Play, Cpu,
  Activity, Shield, Database, Zap
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface EngineLabProps {
  onRunEngine: (id: string) => void;
}

const ENGINES = [
  {
    id: "health", name: "Health Monitor", icon: Heart, color: "#00FF94",
    desc: "Monitors overall supply chain vitality. Tracks KPI deviations, SLA breaches, and system anomalies across all engines in real-time.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "640ms",
    capabilities: ["Anomaly detection", "SLA monitoring", "KPI tracking", "Alert generation"],
    radarData: [
      { metric: "Speed", value: 90 }, { metric: "Accuracy", value: 88 },
      { metric: "Coverage", value: 75 }, { metric: "Recall", value: 82 }, { metric: "Precision", value: 91 },
    ],
    calls: 1247, confidence: 88,
  },
  {
    id: "stockout", name: "Stockout Risk", icon: AlertTriangle, color: "#FF3B6B",
    desc: "Predicts stockout probability for each SKU using demand velocity, lead times, and safety stock calculations.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "890ms",
    capabilities: ["Risk scoring", "Lead time analysis", "Reorder triggers", "Supplier alerts"],
    radarData: [
      { metric: "Speed", value: 85 }, { metric: "Accuracy", value: 93 },
      { metric: "Coverage", value: 88 }, { metric: "Recall", value: 90 }, { metric: "Precision", value: 87 },
    ],
    calls: 834, confidence: 93,
  },
  {
    id: "deadstock", name: "Dead Stock", icon: Archive, color: "#FFB800",
    desc: "Identifies inventory that has exceeded its movement threshold. Suggests markdown, liquidation, or return strategies.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "720ms",
    capabilities: ["Movement analysis", "Markdown recommendations", "ROI calculation", "Disposal planning"],
    radarData: [
      { metric: "Speed", value: 88 }, { metric: "Accuracy", value: 85 },
      { metric: "Coverage", value: 90 }, { metric: "Recall", value: 78 }, { metric: "Precision", value: 92 },
    ],
    calls: 521, confidence: 85,
  },
  {
    id: "demand", name: "Demand Forecast", icon: TrendingUp, color: "#7B61FF",
    desc: "Generates 90-day demand forecasts using historical sales, seasonality, promotions, and external market signals.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "2,240ms",
    capabilities: ["Time-series forecasting", "Seasonality modeling", "Promo impact", "Confidence intervals"],
    radarData: [
      { metric: "Speed", value: 65 }, { metric: "Accuracy", value: 96 },
      { metric: "Coverage", value: 94 }, { metric: "Recall", value: 93 }, { metric: "Precision", value: 95 },
    ],
    calls: 2183, confidence: 96,
  },
  {
    id: "po", name: "PO Brain", icon: FileText, color: "#00D4FF",
    desc: "Automates purchase order generation based on forecasted demand, current stock, supplier lead times, and MOQs.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "1,120ms",
    capabilities: ["PO generation", "MOQ optimization", "Cost minimization", "Supplier selection"],
    radarData: [
      { metric: "Speed", value: 78 }, { metric: "Accuracy", value: 91 },
      { metric: "Coverage", value: 87 }, { metric: "Recall", value: 88 }, { metric: "Precision", value: 94 },
    ],
    calls: 956, confidence: 91,
  },
  {
    id: "supplier", name: "Supplier Intel", icon: Users, color: "#00FFE0",
    desc: "Evaluates supplier performance across lead time reliability, quality scores, pricing trends, and risk indicators.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "980ms",
    capabilities: ["Performance scoring", "Risk assessment", "Lead time analysis", "Negotiation insights"],
    radarData: [
      { metric: "Speed", value: 82 }, { metric: "Accuracy", value: 89 },
      { metric: "Coverage", value: 85 }, { metric: "Recall", value: 86 }, { metric: "Precision", value: 90 },
    ],
    calls: 673, confidence: 89,
  },
  {
    id: "margin", name: "Margin Engine", icon: DollarSign, color: "#00FF94",
    desc: "Analyzes gross and net margins by SKU, category, and channel. Identifies margin leakage and optimization opportunities.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "1,380ms",
    capabilities: ["Margin analysis", "COGS breakdown", "Channel profitability", "Leakage detection"],
    radarData: [
      { metric: "Speed", value: 74 }, { metric: "Accuracy", value: 97 },
      { metric: "Coverage", value: 92 }, { metric: "Recall", value: 94 }, { metric: "Precision", value: 96 },
    ],
    calls: 1089, confidence: 97,
  },
  {
    id: "customer", name: "Customer 360", icon: User, color: "#FF00AA",
    desc: "Provides a holistic view of customer behavior, CLV, churn risk, segment health, and personalization opportunities.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "1,720ms",
    capabilities: ["CLV calculation", "Churn prediction", "Segmentation", "RFM analysis"],
    radarData: [
      { metric: "Speed", value: 71 }, { metric: "Accuracy", value: 92 },
      { metric: "Coverage", value: 96 }, { metric: "Recall", value: 91 }, { metric: "Precision", value: 89 },
    ],
    calls: 1432, confidence: 92,
  },
  {
    id: "knowledge", name: "Knowledge Layer", icon: Brain, color: "#7B61FF",
    desc: "Semantic search and retrieval over 3,891 indexed supply chain documents, SOPs, contracts, and domain knowledge.",
    model: "qwen3:14b", params: "14B", quant: "q5_K_M", latency: "520ms",
    capabilities: ["Semantic search", "Document retrieval", "Context injection", "RAG pipeline"],
    radarData: [
      { metric: "Speed", value: 95 }, { metric: "Accuracy", value: 88 },
      { metric: "Coverage", value: 99 }, { metric: "Recall", value: 97 }, { metric: "Precision", value: 85 },
    ],
    calls: 3891, confidence: 88,
  },
];

export function EngineLab({ onRunEngine }: EngineLabProps) {
  const [selected, setSelected] = useState<string | null>(ENGINES[0].id);
  const { engines: liveStats } = useShowcase();
  const engine = ENGINES.find((e) => e.id === selected);

  return (
    <div className="flex h-full" style={{ background: "#0B1020" }}>
      {/* Engine list */}
      <div
        className="w-64 border-r overflow-y-auto flex-shrink-0"
        style={{ borderColor: "rgba(0,212,255,0.1)", background: "rgba(8,12,28,0.9)" }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.12em", color: "#00D4FF" }}>
            ENGINE LAB
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F", marginTop: 2 }}>
            9 specialized AI modules
          </div>
        </div>
        <div className="p-3 space-y-1">
          {ENGINES.map((e) => {
            const Icon = e.icon;
            const isSelected = selected === e.id;
            return (
              <button
                key={e.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: isSelected ? `${e.color}10` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isSelected ? e.color + "30" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: isSelected ? `0 0 12px ${e.color}20` : "none",
                }}
                onClick={() => setSelected(e.id)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: isSelected ? `${e.color}20` : "rgba(255,255,255,0.05)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: isSelected ? e.color : "#6B7A9F" }} />
                </div>
                <div className="min-w-0">
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: "13px", color: isSelected ? e.color : "#A8B4CC", letterSpacing: "0.04em" }}>
                    {e.name}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F" }}>
                    {liveStats[e.id] ? `${liveStats[e.id].stat} ${liveStats[e.id].label}` : "—"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {engine && (
            <motion.div
              key={engine.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto"
            >
              {/* Hero */}
              <div
                className="rounded-2xl p-6 mb-5"
                style={{
                  background: `linear-gradient(135deg, ${engine.color}10, ${engine.color}04)`,
                  border: `1px solid ${engine.color}25`,
                  boxShadow: `0 0 40px ${engine.color}10`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: `${engine.color}20`, border: `1px solid ${engine.color}40`, boxShadow: `0 0 20px ${engine.color}30` }}
                    >
                      <engine.icon className="w-7 h-7" style={{ color: engine.color }} />
                    </div>
                    <div>
                      <h1
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontWeight: 700,
                          fontSize: "22px",
                          letterSpacing: "0.06em",
                          color: engine.color,
                        }}
                      >
                        {engine.name.toUpperCase()}
                      </h1>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#6B7A9F", marginTop: 3 }}>
                        {engine.model} · {engine.params} params · {engine.quant}
                      </div>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
                    style={{
                      background: engine.color,
                      color: "#0B1020",
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 700,
                      fontSize: "13px",
                      letterSpacing: "0.08em",
                      boxShadow: `0 0 20px ${engine.color}50`,
                    }}
                    onClick={() => onRunEngine(engine.id)}
                  >
                    <Play className="w-4 h-4" />
                    RUN ENGINE
                  </button>
                </div>

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#A8B4CC", marginTop: 16, lineHeight: 1.6 }}>
                  {engine.desc}
                </p>
              </div>

              {/* Stats + Radar */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                {/* Metrics */}
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Calls", value: engine.calls.toLocaleString(), icon: Activity, color: "#00D4FF" },
                    { label: liveStats[engine.id]?.label || "Output", value: liveStats[engine.id]?.stat || "—", icon: Shield, color: "#00FF94" },
                    { label: "Avg Latency", value: engine.latency, icon: Zap, color: "#7B61FF" },
                    { label: "Model", value: engine.model, icon: Cpu, color: "#00FFE0" },
                    { label: "Parameters", value: engine.params, icon: Database, color: "#FFB800" },
                    { label: "Quantization", value: engine.quant, icon: Brain, color: "#FF00AA" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl p-3"
                      style={{ background: "rgba(13,20,45,0.6)", border: `1px solid ${s.color}18` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F" }}>
                          {s.label}
                        </span>
                      </div>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "16px", color: s.color }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Radar */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(13,20,45,0.6)", border: `1px solid ${engine.color}18` }}
                >
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", color: "#6B7A9F", marginBottom: 8 }}>
                    CAPABILITY PROFILE
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <RadarChart data={engine.radarData}>
                      <PolarGrid stroke={`${engine.color}15`} />
                      <PolarAngleAxis dataKey="metric" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: "#6B7A9F" }} />
                      <Radar dataKey="value" stroke={engine.color} fill={engine.color} fillOpacity={0.15} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Capabilities */}
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(13,20,45,0.6)", border: "1px solid rgba(0,212,255,0.1)" }}
              >
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", color: "#6B7A9F", marginBottom: 12 }}>
                  CAPABILITIES
                </div>
                <div className="flex flex-wrap gap-2">
                  {engine.capabilities.map((c) => (
                    <div
                      key={c}
                      className="px-3 py-1.5 rounded-lg"
                      style={{ background: `${engine.color}0C`, border: `1px solid ${engine.color}25` }}
                    >
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: engine.color }}>
                        {c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
