import { neon } from "@neondatabase/serverless";

const DEFAULT_STATE = {
  tasks: [
    {id:"seed-1",title:"Read the official case file and extract evidence",description:"List case-provided facts, simulated figures, constraints, and explicit unknowns. Keep evidence separate from assumptions.",owner:"Satyam",phase:0,status:"In Progress",priority:true,due:"",evidence:"",createdAt:"2026-10-09T00:00:00.000Z",updatedAt:"2026-10-09T00:00:00.000Z"},
    {id:"seed-2",title:"Map stakeholders and who experiences the problem",description:"Identify students, faculty, college administration, and other relevant stakeholders; record needs and potential harms.",owner:"Yashi",phase:0,status:"Not Started",priority:true,due:"",evidence:"",createdAt:"2026-10-09T00:00:00.000Z",updatedAt:"2026-10-09T00:00:00.000Z"},
    {id:"seed-3",title:"Extract case signals and research questions",description:"Capture device access, language confidence, AI-use patterns, policy inconsistency, and what the case does not establish.",owner:"Anvi",phase:0,status:"Not Started",priority:true,due:"",evidence:"",createdAt:"2026-10-09T00:00:00.000Z",updatedAt:"2026-10-09T00:00:00.000Z"},
    {id:"seed-4",title:"Set up the investigation document and source log",description:"Create a shared document with sections for case evidence, external sources, assumptions, unknowns, and citations.",owner:"Riddima",phase:0,status:"In Progress",priority:true,due:"",evidence:"",createdAt:"2026-10-09T00:00:00.000Z",updatedAt:"2026-10-09T00:00:00.000Z"},
    {id:"seed-5",title:"Draft at least four plausible problem framings",description:"For each framing: affected group, exact failure, supporting evidence, missing evidence, and what to investigate next.",owner:"Satyam",phase:1,status:"Not Started",due:"",evidence:""},
    {id:"seed-6",title:"Investigate language and confidence barriers",description:"Check what evidence exists for Hindi/mixed-language comfort and whether language is the root cause or a signal.",owner:"Anvi",phase:2,status:"Not Started",due:"",evidence:""},
    {id:"seed-7",title:"Investigate device and connectivity constraints",description:"Explore whether smartphone-first use, unreliable laptops, bandwidth, or access to paid tools changes the problem.",owner:"Yashi",phase:2,status:"Not Started",due:"",evidence:""},
    {id:"seed-8",title:"Compare problem framings against selection criteria",description:"Compare severity, evidence strength, equity, feasibility, measurable outcome, and risk of solving the wrong problem.",owner:"Riddima",phase:3,status:"Not Started",due:"",evidence:""},
    {id:"seed-9",title:"Write the final problem statement and rationale",description:"State who is affected, what fails, where/when it happens, and why the evidence supports prioritising it.",owner:"Satyam",phase:3,status:"Not Started",due:"",evidence:""},
    {id:"seed-10",title:"Define human and AI responsibilities",description:"Describe where AI helps, what remains human-owned, how errors are checked, and what must never be inferred.",owner:"Yashi",phase:4,status:"Not Started",due:"",evidence:""},
    {id:"seed-11",title:"Draft V1 scope and non-goals",description:"Define the smallest useful solution slice and explicitly list features that are out of scope.",owner:"Satyam",phase:5,status:"Not Started",due:"",evidence:""},
    {id:"seed-12",title:"Write acceptance tests and outcome metrics",description:"Include at least three testable acceptance criteria, an outcome metric, and an exclusion/harm check.",owner:"Riddima",phase:5,status:"Not Started",due:"",evidence:""},
    {id:"seed-13",title:"Create a working prototype slice",description:"Build only after the problem and acceptance criteria are agreed. Use clearly disclosed mock data if needed.",owner:"Anvi",phase:6,status:"Not Started",due:"",evidence:""},
    {id:"seed-14",title:"Prepare the case investigation and problem-solution brief",description:"Explain the investigation, alternatives, selected problem, evidence, solution logic, limitations, and references.",owner:"Riddima",phase:7,status:"Not Started",due:"",evidence:""},
    {id:"seed-15",title:"Prepare slides and demo rehearsal",description:"Build a clear narrative and rehearse the demo, edge cases, limitations, and teammate hand-offs.",owner:"Satyam",phase:7,status:"Not Started",due:"",evidence:""},
    {id:"seed-16",title:"Maintain genuine AI interaction log and decision index",description:"Save real AI interactions and record consequential decisions. Do not reconstruct or fabricate transcripts.",owner:"Yashi",phase:7,status:"Not Started",due:"",evidence:""}
  ],
  decisions: [],
  activity: [{id:"welcome",text:"Workspace initialized with a starter task plan",by:"Satyam",at:"2026-10-09T00:00:00.000Z"}],
  phases: Array.from({length:8},()=>({status:"Not Started"}))
};

function send(res, status, body) {
  res.status(status).setHeader("Content-Type","application/json; charset=utf-8").setHeader("Cache-Control","no-store").json(body);
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow","GET, POST");
    return send(res,405,{error:"Method not allowed"});
  }
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
  if (!databaseUrl) return send(res,503,{error:"Database not configured. Add DATABASE_URL in Vercel project environment variables to enable shared cloud sync."});
  try {
    const sql = neon(databaseUrl);
    await sql`CREATE TABLE IF NOT EXISTS iiit_work_workspace (id INTEGER PRIMARY KEY, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`INSERT INTO iiit_work_workspace (id, state) VALUES (1, ${JSON.stringify(DEFAULT_STATE)}::jsonb) ON CONFLICT (id) DO NOTHING`;
    if (req.method === "GET") {
      const rows = await sql`SELECT state, updated_at FROM iiit_work_workspace WHERE id = 1`;
      return send(res,200,{state:rows[0].state,updatedAt:rows[0].updated_at,mode:"cloud"});
    }
    const expected = process.env.TEAM_ACCESS_CODE;
    if (!expected) return send(res,503,{error:"Team writes are disabled until TEAM_ACCESS_CODE is configured in Vercel."});
    if (req.headers["x-team-access-code"] !== expected) return send(res,401,{error:"A valid team access code is required to update the shared workspace."});
    const incoming = req.body && req.body.state;
    if (!incoming || !Array.isArray(incoming.tasks) || !Array.isArray(incoming.decisions) || !Array.isArray(incoming.phases)) {
      return send(res,400,{error:"Invalid workspace state."});
    }
    if (JSON.stringify(incoming).length > 450000) return send(res,413,{error:"Workspace payload is too large."});
    await sql`UPDATE iiit_work_workspace SET state = ${JSON.stringify(incoming)}::jsonb, updated_at = NOW() WHERE id = 1`;
    return send(res,200,{ok:true,updatedAt:new Date().toISOString()});
  } catch (error) {
    console.error("Workspace API error:",error);
    return send(res,500,{error:"The workspace database request failed. Check DATABASE_URL and the Vercel function logs."});
  }
}