export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";
import { checkRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "anonymous_session";
        const { allowed, resetMs } = checkRateLimit(ip);

        if (!allowed) {
            return NextResponse.json({
                reply: "Rate limit exceeded. Quota resets soon.",
                resetAt: new Date(resetMs).toISOString()
            }, { status: 429 });
        }

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

        const reply = await callAI(prompt, { maxTokens: 1500, temperature: 0.3 });
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
