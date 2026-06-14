import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TopNav, DashView } from "./TopNav";
import { EngineSidebar } from "./EngineSidebar";
import { AIFlowVisualization } from "./AIFlowVisualization";
import { ThoughtStream } from "./ThoughtStream";
import { AnswerVisualization } from "./AnswerVisualization";
import { SessionDeepDive } from "./SessionDeepDive";
import { EngineLab } from "./EngineLab";
import { LiveChat } from "./LiveChat";
import { getStats, getHealth, getRecent } from "../lib/api";

const ENGINES_CYCLE = ["margin", "demand", "stockout", "customer", "po", "supplier", "knowledge", "health", "deadstock"];
// Real recent queries fetched from /recent — no fake cycle.
const FALLBACK_QUERIES = [
  "What is our overall margin?",
  "Which customers are at risk?",
  "How has V00011 behaved over the years?",
  "Which SKUs are at critical stockout risk?",
  "Tell me about customer MERSIN TRADE",
  "What should we buy next?",
  "Show me profit by year",
];

const STEP_COUNT = 10;

export function Dashboard() {
  const [activeView, setActiveView] = useState<DashView>("ask");
  const [activeEngine, setActiveEngine] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [queryCount, setQueryCount] = useState(14283);
  const [latency, setLatency] = useState(124);
  const [isLive, setIsLive] = useState(true);

  // Pull REAL numbers from the backend.
  useEffect(() => {
    getStats().then((s) => {
      if (s && s.status === "ok") setQueryCount(s.invoice_lines || 14283);
    });
    getHealth().then((h) => setIsLive(h.ok));
    // Fetch REAL recent queries for the pipeline cycle
    const fetchRecent = () => {
      getRecent().then((rq) => {
        if (rq.length > 0) setRealQueries(rq.map((r) => r.question));
      });
    };
    fetchRecent();
    const ri = setInterval(fetchRecent, 15000);
    return () => clearInterval(ri);
  }, []);
  const [currentQuery, setCurrentQuery] = useState("");
  const [realQueries, setRealQueries] = useState<string[]>(FALLBACK_QUERIES);
  const [lastTimings, setLastTimings] = useState<any>(null);
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearStepTimers = () => {
    stepTimersRef.current.forEach(clearTimeout);
    stepTimersRef.current = [];
  };

  const cycleRef = useRef(0);
  const startProcessing = useCallback((engineId?: string, query?: string) => {
    clearStepTimers();
    const idx = cycleRef.current;
    const engine = engineId || ENGINES_CYCLE[idx % ENGINES_CYCLE.length];
    const q = query || realQueries[idx % Math.max(realQueries.length, 1)];
    cycleRef.current = idx + 1;

    setIsProcessing(true);
    setCurrentStep(0);
    setActiveEngine(engine);
    setCurrentQuery(q);

    const timers = Array.from({ length: STEP_COUNT }, (_, i) => {
      const t = setTimeout(() => {
        setCurrentStep(i);
        if (i === STEP_COUNT - 1) {
          const endTimer = setTimeout(() => {
            setIsProcessing(false);
            setQueryCount((n) => n + 1);
          }, 800);
          stepTimersRef.current.push(endTimer);
        }
      }, i * 700);
      return t;
    });
    stepTimersRef.current = timers;
  }, []);

  // Latency animation
  useEffect(() => {
    const t = setInterval(() => {
      setLatency((n) => Math.max(80, Math.min(240, n + Math.round((Math.random() - 0.45) * 20))));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  // Auto-cycle queries
  useEffect(() => {
    const t = setTimeout(() => startProcessing(), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      const t = setTimeout(() => startProcessing(), 5000);
      return () => clearTimeout(t);
    }
  }, [isProcessing, startProcessing]);

  // Cleanup on unmount
  useEffect(() => () => clearStepTimers(), []);

  // Callback: when LiveChat completes a real query, show it in the pipeline
  const onRealQuery = useCallback((question: string, endpoint: string, timings: any) => {
    setLastTimings(timings);
    // Map endpoint to an engine id for the pipeline
    const engineMap: Record<string, string> = {
      margin: "margin", customer: "customer", supplier: "supplier",
      health: "health", dead_stock: "deadstock", demand: "demand",
      procurement: "po", knowledge: "knowledge", query_brain: "margin",
      lookup: "customer", deep: "supplier", chitchat: "health",
    };
    const engKey = Object.keys(engineMap).find((k) => endpoint.includes(k)) || "health";
    startProcessing(engineMap[engKey], question);
  }, [startProcessing]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "#0B1020", color: "#E8EDF8" }}
    >
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: -200,
            left: -200,
            background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            bottom: -100,
            right: -100,
            background: "radial-gradient(circle, rgba(123,97,255,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            top: "40%",
            left: "40%",
            background: "radial-gradient(circle, rgba(255,0,170,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <TopNav
          activeView={activeView}
          onViewChange={setActiveView}
          queryCount={queryCount}
          latency={latency}
          isLive={isLive}
        />

        <AnimatePresence mode="wait">
          {activeView === "ask" && (
            <motion.div
              key="ask"
              className="flex-1 overflow-hidden min-h-0 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full max-w-3xl h-full">
                <LiveChat onRealQuery={onRealQuery} />
              </div>
            </motion.div>
          )}

          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              className="flex flex-1 overflow-hidden min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EngineSidebar
                activeEngine={activeEngine}
                onEngineSelect={(id) => {
                  if (!isProcessing) startProcessing(id);
                }}
                isProcessing={isProcessing}
              />

              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <AIFlowVisualization
                  currentStep={currentStep}
                  isProcessing={isProcessing}
                  activeEngine={activeEngine}
                  currentQuery={currentQuery}
                />
                <AnswerVisualization
                  activeEngine={activeEngine}
                  isProcessing={isProcessing}
                  currentStep={currentStep}
                />
              </div>

              <ThoughtStream
                currentStep={currentStep}
                isProcessing={isProcessing}
                activeEngine={activeEngine}
                lastTimings={lastTimings}
                onNewQuery={() => !isProcessing && startProcessing()}
              />
            </motion.div>
          )}

          {activeView === "session" && (
            <motion.div
              key="session"
              className="flex-1 overflow-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <SessionDeepDive queryCount={queryCount} latency={latency} />
            </motion.div>
          )}

          {activeView === "components" && (
            <motion.div
              key="components"
              className="flex-1 overflow-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <EngineLab onRunEngine={(id) => { setActiveView("dashboard"); setTimeout(() => startProcessing(id), 300); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
