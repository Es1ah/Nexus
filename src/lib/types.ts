// Types for the Nexus Truth Engine

export interface NexusAuditInput {
    idea: string;
    region: string;
    sector: string;
    attachments?: File[];
}

export interface PillarResult {
    name: string;
    score: number;
    summary: string;
    details: string[];
    icon: string;
    sourceUrl?: string;
}

export interface MarketHunger extends PillarResult {
    sentimentBreakdown: {
        positive: number;
        negative: number;
        neutral: number;
    };
    topComplaints: string[];
    demandIndicators: string[];
}

export interface RegulatoryRadar extends PillarResult {
    requirements: {
        body: string;
        requirement: string;
        estimatedCost: string;
        timeline: string;
    }[];
    riskLevel: "low" | "medium" | "high";
}

export interface CompetitiveGap extends PillarResult {
    competitors: {
        name: string;
        strengths: string[];
        weaknesses: string[];
        opportunity: string;
    }[];
}

export interface CompanyProfile {
    id: string;
    name: string;
    status: "active" | "shutdown" | "pivot";
    region: "local" | "African" | "global";
    founders: string[];
    funding: string;
    history: string;
    businessModel: string;
    whyItFailed?: string;
    publicData: Record<string, string>;
    articles: {
        title: string;
        url: string;
        source: string;
    }[];
}

export interface CompetitiveLandscape extends PillarResult {
    companies: CompanyProfile[];
}

export interface ResourceBlueprint extends PillarResult {
    techStack: string[];
    skills: string[];
    estimatedMvpCost: string;
    timeline: string;
}

export interface TrustAnchor extends PillarResult {
    distributionNodes: {
        name: string;
        type: string;
        reachEstimate: string;
    }[];
    partnerships: string[];
}

export interface SourceReport {
    name: string;
    source: string;
    sourceUrl?: string;
    count: number;
    sentiment: {
        positive: number;
        negative: number;
        neutral: number;
    };
    topThemes: string[];
    rawExcerpts: {
        content: string;
        rating?: number;
        author?: string;
        url?: string;
    }[];
}

export interface NexusAuditResult {
    survivalScore: number;
    verdict: string;
    immediateMove: string;
    pivotSuggestion: string;
    pillars: {
        marketHunger: MarketHunger;
        regulatoryRadar: RegulatoryRadar;
        competitiveGaps: CompetitiveGap;
        resourceBlueprint: ResourceBlueprint;
        trustAnchors: TrustAnchor;
        researchLibrarian: PillarResult;
        competitiveLandscape: CompetitiveLandscape;
    };
    sourceReports: {
        appStore?: SourceReport;
        youtube?: SourceReport;
        redditNairaland?: SourceReport;
        instagram?: SourceReport;
        nigerianBlogs?: SourceReport;
        researchPapers?: SourceReport; // New property
        searchAnalytics?: {
            volume: string;
            difficulty: string;
            trendingKeywords: string[];
            intentMap: Record<string, number>;
        };
    };
    syntheticPersonas: {
        name: string;
        role: string;
        reaction: string;
        wouldUse: boolean;
    }[];
    timestamp: string;
    isSimulated?: boolean;
}

export interface AgentLogEntry {
    id: string;
    agent: string;
    message: string;
    status: "running" | "complete" | "error";
    timestamp: number;
    details?: string;
}

export interface TickerItem {
    label: string;
    value: string;
    change?: string;
    direction?: "up" | "down" | "neutral";
}
