import { ClockWidget } from "./widgets/ClockWidget";
import { DeezerWidget } from "./widgets/DeezerWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";

export function BeaverDashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>BeaverDashboard</h1>
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
