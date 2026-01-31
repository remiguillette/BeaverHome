import { ClockWidget } from "./widgets/ClockWidget";
import { DeezerWidget } from "./widgets/DeezerWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";

export function BeaverDashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="badge">Test hub layout</p>
          <h1>BeaverDashboard</h1>
          <p className="subtitle">
            A simple kiosk-ready layout with clock, music, and weather widgets.
          </p>
        </div>
        <div className="dashboard__status">
          <span className="status-pill">Local only</span>
          <span className="status-pill">127.0.0.1</span>
        </div>
      </header>

      <section className="dashboard__grid">
        <ClockWidget />
        <DeezerWidget />
        <WeatherWidget />
      </section>
    </div>
  );
}
