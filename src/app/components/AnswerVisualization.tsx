import { motion, AnimatePresence } from "motion/react";
import { useShowcase } from "../lib/showcase";
import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Users, Package, AlertCircle, ArrowUpRight, ArrowDownRight, Brain, BarChart2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from "recharts";

interface AnswerVisualizationProps {
  activeEngine: string | null;
  isProcessing: boolean;
  currentStep: number;
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "rgba(8,12,28,0.95)",
    border: "1px solid rgba(0,212,255,0.2)",
    borderRadius: 8,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#E8EDF8",
  },
};

function KpiCard({ label, value, delta, color, icon: Icon }: any) {
  const positive = !delta?.startsWith("-");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{
        background: `linear-gradient(135deg, ${color}10, ${color}04)`,
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {delta && (
          <div className="flex items-center gap-0.5" style={{ color: positive ? "#00FF94" : "#FF3B6B" }}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>{delta}</span>
          </div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "22px", color: "#E8EDF8", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6B7A9F", marginTop: 3 }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}

function MarginView() {
  const { margin } = useShowcase();
  const latest = margin[margin.length - 1] || { margin: 0, revenue: 0 };
  const fmtAED = (n: number) => n >= 1e6 ? `AED ${(n/1e6).toFixed(1)}M` : `AED ${(n/1e3).toFixed(0)}K`;
  const data = margin.length ? margin : [{ month: "—", margin: 0, revenue: 0 }];
  return (
    <div className="grid grid-cols-5 gap-3 h-full">
      <div className="col-span-2 grid grid-rows-2 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Gross Margin" value={`${latest.margin}%`} color="#00FF94" icon={DollarSign} />
          <KpiCard label="Revenue (mo)" value={fmtAED(latest.revenue)} color="#00D4FF" icon={TrendingUp} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Months" value={`${margin.length}`} color="#FF3B6B" icon={Package} />
          <KpiCard label="Avg Margin" value={`${(margin.reduce((a,b)=>a+b.margin,0)/(margin.length||1)).toFixed(1)}%`} color="#7B61FF" icon={DollarSign} />
        </div>
      </div>
      <div
        className="col-span-3 rounded-xl p-3"
        style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)" }}
      >
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#6B7A9F", marginBottom: 8 }}>
          MARGIN TREND · 6MO
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF94" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00FF94" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,212,255,0.06)" />
            <XAxis dataKey="month" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
            <YAxis stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} unit="%" />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="margin" stroke="#00FF94" strokeWidth={2} fill="url(#mgGrad)" dot={{ fill: "#00FF94", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DemandView() {
  const { demand, margin } = useShowcase();
  // Use the real monthly series as the visible trend; label honestly.
  const data = margin.map((m) => ({ month: m.month, forecast: m.revenue }));
  return (
    <div className="grid grid-cols-3 gap-3 h-full">
      <div
        className="col-span-2 rounded-xl p-3"
        style={{ background: "rgba(123,97,255,0.04)", border: "1px solid rgba(123,97,255,0.12)" }}
      >
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#6B7A9F", marginBottom: 8 }}>
          REVENUE TREND · MONTHLY (AED)
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(123,97,255,0.06)" />
            <XAxis dataKey="month" stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
            <YAxis stroke="#6B7A9F" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="forecast" stroke="#7B61FF" strokeWidth={2} fill="url(#fcGrad)" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-rows-2 gap-3">
        <KpiCard label="SKUs Analyzed" value={`${demand.analyzed.toLocaleString()}`} color="#7B61FF" icon={TrendingUp} />
        <KpiCard label="90d Forecast" value={`${(demand.forecast_90d/1000).toFixed(0)}K`} color="#00FFE0" icon={Brain} />
      </div>
    </div>
  );
}

function StockoutView() {
  const { stockout } = useShowcase();
  // derive a 0-100 risk: fewer days of supply vs lead = higher risk
  const items = (stockout.length ? stockout : []).map((s) => ({
    sku: s.sku,
    stock: s.stock,
    risk: Math.min(100, Math.max(5, Math.round(100 - (s.days / Math.max(1, s.lead)) * 100))),
  }));
  const critical = items.filter((i) => i.risk > 70).length;
  return (
    <div className="grid grid-cols-3 gap-3 h-full">
      <div className="col-span-2 space-y-1.5 overflow-auto">
        {items.map((item, i) => (
          <motion.div
            key={item.sku}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{
              background: item.risk > 70 ? "rgba(255,59,107,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${item.risk > 70 ? "rgba(255,59,107,0.2)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#A8B4CC", minWidth: 70 }}>
              {item.sku}
            </div>
            <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: item.risk > 70 ? "#FF3B6B" : item.risk > 50 ? "#FFB800" : "#00FF94" }}
                initial={{ width: 0 }}
                animate={{ width: `${item.risk}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: item.risk > 70 ? "#FF3B6B" : "#6B7A9F", minWidth: 32, textAlign: "right" }}>
              {item.risk}%
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#6B7A9F", minWidth: 50 }}>
              {item.stock} units
            </span>
          </motion.div>
        ))}
      </div>
      <div className="space-y-3">
        <KpiCard label="Critical SKUs" value={`${critical}`} color="#FF3B6B" icon={AlertCircle} />
        <KpiCard label="At-Risk Shown" value={`${items.length}`} color="#FFB800" icon={Package} />
      </div>
    </div>
  );
}

function CustomerView() {
  const { customers, demand } = useShowcase();
  const totalCust = customers.reduce((a, b) => a + b.value, 0);
  const activePct = totalCust ? Math.round((customers.find(c=>c.metric==="Active")?.value || 0) / totalCust * 100) : 0;
  return (
    <div className="grid grid-cols-3 gap-3 h-full">
      <div
        className="col-span-2 rounded-xl p-3"
        style={{ background: "rgba(255,0,170,0.04)", border: "1px solid rgba(255,0,170,0.12)" }}
      >
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", color: "#6B7A9F", marginBottom: 4 }}>
          CUSTOMER HEALTH RADAR
        </div>
        <ResponsiveContainer width="100%" height="88%">
          <RadarChart data={customers}>
            <PolarGrid stroke="rgba(255,0,170,0.1)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: "#6B7A9F" }} />
            <Radar dataKey="value" stroke="#FF00AA" fill="#FF00AA" fillOpacity={0.12} strokeWidth={2} dot={{ fill: "#FF00AA", r: 3 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        <KpiCard label="Total Customers" value={`${totalCust.toLocaleString()}`} color="#FF00AA" icon={Users} />
        <KpiCard label="Active %" value={`${activePct}%`} color="#7B61FF" icon={TrendingUp} />
      </div>
    </div>
  );
}

function DefaultView({ isProcessing }: { isProcessing: boolean }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}
          animate={isProcessing ? { boxShadow: ["0 0 0 rgba(0,212,255,0.3)", "0 0 32px rgba(0,212,255,0.3)", "0 0 0 rgba(0,212,255,0.3)"] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <BarChart2 className="w-8 h-8" style={{ color: "#00D4FF" }} />
        </motion.div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "16px", color: "#C8D4E8", letterSpacing: "0.04em" }}>
          {isProcessing ? "Synthesizing Answer…" : "Ready for Query"}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#6B7A9F", marginTop: 6 }}>
          {isProcessing ? "Visualization adapts to active engine" : "Select an engine or run a query"}
        </div>
      </div>
    </div>
  );
}

const ENGINE_VIEWS: Record<string, () => JSX.Element> = {
  margin: () => <MarginView />,
  demand: () => <DemandView />,
  stockout: () => <StockoutView />,
  customer: () => <CustomerView />,
};

export function AnswerVisualization({ activeEngine, isProcessing, currentStep }: AnswerVisualizationProps) {
  const [displayEngine, setDisplayEngine] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep >= 9 && activeEngine) {
      setDisplayEngine(activeEngine);
    } else if (!isProcessing && !activeEngine) {
      setDisplayEngine(null);
    }
  }, [currentStep, isProcessing, activeEngine]);

  const View = displayEngine ? ENGINE_VIEWS[displayEngine] : null;

  return (
    <div
      className="h-56 border-t flex-shrink-0"
      style={{ background: "rgba(8,12,28,0.85)", borderColor: "rgba(0,212,255,0.1)" }}
    >
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.12em", color: "#6B7A9F" }}>
              ANSWER SYNTHESIS
            </span>
            {displayEngine && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#00D4FF", marginLeft: 12 }}>
                · {displayEngine.toUpperCase()} ENGINE
              </span>
            )}
          </div>
          {isProcessing && (
            <motion.div
              className="px-2 py-1 rounded"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#00D4FF" }}>GENERATING</span>
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayEngine || "default"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {View ? <View /> : <DefaultView isProcessing={isProcessing} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
