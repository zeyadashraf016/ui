import { Activity, Database, Cpu, Cloud, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function TopNavigation() {
  const [isDark, setIsDark] = useState(true);

  const statusItems = [
    { label: "API Online", icon: Activity, color: "emerald" },
    { label: "SQLite Connected", icon: Database, color: "blue" },
    { label: "Ollama qwen3:14b Ready", icon: Cpu, color: "purple" },
    { label: "Cloudflare Tunnel Active", icon: Cloud, color: "cyan" },
  ];

  return (
    <nav className="h-20 border-b border-white/10 backdrop-blur-xl bg-white/5">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - Logo & Status */}
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              ELIARA
            </h1>
            <p className="text-xs text-white/50 mt-0.5">AI Supply Chain Intelligence Platform</p>
          </div>

          <div className="flex items-center gap-4">
            {statusItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full bg-${item.color}-400`} />
                  <motion.div
                    className={`absolute inset-0 w-2 h-2 rounded-full bg-${item.color}-400`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <item.icon className="w-3 h-3 text-white/50" />
                <span className="text-xs text-white/70">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(34, 211, 238, 0.3)",
                "0 0 30px rgba(34, 211, 238, 0.5)",
                "0 0 20px rgba(34, 211, 238, 0.3)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-300">Live Session</span>
          </motion.div>
        </div>

        {/* Right - Session Info */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-white/50">Session ID</div>
            <div className="text-sm font-mono text-white/80">ELR-2026-0609-X7K</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50">Latency</div>
            <div className="text-sm font-mono text-emerald-400">42ms</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50">Active Engines</div>
            <div className="text-sm font-bold text-white/90">9 Engines</div>
          </div>
          
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
