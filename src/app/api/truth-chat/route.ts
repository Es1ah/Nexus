import { NextResponse } from "next/server";
import axios from "axios";

async function callAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.3,
        },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://nexus-truth.engine",
                "X-Title": "Nexus Truth Engine",
            },
        }
    );
    return response.data.choices[0].message.content as string;
}

export async function POST(req: Request) {
    try {
        const { idea, message, history, fullAudit } = await req.json();

        const chatContext = (history || []).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

        const prompt = `
You are the NEXUS TRUTH AI. You have access to a deep market audit report for a startup idea.
IDEA: "${idea}"

--- FULL AUDIT REPORT ---
${JSON.stringify(fullAudit, null, 2)}
--- END OF REPORT ---

CONVERSATION HISTORY:
${chatContext}

USER QUESTION: ${message}

INSTRUCTIONS:
1. Provide a direct, data-driven answer based on the Audit Report.
2. If the user asks for something not in the report, use your general knowledge of the region but prioritize the audit data.
3. Keep the tone professional, objective, and "neo-brutalist" (direct, no fluff).
4. Use formatting (bullet points, bold text) to make your answer readable.
`;

        const reply = await callAI(prompt);
        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Truth Chat Error:", error.message);

        // Simulator Fallback if API fails
        const payload = await req.clone().json().catch(() => ({}));
        const idea = payload.idea || "the idea";

        const fallbackReply = `(SIMULATED RESPONSE) After analyzing the Truth Engine data for "${idea}", I detect a significant viability gap in the regulatory sector. While market hunger scores remain above average, sustainability will depend on your immediate move regarding the suggested pivot. [Note: System in Simulation Mode]`;

        return NextResponse.json({
            reply: fallbackReply,
            isSimulated: true
        });
    }
}
