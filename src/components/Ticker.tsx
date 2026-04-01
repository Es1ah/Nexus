"use client";

import { MOCK_TICKER_DATA } from "@/lib/constants";

export default function Ticker() {
    // Quadruple duplication for extremely long monitors and smooth loops
    const items = [...MOCK_TICKER_DATA, ...MOCK_TICKER_DATA, ...MOCK_TICKER_DATA, ...MOCK_TICKER_DATA];

    return (
        <div className="w-full border-b-[3px] border-black overflow-hidden h-10 flex items-center bg-accent">
            <div className="ticker-container w-full h-full flex items-center">
                <div className="ticker-content animate-ticker-scroll flex items-center h-full">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 px-10 text-[12px] h-full border-r-[3px] border-black">
                            {/* Label, Value and Change all on one line horizontally */}
                            <span className="text-black font-black tracking-tighter uppercase flex-shrink-0">{item.label}</span>
                            <span className="text-black font-mono font-bold flex-shrink-0 bg-white/30 px-2 py-0.5">{item.value}</span>
                            {item.change && (
                                <span
                                    className={`font-black flex-shrink-0 ${item.direction === "up"
                                        ? "text-black bg-white px-2 py-0.5"
                                        : item.direction === "down"
                                            ? "text-white bg-black px-2 py-0.5"
                                            : "text-black"
                                        }`}
                                >
                                    {item.direction === "up" ? "▲" : item.direction === "down" ? "▼" : ""}{item.change}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
