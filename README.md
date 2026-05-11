# TrueFlow

**Real-time water quality intelligence platform — 3rd APU Sustainability Hackathon 2026**

Live → [trueflow-flo.vercel.app](https://trueflow-flo.vercel.app)

---

## What It Is

TrueFlow is a real-time water quality monitoring dashboard built for Malaysian river systems. It models a network of IoT sensor stations across the Klang River basin, Gombak River, Pendang Reservoir, and Pelus River — processing raw sensor readings into live quality scores, compliance checks, and actionable alerts.

It includes **FLO**, a context-grounded AI assistant that answers questions about live station data: *"Is KLR-03 safe right now?"*, *"Which station has the worst turbidity?"*, *"What does ALERT status mean for dissolved oxygen?"* FLO answers against real current readings, not a static knowledge base.

---

## Features

- **Live dashboard** — 8 monitoring stations, 120-point rolling area charts per parameter
- **Real-time pipeline** — sensor packets → checksum → calibration → quality score → Supabase → WebSocket broadcast → UI update, all in under a second
- **Compliance panel** — checks readings against WHO 2022, MS 1500:2019, and DOE Class II standards per station
- **Alert feed** — flags ALERT / WARNING / NORMAL status with thresholds per parameter
- **FLO AI assistant** — context-aware chatbot with live sensor data injected into every prompt. Multi-model fallback: if the primary model rate-limits, falls through to 5 alternatives automatically
- **Demo simulator** — generates realistic sensor packets using calibrated formulas (Nernst equation for pH, galvanic cell model for DO, probe constants for TDS) and pushes them through the full pipeline live
- **Live injection** — manually inject custom readings per station to test edge cases

---

## How the Data Pipeline Works

```
generateRawPacket()           — produces ADC values, RSSI, battery %, firmware, checksum
      ↓
processPacket()               — applies calibration formulas, computes 0–100 quality score
      ↓
supabase.insert()             — writes to sensor_readings table
      ↓
Supabase Realtime (WebSocket) — broadcasts INSERT event to all subscribed clients
      ↓
Dashboard / Stations page     — receives event, updates state, re-renders charts
```

No polling. Pure event-driven via Supabase Realtime WebSocket subscriptions.

---

## How FLO Works

FLO is not a generic chatbot. Before every response, the backend fetches the latest reading from all 8 stations and injects them as structured context into the system prompt:

```
Station KLR-03 | pH: 6.8 | TDS: 412 ppm | Turbidity: 18 NTU | DO: 5.1 mg/L | Score: 61 | Status: WARNING
Station GBK-01 | pH: 7.2 | TDS: 280 ppm | Turbidity: 6 NTU  | DO: 7.4 mg/L | Score: 84 | Status: NORMAL
...
```

FLO answers from this ground truth. It will not soften an ALERT condition or speculate beyond its data. Full conversation history is maintained across the session.

**Primary model:** `meta-llama/llama-3.2-3b-instruct` via OpenRouter  
**Fallback chain:** Gemma 3 4B → Mistral 7B → Qwen 2.5 → Phi-4 → (local Ollama if configured)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7 |
| Styling | Tailwind CSS v4 (Vite-native) |
| Animation | Framer Motion 12 |
| Charts | Recharts 3 |
| Markdown rendering | react-markdown (FLO responses) |
| Database / Realtime | Supabase (PostgreSQL + WebSocket) |
| AI backend | Node.js + Express, OpenRouter API |
| Frontend deployment | Vercel |
| Backend deployment | Render (paused) |

---

## Architecture

```
Browser
  ├── Supabase JS client (direct — anon key, read/insert)
  │     └── Realtime subscription per page
  └── FLO chat widget → POST /chat → Express backend (Render)
                              └── fetch live Supabase readings
                              └── build context-injected prompt
                              └── OpenRouter API (Llama 3.2 + fallbacks)
```

The frontend connects to Supabase directly for data. The Express backend exists solely to serve the AI chatbot — it fetches live readings, builds the prompt, and proxies to OpenRouter. Separating the AI backend from the frontend keeps the API key server-side.

> **Note:** In a production deployment, the Express backend would be replaced with a Supabase Edge Function to eliminate the separate server. The current architecture is intentional for prototype speed.

---

## Sensors (Simulated)

No physical hardware is deployed. The demo pipeline simulates what ESP32 nodes with DFRobot sensor probes would produce — using the same calibration formulas a real deployment would use:

| Parameter | Model |
|---|---|
| pH | Nernst equation (voltage → pH) |
| TDS | Probe constant method (EC → ppm) |
| Turbidity | Voltage-curve interpolation (NTU) |
| Dissolved Oxygen | Galvanic cell (mV → mg/L) |

The architecture is designed to accept real hardware with no frontend changes — swap `generateRawPacket()` for actual ESP32 POST requests and the rest of the pipeline is identical.

---

## Local Setup

### Prerequisites
- Node.js 18+
- Supabase project with `sensor_readings` table and Realtime enabled
- OpenRouter API key (free tier works)

### Frontend

```bash
git clone https://github.com/williamjonathanliem/trueflow
cd trueflow
npm install
```

Create `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_CHATBOT_URL=http://localhost:3001
```

```bash
npm run dev
```

### Backend (AI chatbot)

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
OPENROUTER_API_KEY=your_openrouter_key

# Optional — use local Ollama instead of OpenRouter
USE_OLLAMA=false
```

```bash
node server.js
```

### Database

Run the SQL schema in your Supabase SQL editor to create the `sensor_readings` table and enable the Realtime publication. Schema file is in `supabase/`.

---

## Hackathon Context

Submitted to the **3rd APU Sustainability Hackathon 2026**, themed around tech-driven solutions for real-world sustainability challenges. Stage 2 was a full-day build event at Asia Pacific University on 25th April 2026, competing for RM3,200 in prizes with a pathway to the France Ocean Hackathon.

---

## License

MIT
