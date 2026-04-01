export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { runNexusAudit } from "@/lib/agent";
import { checkRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "anonymous_session";

    try {
        const { allowed, remaining, resetMs } = checkRateLimit(ip);

        if (!allowed) {
            return NextResponse.json({
                error: "Rate limit exceeded. You have used all 5 audits for this hour. " +
                    `Quota resets at ${new Date(resetMs).toLocaleTimeString()}.`,
                resetAt: new Date(resetMs).toISOString(),
            }, { status: 429 });
        }

        const body = await req.json();
        const { idea, region, sector } = body;

        if (!idea?.trim()) {
            return NextResponse.json({ error: "Idea is required to run an audit." }, { status: 400 });
        }

        console.log(`[Audit API] New request from ${ip} | remaining audits: ${remaining}`);

        const auditResult = await runNexusAudit(
            idea.trim(),
            region || "Lagos, Nigeria",
            sector || "Other"
        );

        return NextResponse.json(auditResult);
    } catch (error: any) {
        const msg = error?.message || "Unknown internal error";
        console.error("[Audit API] FATAL ERROR:", msg);
        return NextResponse.json(
            {
                error: `Truth Engine Failure: ${msg}. Check that OPENROUTER_API_KEY is set in .env.local and restart the dev server.`,
                isSimulated: false
            },
            { status: 500 }
        );
    }
}

