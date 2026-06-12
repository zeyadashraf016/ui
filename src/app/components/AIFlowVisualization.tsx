import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  MessageSquare, Zap, GitBranch, DollarSign, Database,
  Lock, Cpu, Shield, CheckCircle, Search
} from "lucide-react";

interface AIFlowVisualizationProps {
  currentStep: number;
  isProcessing: boolean;
  activeEngine: string | null;
  currentQuery: string;
}

interface Particle {
  id: number;
  progress: number;
  fromNode: number;
  toNode: number;
  color: string;
}

const FLOW_NODES = [
  {
    id: "query", label: "User Query", sublabel: "Natural Language Input",
    icon: MessageSquare, color: "#00D4FF", step: 0,
    metrics: { type: "NL Query", tokens: "~24" }
  },
  {
    id: "fastapi", label: "FastAPI Orchestrator", sublabel: "Route & Validate",
    icon: Zap, color: "#00FFE0", step: 1,
    metrics: { latency: "8ms", status: "200 OK" }
  },
  {
    id: "intent", label: "Intent Classifier", sublabel: "Query Classification",
    icon: Search, color: "#7B61FF", step: 2,
    metrics: { confidence: "97%", class: "MARGIN" }
  },
  {
    id: "routing", label: "Router Ensemble", sublabel: "5-Layer Routing",
    icon: GitBranch, color: "#FF00AA", step: 3,
    metrics: { routers: "5", matched: "Margin" }
  },
  {
    id: "engine", label: "Margin Engine", sublabel: "Specialized AI Module",
    icon: DollarSign, color: "#00FF94", step: 4,
    metrics: { engine: "margin", calls: "1,089" }
  },
  {
    id: "database", label: "SQLite Database", sublabel: "Fact Retrieval",
    icon: Database, color: "#00D4FF", step: 5,
    metrics: { rows: "2.4M", query: "12ms" }
  },
  {
    id: "factcard", label: "Fact Card Lock", sublabel: "Data Verification",
    icon: Lock, color: "#FFB800", step: 6,
    metrics: { facts: "7", locked: "Yes" }
  },
  {
    id: "llm", label: "Ollama qwen3:14b", sublabel: "LLM Generation",
    icon: Cpu, color: "#7B61FF", step: 7,
    metrics: { model: "qwen3:14b", tokens: "512" }
  },
  {
    id: "guard", label: "Number Guard", sublabel: "Hallucination Check",
    icon: Shield, color: "#FF3B6B", step: 8,
    metrics: { checks: "14", passed: "14/14" }
  },
  {
    id: "response", label: "Final Response", sublabel: "Validated Output",
    icon: CheckCircle, color: "#00FF94", step: 9,
    metrics: { latency: "2.4s", accuracy: "99.1%" }
  },
];

