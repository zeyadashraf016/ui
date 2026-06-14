import { useState, useEffect } from "react";
import { useShowcase } from "../lib/showcase";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, AlertTriangle, Archive, TrendingUp, FileText,
  Users, DollarSign, User, Brain, Layers, ChevronRight,
  Activity, Cpu, Network
} from "lucide-react";

export interface Engine {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  color: string;
  glowColor: string;
  status: "ready" | "processing" | "idle" | "error";
  latency: number;
  confidence: number;
  callsToday: number;
}

interface EngineSidebarProps {
  activeEngine: string | null;
  onEngineSelect: (id: string) => void;
  isProcessing: boolean;
}

const ENGINE_DEFS = [
  { id: "health", name: "Health Monitor", shortName: "Health", icon: Heart, color: "#00FF94", glowColor: "rgba(0,255,148,0.3)", callsToday: 1247 },
  { id: "stockout", name: "Stockout Risk", shortName: "Stockout", icon: AlertTriangle, color: "#FF3B6B", glowColor: "rgba(255,59,107,0.3)", callsToday: 834 },
  { id: "deadstock", name: "Dead Stock", shortName: "Dead Stock", icon: Archive, color: "#FFB800", glowColor: "rgba(255,184,0,0.3)", callsToday: 521 },
  { id: "demand", name: "Demand Forecast", shortName: "Demand", icon: TrendingUp, color: "#7B61FF", glowColor: "rgba(123,97,255,0.3)", callsToday: 2183 },
  { id: "po", name: "PO Brain", shortName: "PO Brain", icon: FileText, color: "#00D4FF", glowColor: "rgba(0,212,255,0.3)", callsToday: 956 },
  { id: "supplier", name: "Supplier Intel", shortName: "Supplier", icon: Users, color: "#00FFE0", glowColor: "rgba(0,255,224,0.3)", callsToday: 673 },
  { id: "margin", name: "Margin Engine", shortName: "Margin", icon: DollarSign, color: "#00FF94", glowColor: "rgba(0,255,148,0.3)", callsToday: 1089 },
  { id: "customer", name: "Customer 360", shortName: "Customer", icon: User, color: "#FF00AA", glowColor: "rgba(255,0,170,0.3)", callsToday: 1432 },
  { id: "knowledge", name: "Knowledge Layer", shortName: "Knowledge", icon: Brain, color: "#7B61FF", glowColor: "rgba(123,97,255,0.3)", callsToday: 3891 },
];

const ROUTERS = [
  { name: "Intent Classifier", color: "#00D4FF", active: true },
  { name: "Margin Router", color: "#7B61FF", active: true },
  { name: "Customer Router", color: "#FF00AA", active: false },
  { name: "Deep Entity Router", color: "#00FFE0", active: true },
  { name: "Knowledge Router", color: "#7B61FF", active: true },
];

