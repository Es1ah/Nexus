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

        const { company, message, history, idea } = await req.json();

        const chatContext = (history || []).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

        const prompt = `
You are adopting the persona of the startup/company: ${company.name}.
Your current status is: ${company.status.toUpperCase()}.
Your operating region is: ${company.region.toUpperCase()}.

COMPANY PROFILE:
Founders: ${company.founders.join(', ')}
Business Model: ${company.businessModel}
History: ${company.history}
${company.whyItFailed ? `Why we failed: ${company.whyItFailed}` : ''}
Funding: ${JSON.stringify(company.funding)}
Public Data: ${JSON.stringify(company.publicData)}

A user is building a competing or similar product: "${idea}".
They are asking you questions to understand your journey, your mistakes, and your market reality.

CONVERSATION HISTORY:
${chatContext}

USER MESSAGE: ${message}

INSTRUCTIONS:
1. Respond AS the company/founder. Be candid, especially if you failed ("shutdown").
2. Reference your specific history, funding, or public data in your answers.
3. Keep the tone professional, objective, and "neo-brutalist" (direct, no fluff, brutal honesty about the market).
4. Do not offer unsolicited advice unless it directly relates to your experience (e.g. "We burned $2M on marketing, don't do that").
5. Keep it conversational but brief (max 3-4 sentences).
`;

        const reply = await callAI(prompt, { maxTokens: 1500, temperature: 0.3 });
        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Startup Chat Error:", error.message);

        // Simulator Fallback if API fails
        const payload = await req.clone().json().catch(() => ({}));
        const company = payload.company || { name: "The Startup", status: "unknown" };

        const fallbackReply = `(SIMULATED RESPONSE) Speaking for ${company.name}, our experience shows that this market is highly volatile. If we failed, it was due to unit economics. Make sure to learn from our public data. [Note: System in Simulation Mode]`;

        return NextResponse.json({
            reply: fallbackReply,
            isSimulated: true
        });
    }
}
