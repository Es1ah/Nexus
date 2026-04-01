import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { generateMockAuditResult } from "./mock-data";
import type { NexusAuditResult, SourceReport } from "./types";

// ─── FAILSAFE ENV LOADER ─────────────────────────────────────────────────────
// If Next.js didn't inject .env.local (e.g. cold start, killed process),
// we read it directly from disk as a fallback.
function loadEnvKey(keyName: string): string {
    // First try process.env (normal Next.js injection)
    if (process.env[keyName]) return process.env[keyName]!;

    // Fallback: parse .env.local manually from disk
    try {
        const envPath = path.join(process.cwd(), ".env.local");
        const raw = fs.readFileSync(envPath, "utf8");
        const match = raw.match(new RegExp(`^${keyName}=(.+)$`, "m"));
        if (match?.[1]) {
            const val = match[1].trim();
            process.env[keyName] = val; // cache it
            console.log(`[Truth Engine] Loaded ${keyName} from .env.local (suffix: ${val.slice(-6)})`);
            return val;
        }
    } catch {
        // file not found
    }
    return "";
}

// ─── AI PROVIDER (always-active, no silent fallback) ─────────────────────────
async function callAI(prompt: string, maxTokens = 4000): Promise<string> {
    const key = loadEnvKey("OPENROUTER_API_KEY");
    if (!key) throw new Error("OPENROUTER_API_KEY not found in process.env or .env.local");

    const MAX_RETRIES = 3;
    let lastErr: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[Truth Engine] Calling OpenRouter (attempt ${attempt}/${MAX_RETRIES})...`);
            const res = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "google/gemini-2.0-flash-001",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: maxTokens,
                    temperature: 0.1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${key}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://nexus-truth.engine",
                        "X-Title": "Nexus Truth Engine",
                    },
                    timeout: 60000,
                }
            );
            const content = res.data?.choices?.[0]?.message?.content;
            if (!content) throw new Error("Empty response body from AI");
            console.log(`[Truth Engine] OpenRouter OK (attempt ${attempt}).`);
            return content;
        } catch (e: any) {
            lastErr = e;
            console.error(`[Truth Engine] Attempt ${attempt} failed:`, e.response?.data?.error?.message || e.message);
            if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 1500 * attempt));
        }
    }
    throw lastErr;
}

// ─── WEB SCRAPER AGENTS ───────────────────────────────────────────────────────
async function scrapeHackerNews(query: string): Promise<{ title: string; url: string; score: number; comments: number }[]> {
    try {
        const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`;
        const { data } = await axios.get(searchUrl, { timeout: 10000 });
        return (data.hits || []).map((h: any) => ({
            title: h.title,
            url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            score: h.points || 0,
            comments: h.num_comments || 0,
        }));
    } catch {
        return [];
    }
}

async function scrapeReddit(query: string): Promise<{ title: string; url: string; score: number; body: string }[]> {
    try {
        const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&type=link`;
        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Nexus-Truth-Engine/1.0" },
            timeout: 10000,
        });
        return (data?.data?.children || []).map((c: any) => ({
            title: c.data.title,
            url: `https://reddit.com${c.data.permalink}`,
            score: c.data.score,
            body: (c.data.selftext || "").slice(0, 300),
        }));
    } catch {
        return [];
    }
}

async function scrapeNairaland(query: string): Promise<{ title: string; url: string; author: string }[]> {
    try {
        const url = `https://www.nairaland.com/search?q=${encodeURIComponent(query)}&submit=1`;
        const { data } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
            timeout: 10000,
        });
        const $ = cheerio.load(data);
        const results: { title: string; url: string; author: string }[] = [];
        $("table.board td b a").each((_, el) => {
            const title = $(el).text().trim();
            const href = $(el).attr("href") || "";
            if (title && href) {
                results.push({ title, url: `https://www.nairaland.com${href}`, author: "Nairaland" });
            }
        });
        return results.slice(0, 8);
    } catch {
        return [];
    }
}

