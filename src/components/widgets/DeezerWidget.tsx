import { useState } from "react";

const ACTION_ENDPOINT = "http://127.0.0.1:5001/api/action";
const ACTION_NAME = "deezer.next";
const COOLDOWN_MS = 400;

export function DeezerWidget() {
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const triggerNext = async () => {
    if (isCoolingDown) {
      return;
    }

    setIsCoolingDown(true);

    try {
      await fetch(ACTION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: ACTION_NAME }),
      });
    } finally {
      window.setTimeout(() => {
        setIsCoolingDown(false);
      }, COOLDOWN_MS);
    }
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
      </div>
    </article>
  );
}
