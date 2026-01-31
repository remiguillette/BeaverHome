import { useEffect, useState } from "react";
import { Battery, Wifi } from "lucide-react";
import { ClockWidget } from "./widgets/ClockWidget";
import { DeezerWidget } from "./widgets/DeezerWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";

const BATTERY_URL = "http://127.0.0.1:5002/system/battery";
const WLAN_URL = "http://127.0.0.1:5002/system/wlan";

export function BeaverDashboard() {
  const [batteryLevel, setBatteryLevel] = useState<string | null>(null);
  const [wlanStatus, setWlanStatus] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const [batteryResponse, wlanResponse] = await Promise.all([
          fetch(BATTERY_URL),
          fetch(WLAN_URL),
        ]);
        const [batteryText, wlanText] = await Promise.all([
          batteryResponse.text(),
          wlanResponse.text(),
        ]);

        if (!isMounted) return;
        setBatteryLevel(batteryText.trim() || null);
        setWlanStatus(wlanText.trim() || null);
      } catch (error) {
        if (!isMounted) return;
        setBatteryLevel(null);
        setWlanStatus(null);
      }
    };

    fetchStatus();
    const interval = window.setInterval(fetchStatus, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="dashboard">
      <header className="android-status-bar">
        <div className="status-bar__left">
          <ClockWidget />
        </div>
        <div className="status-bar__right">
          <span className="status-icon">
            <Wifi aria-hidden="true" />
            <span>{wlanStatus ?? "—"}</span>
          </span>
          <span className="status-icon">
            <Battery aria-hidden="true" />
            <span>{batteryLevel ? `${batteryLevel}%` : "—"}</span>
          </span>
        </div>
      </header>
      <section className="dashboard__grid">
        <DeezerWidget />
        <WeatherWidget />
      </section>
    </div>
  );
}
