"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send, RotateCcw, ArrowLeft, MessageSquare, ShieldCheck, Database } from "lucide-react";

export default function TruthChatPage() {
    const [auditResult, setAuditResult] = useState<any>(null);
    const [idea, setIdea] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedResult = sessionStorage.getItem('nexus_audit_result');
        const storedIdea = sessionStorage.getItem('nexus_audit_idea');

        if (storedResult) {
            try {
                const parsedResult = JSON.parse(storedResult);
                setAuditResult(parsedResult);
                setIdea(storedIdea || "Your Idea");
                setMessages([
                    {
                        role: 'assistant',
                        content: `**NEXUS TRUTH ENGINE ONLINE.** I have processed the audit for: **"${storedIdea}"**. I am ready to cross-reference the data points. What specific risk or opportunity do you want me to analyze based on the report?`
                    }
                ]);
            } catch (e) {
                console.error("Failed to parse audit result", e);
            }
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = { role: 'user', content: input } as const;
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        try {
            const response = await fetch('/api/truth-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea,
                    message: input,
                    history: messages.slice(-10), // Send last 10 messages for context
                    fullAudit: auditResult
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

    if (!auditResult) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 border-[4px] border-black bg-white flex items-center justify-center mb-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    <Database size={40} />
                </div>
                <h1 className="text-3xl font-black uppercase mb-4 tracking-tighter">No Audit Data Found</h1>
                <p className="text-black/60 font-bold mb-8 uppercase max-w-sm">Please run a Nexus audit first to populate the truth engine with context.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-accent border-[3px] border-black text-black font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                    Return to Intake
                </button>
            </div>
        );
    }

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
                        <span className="text-xl font-black uppercase tracking-tighter">TRUTH_CHAT</span>
                        <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 uppercase">Audit Session: Live</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black uppercase text-black/40">Analyzing Context</span>
                        <span className="text-xs font-black uppercase text-black max-w-[200px] truncate">"{idea}"</span>
                    </div>
                    <button
                        onClick={() => setMessages([{ role: 'assistant', content: "Audit History Cleared. Truth engine reset. How can I help?" }])}
                        className="flex items-center gap-2 px-4 py-2 border-[3px] border-black text-[10px] font-black uppercase bg-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    >
                        <RotateCcw size={12} />
                        Clear History
                    </button>
                </div>
            </nav>

            {/* Chat Container */}
            <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto pr-2 space-y-6 flex flex-col no-scrollbar"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 border-[3px] border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-white' : 'bg-black text-accent'}`}>
                                        {msg.role === 'user' ? <ShieldCheck size={18} /> : <Zap size={18} fill="currentColor" />}
                                    </div>
                                    <div className={`p-4 md:p-6 border-[3px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                        <div className="prose prose-invert prose-sm">
                                            {(msg.content || "").split('\n').map((line, idx) => (
                                                <p key={idx} className="mb-2 leading-tight font-bold text-sm md:text-base">
                                                    {line.startsWith('**') ? <span className="text-accent">{line.replace(/\*\*/g, '')}</span> : line}
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
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-10 h-10 border-[3px] border-black bg-black text-accent flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Zap size={18} fill="currentColor" />
                                </div>
                                <div className="p-4 border-[3px] border-black bg-black text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="relative pt-4">
                    <form
                        onSubmit={handleSendMessage}
                        className="bg-white border-[4px] border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] flex items-stretch p-2 gap-2"
                    >
                        <div className="hidden md:flex items-center pl-4 pr-2 text-black/20">
                            <MessageSquare size={24} />
                        </div>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Interrogate the truth report..."
                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none py-4 px-2 text-lg font-black uppercase tracking-tight placeholder:text-black/10"
                            disabled={isThinking}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className={`px-8 flex items-center gap-2 bg-black text-white font-black uppercase hover:bg-accent hover:text-black transition-colors border-[3px] border-black ${(!input.trim() || isThinking) ? 'opacity-50 grayscale' : ''}`}
                        >
                            <span>Send</span>
                            <Send size={18} />
                        </button>
                    </form>
                    <div className="mt-4 flex justify-between items-center px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Nexus Cognitive Link Enabled</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Cross-Referencing: Live</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
