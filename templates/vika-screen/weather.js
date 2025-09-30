/* === Konstanter for Sandnes === */
const LAT = 58.85, LON = 5.74;  // Sandnes, Rogaland
const LOCALE = 'nb-NO';

/* === Skaler scenen til skjermen (TV) === */
function scaleStage() {
    const s = document.getElementById('stage');
    const sx = innerWidth / 1920, sy = innerHeight / 1080;
    s.style.transform = `scale(${Math.min(sx, sy)})`;
}
addEventListener('resize', scaleStage); scaleStage();

/* === Klokke (oppdater hvert sekund) === */
function tickClock() {
    const now = new Date();
    const opts = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    document.getElementById('clock').textContent = now.toLocaleString(LOCALE, opts);
}
setInterval(tickClock, 1000); tickClock();

/* === WMO-koder → tekst + emoji === */
const WMO = {
    0: ["Klar himmel", "☀️"], 1: ["For det meste klart", "🌤️"], 2: ["Delvis skyet", "⛅"], 3: ["Skyet", "☁️"],
    45: ["Tåke", "🌫️"], 48: ["Tåke", "🌫️"],
    51: ["Yr", "🌦️"], 53: ["Yr", "🌦️"], 55: ["Yr", "🌦️"],
    61: ["Regn", "🌧️"], 63: ["Regn", "🌧️"], 65: ["Kraftig regn", "🌧️"],
    66: ["Underkjølt regn", "🌧️"], 67: ["Underkjølt regn", "🌧️"],
    71: ["Snø", "❄️"], 73: ["Snø", "❄️"], 75: ["Snø", "❄️"],
    80: ["Regnbyger", "🌧️"], 81: ["Regnbyger", "🌧️"], 82: ["Kraftige byger", "🌧️"],
    95: ["Torden", "⛈️"], 96: ["Torden med hagl", "⛈️"], 99: ["Kraftig torden", "⛈️"],
};

/* === API-kall (Open-Meteo) === */
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&timezone=auto`
        + `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover`
        + `&hourly=temperature_2m,weather_code,precipitation_probability`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Kunne ikke hente værdata');
    return await r.json();
}

/* === Render === */
function render(data) {
    // Nåværende
    const temp = Math.round(data.current.temperature_2m);
    const feels = Math.round(data.current.apparent_temperature);
    const wind = Math.round(data.current.wind_speed_10m);
    const clouds = Math.round(data.current.cloud_cover ?? 0);
    const [txt, ico] = WMO[data.current.weather_code] || ["–", "🌡️"];
    document.getElementById('temp').textContent = `${temp}°`;
    document.getElementById('feels').textContent = `Føles som: ${feels}°`;
    document.getElementById('wdesc').textContent = `${ico} ${txt}`;
    document.getElementById('wind').textContent = `${wind} m/s`;
    document.getElementById('clouds').textContent = `${clouds}%`;

    // Dagens H/L
    document.getElementById('hilo').textContent =
        `H: ${Math.round(data.daily.temperature_2m_max[0])}°  •  L: ${Math.round(data.daily.temperature_2m_min[0])}°`;

    // Sammendrag
    document.getElementById('summary').textContent =
        `I dag: ${txt}, ${Math.round(data.daily.temperature_2m_min[0])}°–${Math.round(data.daily.temperature_2m_max[0])}°`;

    // Finn indeks for "neste time" for sannsynlighet
    const now = new Date();
    let idx = data.hourly.time.findIndex(t => new Date(t) > now);
    if (idx < 0) idx = 0;
    const probNext = data.hourly.precipitation_probability[idx] ?? 0;
    document.getElementById('prec').textContent = `${probNext}%`;

    // Hourly (neste 8 timer)
    const hours = document.getElementById('hours'); hours.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const j = Math.min(idx + i, data.hourly.time.length - 1);
        const t = Math.round(data.hourly.temperature_2m[j]);
        const code = data.hourly.weather_code[j];
        const icoH = (WMO[code] || ["", "🌡️"])[1];
        const hh = new Date(data.hourly.time[j]).toLocaleTimeString(LOCALE, { hour: '2-digit' });
        const p = data.hourly.precipitation_probability[j] ?? 0;

        const el = document.createElement('div');
        el.className = 'hour';
        el.innerHTML = `
      <div class="h">${hh}</div>
      <div style="font-size:40px">${icoH}</div>
      <div class="t">${t}°</div>
      <div class="bar"><i style="width:${p}%; background:${p > 60 ? '#60a5fa' : '#93c5fd'}"></i></div>
    `;
        hours.appendChild(el);
    }

    // Daily (7 dager)
    const days = document.getElementById('days'); days.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const tmax = Math.round(data.daily.temperature_2m_max[i]);
        const tmin = Math.round(data.daily.temperature_2m_min[i]);
        const code = data.daily.weather_code[i];
        const [txtD, icoD] = WMO[code] || ["", "🌡️"];
        const name = new Date(data.daily.time[i]).toLocaleDateString(LOCALE, { weekday: 'short' });

        const d = document.createElement('div');
        d.className = 'day';
        d.innerHTML = `
      <div class="name">${name}</div>
      <div class="ico">${icoD}</div>
      <div class="range"><b>${tmax}°</b> / <i>${tmin}°</i></div>
      <div style="opacity:.95;margin-top:6px">${txtD}</div>
    `;
        days.appendChild(d);
    }
}

/* === Init + auto-oppdatering hvert minutt === */
async function loadOnce() {
    try {
        const data = await fetchWeather(LAT, LON);
        render(data);
    } catch (e) {
        console.error(e);
    }
}
loadOnce();
setInterval(loadOnce, 60 * 1000); // 1 minutt
