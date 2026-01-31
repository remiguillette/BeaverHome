import { useEffect, useState } from "react";

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function ClockWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <article className="widget-card widget-card--clock">
      <header>
        <h2>Clock</h2>
      </header>
      <div className="clock">
        <span className="clock__time">{formatTime(now)}</span>
        <span className="clock__date">{formatDate(now)}</span>
      </div>
    </article>
  );
}
