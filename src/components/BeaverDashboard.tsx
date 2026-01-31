import { ClockWidget } from "./widgets/ClockWidget";
import { DeezerWidget } from "./widgets/DeezerWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";

export function BeaverDashboard() {
  return (
    <div className="dashboard">
      <header className="android-status-bar">
        <div className="status-bar__left">
          <ClockWidget />
        </div>
        <div className="status-bar__right">
          <span className="status-icon">📶 5G</span>
          <span className="status-icon">🛜</span>
          <span className="status-icon">🔋 85%</span>
        </div>
      </header>
      <section className="dashboard__grid">
        <DeezerWidget />
        <WeatherWidget />
      </section>
    </div>
  );
}
