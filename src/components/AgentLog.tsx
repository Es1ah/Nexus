"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AGENT_STEPS } from "@/lib/constants";
import {
    Search,
    ShieldCheck,
    BarChart3,
    Wrench,
    Users,
    CheckCircle2,
    Loader2,
    Terminal,
    Brain,
    Zap,
    FileText,
} from "lucide-react";

interface AgentLogProps {
    onComplete: () => void;
    idea: string;
}

const agentIcons: Record<string, React.ReactNode> = {
    "Market Intelligence": <Search size={16} />,
    "Regulatory Scanner": <ShieldCheck size={16} />,
    "Competitive Analyst": <BarChart3 size={16} />,
    "Resource Mapper": <Wrench size={16} />,
    "Trust Network": <Users size={16} />,
    "Research Librarian": <FileText size={16} />,
    "Truth Engine": <Zap size={16} />,
};

interface LogEntry {
    id: number;
    agent: string;
    message: string;
    status: "running" | "complete";
}

export default function AgentLog({ onComplete, idea }: AgentLogProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [currentAgent, setCurrentAgent] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const logEndRef = useRef<HTMLDivElement>(null);
    const idCounter = useRef(0);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    useEffect(() => {
        const totalMessages = AGENT_STEPS.reduce((acc, s) => acc + s.messages.length, 0);
        let completedMessages = 0;

        for (let i = 0; i < currentAgent; i++) {
            completedMessages += AGENT_STEPS[i].messages.length;
        }
        completedMessages += currentMessage;

        setOverallProgress(Math.min((completedMessages / totalMessages) * 100, 100));
    }, [currentAgent, currentMessage]);

    useEffect(() => {
        if (currentAgent >= AGENT_STEPS.length) {
            setTimeout(() => onComplete(), 800);
            return;
        }

        const step = AGENT_STEPS[currentAgent];

        if (currentMessage >= step.messages.length) {
            // Mark last log as complete
            setLogs((prev) => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = { ...updated[updated.length - 1], status: "complete" };
                }
                return updated;
            });

            setTimeout(() => {
                setCurrentAgent((prev) => prev + 1);
                setCurrentMessage(0);
            }, 400);
            return;
        }

        const newId = idCounter.current++;

        // Mark previous as complete and add new
        setLogs((prev) => {
            const updated = prev.map((log) =>
                log.status === "running" ? { ...log, status: "complete" as const } : log
            );
            return [
                ...updated,
                {
                    id: newId,
                    agent: step.agent,
                    message: step.messages[currentMessage],
                    status: "running" as const,
                },
            ];
        });

        const delay = 600 + Math.random() * 800;
        const timer = setTimeout(() => {
            setCurrentMessage((prev) => prev + 1);
        }, delay);

        return () => clearTimeout(timer);
    }, [currentAgent, currentMessage, onComplete]);

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
            >
                <div className="w-14 h-14 border-[4px] border-black bg-accent flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] -rotate-6">
                    <Brain size={28} fill="black" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-black uppercase tracking-tighter">
                        Nexus Engine v1.2
                    </h2>
                    <p className="text-sm font-bold text-black/40 uppercase tracking-widest">
                        Scanning: &quot;{idea.substring(0, 40)}{idea.length > 40 ? "..." : ""}&quot;
                    </p>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-10 p-4 border-[3px] border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-black tracking-widest uppercase">
                        Core System Sync
                    </span>
                    <span className="text-sm font-mono font-black text-black bg-accent px-2">
                        {Math.round(overallProgress)}%
                    </span>
                </div>
                <div className="h-6 bg-black/5 border-[2px] border-black overflow-hidden relative">
                    <motion.div
                        className="h-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-[1px] bg-black/10" />
                    </div>
                </div>
            </div>

            {/* Agent Status Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
                {AGENT_STEPS.map((step, i) => {
                    const isActive = i === currentAgent;
                    const isComplete = i < currentAgent;

                    return (
                        <div
                            key={step.agent}
                            className={`flex flex-col items-center gap-2 p-3 border-[3px] transition-all duration-300 ${isActive
                                ? "border-black bg-accent shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-1 -translate-y-1"
                                : isComplete
                                    ? "border-black bg-black text-white"
                                    : "border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] opacity-40"
                                }`}
                        >
                            <div
                                className={`${isActive
                                    ? "text-black"
                                    : isComplete
                                        ? "text-accent"
                                        : "text-black/40"
                                    }`}
                            >
                                {isComplete ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    agentIcons[step.agent]
                                )}
                            </div>
                            <span
                                className={`text-[9px] font-black text-center uppercase leading-[1.1] ${isActive
                                    ? "text-black"
                                    : isComplete
                                        ? "text-white"
                                        : "text-black/40"
                                    }`}
                            >
                                {step.agent}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Terminal Log */}
            <div className="border-[4px] border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b-[4px] border-black bg-black text-white uppercase font-black tracking-widest text-[10px]">
                    <Terminal size={14} className="text-accent" />
                    <span>Live Intelligence Stream</span>
                    <div className="flex-1" />
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 border-2 border-white bg-danger" />
                        <div className="w-3 h-3 border-2 border-white bg-warning" />
                        <div className="w-3 h-3 border-2 border-white bg-accent" />
                    </div>
                </div>

                <div className="p-6 max-h-80 overflow-y-auto font-mono text-[11px] space-y-2 bg-[#fafafa]">
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-start gap-3 border-l-2 border-black/5 pl-2"
                        >
                            {log.status === "running" ? (
                                <Loader2 size={14} className="text-black animate-spin mt-0.5 flex-shrink-0" />
                            ) : (
                                <CheckCircle2 size={14} className="text-accent mt-0.5 flex-shrink-0" />
                            )}
                            <span className="font-black bg-black text-white px-1 h-fit uppercase text-[9px] mt-0.5">[{log.agent}]</span>
                            <span
                                className={
                                    log.status === "running" ? "text-black font-bold" : "text-black/50"
                                }
                            >
                                {log.message}
                            </span>
                        </motion.div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
}
