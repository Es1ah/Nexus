"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SurvivalScoreProps {
    score: number;
    size?: number;
}

export default function SurvivalScore({ score, size = 200 }: SurvivalScoreProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    const getScoreColor = (s: number) => {
        if (s >= 70) return { stroke: "#bef264", label: "HIGH VIABILITY" };
        if (s >= 40) return { stroke: "#fbbf24", label: "MODERATE RISK" };
        return { stroke: "#ef4444", label: "HIGH RISK" };
    };

    const { stroke, label } = getScoreColor(score);

    useEffect(() => {
        const timer = setTimeout(() => {
            const step = score / 60;
            let current = 0;
            const interval = setInterval(() => {
                current += step;
                if (current >= score) {
                    setAnimatedScore(score);
                    clearInterval(interval);
                } else {
                    setAnimatedScore(Math.floor(current));
                }
            }, 16);
            return () => clearInterval(interval);
        }, 300);

        return () => clearTimeout(timer);
    }, [score]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: size, height: size }}>


                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="score-ring"
                >
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="12"
                    />
                    {/* Score ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transition: "stroke-dashoffset 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        }}
                    />
                    {/* Tick marks */}
                    {Array.from({ length: 40 }).map((_, i) => {
                        const angle = (i * 360) / 40 - 90;
                        const rad = (angle * Math.PI) / 180;
                        const innerR = radius - 14;
                        const outerR = radius - 10;
                        return (
                            <line
                                key={i}
                                x1={size / 2 + innerR * Math.cos(rad)}
                                y1={size / 2 + innerR * Math.sin(rad)}
                                x2={size / 2 + outerR * Math.cos(rad)}
                                y2={size / 2 + outerR * Math.sin(rad)}
                                stroke="var(--border)"
                                strokeWidth="1"
                                opacity={i % 5 === 0 ? 0.5 : 0.2}
                            />
                        );
                    })}
                </svg>

                {/* Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-7xl font-black tracking-tighter text-black"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {animatedScore}
                    </motion.span>
                    <span className="text-xs font-black text-black/40 uppercase tracking-widest mt-[-8px]">Index Score</span>
                </div>
            </div>

            {/* Label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-2"
            >
                <span
                    className="text-xs font-black tracking-widest px-4 py-2 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] uppercase"
                    style={{
                        background: stroke,
                        color: stroke === "#bef264" || stroke === "#fbbf24" ? "#000" : "#fff"
                    }}
                >
                    {label}
                </span>
                <span className="text-[10px] font-black uppercase text-black/50 tracking-tighter">SURVIVAL PROBABILITY</span>
            </motion.div>
        </div>
    );
}
