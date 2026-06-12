import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Activity, Zap, Brain, Shield, Clock, ChevronDown, Search, Bell, Settings } from "lucide-react";

export type DashView = "ask" | "dashboard" | "session" | "components";

interface TopNavProps {
  activeView: DashView;
  onViewChange: (v: DashView) => void;
  queryCount: number;
  latency: number;
  isLive: boolean;
}

const views: { id: DashView; label: string }[] = [
  { id: "ask", label: "Ask Eliara" },
  { id: "dashboard", label: "Live Command" },
  { id: "session", label: "Session Dive" },
  { id: "components", label: "Engine Lab" },
];

export function TopNav({ activeView, onViewChange, queryCount, latency, isLive }: TopNavProps) {
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour12: false });
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <header
      className="relative flex items-center justify-between px-6 h-14 border-b z-50 flex-shrink-0"
      style={{
        background: "rgba(8, 12, 28, 0.95)",
        borderColor: "rgba(0, 212, 255, 0.15)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Bottom scan line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #00D4FF 30%, #7B61FF 70%, transparent)" }}
      />

      {/* Logo + Nav */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #7B61FF)",
                boxShadow: "0 0 16px rgba(0,212,255,0.5)",
              }}
            />
            <Brain className="absolute inset-0 m-auto w-4 h-4 text-white" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "0.12em",
                background: "linear-gradient(135deg, #00D4FF, #00FFE0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}
            >
              ELIARA
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                color: "#6B7A9F",
                letterSpacing: "0.15em",
                lineHeight: 1,
                marginTop: 3,
              }}
            >
              LIVE INTELLIGENCE
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className="relative px-3 py-1.5 rounded-md transition-all"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                letterSpacing: "0.06em",
                color: activeView === v.id ? "#00D4FF" : "#6B7A9F",
                background: activeView === v.id ? "rgba(0,212,255,0.08)" : "transparent",
              }}
            >
              {activeView === v.id && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-md"
                  style={{ border: "1px solid rgba(0,212,255,0.3)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {v.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Center metrics */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: isLive ? "#00FF94" : "#FF3B6B", boxShadow: isLive ? "0 0 8px #00FF94" : "0 0 8px #FF3B6B" }}
            />
            {isLive && (
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "#00FF94", opacity: 0.4 }} />
            )}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: isLive ? "#00FF94" : "#FF3B6B", letterSpacing: "0.1em" }}>
            {isLive ? "LIVE" : "IDLE"}
          </span>
        </div>

        <div className="w-px h-4" style={{ background: "rgba(0,212,255,0.15)" }} />

        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" style={{ color: "#00D4FF" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#A8B4CC" }}>
            {queryCount.toLocaleString()} <span style={{ color: "#6B7A9F" }}>queries</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" style={{ color: "#00FFE0" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#A8B4CC" }}>
            {latency}<span style={{ color: "#6B7A9F" }}>ms</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" style={{ color: "#7B61FF" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#A8B4CC" }}>
            99.97<span style={{ color: "#6B7A9F" }}>% up</span>
          </span>
        </div>

        <div className="w-px h-4" style={{ background: "rgba(0,212,255,0.15)" }} />

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" style={{ color: "#6B7A9F" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#E8EDF8" }}>
            {fmt(time)}&nbsp;
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#6B7A9F" }}>
            {fmtDate(time)}
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all" style={{ color: "#6B7A9F" }}>
          <Search className="w-4 h-4" />
        </button>
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all"
          style={{ color: "#6B7A9F" }}
          onClick={() => setNotifications(0)}
        >
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <div
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ fontSize: "9px", background: "#FF3B6B", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {notifications}
            </div>
          )}
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all" style={{ color: "#6B7A9F" }}>
          <Settings className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 ml-1 pl-3" style={{ borderLeft: "1px solid rgba(0,212,255,0.15)" }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00D4FF, #7B61FF)",
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: "11px",
              color: "#0B1020",
            }}
          >
            EL
          </div>
          <ChevronDown className="w-3 h-3" style={{ color: "#6B7A9F" }} />
        </div>
      </div>
    </header>
  );
}
