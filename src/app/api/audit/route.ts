export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { runNexusAudit } from "@/lib/agent";
import { checkRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "anonymous_session";
        const { allowed, remaining, resetMs } = checkRateLimit(ip);

        if (!allowed) {
            return NextResponse.json({
                error: "Rate limit exceeded. Nexus is expensive to run. Quota resets soon.",
                resetAt: new Date(resetMs).toISOString()
            }, { status: 429 });
        }

        const { idea, region, sector } = await req.json();

        if (!idea) {
            return NextResponse.json({ error: "Idea is required" }, { status: 400 });
        }

        // Run the Nexus Agentic Truth Engine
        const auditResult = await runNexusAudit(
            idea.trim(),
            region || "Lagos, Nigeria",
            sector || "other"
        );

        return NextResponse.json(auditResult);
    } catch (error) {
        console.error("Audit Error:", error);
        return NextResponse.json(
            { error: "Failed to process audit" },
            { status: 500 }
        );
    }
}
