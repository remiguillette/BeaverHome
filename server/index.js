import http from "node:http";
import { URL } from "node:url";

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? "5001");
const MEDIA_URL =
  process.env.DEEZER_MEDIA_URL ?? "http://127.0.0.1:5001/deezer/media";
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
    return "0:00";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const parseNowPlaying = (raw) => {
  const match = raw.trim().match(/^\|(.*)\|\|(.*)\|\|(\d+)\|?$/);

  if (!match) {
    return null;
  }

  const artist = match[1].trim();
  const title = match[2].trim();
  const durationMs = Number(match[3]);

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

    const parsed = parseNowPlaying(text);
    state.raw = text;

    if (!parsed) {
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

  sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
});

refreshNowPlaying();
setInterval(refreshNowPlaying, POLL_INTERVAL_MS);
