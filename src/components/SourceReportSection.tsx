"use client";

import { motion } from "framer-motion";
import {
    AppWindow,
    Youtube,
    MessageSquare,
    Search,
    TrendingUp,
    Quote,
    Star,
    Download,
    FileText,
    ExternalLink,
    Instagram,
    Globe,
} from "lucide-react";
import type { SourceReport, NexusAuditResult } from "@/lib/types";

interface SourceReportSectionProps {
    sourceReports: NexusAuditResult["sourceReports"];
    idea?: string;
    onDownloadReport?: () => void;
}

export default function SourceReportSection({ sourceReports, idea, onDownloadReport }: SourceReportSectionProps) {
    if (!sourceReports) return null;

    const { appStore, youtube, redditNairaland, searchAnalytics } = sourceReports;

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-black text-black uppercase tracking-tighter">INTELLIGENCE REPORTS</h2>
                    <p className="text-sm font-bold text-black/50 uppercase tracking-widest bg-black/5 inline-block px-2">Data-mined clusters from high-signal sources</p>
                </div>
                {onDownloadReport && (
                    <button
                        onClick={onDownloadReport}
                        className="flex items-center gap-2 px-6 py-3 border-[3px] border-black bg-accent text-black font-black uppercase tracking-tighter shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all"
                    >
                        <FileText size={16} />
                        Full Report
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* App Store */}
                {appStore && (
                    <ReportCard
                        report={appStore}
                        icon={<AppWindow size={20} className="text-blue-400" />}
                        accentColor="blue"
                        idea={idea}
                    />
                )}
                {/* YouTube */}
                {youtube && (
                    <ReportCard
                        report={youtube}
                        icon={<Youtube size={20} className="text-red-500" />}
                        accentColor="red"
                        idea={idea}
                    />
                )}
                {/* Reddit / Nairaland */}
                {redditNairaland && (
                    <ReportCard
                        report={redditNairaland}
                        icon={<MessageSquare size={20} className="text-orange-500" />}
                        accentColor="orange"
                        idea={idea}
                    />
                )}

                {/* Instagram */}
                {sourceReports.instagram && (
                    <ReportCard
                        report={sourceReports.instagram}
                        icon={<Instagram size={20} className="text-pink-600" />}
                        accentColor="pink"
                        idea={idea}
                    />
                )}

                {/* Nigerian Blogs */}
                {sourceReports.nigerianBlogs && (
                    <ReportCard
                        report={sourceReports.nigerianBlogs}
                        icon={<Globe size={20} className="text-emerald-600" />}
                        accentColor="emerald"
                        idea={idea}
                    />
                )}

                {/* Research Papers */}
                {sourceReports.researchPapers && (
                    <ReportCard
                        report={sourceReports.researchPapers}
                        icon={<FileText size={20} className="text-purple-600" />}
                        accentColor="purple"
                        idea={idea}
                    />
                )}

                {/* Search Analytics Card */}
                {searchAnalytics && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 border-[3px] border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 border-[3px] border-black bg-accent flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                                    <Search size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-black uppercase tracking-tighter">Search Engine Intel</h3>
                                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Google / Market Volume</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-black text-black bg-accent px-2">{searchAnalytics.volume}</span>
                                <p className="text-[10px] font-black text-black/40 uppercase">VAL/MO</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border-[3px] border-black bg-black/5">
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-3 underline">Trending Keywords</p>
                                <div className="flex flex-wrap gap-2">
                                    {searchAnalytics.trendingKeywords?.map((kw, i) => (
                                        <span key={i} className="text-[11px] font-black px-2 py-1 bg-white border-[2px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 border-[3px] border-black bg-black/5">
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-3 underline">User Intent Map</p>
                                <div className="space-y-3">
                                    {Object.entries(searchAnalytics.intentMap || {}).map(([intent, val]) => (
                                        <div key={intent} className="space-y-1">
                                            <div className="flex justify-between text-[11px] font-black uppercase">
                                                <span>{intent}</span>
                                                <span className="text-accent-secondary">{val}%</span>
                                            </div>
                                            <div className="h-3 bg-black/10 border-[2px] border-black overflow-hidden">
                                                <div className="h-full bg-accent" style={{ width: `${val}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function ReportCard({ report, icon, accentColor, idea }: { report: SourceReport, icon: React.ReactNode, accentColor: string, idea?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border-[3px] border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)] bg-white">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-black uppercase tracking-tighter leading-none">{report.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">{report.source}</p>
                            {report.sourceUrl && (
                                <a
                                    href={report.sourceUrl.startsWith('http') ? report.sourceUrl : `${report.sourceUrl}${encodeURIComponent(idea || "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[9px] font-black text-white bg-black px-2 py-0.5 uppercase hover:bg-accent hover:text-black transition-all"
                                >
                                    <ExternalLink size={10} />
                                    SOURCE_LINK ↗
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex border-[2px] border-black h-3 w-20 overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${report.sentiment.positive}%` }} />
                        <div className="h-full bg-danger" style={{ width: `${report.sentiment.negative}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-tighter">{report.count} Signals</span>
                </div>
            </div>

            <div className="p-4 border-[3px] border-black bg-black/5">
                <p className="text-[10px] font-black text-black uppercase mb-3 underline tracking-widest">Pain Points / Themes</p>
                <div className="flex flex-wrap gap-2">
                    {report.topThemes?.map((theme, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white border-[2px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                            <TrendingUp size={12} className="text-black" />
                            <span className="text-[11px] font-black uppercase">{theme}</span>
                        </div>
                    )) || <span className="text-[10px] font-black opacity-30">NO THEMES DETECTED</span>}
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[10px] font-black text-black uppercase tracking-widest underline">Raw Evidence Logs</p>
                {report.rawExcerpts?.map((exc, i) => (
                    <div key={i} className="flex gap-4 p-4 border-[3px] border-black bg-[#fafafa] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-black" />
                        <Quote size={16} className="text-black/10 flex-shrink-0" fill="currentColor" />
                        <div className="space-y-2 w-full">
                            <p className="text-sm text-black font-bold leading-tight italic break-words">
                                &quot;{exc.content}&quot;
                            </p>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">USER ID: {exc.author || "ANON"}</span>
                                    {exc.url && (
                                        <a
                                            href={exc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-black text-white bg-black px-1.5 py-0.5 uppercase hover:bg-accent hover:text-black transition-all inline-flex items-center gap-1"
                                        >
                                            <ExternalLink size={8} /> EXACT SIGNAL SPOT ↗
                                        </a>
                                    )}
                                </div>
                                {exc.rating && (
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <Star key={j} size={10} className={j < exc.rating! ? "fill-black text-black" : "text-black/10"} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) || <p className="text-xs font-bold opacity-30">NO RAW LOGS AVAILABLE</p>}
            </div>
        </motion.div>
    );
}
