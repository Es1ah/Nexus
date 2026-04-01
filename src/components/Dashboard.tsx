"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    RotateCcw,
    ArrowRight,
    Quote,
    User,
    ThumbsUp,
    ThumbsDown,
    Lightbulb,
    Download,
    Share2,
    MessageCircle,
    X,
} from "lucide-react";
import SurvivalScore from "@/components/SurvivalScore";
import PillarCard from "@/components/PillarCard";
import SourceReportSection from "@/components/SourceReportSection";
import type { NexusAuditResult } from "@/lib/types";
import { downloadNexusReport } from "@/lib/report-generator";

interface DashboardProps {
    result: NexusAuditResult;
    idea: string;
    onRestart: () => void;
}

export default function Dashboard({ result, idea, onRestart }: DashboardProps) {
    const [activePersonaChat, setActivePersonaChat] = useState<{ name: string; role: string; reaction: string } | null>(null);
    const [chatHistories, setChatHistories] = useState<Record<string, { role: 'user' | 'assistant', content: string }[]>>({});
    const [isThinking, setIsThinking] = useState(false);

    // Load histories from session storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('nexus_persona_chats');
            if (saved) {
                try {
                    setChatHistories(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to load chat histories", e);
                }
            }
        }
    }, []);

    // Save histories to session storage
    useEffect(() => {
        if (typeof window !== 'undefined' && Object.keys(chatHistories).length > 0) {
            sessionStorage.setItem('nexus_persona_chats', JSON.stringify(chatHistories));
        }
    }, [chatHistories]);

    const currentChat = activePersonaChat ? (chatHistories[activePersonaChat.name] || []) : [];

    if (!result || !result.pillars) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <span className="text-2xl font-black uppercase">Data Engine Error</span>
                <button onClick={onRestart} className="btn-brutalist">Restart</button>
            </div>
        );
    }

    const pillarEntries = Object.entries(result.pillars);
    const avgScore =
        pillarEntries.length > 0
            ? pillarEntries.reduce((acc, [, p]) => acc + (p?.score || 0), 0) / pillarEntries.length
            : 0;

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <div className="border-b-[4px] border-black bg-white sticky top-0 z-50 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-black p-1 border border-black group">
                            <Zap size={20} className="text-accent group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-xl font-black text-black uppercase tracking-tighter">Nexus</span>
                        {result.isSimulated && (
                            <span className="text-[10px] font-black text-white bg-danger px-2 py-0.5 ml-2 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] animate-pulse">
                                SIMULATION_MODE: AI_LINK_OFFLINE
                            </span>
                        )}
                        <span className="text-[10px] font-mono text-white bg-black px-2 py-0.5 ml-2">
                            TRUTH REPORT V1.0
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/chat'}
                            className="flex items-center gap-2 px-4 py-2 border-[3px] border-black text-xs font-black uppercase bg-accent hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                        >
                            <MessageCircle size={14} />
                            Truth Chat
                        </button>
                        <button
                            onClick={onRestart}
                            className="flex items-center gap-2 px-4 py-2 border-[3px] border-black text-xs font-black uppercase bg-white hover:bg-black hover:text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                        >
                            <RotateCcw size={14} />
                            Reset
                        </button>
                        <button
                            onClick={() => downloadNexusReport(result, idea)}
                            className="flex items-center gap-2 px-4 py-2 border-[3px] border-black text-xs font-black uppercase bg-accent-secondary text-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                        >
                            <Download size={14} />
                            Download
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Hero: Score + Verdict */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Survival Score */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-1 flex flex-col items-center justify-center p-8 border-[4px] border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
                    >
                        <SurvivalScore score={result.survivalScore} />
                    </motion.div>

                    {/* Verdict + Idea */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="lg:col-span-2 flex flex-col gap-6"
                    >
                        {/* Idea Card */}
                        <div className="p-6 border-[3px] border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                            <span className="text-xs font-black text-black tracking-tighter uppercase bg-accent px-2 py-0.5 border border-black inline-block mb-3">
                                ANALYZED STRATEGY
                            </span>
                            <p className="text-2xl text-black font-black leading-tight">
                                &quot;{idea}&quot;
                            </p>
                        </div>

                        {/* Verdict */}
                        <div className="p-6 border-[3px] border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 bg-black text-white text-[10px] font-mono">NX-V3</div>
                            <span className="text-xs font-black text-black tracking-tighter uppercase border-b-2 border-accent-secondary inline-block mb-3">
                                EXECUTIVE VERDICT
                            </span>
                            <p className="text-base text-black font-bold leading-relaxed">
                                {result.verdict}
                            </p>
                        </div>

                        {/* Score Summary Bar */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 border-[3px] border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center group hover:bg-accent transition-colors">
                                <span className="text-4xl font-black text-black">
                                    {result.survivalScore}%
                                </span>
                                <p className="text-[10px] text-black font-black uppercase mt-1 tracking-widest">Global Rank</p>
                            </div>
                            <div className="p-4 border-[3px] border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center group hover:bg-accent-secondary hover:text-white transition-colors">
                                <span className="text-4xl font-black">
                                    {Math.round(avgScore)}%
                                </span>
                                <p className="text-[10px] font-black uppercase mt-1 tracking-widest">Pillar Mean</p>
                            </div>
                            <div className="p-4 border-[3px] border-black bg-black text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-center">
                                <span className="text-4xl font-black text-accent">
                                    {result.syntheticPersonas.filter((p) => p.wouldUse).length}/
                                    {result.syntheticPersonas.length}
                                </span>
                                <p className="text-[10px] font-black uppercase mt-1 tracking-widest text-white/60">Persona Adoption</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Immediate Move */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-12"
                    id="immediate-move"
                >
                    <div
                        className="p-8 border-[6px] border-black bg-white shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative"
                    >
                        <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[12px] font-black uppercase">Urgent Action</div>
                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 border-[4px] border-black bg-accent flex items-center justify-center flex-shrink-0 -rotate-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                                <Lightbulb size={32} fill="black" />
                            </div>
                            <div className="flex-1 pt-2">
                                <h3 className="text-xl font-black text-black tracking-tight uppercase mb-4 scale-y-110 origin-left">
                                    Immediate Move — Priority Alpha
                                </h3>
                                <p className="text-xl text-black font-bold leading-tight border-l-[6px] border-black pl-6 py-2">
                                    {result.immediateMove}
                                </p>
                            </div>
                            <div className="bg-black p-4 text-white hover:bg-accent hover:text-black transition-colors pointer-events-none mt-4">
                                <ArrowRight size={24} strokeWidth={3} />
                            </div>
                        </div>

                        {/* Pivot Suggestion */}
                        {result.pivotSuggestion && (
                            <div className="mt-8 pt-6 border-t-[4px] border-black border-dashed">
                                <p className="text-sm font-black text-black uppercase tracking-widest bg-accent-secondary text-white inline-block px-3 py-1 mb-3">
                                    Strategic Pivot Suggestion
                                </p>
                                <p className="text-lg text-black font-bold leading-relaxed max-w-4xl">
                                    {result.pivotSuggestion}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 5 Pillar Cards */}
                <div className="mb-16">
                    <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                        Survival Pillars
                    </h2>
                    <p className="text-sm font-bold text-black/50 mb-8 uppercase tracking-widest bg-black/5 inline-block px-2">
                        Deep stress-test analysis of your market fit
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pillarEntries.map(([key, pillar], index) => (
                            <PillarCard
                                key={key}
                                pillarKey={key}
                                data={pillar}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                {/* Agent Intelligence Reports */}
                <div className="mb-12">
                    <SourceReportSection sourceReports={result.sourceReports} idea={idea} onDownloadReport={() => downloadNexusReport(result, idea)} />
                </div>

                {/* Synthetic Personas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mb-16"
                    id="synthetic-personas"
                >
                    <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                        Synthetic Personas
                    </h2>
                    <p className="text-sm font-bold text-black/50 mb-8 uppercase tracking-widest bg-black/5 inline-block px-2">
                        Simulated user reactions based on local market data
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {result.syntheticPersonas.map((persona, i) => (
                            <motion.div
                                key={persona.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                                className="p-6 border-[3px] border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 border-[3px] border-black bg-white flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-black uppercase tracking-tighter">
                                            {persona.name}
                                        </h4>
                                        <p className="text-xs font-bold text-black/40 uppercase tracking-widest">{persona.role}</p>
                                    </div>
                                    <div
                                        className={`w-10 h-10 border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${persona.wouldUse
                                            ? "bg-accent"
                                            : "bg-danger text-white"
                                            }`}
                                    >
                                        {persona.wouldUse ? (
                                            <ThumbsUp size={18} fill="currentColor" />
                                        ) : (
                                            <ThumbsDown size={18} fill="currentColor" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-black/5 p-4 border-l-[4px] border-black italic mb-6">
                                    <Quote size={20} fill="black" className="text-black/20 flex-shrink-0" />
                                    <p className="text-sm text-black font-bold leading-tight">
                                        {persona.reaction}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setActivePersonaChat(persona);
                                        if (!chatHistories[persona.name]) {
                                            setChatHistories(prev => ({
                                                ...prev,
                                                [persona.name]: [{ role: 'assistant', content: `Hello! I'm ${persona.name}, a ${persona.role}. Ask me anything about your idea for ${idea}.` }]
                                            }));
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff6b00] border-[3px] border-black text-white font-black uppercase tracking-tighter shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all"
                                >
                                    <MessageCircle size={18} fill="white" />
                                    Chat with {(persona.name || "Agent").split(' ')[0]}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Persona Chat Overlay */}
                <AnimatePresence>
                    {activePersonaChat && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setActivePersonaChat(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-2xl bg-white border-[6px] border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] flex flex-col max-h-[80vh]"
                            >
                                <div className="p-6 border-b-[4px] border-black bg-accent flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 border-[3px] border-black bg-white flex items-center justify-center">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-black uppercase tracking-tighter text-xl">{activePersonaChat.name}</h3>
                                            <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">{activePersonaChat.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActivePersonaChat(null)} className="p-2 border-[3px] border-black bg-white hover:bg-black hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/5">
                                    {currentChat.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-4 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                                <p className="text-sm font-bold leading-tight">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && (
                                        <div className="flex justify-start">
                                            <div className="p-4 border-[3px] border-black bg-black text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t-[4px] border-black bg-white">
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            const input = (e.target as any).message.value;
                                            if (!input || isThinking) return;

                                            const newUserMsg = { role: 'user', content: input } as const;
                                            const updatedHistory = [...currentChat, newUserMsg];

                                            setChatHistories(prev => ({
                                                ...prev,
                                                [activePersonaChat!.name]: updatedHistory
                                            }));

                                            (e.target as any).message.value = '';
                                            setIsThinking(true);

                                            try {
                                                const response = await fetch('/api/chat', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        persona: activePersonaChat,
                                                        idea,
                                                        message: input,
                                                        history: currentChat, // Send current history
                                                        fullAudit: result
                                                    })
                                                });
                                                const data = await response.json();

                                                setChatHistories(prev => ({
                                                    ...prev,
                                                    [activePersonaChat!.name]: [...updatedHistory, { role: 'assistant', content: data.reply }]
                                                }));
                                            } catch (err) {
                                                setChatHistories(prev => ({
                                                    ...prev,
                                                    [activePersonaChat!.name]: [...updatedHistory, { role: 'assistant', content: "Something went wrong. My neural link is unstable." }]
                                                }));
                                            } finally {
                                                setIsThinking(false);
                                            }
                                        }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            name="message"
                                            placeholder={`Ask ${(activePersonaChat.name || "Agent").split(' ')[0]} a question...`}
                                            className="flex-1 border-[3px] border-black px-4 py-2 font-bold focus:outline-none focus:bg-accent/10"
                                            autoFocus
                                        />
                                        <button className="px-6 py-2 bg-black text-white border-[3px] border-black font-black uppercase hover:bg-accent hover:text-black transition-colors">
                                            Ask
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-center py-20 border-t-[4px] border-black mt-12 bg-accent/20"
                >
                    <h3 className="text-4xl font-black text-black mb-4 uppercase tracking-tighter">
                        READY TO ITERATE?
                    </h3>
                    <p className="text-black font-bold mb-8 uppercase tracking-tight">
                        Refine your strategy and run another audit.
                    </p>
                    <button
                        onClick={onRestart}
                        className="btn-brutalist px-12 py-4 text-lg"
                    >
                        <RotateCcw size={20} />
                        Run New Audit
                    </button>
                </motion.div>

                {/* Footer */}
                <footer className="border-t border-border py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-accent" />
                            <span className="text-xs font-semibold text-text-primary">
                                Nexus
                            </span>
                            <span className="text-xs text-text-tertiary">
                                — Truth Report generated{" "}
                                {new Date(result.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <span className="text-xs text-text-tertiary">
                            &copy; {new Date().getFullYear()} Nexus. Built for African founders.
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
