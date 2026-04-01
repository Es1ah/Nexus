/**
 * Nexus API Diagnostic Test
 * Run: node test-live.js
 */
const { default: axios } = require("./node_modules/axios");

const KEY = "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";

async function testLive() {
  console.log("--- NEXUS API DIAGNOSTIC ---");
  console.log("Key suffix:", KEY.slice(-6));

  // 1: Basic connectivity test
  console.log("\n[1] Testing basic connectivity...");
  try {
    const r = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: 'Reply ONLY with valid JSON: {"status":"LIVE","key":"ok"}' }],
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nexus-truth.engine",
          "X-Title": "Nexus Truth Engine",
        },
        timeout: 20000,
      }
    );
    const txt = r.data.choices[0].message.content;
    console.log("RESPONSE:", txt);
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("PARSED JSON OK:", parsed);
    } else {
      console.log("WARNING: No JSON in response - this is the simulation bug!");
    }
  } catch (e) {
    console.log("ERROR:", e.response?.status, JSON.stringify(e.response?.data) || e.message);
  }

  // 2: Test real audit-style prompt (small version)
  console.log("\n[2] Testing audit-style JSON prompt...");
  try {
    const auditPrompt = `You are a market analyst. For a startup idea: "app to help founders validate startup ideas" in Lagos, Nigeria.
Respond ONLY with this exact JSON structure (fill in real data):
{"marketHunger":{"summary":"string","details":["string"],"score":75},"competitiveLandscape":{"summary":"string","score":60,"companies":[{"id":"1","name":"Validator AI","status":"active","region":"global","founders":["Ross Currier"],"funding":[],"history":"string","businessModel":"SaaS","articles":[{"title":"ValidatorAI launch","url":"https://validatorai.com","source":"ProductHunt"}]}]}}`;

    const r2 = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: auditPrompt }],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nexus-truth.engine",
        },
        timeout: 30000,
      }
    );
    const txt2 = r2.data.choices[0].message.content;
    const match2 = txt2.match(/\{[\s\S]*\}/);
    if (match2) {
      const data2 = JSON.parse(match2[0]);
      console.log("AUDIT JSON OK. Companies found:", data2.competitiveLandscape?.companies?.length || 0);
      console.log("First company:", data2.competitiveLandscape?.companies?.[0]?.name);
    } else {
      console.log("WARNING: Audit JSON not parseable. Raw:", txt2.slice(0, 300));
    }
  } catch (e) {
    console.log("AUDIT TEST ERROR:", e.response?.status, JSON.stringify(e.response?.data) || e.message);
  }

  console.log("\n--- DIAGNOSTIC COMPLETE ---");
}

testLive();
