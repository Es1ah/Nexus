"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
    value: string;
    label: string;
    icon?: string;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    id: string;
    className?: string; // Added className prop
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder,
    label,
    id,
    className = "",
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative" id={id}>
            {label && (
                <label className="block text-[10px] font-black text-black mb-1.5 tracking-widest uppercase">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-3 px-4 py-2 border-[3px] border-black transition-all outline-none ${className || "w-full bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    }`}
            >
                <span className={`text-[11px] font-black uppercase tracking-tighter ${selected ? "text-black" : "text-black/30"}`}>
                    {selected ? (
                        <span className="flex items-center gap-2">
                            {selected.icon && <span>{selected.icon}</span>}
                            {selected.label}
                        </span>
                    ) : (
                        placeholder
                    )}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-black transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.1 }}
                            className="absolute z-50 w-full min-w-[200px] mt-2 border-[3px] border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-h-64 overflow-y-auto"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-tighter border-b last:border-b-0 border-black/10 transition-colors hover:bg-black hover:text-white ${option.value === value
                                        ? "bg-accent text-black"
                                        : "text-black"
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {option.icon && <span>{option.icon}</span>}
                                        {option.label}
                                    </span>
                                    {option.value === value && <Check size={14} className="text-black" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
