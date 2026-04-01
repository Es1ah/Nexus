"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Globe,
  Brain,
  Plus,
  ArrowUp,
  Settings,
  User,
  LayoutGrid,
  Sparkles,
  Search,
  MessageSquare,
} from "lucide-react";
import Ticker from "@/components/Ticker";
import CustomSelect from "@/components/CustomSelect";
import AgentLog from "@/components/AgentLog";
import Dashboard from "@/components/Dashboard";
import { REGIONS, SECTORS } from "@/lib/constants";
import type { NexusAuditResult } from "@/lib/types";

type AppPhase = "intake" | "processing" | "dashboard";

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>("intake");
  const [idea, setIdea] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");
  const [result, setResult] = useState<NexusAuditResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically load dashboard if returning from a subpage
    const storedResult = sessionStorage.getItem('nexus_audit_result');
    const storedIdea = sessionStorage.getItem('nexus_audit_idea');
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResult(parsed);
        if (storedIdea) setIdea(storedIdea);
        setPhase("dashboard");
      } catch (e) {
        console.error("Failed to parse stored result", e);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!idea.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setPhase("processing");
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          region: REGIONS.find((r) => r.value === region)?.label || "Lagos, Nigeria",
          sector: SECTORS.find((s) => s.value === sector)?.label || "General",
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nexus_audit_result', JSON.stringify(data));
        sessionStorage.setItem('nexus_audit_idea', idea);
      }
    } catch (err: any) {
      console.error("Audit UI Error:", err);
      setError(err.message || "Failed to generate report. Neural link severed.");
      setPhase("intake");
    }
    setIsSubmitting(false);
  };

  const handleProcessingComplete = () => {
    if (result) setPhase("dashboard");
  };

  const handleRestart = () => {
    setPhase("intake");
    setIdea("");
    setRegion("");
    setSector("");
    setResult(null);
    setError(null);
    sessionStorage.removeItem('nexus_audit_result');
    sessionStorage.removeItem('nexus_audit_idea');
  };

  return (
    <div className={`min-h-screen ${phase === "intake" ? "bg-background" : "bg-background"} transition-colors duration-500 font-sans`}>
      <AnimatePresence mode="wait">

        {/* ══════════════ INTAKE PHASE (Neo-Brutalist) ══════════════ */}
        {phase === "intake" && (
          <motion.div
            key="intake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col min-h-screen grid-pattern"
          >
            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b-[4px] border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 border-[3px] border-black flex items-center gap-2 text-sm font-black bg-accent shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <Zap size={20} fill="black" />
                    <span className="font-heading text-2xl uppercase tracking-tighter">Nexus</span>
                    <span className="text-[10px] bg-black text-white px-1.5 py-0.5 font-mono">v1.2</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {result && (
                  <button
                    onClick={() => window.location.href = '/chat'}
                    className="bg-accent border-[3px] border-black px-6 py-2 text-sm font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-2"
                  >
                    Truth Chat <MessageSquare size={16} />
                  </button>
                )}
                <button
                  onClick={() => document.getElementById('chat-input-box')?.focus()}
                  className="bg-accent-secondary text-white border-[3px] border-black px-6 py-2 text-sm font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-2"
                >
                  Analyze <ArrowUp size={16} className="rotate-45" />
                </button>
                <div className="w-10 h-10 border-[3px] border-black bg-white flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <User size={20} />
                </div>
              </div>
            </nav>

            {/* Ticker */}
            <div className="border-b-[4px] border-black">
              <Ticker />
            </div>

            {/* Main Content (Centered) */}
            <main className="flex-1 flex flex-col items-center pt-20 px-6 pb-60 relative">
              {/* Background Shapes */}
              <div className="absolute top-20 left-10 w-32 h-32 border-[4px] border-black bg-accent-secondary rotate-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)] pointer-events-none" />
              <div className="absolute bottom-40 right-10 w-40 h-40 border-[4px] border-black bg-accent -rotate-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] pointer-events-none rounded-full" />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center z-10 mb-16"
              >
                <div className="w-28 h-28 border-[4px] border-black bg-accent flex items-center justify-center mb-10 mx-auto shadow-[12px_12px_0_0_rgba(0,0,0,1)] -rotate-3">
                  <Zap size={60} fill="black" />
                </div>
                <h1 className="font-heading text-[clamp(2.5rem,8vw,5rem)] text-black mb-6 leading-[0.9] font-black uppercase">
                  Uncover <br /> <span className="bg-accent px-4 py-2 border-[4px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] inline-block my-2">The Truth</span> <br /> Behind Build.
                </h1>
                <p className="text-black/70 font-bold text-xl max-w-xl mx-auto uppercase tracking-tight bg-white border-[3px] border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] mt-8">
                  Autonomous market intelligence <br /> for African startup founders.
                </p>
              </motion.div>

              {/* Chat Input Bar (Redesigned like Image 2 - Now in flow) */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-3xl flex flex-col items-center z-20 mb-32"
              >
                {error && (
                  <div className="w-full mb-4 p-4 bg-danger text-white border-[3px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] font-black uppercase tracking-tighter text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="underline hover:text-black">Dismiss</button>
                  </div>
                )}

                <div className="w-full bg-white border-[4px] border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row items-stretch">
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-black text-black uppercase tracking-tighter border-b-[3px] border-accent">
                        ENTER STRATEGY DESCRIPTION
                      </span>
                      <Sparkles size={14} fill="currentColor" className="text-accent-secondary" />
                    </div>

                    <div className="relative">
                      <textarea
                        id="chat-input-box"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="e.g. A marketplace for artisanal fabrics in Lagos..."
                        className="w-full bg-white border-[3px] border-black/10 p-4 text-xl font-bold focus:border-black focus:outline-none resize-none leading-tight min-h-[140px] placeholder:text-black/10 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (idea) handleSubmit();
                          }
                        }}
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex gap-3">
                        <CustomSelect id="region-mini" label="" options={REGIONS} value={region} onChange={setRegion} placeholder="REGION" className="!bg-white !border-[3px] !border-black !rounded-none !py-2 !px-4 !text-[11px] !text-black !font-black !shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
                        <CustomSelect id="sector-mini" label="" options={SECTORS} value={sector} onChange={setSector} placeholder="SECTOR" className="!bg-white !border-[3px] !border-black !rounded-none !py-2 !px-4 !text-[11px] !text-black !font-black !shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
                      </div>
                    </div>
                  </div>

                  {/* Send Button Box */}
                  <button
                    onClick={handleSubmit}
                    disabled={!idea.trim() || isSubmitting}
                    className={`md:w-32 flex flex-col items-center justify-center p-4 transition-all border-l-[4px] border-black ${idea.trim() ? "bg-accent hover:bg-accent-dim active:translate-x-[2px] active:translate-y-[2px]" : "bg-black/5"}`}
                  >
                    {isSubmitting ? (
                      <div className="w-8 h-8 border-[4px] border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-3">
                          <ArrowUp size={32} className="rotate-90" />
                        </div>
                        <span className="text-[14px] font-black uppercase tracking-tighter">Execute</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              <div className="h-60 w-full" /> {/* Extra spacer for scroll */}
            </main>
          </motion.div>
        )}

        {/* ══════════════ PROCESSING PHASE ══════════════ */}
        {phase === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 flex items-center justify-center px-6"
          >
            <AgentLog onComplete={handleProcessingComplete} idea={idea} />
          </motion.div>
        )}

        {/* ══════════════ DASHBOARD PHASE ══════════════ */}
        {phase === "dashboard" && result && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 overflow-y-auto"
          >
            <Dashboard result={result} idea={idea} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
