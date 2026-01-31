Perfect — with Termux + Knox Kiosk you have exactly the cleanest "tablet hub" architecture. And your stack (React/Vite + Express/TS + SQLite) fits perfectly.

Here's a solid (and simple) implementation for running MacroDroid locally.

---

1) Local network only: 127.0.0.1 everywhere

Objective

Frontend: http://127.0.0.1:5000

Backend API: http://127.0.0.1:5001

MacroDroid: http://127.0.0.1:8080/<path_secret>

⚠️ Just verify that MacroDroid responds to 127.0.0.1:8080 (test in Chrome on the Fold).

If so → you're air-gapped from Wi-Fi.

---

2) MacroDroid: "secret" paths + one per action

Examples:

/deezer_next_k9F3

/deezer_playpause_k9F3

/deezer_prev_k9F3

/hub_screen_on_k9F3

This is sufficient for "auth" on the MacroDroid side.

---

3) Express Backend (TypeScript): a mini MacroDroid "proxy"

Why a proxy?
Your React script calls your API, and the backend communicates with MacroDroid.

Advantages: logging, anti-spam, clean mapping, future SQLite support, etc.

apps/api/src/index.ts

import express from "express";

const app = express();

app.use(express.json());

const MACRO_BASE = process.env.MACRO_BASE ?? "http://127.0.0.1:8080";
const TOKEN = process.env.MACRO_TOKEN ?? "k9F3"; // same token in your paths

function macroUrl(action: string) { 
// you control the mapping table here 
const map: Record<string, string> = { 
"deezer.next": `/deezer_next_${TOKEN}`, 
"deezer.prev": `/deezer_prev_${TOKEN}`, 
"deezer.playpause": `/deezer_playpause_${TOKEN}`, 
}; 
const path = map[action]; 
if (!path) throw new Error("Unknown action"); 
return `${MACRO_BASE}${path}`;
}

app.post("/api/action", async (req, res) => { 
try { 
const action = String(req.body?.action ?? ""); 
if (!action) return res.status(400).json({ ok: false, error: "Missing action" }); 

const r = await fetch(macroUrl(action), { method: "GET" }); 
const text = await r.text(); 

res.json({ ok: true, status: r.status, response: text }); 
} catch(e:any) { 
res.status(500).json({ ok: false, error: e?.message ?? String(e) }); 
}
});

app.listen(5001, "127.0.0.1", () => {
console.log("API on http://127.0.0.1:5001");

});

Notes Android/Termux

Node 18+ has global fetch. If not, install undici or node-fetch.

Explicitly bind "127.0.0.1" = not exposed to the network.

---

4) React Frontend: Radix + Tailwind buttons

Ultra-simple example

async function send(action: string) {
await fetch("http://127.0.0.1:5001/api/action", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ action }),

});
}

export function DeezerControls() { 
return ( 
<div className="flex gap-3"> 
<button className="px-4 py-2 rounded bg-neutral-800 text-white" onClick={() => send("deezer.prev")}> 
Prev 
</button> 
<button className="px-4 py-2 rounded bg-neutral-800 text-white" onClick={() => send("deezer.playpause")}> 
Play/Pause 
</button> 
<button className="px-4 py-2 rounded bg-neutral-800 text-white" onClick={() => send("deezer.next")}> 
Next 
</button> 
</div> 
);
}

---

5) Fast development vs. production (kiosk)

In production (recommended)

Build quickly (static)

Express serves static files + the API => only one port (5000), very convenient for Kiosks

Approach:

Express on 127.0.0.1:5000

app.use(express.static("dist"))

/api/* for the API

This avoids CORS, and your kiosk only opens one URL.

---

6) Anti-spam click (useful for Deezer)

Two quick solutions:

Frontend: disable the button 300–500ms after click

Backend: rate-limit per action

Backend example (simple):

keeps a timestamp in memory and rejects it if < 200ms.

---

7) Termux Auto Startup (Kiosk Friendly)

Since you're already familiar with this, here's the pattern:

termux-wake-lock

start your pm2 or nohup node

start kiosk at http://127.0.0.1:5000

PM2 works very well on Termux to keep the process running.

--

8) If MacroDroid doesn't respond to 127.0.0.1 (rare but possible)

Keep everything the same, just:

MACRO_BASE="http://192.168.x.x:8080"

In MacroDroid: whitelist IP = 192.168.x.x (the Fold's IP address) And your UI/API remain local-only.