export function AIFlowVisualization({ currentStep, isProcessing, activeEngine, currentQuery }: AIFlowVisualizationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const particleIdRef = useRef(0);

  const spawnParticle = useCallback((fromNode: number, toNode: number, color: string) => {
    const id = ++particleIdRef.current;
    setParticles((prev) => [...prev, { id, progress: 0, fromNode, toNode, color }]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 1500);
  }, []);

  useEffect(() => {
    if (!isProcessing) return;
    if (currentStep < FLOW_NODES.length - 1) {
      const node = FLOW_NODES[currentStep];
      const nextNode = FLOW_NODES[currentStep + 1];
      for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnParticle(currentStep, currentStep + 1, node.color), i * 200);
      }
    }
  }, [currentStep, isProcessing, spawnParticle]);

  // Background particle rain
  useEffect(() => {
    if (!isProcessing) return;
    const t = setInterval(() => {
      const from = Math.floor(Math.random() * (FLOW_NODES.length - 1));
      const colors = ["#00D4FF", "#7B61FF", "#00FFE0", "#FF00AA"];
      spawnParticle(from, from + 1, colors[Math.floor(Math.random() * colors.length)]);
    }, 800);
    return () => clearInterval(t);
  }, [isProcessing, spawnParticle]);

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col" style={{ minWidth: 0 }}>
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-6 pt-5 pb-4 flex items-start justify-between flex-shrink-0">
        <div>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              letterSpacing: "0.08em",
              background: "linear-gradient(135deg, #00D4FF, #7B61FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
            }}
          >
            LIVE AI PIPELINE ORCHESTRATION
          </h2>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#6B7A9F", marginTop: 4 }}>
            Real-time query processing · {FLOW_NODES.length} pipeline stages · 9 specialized engines
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isProcessing && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" style={{ boxShadow: "0 0 8px #00D4FF" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#00D4FF" }}>
                PROCESSING
              </span>
            </motion.div>
          )}
          <div
            className="px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(0,255,148,0.06)", border: "1px solid rgba(0,255,148,0.15)" }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#00FF94" }}>
              STEP {Math.min(currentStep + 1, FLOW_NODES.length)}/{FLOW_NODES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Active query strip */}
      {currentQuery && (
        <div
          className="relative z-10 mx-6 mb-4 px-4 py-2.5 rounded-lg flex-shrink-0"
          style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F", marginRight: 8 }}>
            ACTIVE QUERY →
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#E8EDF8" }}>
            "{currentQuery}"
          </span>
        </div>
      )}

      {/* Flow diagram — horizontal layout */}
      <div className="relative flex-1 overflow-auto px-6 pb-6">
        {/* SVG connector lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="conn-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7B61FF" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Two-row grid layout */}
        <div className="relative" style={{ minHeight: "360px" }}>
          {/* Row 1: nodes 0-4 */}
          <div className="grid grid-cols-5 gap-3 mb-12">
            {FLOW_NODES.slice(0, 5).map((node, i) => (
              <FlowNode
                key={node.id}
                node={node}
                isActive={currentStep >= node.step}
                isCurrent={currentStep === node.step && isProcessing}
                isHovered={hoveredNode === node.id}
                onHover={setHoveredNode}
                showArrow={i < 4}
                arrowDir="right"
              />
            ))}
          </div>

          {/* Connector between rows */}
          <div className="flex justify-end pr-4 -mt-8 mb-4">
            <div className="flex items-center" style={{ color: currentStep >= 5 ? "#00D4FF" : "#6B7A9F40" }}>
              <div className="w-8 h-px" style={{ background: currentStep >= 5 ? "#00D4FF" : "rgba(255,255,255,0.1)" }} />
              <svg width="20" height="32" viewBox="0 0 20 32">
                <path
                  d="M 10 0 L 10 24 L 2 16"
                  stroke={currentStep >= 5 ? "#00D4FF" : "rgba(255,255,255,0.1)"}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 24 L 18 16"
                  stroke={currentStep >= 5 ? "#00D4FF" : "rgba(255,255,255,0.1)"}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Row 2: nodes 5-9 (reversed) */}
          <div className="grid grid-cols-5 gap-3" style={{ direction: "rtl" }}>
            {FLOW_NODES.slice(5).reverse().map((node, i) => (
              <FlowNode
                key={node.id}
                node={node}
                isActive={currentStep >= node.step}
                isCurrent={currentStep === node.step && isProcessing}
                isHovered={hoveredNode === node.id}
                onHover={setHoveredNode}
                showArrow={i < 4}
                arrowDir="left"
                rtl
              />
            ))}
          </div>
        </div>

        {/* Floating particles overlay */}
        <AnimatePresence>
          {particles.slice(-6).map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 rounded-full pointer-events-none"
              style={{
                background: p.color,
                boxShadow: `0 0 12px ${p.color}`,
                left: "50%",
                top: "50%",
                zIndex: 20,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
                y: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom pipeline progress bar */}
      <div
        className="relative z-10 mx-6 mb-5 px-4 py-3 rounded-xl flex-shrink-0"
        style={{ background: "rgba(13,20,45,0.8)", border: "1px solid rgba(0,212,255,0.12)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: "12px", letterSpacing: "0.1em", color: "#6B7A9F" }}>
            PIPELINE PROGRESS
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#00D4FF" }}>
            {Math.round((Math.min(currentStep, FLOW_NODES.length - 1) / (FLOW_NODES.length - 1)) * 100)}%
          </span>
        </div>
        <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "linear-gradient(90deg, #00D4FF, #7B61FF, #FF00AA)" }}
            animate={{ width: `${(Math.min(currentStep, FLOW_NODES.length - 1) / (FLOW_NODES.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {isProcessing && (
            <motion.div
              className="absolute inset-y-0 w-16 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
        <div className="flex justify-between mt-1.5">
          {FLOW_NODES.map((n, i) => (
            <div
              key={n.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: i <= currentStep ? n.color : "rgba(255,255,255,0.1)",
                boxShadow: i === currentStep ? `0 0 6px ${n.color}` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowNode({
  node, isActive, isCurrent, isHovered, onHover, showArrow, arrowDir, rtl
}: {
  node: typeof FLOW_NODES[0];
  isActive: boolean;
  isCurrent: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  showArrow: boolean;
  arrowDir: "left" | "right";
  rtl?: boolean;
}) {
  const Icon = node.icon;

  return (
    <div className="relative flex items-center" style={{ direction: "ltr" }}>
      <motion.div
        className="flex-1 rounded-xl overflow-hidden cursor-pointer"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${node.color}12, ${node.color}06)`
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${isActive ? node.color + "35" : "rgba(255,255,255,0.06)"}`,
          boxShadow: isCurrent
            ? `0 0 24px ${node.color}50, inset 0 0 24px ${node.color}08`
            : isActive
              ? `0 0 10px ${node.color}20`
              : "none",
        }}
        whileHover={{ scale: 1.02, y: -2 }}
        onHoverStart={() => onHover(node.id)}
        onHoverEnd={() => onHover(null)}
      >
        {/* Processing shimmer */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${node.color}15, transparent)`,
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["-200% center", "200% center"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="p-3">
          {/* Icon row */}
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: isActive ? `${node.color}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? node.color + "40" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? node.color : "#6B7A9F" }} />
            </div>
            <div className="flex items-center gap-1">
              {isCurrent ? (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: node.color, boxShadow: `0 0 6px ${node.color}` }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                />
              ) : (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isActive ? "#00FF94" : "rgba(255,255,255,0.15)" }}
                />
              )}
            </div>
          </div>

          {/* Labels */}
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.04em",
              color: isActive ? node.color : "#6B7A9F",
              lineHeight: 1.2,
            }}
          >
            {node.label}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "#6B7A9F",
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {node.sublabel}
          </div>

          {/* Metrics row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {Object.entries(node.metrics).map(([k, v]) => (
              <div
                key={k}
                className="px-1.5 py-0.5 rounded"
                style={{
                  background: isActive ? `${node.color}10` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? node.color + "20" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: isActive ? node.color : "#6B7A9F80" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Arrow connector */}
      {showArrow && (
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: 20, color: isActive ? node.color : "rgba(255,255,255,0.15)" }}
        >
          {arrowDir === "right" ? (
            <svg width="16" height="12" viewBox="0 0 16 12">
              <path d="M 0 6 L 10 6 M 6 2 L 10 6 L 6 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="12" viewBox="0 0 16 12">
              <path d="M 16 6 L 6 6 M 10 2 L 6 6 L 10 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
