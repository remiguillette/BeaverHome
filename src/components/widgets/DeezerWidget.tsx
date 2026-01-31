import { useState } from "react";

const ACTIONS = [
  { action: "back", label: "Back" },
  { action: "play", label: "Play/Pause" },
  { action: "next", label: "Next" }
] as const;

const ACTION_ENDPOINT = "/api/deezer";
const COOLDOWN_MS = 400;

type ActionName = (typeof ACTIONS)[number]["action"];

export function DeezerWidget() {
  const [cooldownAction, setCooldownAction] = useState<ActionName | null>(null);

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

  return (
    <article className="widget-card">
      <header>
        <h2>Deezer</h2>
        <p className="widget-subtitle">Music controls</p>
      </header>
      <div className="widget-body">
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
