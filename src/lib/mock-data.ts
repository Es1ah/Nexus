import type {
    NexusAuditResult,
    MarketHunger,
    RegulatoryRadar,
    CompetitiveGap,
    ResourceBlueprint,
    TrustAnchor,
    CompetitiveLandscape
} from "@/lib/types";

/**
 * Generates a realistic mock audit result for demo/development purposes.
 */
export function generateMockAuditResult(
    idea: string,
    region: string,
    sector: string
): NexusAuditResult {
    const survivalScore = Math.floor(Math.random() * 40) + 45; // 45-85

    return {
        survivalScore,
        verdict:
            survivalScore >= 70
                ? `Strong market signal detected. "${idea}" shows significant promise in ${region} with clear demand indicators and manageable regulatory overhead.`
                : survivalScore >= 50
                    ? `Moderate viability detected. "${idea}" has potential in ${region} but faces notable challenges in regulatory compliance and competitive saturation.`
                    : `Caution advised. "${idea}" faces significant headwinds in ${region}. Consider a pivot or niche approach before committing capital.`,
        immediateMove:
            survivalScore >= 65
                ? "Conduct 10 in-person interviews with potential early adopters in your target area this week. Validate willingness to pay before writing a single line of code."
                : "Talk to 5 regulatory consultants and 5 potential customers. Map the exact compliance costs before committing any resources to development.",
        pivotSuggestion:
            survivalScore >= 65
                ? `Consider starting with B2B customers first to build revenue and credibility. ${sector === "energy" ? "Target bakeries and restaurants before households to offset hardware costs." : "Enterprise clients can provide the stable revenue needed to fund consumer expansion."}`
                : `Explore adjacent market segments. ${sector === "fintech" ? "Micro-savings features have lower regulatory barriers than full banking." : "A simpler, regulation-light version could serve as your market entry point."}`,
        pillars: {
            marketHunger: {
                name: "Market Hunger",
                score: Math.floor(Math.random() * 25) + 55,
                icon: "Pillar 1 of 5",
                summary: `Analysis of digital signals across social platforms and forum clusters reveals specific latent demand for ${idea} in the ${region} area. Key entry points center around solving existing efficiency gaps in the ${sector} industry.`,
                details: [
                    `Significant engagement spikes on niche forums regarding ${sector} related pain points in ${region}`,
                    `Calculated demand index shows a 35% gap between current solutions and user expectations`,
                    `Real-time search volume for keywords related to "${idea}" has stabilized at high-intent levels`,
                    `Local social media sentiment indicates a preference for localized ${sector} offerings`,
                    `Community clusters in ${region} are reporting systematic failures in current market leaders`,
                ],
                sentimentBreakdown: { positive: 35, negative: 45, neutral: 20 },
                topComplaints: ["High costs", "Poor reliability", "Limited access"],
                demandIndicators: ["Rising search trends", "Social media virality"],
            } as MarketHunger,
            regulatoryRadar: {
                name: "Regulatory Radar",
                score: Math.floor(Math.random() * 30) + 40,
                icon: "Pillar 2 of 5",
                summary: `Foundational compliance required with regional authorities in ${region}. Estimated setup costs for ${sector} operations: ₦2.5M - ₦8M.`,
                details: [
                    `Primary regulatory oversight: Relevant ${sector} commissions and regional boards`,
                    `Estimated compliance cost range: ₦2,500,000 - ₦8,000,000`,
                    `Required certifications: Standard business registration plus sector-specific permits`,
                    `Typical timeline for initial licensing: 3-6 months based on current processing speeds`,
                    `Tax structure: Standard Corporate Income Tax and local development levies`,
                    `Regulatory risk level: Moderate, requiring active legal management`,
                ],
                requirements: [],
                riskLevel: "medium",
            } as RegulatoryRadar,
            competitiveGaps: {
                name: "Competitive Gaps",
                score: Math.floor(Math.random() * 25) + 50,
                icon: "Pillar 3 of 5",
                summary: `Identified several direct and indirect competitors in the ${region} ${sector} market. The primary opportunity lies in the technical delivery bottlenecks and poor customer retention strategies of existing players.`,
                details: [
                    `Analyzed top 5 established players in the ${sector} sector for functional weaknesses`,
                    `Identified systematic nav-errors and high latency in competitor mobile interfaces`,
                    `Pricing structure comparison shows a 12-18% optimization window for a new entrant like ${idea}`,
                    `Competitor review clusters reveal a common complaint regarding "slow response times"`,
                    `Niche segments in ${region} are currently underserved by major ${sector} conglomerates`,
                ],
                competitors: [],
            } as CompetitiveGap,
            resourceBlueprint: {
                name: "Resource Blueprint",
                score: Math.floor(Math.random() * 20) + 60,
                icon: "Pillar 4 of 5",
                summary: `MVP can be built with a lean team of 2-3 developers in 8-12 weeks. Estimated development cost: ₦4M-₦8M. Key technology decisions should prioritize mobile-first architecture.`,
                details: [
                    `Recommended stack: React Native (mobile), Next.js (web), Node.js (backend)`,
                    `Core team needed: 1 Full-stack Developer, 1 Mobile Developer, 1 Designer`,
                    `MVP timeline: 8-12 weeks for core features`,
                    `Estimated development cost: ₦4,000,000 - ₦8,000,000`,
                    `Cloud infrastructure: ~₦150,000/month (AWS/GCP free tier eligible initially)`,
                    `Critical skill gap: Local payment integration expertise (Paystack/Flutterwave)`,
                ],
                techStack: [],
                skills: [],
                estimatedMvpCost: "₦4M-₦8M",
                timeline: "8-12 weeks",
            } as ResourceBlueprint,
            trustAnchors: {
                name: "Trust Anchors",
                score: Math.floor(Math.random() * 25) + 55,
                icon: "Pillar 5 of 6",
                summary: `Identified potential distribution partners and community trust nodes in ${region}. Leveraging existing ${sector} networks could provide a faster market entry path.`,
                details: [
                    `Identified local business influencers with active followings in ${region}`,
                    `Potential partnership synergy with ${sector} trade associations`,
                    `Regional community hubs can serve as initial beta-testing zones`,
                    `WhatsApp and Telegram micro-communities are the primary verified info channels`,
                    `Existing logistics/payment networks in ${region} offer 10x leverage opportunities`,
                    `Trust transfer possible through local religious or trade-based leadership`,
                ],
                distributionNodes: [],
                partnerships: [],
            } as TrustAnchor,
            researchLibrarian: {
                name: "Research Librarian",
                score: Math.floor(Math.random() * 20) + 70,
                icon: "Pillar 6 of 6",
                summary: "Digital archives and regional sector reports confirm a significant structural gap in current local solutions.",
                details: [
                    "Cross-referencing 2024 industrial whitepapers for the region",
                    "Extracted data from 3 prominent academic studies on local tech adoption",
                    "Clustered historical failure data from public sector registries",
                    "Validated signal strength against 2023 regional census data",
                ],
            },
            competitiveLandscape: {
                name: "Competitive Landscape",
                score: Math.floor(Math.random() * 30) + 40,
                icon: "Pillar 7 of 7",
                summary: `Comprehensive audit of ${region} and global players in the ${sector} space. Identifying both active and failed precedents to avoid common pitfalls.`,
                details: [
                    "Analyzing 12+ historical players in the African market",
                    "Regional breakdown: 40% Local, 35% Pan-African, 25% Global",
                    "Fail-state audit: 3 prominent startups in this space shut down between 2021-2024",
                    "Market consolidation indicators suggest entry timing is high-risk/high-reward",
                ],
                companies: [
                    {
                        id: "comp-1",
                        name: "LagosLogistics",
                        status: "shutdown",
                        region: "local",
                        founders: ["Segun Agbaje", "Femi Otedola"],
                        funding: [
                            { round: "Seed", amount: "$500k", date: "2021-02-15", investors: ["Local Angels"] },
                            { round: "Series A", amount: "$2M", date: "2022-06-10", investors: ["Venture Partners"] }
                        ],
                        history: "Started as a last-mile delivery service in Ikeja. Expanded too quickly without proper unit economics.",
                        businessModel: "B2C Logistics",
                        whyItFailed: "Aggressive expansion costs outpaced revenue; burn rate unsustainable during currency devaluation.",
                        publicData: { "Market Share": "5% at peak", "Employees": "50+" },
                        articles: [
                            { title: "LagosLogistics shuts down after burning $2.5M", url: "https://techcrunch.com", source: "TechCrunch" },
                            { title: "Why Nigerian logistics startups are failing", url: "https://twitter.com", source: "Twitter" }
                        ]
                    },
                    {
                        id: "comp-2",
                        name: "GlobalReach",
                        status: "active",
                        region: "global",
                        founders: ["John Doe", "Jane Smith"],
                        funding: [
                            { round: "Series B", amount: "$50M", date: "2023-01-20", investors: ["Global VC"] }
                        ],
                        history: "Global player entering the African market via Lagos and Nairobi.",
                        businessModel: "SaaS Platform",
                        publicData: { "Global Users": "1M+", "African Status": "Beta" },
                        articles: [
                            { title: "GlobalReach announces Africa expansion", url: "https://a16z.com", source: "a16z" }
                        ]
                    }
                ]
            } as CompetitiveLandscape,
        },
        sourceReports: {
            appStore: {
                name: "Competitor Store Audit",
                source: "Google Play Store / iOS App Store",
                sourceUrl: "https://play.google.com/store/search?q=",
                count: 142,
                sentiment: { positive: 28, negative: 54, neutral: 18 },
                topThemes: ["Slow login", "Payment failure", "Bad support"],
                rawExcerpts: [
                    { content: `I've tried similar ${sector} apps in ${region}, but most are too slow to load.`, rating: 1, author: "LagosUser", url: "https://play.google.com" },
                    { content: `Looking for a reliable way to manage ${idea}. The current options aren't great.`, rating: 2, author: "TechFounder", url: "https://apps.apple.com" }
                ],
            },
            youtube: {
                name: "YouTube Narrative Analysis",
                source: "YouTube Search Logs",
                sourceUrl: "https://www.youtube.com/results?search_query=",
                count: 89,
                sentiment: { positive: 65, negative: 15, neutral: 20 },
                topThemes: ["How to start", "Market size", "Technical reqs"],
                rawExcerpts: [
                    { content: `Can someone explain how ${idea} works in ${region}?`, author: "Entrepreneur_NG", url: "https://youtube.com/watch?v=123" },
                    { content: `Reviewing the top ${sector} solutions in the market today.`, author: "ReviewChannel", url: "https://youtube.com/watch?v=456" }
                ],
            },
            redditNairaland: {
                name: "Community Signal Logs",
                source: "Nairaland Forum / r/Nigeria",
                sourceUrl: "https://www.nairaland.com/search?q=",
                count: 312,
                sentiment: { positive: 45, negative: 35, neutral: 20 },
                topThemes: [`${sector} gaps`, "Local reliability", "Price transparency"],
                rawExcerpts: [
                    { content: `Does anyone know a better way to do ${idea}? Everything in ${region} is so outdated.`, author: "ConcernedCitizen", url: "https://nairaland.com" }
                ],
            },
            instagram: {
                name: "Instagram Comment Audit",
                source: "Instagram",
                sourceUrl: "https://instagram.com",
                count: 100,
                sentiment: { positive: 70, negative: 10, neutral: 20 },
                topThemes: ["Pricing", "Reliability", "Support"],
                rawExcerpts: [
                    { content: `This service is too expensive.`, author: "InstaUser1", url: "https://instagram.com/p/123" }
                ],
            },
            nigerianBlogs: {
                name: "Regional Blog Comment Scrape",
                source: "Digital Blogs",
                sourceUrl: "https://techcabal.com",
                count: 25,
                sentiment: { positive: 50, negative: 10, neutral: 40 },
                topThemes: ["Funding", "Market Entry", "Competition"],
                rawExcerpts: [
                    { content: `I read about ${idea} on TechCabal, sounds interesting.`, author: "BlogReader", url: "https://techcabal.com/article" }
                ],
            },
            searchAnalytics: {
                volume: "Calculating...",
                difficulty: "Medium",
                trendingKeywords: ["market entry", "competitor gaps", "local logistics"],
                intentMap: { "Informational": 40, "Transactional": 35, "Navigational": 25 }
            }
        },
        syntheticPersonas: [
            {
                name: "Chukwudi Okafor",
                role: `${region} ${sector} Entrepreneur`,
                reaction: `"If ${idea} can bypass the current bottlenecks we see in ${sector}, it would be a game-changer for businesses like mine in ${region}."`,
                wouldUse: true,
            },
            {
                name: "Aisha Bello",
                role: "Strategic Consumer, Age 24",
                reaction: `"I'm tired of the lack of innovation in ${region}'s ${sector} market. I would definitely try ${idea} if the mobile experience is better than what we have now."`,
                wouldUse: true,
            },
            {
                name: "Babajide Sanwo",
                role: `Skeptical ${sector} Industry Veteran`,
                reaction: `"The market for ${idea} exists, but the regulatory landscape for ${sector} in ${region} is brutal. Prove you can survive the authorities and I'm in."`,
                wouldUse: false,
            },
        ],
        timestamp: new Date().toISOString(),
    };
}
