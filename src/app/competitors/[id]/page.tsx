"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, Flame, RefreshCcw, Send, CheckCircle2, Zap, MessageSquare, ExternalLink, FileText } from "lucide-react";
import { CompanyProfile } from "@/lib/types";

export default function CompetitorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [idea, setIdea] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedResult = sessionStorage.getItem('nexus_audit_result');
        const storedIdea = sessionStorage.getItem('nexus_audit_idea');

        if (storedIdea) setIdea(storedIdea);

        if (storedResult) {
            try {
                const parsedResult = JSON.parse(storedResult);
                const comps = parsedResult.pillars?.competitiveLandscape?.companies || [];
                const found = comps.find((c: CompanyProfile) => c.id === params.id);
                if (found) {
                    setCompany(found);
                    setMessages([
                        {
                            role: 'assistant',
                            content: `I am the synthetic persona representing **${found.name}**. Wait... you're working on "${storedIdea || 'a competing product'}"? Ask me about our journey, our ${found.status === 'shutdown' ? 'mistakes that killed us' : 'growth levers'}, or our funding rounds.`
                        }
                    ]);
                }
            } catch (e) {
                console.error("Failed to parse audit result", e);
            }
        }
    }, [params.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking || !company) return;

        const userMsg = { role: 'user', content: input } as const;
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        try {
            const response = await fetch('/api/startup-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company,
                    message: input,
                    history: messages.slice(-8),
                    idea
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "SYSTEM_ERROR: Neural bandwidth saturated. Re-attempting manual data fetch..." }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!company) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <p className="text-xl font-bold uppercase animate-pulse">Loading or Company Not Found...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfcf0] flex flex-col font-sans">
            <nav className="sticky top-0 z-50 bg-white border-b-[4px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.location.href = '/competitors'}
                        className="p-2 border-[3px] border-black bg-white hover:bg-black hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black uppercase tracking-tighter">Profile: {company.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black bg-black text-white px-3 py-1 uppercase ${company.status === 'shutdown' ? 'bg-danger' :
                        company.status === 'pivot' ? 'bg-accent-secondary' : 'bg-accent text-black'
                        }`}>
                        STATUS: {company.status}
                    </span>
                </div>
            </nav>

            <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Profile Details */}
                <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
                    <div className="p-8 border-[4px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white">
                        <div className="w-20 h-20 mb-6 border-[3px] border-black flex items-center justify-center text-4xl font-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                            {company.name.charAt(0)}
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{company.name}</h1>
                        <p className="text-black/60 font-bold mb-6 text-sm">{company.businessModel}</p>

                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-black/50 mb-1">Founders</h4>
                                <p className="font-bold border-l-4 border-black pl-3">{company.founders.join(', ')}</p>
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-black/50 mb-1">Origin</h4>
                                <p className="font-bold border-l-4 border-black pl-3">{company.region.toUpperCase()}</p>
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-black/50 mb-1">Company History</h4>
                                <p className="font-bold bg-black/5 p-3 border-2 border-black/10 leading-relaxed text-xs">{company.history}</p>
                            </div>
                            {company.whyItFailed && (
                                <div className="mt-4">
                                    <h4 className="font-black uppercase tracking-widest text-[10px] text-danger mb-1">Autopsy Report (Why it Failed)</h4>
                                    <p className="font-bold bg-danger/10 text-danger p-3 border-2 border-danger/50 leading-relaxed text-xs">
                                        {company.whyItFailed}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-[4px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white">
                        <h3 className="text-lg font-black uppercase tracking-tighter border-b-2 border-black pb-2 mb-4">Funding & Cap Table</h3>
                        <div className="space-y-4">
                            {company.funding ? (
                                <div className="p-4 bg-accent/10 border-2 border-black border-dashed">
                                    <p className="text-sm font-black uppercase leading-tight">
                                        {company.funding}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm font-bold opacity-50 italic">No public funding data available.</p>
                            )}
                        </div>
                    </div>

                    {Object.keys(company.publicData || {}).length > 0 && (
                        <div className="p-6 border-[4px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                            <h3 className="text-lg font-black uppercase tracking-tighter bg-white inline-block px-2 border-2 border-black mb-4 -ml-2 -mt-2">Extracted Data Points</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(company.publicData).map(([key, value]) => (
                                    <div key={key} className="bg-white p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                        <div className="font-black uppercase text-[9px] text-black/40 mb-1">{key}</div>
                                        <div className="font-bold text-sm tracking-tight">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {company.articles && company.articles.length > 0 && (
                        <div className="p-6 border-[4px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-accent/20">
                            <h3 className="text-lg font-black uppercase tracking-tighter border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
                                <FileText size={20} />
                                Intelligence Reports
                            </h3>
                            <div className="space-y-3">
                                {company.articles.map((article, i) => (
                                    <a
                                        key={i}
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block p-3 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <span className="font-bold text-sm group-hover:text-accent-secondary transition-colors leading-tight">
                                                {article.title}
                                            </span>
                                            <ExternalLink size={14} className="flex-shrink-0 mt-0.5 opacity-50 group-hover:opacity-100" />
                                        </div>
                                        <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-black/50 bg-black/5 inline-block px-1.5 py-0.5">
                                            SRC: {article.source}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col: Synthetic Startup Chat */}
                <div className="col-span-1 lg:col-span-7 flex flex-col border-[4px] border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden h-[800px] lg:h-auto">
                    <div className="bg-black text-white p-4 flex items-center gap-3">
                        <Zap fill="currentColor" size={20} className="text-accent animate-pulse" />
                        <span className="font-black uppercase tracking-wide">Synthetic Interrogation Core</span>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col no-scrollbar"
                    >
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 font-black uppercase text-xs border-[2px] border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-white text-black' : 'bg-black text-accent'}`}>
                                            {msg.role === 'user' ? 'YOU' : company.name.charAt(0)}
                                        </div>
                                        <div className={`p-4 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-white text-black' : 'bg-[#111] text-zinc-200'}`}>
                                            <div className="prose prose-sm md:prose-base prose-invert">
                                                {(msg.content || "").split('\n').map((line, idx) => (
                                                    <p key={idx} className="mb-2 leading-tight font-bold last:mb-0">
                                                        {line.replace(/\*\*/g, '')}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 border-[2px] border-black bg-black text-accent flex items-center justify-center animate-pulse">
                                        <Zap size={14} fill="currentColor" />
                                    </div>
                                    <div className="p-3 border-[3px] border-black bg-[#111] text-white">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t-[4px] border-black bg-[#fdfcf0]">
                        <form
                            onSubmit={handleSendMessage}
                            className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-stretch p-1.5 gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Interrogate ${company.name}...`}
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none py-3 px-3 text-sm font-black uppercase tracking-tight placeholder:text-black/30"
                                disabled={isThinking}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isThinking}
                                className={`px-6 flex items-center justify-center bg-black text-white hover:bg-accent hover:text-black transition-colors border-[2px] border-black ${(!input.trim() || isThinking) ? 'opacity-50 grayscale' : ''}`}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
