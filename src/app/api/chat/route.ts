import { NextResponse } from "next/server";
import axios from "axios";

async function callAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7,
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
        const { persona, idea, message, history, fullAudit } = await req.json();

        const chatContext = (history || []).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

        const prompt = `
You are adopting the persona of:
NAME: ${persona.name}
ROLE: ${persona.role}
INITIAL REACTION: ${persona.reaction}

This persona is reacting to a startup idea for: "${idea}".

--- FULL AUDIT REPORT CONTEXT ---
${JSON.stringify(fullAudit, null, 2)}
--- END OF CONTEXT ---

CONVERSATION HISTORY:
${chatContext}

USER MESSAGE: ${message}

INSTRUCTIONS:
1. Respond as the persona would, citing specific "Signals", "Pillars", or "Evidence" from the audit report above if relevant.
2. Be consistent with your role, age, and skepticism or enthusiasm levels.
3. Keep it conversational, brutal (if needed), and brief (max 3 sentences).
`;

        const reply = await callAI(prompt);
        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Persona Chat Error:", error.message);

        // Simulator Fallback if API fails (e.g. balance issues)
        const payload = await req.clone().json().catch(() => ({}));
        const persona = payload.persona || { role: "Agent", name: "Persona" };
        const idea = payload.idea || "the idea";

        const fallbackReply = `(SIMULATED RESPONSE) As a ${persona.role}, I'm considering your strategy for "${idea}". Based on the signals in the report, I'm concerned about the regulatory overhead in this sector, though the market hunger seems genuine. We need to be careful about the current competitors. [Note: System in Simulation Mode]`;

        return NextResponse.json({
            reply: fallbackReply,
            isSimulated: true
        });
    }
}
