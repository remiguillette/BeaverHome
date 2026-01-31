export function WeatherWidget() {
  return (
    <article className="widget-card">
      <header>
        <h2>Weather</h2>
        <p className="widget-subtitle">Local snapshot</p>
      </header>
      <div className="weather">
        <div className="weather__summary">
          <span className="weather__temp">22°</span>
          <div>
            <p className="weather__condition">Partly cloudy</p>
            <p className="weather__meta">Feels like 24° · Humidity 45%</p>
          </div>
        </div>
        <div className="weather__row">
          <div>
            <p className="weather__label">Forecast</p>
            <p className="weather__value">Rain after 18:00</p>
          </div>
          <div>
            <p className="weather__label">Wind</p>
            <p className="weather__value">8 km/h NE</p>
          </div>
        </div>
      </div>
    </article>
  );
}
