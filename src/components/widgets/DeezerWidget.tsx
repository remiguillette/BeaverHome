import { useMemo, useState } from "react";

const DEEZER_NEXT_URL = "http://127.0.0.1:5001/deezer/next";
const COOLDOWN_MS = 400;
const REQUEST_TIMEOUT_MS = 1200;

function buildTriggerUrl(baseUrl: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("_", Date.now().toString());
  return url.toString();
}

export function DeezerWidget() {
  const [status, setStatus] = useState("Ready");
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const formattedLastTriggered = useMemo(() => {
    if (!lastTriggered) {
      return "Never";
    }
    return new Date(lastTriggered).toLocaleTimeString();
  }, [lastTriggered]);

  const triggerNext = () => {
    if (isCoolingDown) {
      return;
    }

    setStatus("Sending trigger...");
    setIsCoolingDown(true);

    const img = new Image();
    img.decoding = "async";
    let done = false;
    const finish = (message: string) => {
      if (done) {
        return;
      }
      done = true;
      setStatus(message);
      setLastTriggered(new Date().toISOString());
    };

    img.onload = () => {
      finish("Trigger sent.");
    };
    img.onerror = () => {
      finish("Trigger sent (no response).");
    };
    img.src = buildTriggerUrl(DEEZER_NEXT_URL);

    window.setTimeout(() => {
      finish("Trigger sent (timeout).");
    }, REQUEST_TIMEOUT_MS);

    window.setTimeout(() => {
      setIsCoolingDown(false);
    }, COOLDOWN_MS);
  };

  return (
    <article className="widget-card">
      <header>
        <h2>Deezer</h2>
        <p className="widget-subtitle">Music controls</p>
      </header>
      <div className="widget-body">
        <button
          className="action-button"
          type="button"
          onClick={triggerNext}
          disabled={isCoolingDown}
        >
          {isCoolingDown ? "Please wait..." : "Next Track"}
        </button>
        <div className="status">
          <p>
            <span>Status:</span> {status}
          </p>
          <p>
            <span>Last trigger:</span> {formattedLastTriggered}
          </p>
          <p className="hint">Target: {DEEZER_NEXT_URL}</p>
        </div>
      </div>
    </article>
  );
}
