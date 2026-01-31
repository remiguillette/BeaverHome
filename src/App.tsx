import { useMemo, useState } from "react";

const LAMP_URL = "http://127.0.0.1:5001/lampe_on";
const COOLDOWN_MS = 400;
const REQUEST_TIMEOUT_MS = 1200;

function buildTriggerUrl(baseUrl: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("_", Date.now().toString());
  return url.toString();
}

export default function App() {
  const [status, setStatus] = useState("Ready");
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const formattedLastTriggered = useMemo(() => {
    if (!lastTriggered) {
      return "Never";
    }
    return new Date(lastTriggered).toLocaleTimeString();
  }, [lastTriggered]);

  const triggerLamp = () => {
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
    img.src = buildTriggerUrl(LAMP_URL);

    window.setTimeout(() => {
      finish("Trigger sent (timeout).");
    }, REQUEST_TIMEOUT_MS);

    window.setTimeout(() => {
      setIsCoolingDown(false);
    }, COOLDOWN_MS);
  };

  return (
    <div className="app">
      <main className="card">
        <header className="card__header">
          <p className="badge">Samsung-friendly kiosk</p>
          <h1>BeaverHome</h1>
          <p className="subtitle">
            Tap the button to trigger the lamp macro without opening a new tab.
          </p>
        </header>

        <section className="panel">
          <button
            className="action-button"
            type="button"
            onClick={triggerLamp}
            disabled={isCoolingDown}
          >
            {isCoolingDown ? "Please wait..." : "Lampe On"}
          </button>

          <div className="status">
            <p>
              <span>Status:</span> {status}
            </p>
            <p>
              <span>Last trigger:</span> {formattedLastTriggered}
            </p>
            <p className="hint">Target: {LAMP_URL}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
