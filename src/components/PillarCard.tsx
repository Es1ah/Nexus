"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ShieldCheck,
    BarChart3,
    Wrench,
    Users,
    ChevronDown,
} from "lucide-react";
import type { PillarResult } from "@/lib/types";

const pillarConfig: Record<
    string,
    {
        icon: React.ReactNode;
        color: string;
        bgColor: string;
    }
> = {
    marketHunger: {
        icon: <Search size={24} />,
        color: "#000000",
        bgColor: "#bef264",
    },
    regulatoryRadar: {
        icon: <ShieldCheck size={24} />,
        color: "#ffffff",
        bgColor: "#ff6b00",
    },
    competitiveGaps: {
        icon: <BarChart3 size={24} />,
        color: "#000000",
        bgColor: "#3affa0",
    },
    resourceBlueprint: {
        icon: <Wrench size={24} />,
        color: "#ffffff",
        bgColor: "#000000",
    },
    trustAnchors: {
        icon: <Users size={24} />,
        color: "#000000",
        bgColor: "#fbbf24",
    },
    competitiveLandscape: {
        icon: <BarChart3 size={24} />,
        color: "#ffffff",
        bgColor: "#9333ea",
    },
};

interface PillarCardProps {
    pillarKey: string;
    data: PillarResult;
    index: number;
}

export default function PillarCard({ pillarKey, data, index }: PillarCardProps) {
    const [expanded, setExpanded] = useState(false);
    const config = pillarConfig[pillarKey] || pillarConfig.marketHunger;

    const getScoreBarWidth = (score: number) => `${score}%`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            className="p-6 border-[4px] border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer group"
            onClick={() => {
                if (pillarKey === 'competitiveLandscape') {
                    window.location.href = '/competitors';
                } else {
                    setExpanded(!expanded);
                }
            }}
            id={`pillar-${pillarKey}`}
        >
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] -rotate-3 group-hover:rotate-0 transition-transform"
                            style={{ background: config.bgColor, color: config.color }}
                        >
                            {config.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-black uppercase tracking-tighter">{data.name}</h3>
                            <p className="text-[10px] font-mono text-black/40 uppercase mt-0.5">{data.icon} MODULE</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black text-white px-3 py-1 border-[2px] border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                        <span className="text-2xl font-black text-accent">{data.score}%</span>
                    </div>
                </div>

                {/* Score Bar */}
                <div className="h-6 bg-black/5 border-[3px] border-black overflow-hidden mb-6 relative">
                    <motion.div
                        className="h-full bg-black"
                        initial={{ width: 0 }}
                        animate={{ width: getScoreBarWidth(data.score) }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-[1px] bg-white/20" />
                    </div>
                </div>

                {/* Summary */}
                <p className="text-base text-black font-bold leading-tight uppercase tracking-tight mb-4">{data.summary}</p>

                {data.sourceUrl && (
                    <div className="mb-4">
                        <a
                            href={data.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] font-black text-white bg-black px-2 py-0.5 uppercase hover:bg-accent hover:text-black transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            VERIFY_PILLAR_DATA ↗
                        </a>
                    </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-border space-y-2.5">
                                {data.details.map((detail, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 text-sm border-l-[4px] border-black pl-4 py-1 bg-black/5"
                                    >
                                        <span className="text-black font-bold">{detail}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
