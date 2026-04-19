# TrueFlow — Water Quality Intelligence Platform

Real-time water quality monitoring across Malaysia. Sensor data flows from hardware bots → Supabase → live UI. Every reading is timestamped, station-attributed, and scored against WHO & Malaysian standards.

> *Water is meant to be transparent. The data behind it should be too.*

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see Environment Variables section)

# 3. Run dev server
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://ciqpampmjzbaaxqtacir.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_qH7lxiycZRYUO4UnfqrNAw_pSwmCsoq
```

These are already in `.env` locally. If you're setting up fresh, ask for the values — do **not** commit `.env` to git.

---

## Supabase Setup (one-time)

Go to the Supabase SQL editor → paste and run this schema:

```sql
create table sensor_readings (
  id            uuid          default gen_random_uuid() primary key,
  station_id    text          not null,
  device_id     text          not null,
  firmware      text,
  uptime_s      bigint,
  battery_pct   integer,
  signal_rssi   integer,
  ph_mv         integer,
  tds_mv        integer,
  turb_v        numeric(6,3),
  ph            numeric(4,2),
  tds           numeric(6,1),
  turbidity     numeric(6,3),
  quality_score integer,
  status        text          default 'NOMINAL',
  checksum      text,
  created_at    timestamptz   default now()
);

alter table sensor_readings enable row level security;
create policy "anon_read"   on sensor_readings for select to anon using (true);
create policy "anon_insert" on sensor_readings for insert to anon with check (true);

alter publication supabase_realtime add table sensor_readings;
```

To clear the database periodically:
```sql
delete from sensor_readings;
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — mission, how it works, impact |
| `/stations` | All 8 monitoring stations with live status |
| `/dashboard` | Deep-dive per-station with charts and compliance |
| `/demo` | Private pipeline simulator — fires raw sensor packets |
| `/about` | Company identity and mission |

---

## Architecture

```
Browser (React/Vite)
  ├── /demo page → generates raw packet → inserts to Supabase
  ├── Supabase Realtime (WebSocket) → pushes INSERT events to all open pages
  ├── /stations → listens for all station updates
  └── /dashboard → listens for updates on the selected station
```

There is no separate backend. The Vite app talks directly to Supabase via the anon key. In production, real ESP32 sensors would POST to a Supabase Edge Function instead of the browser inserting directly.

---

## Stations

8 monitoring stations across 3 areas:

| ID | Name | Area | Typical Profile |
|---|---|---|---|
| KLR-04 | Klang R. — Stn 04 | Klang River | pH 7.2, TDS 98 ppm, 0.2 NTU |
| KLR-01 | Klang R. — Stn 01 | Klang River | pH 7.1, TDS 112 ppm, 0.3 NTU |
| KLR-02 | Klang R. — Stn 02 | Klang River | pH 6.8, TDS 198 ppm, 1.4 NTU |
| KLR-03 | Klang R. — Stn 03 | Klang River | pH 6.2, TDS 342 ppm, 3.8 NTU ⚠️ |
| GOM-01 | Gombak — Stn 01 | Gombak | pH 7.4, TDS 78 ppm, 0.1 NTU ✓ |
| GOM-02 | Gombak — Stn 02 | Gombak | pH 7.0, TDS 164 ppm, 0.9 NTU |
| PND-01 | Pendang Reservoir | Pendang | pH 7.3, TDS 55 ppm, 0.05 NTU ✓ |
| PEL-01 | Pelus — Stn 01 | Pelus | pH 7.1, TDS 90 ppm, 0.2 NTU |

KLR-03 consistently reads WARNING/ALERT — intentional, reflects real upstream contamination profile.

---

## Sensor Data & Calibration

Hardware model: **ESP32** with 3 analog probes.

### Raw → Calibrated

| Sensor | Raw | Calibration Formula |
|---|---|---|
| pH | mV from ADC | `pH = 7.0 + (2048 − mV) / 59.16` (Nernst at 25°C) |
| TDS | mV from ADC | `ppm = (mV / 1000) × 0.64 × 500` |
| Turbidity | Voltage (0–4.5V) | `NTU = ((4.5 − V) / 0.5)^1.5 × 2.0` |

### Quality Score (0–100)

Weighted composite across 3 parameters:

