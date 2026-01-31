import { useEffect, useState } from "react";

const ACTIONS = [
  { action: "back", label: "Back" },
  { action: "play", label: "Play/Pause" },
  { action: "next", label: "Next" }
] as const;

const ACTION_ENDPOINT = "/api/deezer";
const NOW_PLAYING_ENDPOINT = "/api/now-playing";
const COOLDOWN_MS = 400;

type ActionName = (typeof ACTIONS)[number]["action"];

type NowPlaying = {
  artist: string;
  title: string;
  durationMs: number;
  duration: string;
};

type NowPlayingResponse = {
  ok: boolean;
  nowPlaying?: NowPlaying | null;
  updatedAt?: string | null;
  error?: string | null;
};

export function DeezerWidget() {
  const [cooldownAction, setCooldownAction] = useState<ActionName | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [nowPlayingError, setNowPlayingError] = useState<string | null>(null);
  const [nowPlayingUpdatedAt, setNowPlayingUpdatedAt] = useState<string | null>(null);

  const handleNowPlayingPayload = (data: NowPlayingResponse) => {
    if (data.ok && data.nowPlaying) {
      setNowPlaying(data.nowPlaying);
      setNowPlayingUpdatedAt(data.updatedAt ?? null);
      setNowPlayingError(null);
    } else {
      setNowPlaying(null);
      setNowPlayingUpdatedAt(data.updatedAt ?? null);
      setNowPlayingError(data.error ?? "No player data yet.");
    }
  };

  const triggerAction = async (action: ActionName) => {
    if (cooldownAction) {
      return;
    }

    setCooldownAction(action);

    try {
      await fetch(`${ACTION_ENDPOINT}/${action}`, {
        method: "GET"
      });
    } finally {
      window.setTimeout(() => {
        setCooldownAction(null);
      }, COOLDOWN_MS);
    }
  };

  useEffect(() => {
    let active = true;

    const loadNowPlaying = async () => {
      try {
        const response = await fetch(NOW_PLAYING_ENDPOINT);
        const data = (await response.json()) as NowPlayingResponse;

        if (!active) {
          return;
        }

        handleNowPlayingPayload(data);
      } catch (error) {
        if (!active) {
          return;
        }

        setNowPlaying(null);
        setNowPlayingUpdatedAt(null);
        setNowPlayingError("Unable to reach the player info.");
      }
    };

    loadNowPlaying();

    if (!("EventSource" in window)) {
      const interval = window.setInterval(loadNowPlaying, 4000);

      return () => {
        active = false;
        window.clearInterval(interval);
      };
    }

    const eventSource = new EventSource("/api/now-playing/events");

    eventSource.addEventListener("nowPlaying", (event) => {
      if (!active) {
        return;
      }

      try {
        const data = JSON.parse(event.data) as NowPlayingResponse;
        handleNowPlayingPayload(data);
      } catch (parseError) {
        setNowPlayingError("Unable to read now playing updates.");
      }
    });

    eventSource.addEventListener("error", () => {
      if (!active) {
        return;
      }

      setNowPlayingError((prev) => prev ?? "Waiting for player updates...");
    });

    return () => {
      active = false;
      eventSource.close();
    };
  }, []);

  return (
    <article className="widget-card">
      <header>
        <h2>Deezer</h2>
        <p className="widget-subtitle">Music controls</p>
      </header>
      <div className="widget-body">
        <section className="deezer-now-playing">
          <p className="deezer-now-playing__label">Now playing</p>
          {nowPlaying ? (
            <div className="deezer-now-playing__track">
              <p className="deezer-now-playing__title">{nowPlaying.title}</p>
              <p className="deezer-now-playing__meta">
                {nowPlaying.artist} · {nowPlaying.duration}
              </p>
              {nowPlayingUpdatedAt ? (
                <p className="deezer-now-playing__timestamp">
                  Updated {new Date(nowPlayingUpdatedAt).toLocaleTimeString()}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="deezer-now-playing__empty">
              {nowPlayingError ?? "Waiting for playback..."}
            </p>
          )}
        </section>
        <div className="deezer-controls">
          {ACTIONS.map(({ action, label }) => (
            <button
              key={action}
              className="action-button"
              type="button"
              onClick={() => triggerAction(action)}
              disabled={cooldownAction !== null}
            >
              {cooldownAction === action ? "Please wait..." : label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