function MiniSparkline({ color, animate }: { color: string; animate: boolean }) {
  const points = [4, 10, 6, 14, 8, 12, 16, 10, 18, 14, 20, 12];
  const path = points.map((y, i) => `${i === 0 ? "M" : "L"} ${i * 4} ${24 - y}`).join(" ");
  return (
    <svg width="44" height="24" viewBox="0 0 44 24" className="shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d={path} stroke={`url(#sg-${color.replace("#", "")})`} strokeWidth="1.5" fill="none" />
      {animate && (
        <circle r="2" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
          <animateMotion dur="2s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </svg>
  );
}

export function EngineSidebar({ activeEngine, onEngineSelect, isProcessing }: EngineSidebarProps) {
  const [engines, setEngines] = useState<Engine[]>(
    ENGINE_DEFS.map((e) => ({
      ...e,
      status: "ready" as const,
      latency: Math.floor(Math.random() * 80) + 40,
      confidence: Math.floor(Math.random() * 20) + 80,
    }))
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isProcessing || !activeEngine) return;
    setEngines((prev) =>
      prev.map((e) =>
        e.id === activeEngine ? { ...e, status: "processing" as const } : { ...e, status: "ready" as const }
      )
    );
  }, [activeEngine, isProcessing]);

  useEffect(() => {
    const t = setInterval(() => {
      setEngines((prev) =>
        prev.map((e) => ({
          ...e,
          latency: e.status === "processing" ? e.latency : Math.floor(Math.random() * 60) + 40,
          confidence: e.status === "processing" ? 95 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 15) + 82,
        }))
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const totalCalls = engines.reduce((a, b) => a + b.callsToday, 0);

  return (
    <aside
      className="w-72 flex flex-col border-r overflow-hidden flex-shrink-0"
      style={{ background: "rgba(8,12,28,0.9)", borderColor: "rgba(0,212,255,0.1)", backdropFilter: "blur(20px)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-3.5 h-3.5" style={{ color: "#00D4FF" }} />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", color: "#00D4FF" }}>
              ENGINE CONSTELLATION
            </span>
          </div>
          <div
            className="px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#00D4FF" }}>
              9 ACTIVE
            </span>
          </div>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Queries", value: totalCalls.toLocaleString(), color: "#00D4FF", icon: Activity },
            { label: "Avg Lat", value: "67ms", color: "#00FFE0", icon: Cpu },
            { label: "Engines", value: "9/9", color: "#00FF94", icon: Layers },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-2 text-center"
              style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: s.color, fontWeight: 600 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F", marginTop: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Router Stack */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-3 h-3" style={{ color: "#7B61FF" }} />
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", color: "#7B61FF" }}>
            ROUTER STACK
          </span>
        </div>
        <div className="space-y-1">
          {ROUTERS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md"
              style={{
                background: r.active ? `rgba(${r.color === "#00D4FF" ? "0,212,255" : r.color === "#7B61FF" ? "123,97,255" : r.color === "#FF00AA" ? "255,0,170" : r.color === "#00FFE0" ? "0,255,224" : "123,97,255"},0.06)` : "rgba(255,255,255,0.02)",
                border: `1px solid ${r.active ? r.color + "25" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: r.active ? r.color : "#6B7A9F",
                    boxShadow: r.active ? `0 0 6px ${r.color}` : "none",
                  }}
                />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: r.active ? "#A8B4CC" : "#6B7A9F" }}>
                  {r.name}
                </span>
              </div>
              <ChevronRight className="w-3 h-3" style={{ color: r.active ? r.color : "#6B7A9F", opacity: 0.6 }} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Engine list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {engines.map((engine, i) => {
          const Icon = engine.icon;
          const isActive = activeEngine === engine.id;
          const isExpanded = expanded === engine.id;

          return (
            <motion.div
              key={engine.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <motion.button
                className="w-full text-left rounded-xl overflow-hidden transition-all"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${engine.color}12, ${engine.color}06)`
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? engine.color + "30" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: isActive ? `0 0 16px ${engine.glowColor}` : "none",
                }}
                whileHover={{ scale: 1.01 }}
                onClick={() => {
                  onEngineSelect(engine.id);
                  setExpanded(isExpanded ? null : engine.id);
                }}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive ? `${engine.color}20` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isActive ? engine.color + "40" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? engine.color : "#6B7A9F" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontWeight: 600,
                          fontSize: "13px",
                          color: isActive ? engine.color : "#C8D4E8",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {engine.shortName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {engine.status === "processing" && (
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: engine.color }}
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        )}
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "10px",
                            color: engine.status === "processing" ? engine.color : "#6B7A9F",
                          }}
                        >
                          {engine.status === "processing" ? "BUSY" : "RDY"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F" }}>
                          {engine.latency}ms
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F" }}>
                          {engine.confidence}% conf
                        </span>
                      </div>
                      <MiniSparkline color={engine.color} animate={isActive} />
                    </div>
                  </div>
                </div>

                {/* Expanded stats */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t px-3 py-2"
                      style={{ borderColor: `${engine.color}20` }}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Calls Today", value: engine.callsToday.toLocaleString() },
                          { label: "Avg Latency", value: `${engine.latency}ms` },
                          { label: "Confidence", value: `${engine.confidence}%` },
                          { label: "Model", value: "qwen3:14b" },
                        ].map((stat) => (
                          <div key={stat.label}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F" }}>
                              {stat.label}
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: engine.color, marginTop: 1 }}>
                              {stat.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 border-t flex items-center justify-between"
        style={{ borderColor: "rgba(0,212,255,0.1)" }}
      >
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F" }}>
          Session ELI-2026-0610
        </span>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#00FF94", boxShadow: "0 0 6px #00FF94" }}
        />
      </div>
    </aside>
  );
}