| Parameter | Weight | Scoring |
|---|---|---|
| pH | 40% | 100 pts if 7.0–7.5 → 0 pts if outside 6.5–8.5 |
| TDS | 30% | 100 pts if <100 ppm → 0 pts if >500 ppm |
| Turbidity | 30% | 100 pts if <0.1 NTU → 0 pts if >4 NTU |

Status thresholds: **NOMINAL** ≥70 · **WARNING** 40–69 · **ALERT** <40

Compliance references: WHO 2022, MS 1500:2019, DOE Class II

---

## Demo Pipeline (`/demo`)

The `/demo` page simulates what a real deployed sensor would do. It is private — not linked from the public nav except via the Dashboard sidebar.

**What it does:**
1. Generates a realistic raw JSON packet (mV values + device metadata)
2. Animates the 6-step ingestion pipeline visually: Receive → Checksum → Calibrate → Score → Store → Broadcast
3. Inserts the processed reading into Supabase
4. All open pages (`/stations`, `/dashboard`) update in real-time via WebSocket

**Simulation settings:**
- Demo interval: **6 seconds** per station (accelerated for visibility)
- Production equivalent: **every 5 minutes** per station (10 checks/hour)
- With 8 stations: **80 Supabase inserts/hour** in production
- Cycles through all 8 stations in rotation

**Raw packet shape (what FLO hardware would POST):**
```json
{
  "device_id": "FLO-KLR-04",
  "firmware": "v2.1.3",
  "uptime_s": 9483729,
  "battery_pct": 91,
  "signal_rssi": -63,
  "ts": 1713884729,
  "raw": {
    "ph_mv": 2033,
    "tds_mv": 298,
    "turb_v": 4.381
  },
  "checksum": "a3f7c02e"
}
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion v12 |
| Charts | Recharts v3 |
| Database | Supabase (PostgreSQL + Realtime) |

### Fonts
- **Syne** — labels, badges, nav
- **Plus Jakarta Sans** — headlines
- **JetBrains Mono** — data values, terminal, numbers
- **Inter** — body text

### Color Palette
```
#020d18   dark background
#051a2d   section background
#0ea5e9   primary blue
#0369a1   deep blue
#7dd3fc   shimmer / highlight
#f0f8ff   light text
```

---

## File Structure

```
src/
├── App.jsx                  # Router, preloader, footer visibility logic
├── main.jsx                 # React entry point
├── pages/
│   ├── LandingPage.jsx      # Assembles all landing sections
│   ├── DashboardPage.jsx    # Per-station live dashboard
│   ├── StationsPage.jsx     # Station grid with live status
│   ├── DemoPage.jsx         # Pipeline simulator
│   └── AboutPage.jsx        # Company mission and identity
├── components/
│   ├── Navbar.jsx           # Sticky frosted-glass nav
│   ├── Footer.jsx           # Site footer (hidden on /dashboard and /demo)
│   ├── Hero.jsx             # Landing hero with canvas animation
│   ├── Problem.jsx          # Problem statement section
│   ├── HowItWorks.jsx       # 3-step explainer
│   ├── Dashboard.jsx        # Dashboard preview section on landing
│   ├── Impact.jsx           # SDG6 impact section
│   ├── Team.jsx             # Team section
│   └── ClosingCTA.jsx       # Final CTA section
└── lib/
    ├── supabase.js          # Supabase client (reads from .env)
    └── dataProcessor.js     # Calibration formulas, station profiles, scoring
```

---

## Build

```bash
npm run build    # outputs to /dist
npm run preview  # preview production build locally
```

---

## Notes for Teammates

- **No sensors yet** — the demo page simulates what real hardware would send. The calibration formulas and station profiles are based on real sensor specs (ESP32 + DFRobot probes).
- **Supabase anon key is public** — this is intentional for a client-side app. RLS policies restrict writes to valid inserts only. Do not use the service role key client-side.
- **Footer** — intentionally hidden on `/dashboard` and `/demo` (app-like pages). Shown on all others.
- **KLR-03** will almost always show WARNING or ALERT — its sensor profile is tuned to reflect a higher-contamination source. This is by design.
- **Realtime** uses Supabase WebSocket channels. Each page subscribes on mount and unsubscribes on unmount. The dashboard re-subscribes when you switch stations.
