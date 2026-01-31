import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? "5001");
const MEDIA_URL =
  process.env.DEEZER_MEDIA_URL ?? "http://127.0.0.1:5002/deezer/media";
const POLL_INTERVAL_MS = Number(
  process.env.DEEZER_POLL_INTERVAL_MS ?? "50000"
);

const state = {
  raw: "",
  parsed: null,
  updatedAt: null,
  lastChecked: null,
  error: null
};

const formatDuration = (durationMs) => {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const parseNowPlaying = (raw) => {
  const parts = raw.trim().split("|");

  if (parts.length < 3) {
    return null;
  }

  const artist = parts[0].trim();
  const durationMs = Number(parts[parts.length - 1]);
  const title = parts.slice(1, -1).join("|").trim();

  if (!artist || !title || !Number.isFinite(durationMs)) {
    return null;
  }

  return {
    artist,
    title,
    durationMs,
    duration: formatDuration(durationMs)
  };
};

const refreshNowPlaying = async () => {
  state.lastChecked = new Date().toISOString();

  try {
    const response = await fetch(MEDIA_URL, { method: "GET" });
    const text = await response.text();

    if (text === state.raw) {
      return;
    }

    state.raw = text;

    const parsed = parseNowPlaying(text);
    if (!parsed) {
      state.parsed = null;
      state.updatedAt = null;
      state.error = "Unable to parse now playing payload.";
      return;
    }

    state.parsed = parsed;
    state.updatedAt = new Date().toISOString();
    state.error = null;
  } catch (error) {
    state.error = error?.message ?? String(error);
  }
};

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
};

const PUBLIC_DIR = path.join(__dirname, "..", "dist");

const contentTypeByExt = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".ico": "image/x-icon"
};

const serveStatic = (req, res) => {
  if (!fs.existsSync(PUBLIC_DIR)) {
    return false;
  }

  const urlPath = (req.url ?? "/").split("?")[0];
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return false;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypeByExt[ext] ?? "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
  fs.createReadStream(filePath).pipe(res);
  return true;
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);

  if (req.method === "GET" && url.pathname === "/api/now-playing") {
    sendJson(res, 200, {
      ok: Boolean(state.parsed),
      nowPlaying: state.parsed,
      updatedAt: state.updatedAt,
      lastChecked: state.lastChecked,
      error: state.error
    });
    return;
  }

  if (req.method === "GET" && serveStatic(req, res)) {
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, HOST, () => {
  console.log(`App listening on http://${HOST}:${PORT}`);
  console.log(`Polling source: ${MEDIA_URL} every ${POLL_INTERVAL_MS}ms`);
});

refreshNowPlaying();
setInterval(refreshNowPlaying, POLL_INTERVAL_MS);
