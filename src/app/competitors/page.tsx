"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, Building2, Flame, RefreshCcw } from "lucide-react";
import { CompanyProfile } from "@/lib/types";

export default function CompetitorsPage() {
    const [companies, setCompanies] = useState<CompanyProfile[]>([]);
    const [filter, setFilter] = useState<"all" | "local" | "African" | "global">("all");
    const [idea, setIdea] = useState("");

    useEffect(() => {
        const storedResult = sessionStorage.getItem('nexus_audit_result');
        const storedIdea = sessionStorage.getItem('nexus_audit_idea');

        if (storedResult) {
            try {
                const parsedResult = JSON.parse(storedResult);
                if (parsedResult.pillars?.competitiveLandscape?.companies) {
                    setCompanies(parsedResult.pillars.competitiveLandscape.companies);
                }
                if (storedIdea) {
                    setIdea(storedIdea);
                }
            } catch (e) {
                console.error("Failed to parse audit result", e);
            }
        }
    }, []);

    const filteredCompanies = companies.filter(c => filter === "all" || c.region === filter);

    return (
        <div className="min-h-screen bg-[#fdfcf0] flex flex-col font-sans">
            {/* Nav Header */}
            <nav className="sticky top-0 z-50 bg-white border-b-[4px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="p-2 border-[3px] border-black bg-white hover:bg-black hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black uppercase tracking-tighter">Competitive Landscape</span>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-black/40">Analyzing Market For</span>
                    <span className="text-xs font-black uppercase text-black max-w-[200px] truncate">"{idea || "Your Idea"}"</span>
                </div>
            </nav>

            <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b-[4px] border-black pb-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Precedent Startups</h1>
                        <p className="text-sm font-bold text-black/60 uppercase tracking-widest">
                            Analyze active and failed companies in this sector.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={18} />
                        <span className="text-xs font-black uppercase mr-2">Filter By:</span>
                        <div className="flex border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white divide-x-[3px] divide-black">
                            {['all', 'local', 'African', 'global'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-4 py-2 text-xs font-black uppercase transition-colors ${filter === f ? 'bg-black text-white' : 'hover:bg-accent'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Company Grid */}
                {companies.length === 0 ? (
                    <div className="text-center py-20 border-[4px] border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                        <p className="text-xl font-black uppercase">No competitor data found in the current audit.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-4 px-6 py-2 bg-accent border-[3px] border-black font-black uppercase hover:translate-y-[-2px] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                        >
                            Return to Report
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map((company, i) => (
                            <motion.div
                                key={company.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="border-[4px] border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col group cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all"
                                onClick={() => window.location.href = `/competitors/${company.id}`}
                            >
                                <div className="p-4 border-b-[4px] border-black flex justify-between items-center bg-black/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white border-2 border-black px-2 py-0.5">
                                        {company.region}
                                    </span>
                                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${company.status === 'shutdown' ? 'bg-danger text-white' :
                                            company.status === 'pivot' ? 'bg-accent-secondary text-white' :
                                                'bg-accent text-black'
                                        }`}>
                                        {company.status === 'shutdown' ? <Flame size={12} /> : company.status === 'pivot' ? <RefreshCcw size={12} /> : <Building2 size={12} />}
                                        {company.status}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase mb-2 group-hover:text-accent-secondary transition-colors">
                                        {company.name}
                                    </h3>
                                    <p className="text-sm font-bold text-black/70 mb-4 line-clamp-3 flex-1">
                                        {company.history}
                                    </p>

                                    <div className="mt-auto space-y-2 text-xs font-bold font-mono">
                                        <div className="flex justify-between border-b-2 border-black/10 pb-1">
                                            <span className="text-black/50">Model</span>
                                            <span>{company.businessModel}</span>
                                        </div>
                                        <div className="flex justify-between border-b-2 border-black/10 pb-1">
                                            <span className="text-black/50">Founders</span>
                                            <span className="truncate ml-4">{company.founders.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-black/50">Total Funding</span>
                                            <span>{company.funding || 'Undisclosed'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black text-white p-3 text-center text-xs font-black uppercase group-hover:bg-accent-secondary transition-colors">
                                    View Deep Profile ↗
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
