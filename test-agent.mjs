/**
 * Diagnostic script - runs the agent directly (no HTTP layer)
 * Run: node test-agent.mjs
 */
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load env manually
const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
}

const { default: axios } = require('./node_modules/axios');
const fs = require('fs');
const path = require('path');

console.log('=== NEXUS AGENT DIRECT TEST ===');
console.log('OPENROUTER_API_KEY set:', !!process.env.OPENROUTER_API_KEY, '| suffix:', process.env.OPENROUTER_API_KEY?.slice(-6));

const prompt = `You are a market analyst. Return ONLY this JSON with no explanation:
{"marketHunger":{"summary":"Strong demand exists for idea validation tools in Africa","details":["Signal 1","Signal 2"],"score":75},"regulatoryRadar":{"summary":"Low regulatory risk for SaaS","details":["Signal 1"],"score":80},"competitiveGaps":{"summary":"Major gap in African localization","details":["Gap 1"],"score":65},"resourceBlueprint":{"summary":"Lean MVP in 8 weeks","details":["Stack 1"],"score":72},"trustAnchors":{"summary":"Strong founder community in Lagos","details":["Hub 1"],"score":60},"researchLibrarian":{"summary":"Literature supports demand","details":["Paper 1"],"score":78},"competitiveLandscape":{"summary":"10+ players, none localized for Africa","details":["Insight 1"],"score":65,"companies":[{"id":"validator-ai","name":"Validator AI","status":"active","region":"global","founders":["Ross Currier"],"funding":[],"history":"AI-powered idea validation platform launched 2023","businessModel":"Freemium SaaS","whyItFailed":"","publicData":{"ProductHunt":"Top 3"},"articles":[{"title":"Validator AI on Product Hunt","url":"https://www.producthunt.com/posts/validator-ai","source":"ProductHunt"}]},{"id":"ideaproof","name":"IdeaProof","status":"active","region":"global","founders":["Unknown"],"funding":[],"history":"AI market validation reports platform","businessModel":"PayPerReport SaaS","whyItFailed":"","publicData":{},"articles":[{"title":"IdeaProof launch","url":"https://ideaproof.io","source":"IdeaProof"}]}]},"sources":{"appStore":{"count":20,"topThemes":["No African focus"],"excerpts":[{"content":"No Nigeria support","author":"LagosUser","rating":1,"url":"https://play.google.com/store"}]},"youtube":{"count":15,"topThemes":["Validation tips"],"excerpts":[{"content":"Test comment","author":"StartupNG","url":"https://youtube.com/watch?v=test123"}]},"redditNairaland":{"count":30,"topThemes":["Validation tools"],"excerpts":[{"content":"Test signal","author":"u/founder","url":"https://reddit.com/r/startups/test"}]},"instagram":{"name":"Instagram Audit","sourceUrl":"https://instagram.com","topThemes":["Startup culture"],"excerpts":[{"content":"Test post","author":"@buildng","url":"https://instagram.com/p/test"}]},"nigerianBlogs":{"name":"Blog Audit","sourceUrl":"https://techcabal.com","topThemes":["Startup tools"],"excerpts":[{"content":"African founders need tools","author":"TechCabal","url":"https://techcabal.com/test"}]},"researchPapers":{"name":"Academic Audit","source":"Scholar","sourceUrl":"https://scholar.google.com","topThemes":["Validation research"],"excerpts":[{"content":"42% fail due to no market need","author":"CB Insights","url":"https://cbinsights.com/test"}]}},"searchAnalytics":{"volume":"8100/month","difficulty":"Medium","trendingKeywords":["idea validation"],"intentMap":{"Informational":55,"Transactional":30,"Navigational":15}},"marketSentiment":{"pos":58,"neg":28,"neu":14}}`;

try {
    console.log('\nCalling OpenRouter...');
    const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model: 'google/gemini-2.0-flash-001',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 3000,
            temperature: 0.1,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://nexus-truth.engine',
                'X-Title': 'Nexus Truth Engine',
            },
            timeout: 60000,
        }
    );

    const content = res.data?.choices?.[0]?.message?.content;
    console.log('Response (first 500 chars):', content?.slice(0, 500));

    // Strip markdown fences
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('\n✅ JSON PARSED OK');
        console.log('Companies:', parsed.competitiveLandscape?.companies?.map(c => c.name).join(', '));
        console.log('Market Hunger Score:', parsed.marketHunger?.score);
    } else {
        console.log('❌ NO JSON FOUND IN RESPONSE');
        console.log('Full response:', content);
    }
} catch (e) {
    console.error('❌ ERROR:', e.response?.data || e.message);
}
