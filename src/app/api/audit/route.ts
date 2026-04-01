import { NextResponse } from "next/server";
import { runNexusAudit } from "@/lib/agent";

export async function POST(req: Request) {
    try {
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