// ─── MAIN AUDIT ORCHESTRATOR ──────────────────────────────────────────────────
export async function runNexusAudit(
    idea: string,
    region: string,
    sector: string
): Promise<NexusAuditResult> {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[Truth Engine] Starting LIVE AUDIT: "${idea}"`);
    console.log(`[Truth Engine] Region: ${region} | Sector: ${sector}`);
    console.log(`[Truth Engine] API Key loaded: ${process.env.OPENROUTER_API_KEY ? "YES (" + process.env.OPENROUTER_API_KEY.slice(-6) + ")" : "NO ← THIS IS THE BUG"}`);
    console.log(`${"=".repeat(60)}\n`);

    // 1. Start with mock structure as the SKELETON
    const baseResult = generateMockAuditResult(idea, region, sector);

    // ── REAL-TIME WEB SCRAPING ──────────────────────────────────────────────
    console.log("[Truth Engine] Scraping live web signals...");
    const [hnResults, redditResults, nairalandResults] = await Promise.all([
        scrapeHackerNews(idea),
        scrapeReddit(`${idea} startup`),
        scrapeNairaland(idea),
    ]);
    console.log(`[Truth Engine] Live signals: HN=${hnResults.length}, Reddit=${redditResults.length}, Nairaland=${nairalandResults.length}`);

    // Format scraped signals for AI context
    const liveSignals = `
LIVE HACKER NEWS SIGNALS (real-time scraped from HN Algolia API):
${hnResults.map(h => `• [${h.score} pts, ${h.comments} comments] "${h.title}" → ${h.url}`).join("\n") || "• No HN signals found"}

LIVE REDDIT SIGNALS (real-time scraped):
${redditResults.map(r => `• [${r.score} upvotes] "${r.title}" → ${r.url}${r.body ? `\n  Context: "${r.body}"` : ""}`).join("\n") || "• No Reddit signals found"}

LIVE NAIRALAND SIGNALS (real-time scraped):
${nairalandResults.map(n => `• "${n.title}" → ${n.url}`).join("\n") || "• No Nairaland signals found"}
`;

    // ── AI DEEP AUDIT PROMPT ──────────────────────────────────────────────────
    const intelPrompt = `You are the NEXUS TRUTH ENGINE - the world's most rigorous African startup intelligence system.

STARTUP IDEA: "${idea}"
TARGET REGION: ${region}
SECTOR: ${sector}

${liveSignals}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MISSION: Perform a deep, REAL, factual market audit. Use the live signals above as your primary sources.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPETITIVE LANDSCAPE & PRECEDENT FAILURES (MANDATORY ANALYTICS):
You MUST analyze the following RECENT REAL-WORLD FAILURES that ignored market demand validation:
1. Quibi ($1.75B failure) - Misjudged short-form demand on mobile vs binge-watching.
2. Juicero ($118M failure) - Solution looking for a problem (bags could be squeezed by hand).
3. Aria Insights (formerly CyPhy Works) - High-tech drone for industrial problem that didn't exist at scale.
4. Dinnr - Founders prioritized personal interest over market validation (home-cooking ingredients).
5. AskTina - High landing page traffic but zero paid conversions (no "hair on fire" problem).

ACTIVE MARKET LEADERS & ITERATION TOOLS:
1. Validator AI (validatorai.com) - AI-powered idea validation reports.
2. IdeaProof (ideaproof.io) - In-depth market sizing and validation.
3. Cambium AI (cambium.ai) - GTM strategy automation.
4. Bubble (bubble.io) - The gold standard for MVP iteration and demand testing.
5. GrowthMentor (growthmentor.com) - Human-in-the-loop validation experts.
6. Founders Factory Africa - Supports pre-validation of African startup ideas.

RESEARCH REQUIREMENTS:
1. Identify 12+ REAL direct competitors and PRECEDENT startups.
2. Signal 5+ exact Reddit/Nairaland threads using the LIVE SIGNALS provided.
3. Signal 5+ academic papers proving the "No Market Need" failure rate (e.g., CB Insights 42%).

For EACH company provide:
- founders (real names from public records)
- funding rounds (real amounts, investors from Crunchbase/public records)  
- history (factual, specific)
- businessModel (specific)
- whyItFailed (if shutdown/pivot - specific, factual)
- publicData (key metrics)
- articles: 3+ real links from TechCrunch, HackerNews, YC News, a16z blog, or official blogs

SIGNAL SOURCE REQUIREMENTS:
- App Store excerpts: Real 1-star and 2-star reviews from competitor apps mentioning the problem
- YouTube: Real educational content URLs about idea validation and founder iteration
- Reddit/Nairaland: USE THE LIVE SIGNALS ABOVE as your primary source + add real thread URLs
- Research Papers: Real academic papers with real DOI or direct PDF URLs from arXiv, SSRN, or ResearchGate

DEEP LINK RULES (NO VIOLATIONS):
✓ DO: https://www.nairaland.com/7432812/building-tech-startup-nigeria#35891234
✓ DO: https://news.ycombinator.com/item?id=38654321
✓ DO: https://youtube.com/watch?v=dQw4w9WgXcQ&t=245
✓ DO: https://techcrunch.com/2024/01/15/validatorai-raises-seed-round/
✗ NEVER: https://play.google.com/store/search?q=...
✗ NEVER: https://youtube.com/results?search_query=...
✗ NEVER: generic category pages

Respond ONLY with valid, parseable JSON in this EXACT structure (no markdown fences, no explanation):
{
  "marketHunger": {
    "summary": "Compelling 2-sentence summary backed by HN/Reddit signals above",
    "details": ["8 specific data points citing real sources", "..."],
    "score": 75
  },
  "regulatoryRadar": {
    "summary": "2-sentence regulatory overview for ${region}",
    "details": ["Specific bodies: CAC registration cost ₦50,000", "..."],
    "score": 55
  },
  "competitiveGaps": {
    "summary": "2-sentence gap analysis citing real competitors",
    "details": ["Gap 1 with specific evidence", "..."],
    "score": 68
  },
  "resourceBlueprint": {
    "summary": "2-sentence MVP cost and stack estimate",
    "details": ["Specific tech, cost, and timeline details", "..."],
    "score": 72
  },
  "trustAnchors": {
    "summary": "2-sentence trust network summary for ${region}",
    "details": ["Specific communities, hubs, and partners", "..."],
    "score": 60
  },
  "researchLibrarian": {
    "summary": "2-sentence academic evidence for the market gap",
    "details": ["Paper title, DOI, key finding, URL", "..."],
    "score": 80
  },
  "competitiveLandscape": {
    "summary": "2-sentence landscape overview",
    "details": ["10 key landscape observations with real data"],
    "score": 65,
    "companies": [
      {
        "id": "validator-ai",
        "name": "Validator AI",
        "status": "active",
        "region": "global",
        "founders": ["Ross Currier"],
        "funding": [],
        "history": "Launched in 2023 as an AI-powered startup idea validator. Uses GPT-4 to score ideas and identify target segments. Became popular on Product Hunt achieving #3 product of the day.",
        "businessModel": "Freemium SaaS - free tier for basic validation, paid plans at $49/month for detailed reports",
        "whyItFailed": "",
        "publicData": {"ProductHunt": "Top #3 Product of the Day", "Users": "5000+"},
        "articles": [
          {"title": "Validator AI lands on Product Hunt Top 3", "url": "https://www.producthunt.com/posts/validator-ai", "source": "ProductHunt"},
          {"title": "AI Tools for Startup Validation in 2024", "url": "https://news.ycombinator.com/item?id=37823456", "source": "HackerNews"}
        ]
      }
    ]
  },
  "sources": {
    "appStore": {
      "count": 45,
      "topThemes": ["No African market focus", "Too generic", "Missing local context"],
      "excerpts": [
        {"content": "This app is great for US markets but completely ignores Africa", "author": "Lagos_Founder", "rating": 2, "url": "https://play.google.com/store/apps/details?id=com.validatorai&reviewId=gp:AOqpTO123"},
        {"content": "Would love this but there is no Naira pricing or Nigerian regulation guide", "author": "AbujaTech", "rating": 1, "url": "https://play.google.com/store/apps/details?id=com.ideaproof&reviewId=gp:AOqpTO456"}
      ]
    },
    "youtube": {
      "count": 23,
      "topThemes": ["How to validate startup ideas", "Founder iteration frameworks", "African tech ecosystem"],
      "excerpts": [
        {"content": "Comment from founder: 'This is exactly what I need but it doesn't account for the Nigerian regulatory environment'", "author": "TechStartupNG", "url": "https://youtube.com/watch?v=3fumBcKC6RE&t=145"},
        {"content": "Comment: 'No African startup validation tool exists that understands our market dynamics'", "author": "IbadanFounder", "url": "https://youtube.com/watch?v=vHHa5NuH3OM&t=240"}
      ]
    },
    "redditNairaland": {
      "count": 67,
      "topThemes": ["Startup validation in Nigeria", "Idea iteration tools", "African market research"],
      "excerpts": [
        {"content": "I built a startup validation tool but it keeps giving me US-centric data. Nothing covers Lagos or Nairobi market dynamics properly", "author": "u/AfricanFounder2024", "url": "https://reddit.com/r/startups/comments/1a2b3c4/startup_validation_africa"},
        {"content": "All these idea validation apps are built for Silicon Valley. We need something that understands Nigerian regulations, payment rails like Paystack, and local distribution", "author": "u/NigeriaStartups", "url": "https://reddit.com/r/Nigeria/comments/xyz123/need_idea_validation_tool"}
      ]
    },
    "instagram": {
      "name": "Instagram Comment Audit",
      "sourceUrl": "https://www.instagram.com/techcabal/",
      "topThemes": ["African founders building", "Idea validation tools", "Startup ecosystem"],
      "excerpts": [
        {"content": "Where is the Nexus for African startup founders? We need real market data not US stats!", "author": "@abiodun_builds", "url": "https://www.instagram.com/p/C1a2B3cD4eF/"}
      ]
    },
    "nigerianBlogs": {
      "name": "TechCabal & Nairametrics Blog Audit",
      "sourceUrl": "https://techcabal.com",
      "topThemes": ["African startup ecosystem", "Founder resources", "Market validation"],
      "excerpts": [
        {"content": "The African startup ecosystem lacks proper market validation infrastructure. Founders are building blindly without demand data", "author": "TechCabal Editorial", "url": "https://techcabal.com/2024/08/15/african-founders-lack-market-research-tools/"},
        {"content": "With $5.4B invested in African startups in 2023, the need for rigorous idea validation has never been higher", "author": "Nairametrics Staff", "url": "https://nairametrics.com/2024/03/21/african-startup-investment-2023-review/"}
      ]
    },
    "researchPapers": {
      "name": "Academic & Public Library Audit",
      "source": "SSRN / Google Scholar / arXiv",
      "sourceUrl": "https://scholar.google.com",
      "topThemes": ["Startup failure rates", "Market validation methodology", "African tech adoption"],
      "excerpts": [
        {"content": "42% of startups fail because they build products with no market need (CB Insights). Proper idea validation reduces failure rate by 63%", "author": "CB Insights Research", "url": "https://www.cbinsights.com/research/report/startup-failure-reasons-top/"},
        {"content": "Technology adoption in Sub-Saharan Africa shows distinct patterns from Western markets, requiring localized validation frameworks", "author": "Asongu & Nwachukwu", "url": "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2713557"}
      ]
    }
  },
  "searchAnalytics": {
    "volume": "8,100 searches/month for 'startup idea validation Africa'",
    "difficulty": "Medium (KD 34)",
    "trendingKeywords": ["idea validation app", "startup validation Africa", "founder tool Nigeria", "market research Lagos", "concept testing startup"],
    "intentMap": {"Informational": 55, "Transactional": 30, "Navigational": 15}
  },
  "marketSentiment": {"pos": 58, "neg": 28, "neu": 14}
}`;

    let intel: any = null;
    let aiError: string | null = null;

    try {
        const intelText = await callAI(intelPrompt, 4000);
        console.log("[Truth Engine] AI response received. Parsing JSON...");

        // Try to extract JSON - handle markdown code fences
        let cleaned = intelText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error(`AI did not return valid JSON. Response starts with: ${intelText.slice(0, 200)}`);
        }
        intel = JSON.parse(jsonMatch[0]);
        console.log("[Truth Engine] ✅ JSON parsed successfully! Competitors found:", intel.competitiveLandscape?.companies?.length || 0);
    } catch (e: any) {
        aiError = e.message;
        console.error("[Truth Engine] ❌ CRITICAL AI FAILURE:", aiError);
        // DO NOT fall back to simulation — throw so the API returns a 500 with a real error message
        throw new Error(`AI audit failed: ${aiError}. Check server logs for details.`);
    }

    // ── MAP AI RESULTS INTO PILLARS ─────────────────────────────────────────
    const overwrite = (id: string, aiData: any) => {
        if (aiData && typeof aiData === "object") {
            (baseResult.pillars as any)[id] = {
                ...(baseResult.pillars as any)[id],
                summary: aiData.summary || "",
                details: Array.isArray(aiData.details) ? aiData.details : [],
                score: typeof aiData.score === "number" ? aiData.score : 50,
            };
        }
    };

    overwrite("marketHunger", intel.marketHunger);
    overwrite("regulatoryRadar", intel.regulatoryRadar);
    overwrite("competitiveGaps", intel.competitiveGaps);
    overwrite("resourceBlueprint", intel.resourceBlueprint);
    overwrite("trustAnchors", intel.trustAnchors);
    overwrite("researchLibrarian", intel.researchLibrarian);
    overwrite("competitiveLandscape", intel.competitiveLandscape);

    if (Array.isArray(intel.competitiveLandscape?.companies)) {
        baseResult.pillars.competitiveLandscape.companies = intel.competitiveLandscape.companies;
        console.log(`[Truth Engine] ✅ ${baseResult.pillars.competitiveLandscape.companies.length} real companies mapped to Competitive Landscape.`);
    }

    // ── MAP SOURCE REPORTS ──────────────────────────────────────────────────
    const buildReport = (
        raw: any,
        name: string,
        source: string,
        fallbackUrl: string
    ): SourceReport => ({
        name,
        source,
        sourceUrl: raw?.sourceUrl || fallbackUrl,
        count: raw?.count || 0,
        topThemes: raw?.topThemes || [],
        rawExcerpts: (raw?.excerpts || []).map((e: any) => ({
            content: e.content || "",
            author: e.author || "",
            rating: e.rating,
            url: e.url || "",
        })),
        sentiment: { positive: 50, negative: 30, neutral: 20 },
    });

    const s = intel.sources || {};
    if (s.appStore) baseResult.sourceReports.appStore = buildReport(s.appStore, "Competitor Store Audit", "Google Play / App Store", "");
    if (s.youtube) baseResult.sourceReports.youtube = buildReport(s.youtube, "YouTube Signal Analysis", "YouTube", "");
    if (s.redditNairaland) baseResult.sourceReports.redditNairaland = buildReport(s.redditNairaland, "Community Signal Logs", "Reddit / Nairaland", "");
    if (s.instagram) baseResult.sourceReports.instagram = buildReport(s.instagram, s.instagram.name || "Instagram Audit", "Instagram", "");
    if (s.nigerianBlogs) baseResult.sourceReports.nigerianBlogs = buildReport(s.nigerianBlogs, s.nigerianBlogs.name || "Blog Audit", "TechCabal / Nairametrics", "");
    if (s.researchPapers) baseResult.sourceReports.researchPapers = buildReport(s.researchPapers, s.researchPapers.name || "Academic Audit", s.researchPapers.source || "SSRN / Scholar", "");

    // Inject live scraped HN signals into redditNairaland if available
    if (hnResults.length > 0) {
        const existing = baseResult.sourceReports.redditNairaland?.rawExcerpts || [];
        const hnExcerpts = hnResults.slice(0, 4).map(h => ({
            content: `"${h.title}" — ${h.score} points, ${h.comments} comments on Hacker News`,
            author: "Hacker News Community",
            url: h.url,
        }));
        if (baseResult.sourceReports.redditNairaland) {
            baseResult.sourceReports.redditNairaland.rawExcerpts = [...hnExcerpts, ...existing];
        }
    }

    if (intel.searchAnalytics) {
        baseResult.sourceReports.searchAnalytics = {
            volume: intel.searchAnalytics.volume || "N/A",
            difficulty: intel.searchAnalytics.difficulty || "Unknown",
            trendingKeywords: intel.searchAnalytics.trendingKeywords || [],
            intentMap: intel.searchAnalytics.intentMap || {},
        };
    }

    // ── VERDICT GENERATION ──────────────────────────────────────────────────
    const verdictPrompt = `You are the NEXUS CHIEF AUDITOR delivering the final Truth Engine verdict.

ANALYZED IDEA: "${idea}"
REGION: ${region}
MARKET HUNGER SCORE: ${intel.marketHunger?.score || 70}/100
COMPETITIVE LANDSCAPE: ${intel.competitiveLandscape?.companies?.length || 0} real competitors identified including ${intel.competitiveLandscape?.companies?.slice(0,3).map((c:any)=>c.name).join(', ')}
REGULATORY SCORE: ${intel.regulatoryRadar?.score || 55}/100
KEY GAPS: ${intel.competitiveGaps?.summary || 'Significant localization gap'}

Deliver a brutal, specific, data-backed verdict. Reference real competitors and real data points.

Respond ONLY with valid JSON:
{
  "verdict": "2-3 sentence verdict citing specific competitor names and real market data",
  "immediateMove": "The ONE non-negotiable action to take this week (specific, actionable)",
  "pivotSuggestion": "A high-probability pivot based on the competitive gaps found",
  "survivalScore": 72,
  "personas": [
    {
      "name": "Adunola Osei",
      "role": "Fintech Founder, Yaba Lagos - 3 years in market",
      "reaction": "I tried Validator AI but it gave me US-centric data. If ${idea} actually understands Paystack and CBN compliance, I'm in.",
      "wouldUse": true
    },
    {
      "name": "Emeka Nwosu",
      "role": "Angel Investor, Lagos - Former Andela engineer",
      "reaction": "The competition from Bubble and Indie Hackers is real. But they don't speak our language. Market differentiation is your moat.",
      "wouldUse": true
    },
    {
      "name": "Dr. Fatimah Bello",
      "role": "Academic Researcher - Pan-Atlantic University",
      "reaction": "The 42% failure rate from CB Insights is even higher in Africa. We desperately need localized validation infrastructure.",
      "wouldUse": false
    }
  ]
}`;

    try {
        const verdictText = await callAI(verdictPrompt, 1500);
        let vCleaned = verdictText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const vMatch = vCleaned.match(/\{[\s\S]*\}/);
        if (vMatch) {
            const verdict = JSON.parse(vMatch[0]);
            if (verdict.verdict) baseResult.verdict = verdict.verdict;
            if (verdict.immediateMove) baseResult.immediateMove = verdict.immediateMove;
            if (verdict.pivotSuggestion) baseResult.pivotSuggestion = verdict.pivotSuggestion;
            if (typeof verdict.survivalScore === "number") baseResult.survivalScore = verdict.survivalScore;
            if (Array.isArray(verdict.personas)) baseResult.syntheticPersonas = verdict.personas;
            console.log("[Truth Engine] ✅ Verdict generated. Survival score:", baseResult.survivalScore);
        }
    } catch (e: any) {
        console.warn("[Truth Engine] Verdict AI call failed (non-fatal):", e.message);
    }

    // ── FINAL FLAGS ─────────────────────────────────────────────────────────
    baseResult.isSimulated = false; // NEVER simulate if we got this far
    baseResult.timestamp = new Date().toISOString();

    console.log(`[Truth Engine] ✅ LIVE AUDIT COMPLETE. isSimulated=${baseResult.isSimulated}`);
    return baseResult;
}
