import { ClockWidget } from "./widgets/ClockWidget";
import { DeezerWidget } from "./widgets/DeezerWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";

export function BeaverDashboard() {
  return (
    <div className="dashboard">
      <section className="dashboard__grid">
        <DeezerWidget />
        <WeatherWidget />
        <ClockWidget />
      </section>
    </div>
  );
}
