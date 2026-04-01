import type { NexusAuditResult } from "./types";

/**
 * Generates a high-fidelity standalone HTML report for a Nexus audit result.
 */
export function downloadNexusReport(result: NexusAuditResult, idea: string): void {
  const date = new Date(result.timestamp).toLocaleString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const escape = (str: any) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/`/g, "&#96;");
  };

  /* --- TEMPLATE HELPERS --- */
  const pillarCards = Object.entries(result.pillars)
    .map(([key, p]) => {
      const score = Math.round(p.score);
      return `
        <div class="pillar-card-v2">
          <div class="pillar-header">
            <span class="pillar-name">${escape(p.name)}</span>
            <div class="score-block">
              <span class="pillar-score">${score}</span>
              <span class="pct">%</span>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar-brutalist" style="width: ${score}%"></div>
          </div>
          <p class="pillar-sum">${escape(p.summary)}</p>
          <ul class="pillar-details">
            ${(p.details || []).slice(0, 5).map(d => `<li>${escape(d)}</li>`).join("")}
          </ul>
        </div>`;
    }).join("");

  const sourceCards = (report: any, icon: string) => {
    if (!report) return "";
    return `
      <div class="report-card-v2">
        <div class="report-header-v2">
          <div class="report-icon-v2">${escape(icon)}</div>
          <div>
            <div class="report-title">${escape(report.name || "UNNAMED SOURCE")}</div>
            <div class="report-source">${escape(report.source || "UNKNOWN SOURCE")} ${report.sourceUrl ? `· <a href="${report.sourceUrl}" class="verify-link" target="_blank">VERIFY SOURCE ↗</a>` : ""}</div>
          </div>
        </div>
        <div class="theme-chips-v2">
          ${(report.topThemes || []).map((t: string) => `<span class="chip-black">${escape(t)}</span>`).join("")}
        </div>
        <div class="evidence-grid">
          ${(report.rawExcerpts || []).map((e: any, idx: number) => `
            <div class="evidence-item-v2">
              <span class="citation-tag">CIT-REF [${idx + 1}]</span>
              <p class="evidence-text">"${escape(e.content)}"</p>
              <div class="evidence-meta">
                <div class="meta-left">
                  <span class="author-id">UID: ${escape(e.author || "ANONYMOUS_SIGNAL")}</span>
                  ${e.url ? `<br/><a href="${e.url}" class="verify-link" style="font-size: 0.75rem" target="_blank">VERIFY SIGNAL ↗</a>` : ""}
                </div>
                ${e.rating ? `<span class="rating">Score: ${e.rating}/5</span>` : ""}
              </div>
            </div>`).join("")}
        </div>
      </div>`;
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Nexus Audit Report | ${idea.slice(0, 40)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap');
    
    :root {
      --bg: #fdfcf0;
      --accent: #bef264;
      --black: #000000;
      --white: #ffffff;
      --grey: #f0f0f0;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; border: none; }
    
    body {
      background: var(--bg);
      color: var(--black);
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1.1;
      padding: 60px 40px;
    }
    
    .container { max-width: 1100px; margin: 0 auto; }
    
    /* --- HEADER --- */
    .header {
      border: 6px solid var(--black);
      background: var(--accent);
      padding: 40px;
      margin-bottom: 60px;
      box-shadow: 20px 20px 0 0 var(--black);
      position: relative;
    }
    .logo { 
      font-size: 5rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: -0.05em; line-height: 0.8; margin-bottom: 20px;
    }
    .report-meta { font-weight: 700; text-transform: uppercase; font-size: 1rem; border-top: 4px solid var(--black); pt: 20px; display: flex; justify-content: space-between; }

    /* --- HERO / VERDICT --- */
    .verdict-hero {
      background: var(--white);
      border: 6px solid var(--black);
      padding: 60px;
      margin-bottom: 80px;
      box-shadow: 24px 24px 0 0 var(--black);
    }
    .idea-heading {
      font-size: 3.5rem; font-weight: 700; text-transform: uppercase;
      margin-bottom: 40px; line-height: 0.85; letter-spacing: -0.04em;
    }
    .official-verdict-box {
      background: var(--black); color: var(--accent);
      padding: 40px; margin-bottom: 40px;
      border: 4px solid var(--black);
    }
    .verdict-label { font-size: 1.2rem; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; display: block; text-decoration: underline; }
    .verdict-content { font-size: 1.8rem; font-weight: 500; line-height: 1.1; }
    
    .score-matrix {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px;
      margin-top: 60px;
    }
    .score-cell {
      border: 4px solid var(--black); background: var(--white);
      padding: 30px; text-align: left; box-shadow: 10px 10px 0 0 var(--black);
    }
    .cell-val { font-size: 4rem; font-weight: 700; color: var(--black); line-height: 0.8; }
    .cell-lab { font-size: 0.9rem; font-weight: 700; text-transform: uppercase; margin-top: 15px; color: #666; }

    /* --- SECTIONS --- */
    .section-title-box {
      background: var(--black); color: var(--white);
      padding: 15px 30px; display: inline-block;
      font-size: 2.5rem; font-weight: 700; text-transform: uppercase;
      margin-bottom: 40px;
    }

    .pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 100px; }
    .pillar-card-v2 {
      background: var(--white); border: 6px solid var(--black);
      padding: 40px; box-shadow: 16px 16px 0 0 var(--black);
    }
    .pillar-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
    .pillar-name { font-weight: 700; font-size: 2rem; text-transform: uppercase; line-height: 0.85; width: 70%; }
    .score-block { background: var(--black); color: var(--white); padding: 10px 15px; display: flex; align-items: baseline; }
    .pillar-score { font-size: 2.5rem; font-weight: 700; }
    .pct { font-size: 1rem; margin-left: 2px; }
    
    .progress-container { height: 28px; background: var(--grey); border: 4px solid var(--black); margin-bottom: 25px; overflow: hidden; }
    .progress-bar-brutalist { height: 100%; background: var(--accent); border-right: 4px solid var(--black); }
    
    .pillar-sum { font-weight: 700; font-size: 1.1rem; margin-bottom: 25px; text-transform: uppercase; border-left: 6px solid var(--black); padding-left: 15px; }
    .pillar-details { list-style: none; }
    .pillar-details li { font-size: 0.95rem; font-weight: 500; margin-bottom: 12px; border-bottom: 2px solid #eee; padding-bottom: 8px; }

    /* --- AGENT INTEL --- */
    .report-card-v2 {
      background: var(--white); border: 6px solid var(--black);
      padding: 50px; margin-bottom: 50px; box-shadow: 20px 20px 0 0 var(--black);
    }
    .report-header-v2 { display: flex; gap: 30px; align-items: center; margin-bottom: 40px; }
    .report-icon-v2 { font-size: 4rem; border: 4px solid var(--black); width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: var(--accent); box-shadow: 8px 8px 0 0 var(--black); }
    .report-title { font-weight: 700; font-size: 2.5rem; text-transform: uppercase; line-height: 0.8; }
    .report-source { font-weight: 700; font-size: 1rem; text-transform: uppercase; color: #888; margin-top: 10px; }
    .verify-link { color: var(--black); text-decoration: underline; font-weight: 700; }
    
    .chip-black { 
      display: inline-block; background: var(--black); color: var(--white);
      padding: 8px 16px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0 10px 10px 0;
    }
    
    .evidence-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .evidence-item-v2 { border: 4px solid var(--black); padding: 30px; background: #fafafa; position: relative; }
    .citation-tag { position: absolute; top: -15px; left: 20px; background: var(--black); color: var(--white); padding: 4px 10px; font-size: 0.7rem; font-weight: 700; }
    .evidence-text { font-weight: 500; font-size: 1.2rem; margin-bottom: 20px; font-style: italic; line-height: 1.1; }
    .evidence-meta { display: flex; justify-content: space-between; border-top: 2px solid var(--black); padding-top: 10px; }
    .author-id { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #888; }
    .rating { font-size: 0.8rem; font-weight: 700; color: var(--black); }

    /* --- ACTION --- */
    .action-hero {
      background: var(--black); color: var(--accent);
      padding: 80px 40px; border: 6px solid var(--black); text-align: center;
      box-shadow: 24px 24px 0 0 var(--accent); margin-top: 100px;
    }
    .action-label { font-size: 1.5rem; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; display: inline-block; border-bottom: 4px solid var(--accent); }
    .action-text { font-size: 3.5rem; font-weight: 700; text-transform: uppercase; line-height: 0.9; }

    @media (max-width: 900px) {
      .pillar-grid, .evidence-grid, .score-matrix { grid-template-columns: 1fr; }
      .logo { font-size: 3rem; }
      .idea-heading { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">NEXUS_TRUTH</div>
      <div class="report-meta">
        <span>AUTHENTICATED AUDIT REPORT</span>
        <span>ISSUED: ${date}</span>
      </div>
    </div>

    <div class="verdict-hero">
      <div class="idea-heading">"${escape(idea)}"</div>
      
      <div class="official-verdict-box">
        <span class="verdict-label">Official Truth Verdict</span>
        <p class="verdict-content">${escape(result.verdict)}</p>
      </div>
      
      <div class="score-matrix">
        <div class="score-cell">
          <div class="cell-val">${result.survivalScore}%</div>
          <div class="cell-lab">Viability Index</div>
        </div>
        <div class="score-cell">
          <div class="cell-val">${result.syntheticPersonas.filter(p => p.wouldUse).length}/${result.syntheticPersonas.length}</div>
          <div class="cell-lab">Agent-Simulated Adoption</div>
        </div>
        <div class="score-cell">
          <div class="cell-val">${Math.round(Object.values(result.pillars).reduce((acc, p) => acc + (p?.score || 0), 0) / 6)}%</div>
          <div class="cell-lab">Structural Strength</div>
        </div>
      </div>
    </div>

    <h2 class="section-title-box">Truth Pillars</h2>
    <div class="pillar-grid">
      ${pillarCards}
    </div>

    <h2 class="section-title-box">Persona Simulations</h2>
    <div class="pillar-grid" style="margin-bottom: 60px;">
      ${result.syntheticPersonas.map(p => `
        <div class="score-cell" style="text-align: left; padding: 25px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 2px solid var(--black); padding-bottom: 10px;">
            <span style="font-weight: 700; text-transform: uppercase;">${escape(p.name)}</span>
            <span style="font-size: 0.8rem; font-weight: 700; background: ${p.wouldUse ? 'var(--accent)' : '#ff4d4d'}; padding: 2px 8px; border: 2px solid black;">
              ${p.wouldUse ? 'ADOPTS' : 'REJECTS'}
            </span>
          </div>
          <p style="font-size: 0.95rem; font-weight: 500; font-style: italic; color: #444;">"${escape(p.reaction)}"</p>
          <div style="font-size: 0.7rem; font-weight: 700; color: #888; margin-top: 10px; text-transform: uppercase;">Segment: ${escape(p.role)}</div>
        </div>
      `).join("")}
    </div>

    <h2 class="section-title-box">Agent-Acquired Intel</h2>
    <div class="reports-stack">
      ${sourceCards(result.sourceReports?.researchPapers, "PUB")}
      ${sourceCards(result.sourceReports?.appStore, "APP")}
      ${sourceCards(result.sourceReports?.youtube, "VID")}
      ${sourceCards(result.sourceReports?.redditNairaland, "COM")}
      ${sourceCards(result.sourceReports?.instagram, "IG")}
      ${sourceCards(result.sourceReports?.nigerianBlogs, "WEB")}
    </div>

    <div class="action-hero">
      <div class="action-label">► IMMEDIATE STRATEGIC MOVE</div>
      <div class="action-text">${escape(result.immediateMove)}</div>
      ${result.pivotSuggestion ? `
        <div style="margin-top: 40px; border-top: 2px solid var(--accent); padding-top: 20px;">
          <div class="action-label" style="background: #ff6b00; border-bottom: none; color: white;">STRATEGIC PIVOT</div>
          <p style="font-size: 1.5rem; font-weight: 500; margin-top: 10px; color: white;">${escape(result.pivotSuggestion)}</p>
        </div>
      ` : ""}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Nexus-Truth-Report-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
