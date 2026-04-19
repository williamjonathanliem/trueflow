// ── FLO Sensor Calibration & Processing ─────────────────────────────────────
//
// FLO hardware: ESP32 + analog sensor array
//   pH probe   → ADC → mV reading
//   TDS probe  → ADC → mV reading
//   Turbidity  → analog voltage (0–4.5V)
//
// Data is POSTed every 30s as a raw JSON packet (see generateRawPacket).
// This module converts raw hardware values to calibrated readings and scores.
// ─────────────────────────────────────────────────────────────────────────────

// pH calibration
// Nernst equation at 25°C: 59.16 mV per pH unit, midpoint = 2048 mV → pH 7.0
export function calibratePh(mv) {
  const ph = 7.0 + (2048 - mv) / 59.16
  return Math.round(Math.max(0, Math.min(14, ph)) * 100) / 100
}

// TDS calibration
// ADC mV → voltage → electrical conductivity → ppm (500 scale)
export function calibrateTds(mv) {
  const voltage = mv / 1000
  const ec = voltage * 0.64        // probe constant K = 0.64 cm⁻¹
  const tds = ec * 500             // 1 μS/cm ≈ 0.5 ppm (500 factor)
  return Math.round(Math.max(0, tds))
}

// Turbidity calibration
// DFRobot-style optical sensor: higher voltage = cleaner water
// Range: 3.5V (very turbid ~5 NTU) to 4.5V (crystal clear ~0 NTU)
export function calibrateTurbidity(v) {
  const ntu = Math.max(0, Math.pow((4.5 - v) / 0.5, 1.5) * 2.0)
  return Math.round(ntu * 1000) / 1000
}

// Quality scoring: weighted composite 0–100
// Weights: pH 40% | TDS 30% | Turbidity 30%
export function scoreReading({ ph, tds, turbidity }) {
  // pH: optimal 7.0–7.5 | acceptable 6.5–8.5 | outside = fail
  let phScore = 100
  if (ph < 6.5 || ph > 8.5) phScore = 0
  else if (ph < 7.0) phScore = 60 + ((ph - 6.5) / 0.5) * 40
  else if (ph > 7.5) phScore = 100 - ((ph - 7.5) / 1.0) * 40

  // TDS: <100 excellent | <300 good | <500 acceptable | >500 fail
  let tdsScore = 100
  if (tds > 500) tdsScore = 0
  else if (tds > 300) tdsScore = 40 + ((500 - tds) / 200) * 30
  else if (tds > 100) tdsScore = 70 + ((300 - tds) / 200) * 30

  // Turbidity: <0.1 excellent | <1 good | <4 acceptable | >4 fail
  let turbScore = 100
  if (turbidity > 4) turbScore = 0
  else if (turbidity > 1) turbScore = 40 + ((4 - turbidity) / 3) * 40
  else if (turbidity > 0.1) turbScore = 80 + ((1 - turbidity) / 0.9) * 20

  const quality_score = Math.round(phScore * 0.4 + tdsScore * 0.3 + turbScore * 0.3)
  const status = quality_score < 40 ? 'ALERT' : quality_score < 70 ? 'WARNING' : 'NOMINAL'

  return { quality_score, status }
}

// Per-station sensor profiles — base hardware values + realistic variance
// ph_mv  = 2048 − (ph − 7.0) × 59.16   (Nernst at 25°C)
// tds_mv = tds / 0.32                    (inverse of calibrateTds)
// turb_v = 4.5 − 0.5 × (ntu/2)^(2/3)   (inverse of calibrateTurbidity)
export const STATION_PROFILES = {
  'KLR-04': { ph_mv: 2036, tds_mv: 306,  turb_v: 4.39, ph_var: 40,  tds_var: 30,  turb_var: 0.08 }, // pH 7.2 | TDS 98  | 0.2 NTU
  'KLR-01': { ph_mv: 2042, tds_mv: 350,  turb_v: 4.36, ph_var: 40,  tds_var: 35,  turb_var: 0.10 }, // pH 7.1 | TDS 112 | 0.3 NTU
  'KLR-02': { ph_mv: 2060, tds_mv: 619,  turb_v: 4.10, ph_var: 55,  tds_var: 55,  turb_var: 0.18 }, // pH 6.8 | TDS 198 | 1.4 NTU
  'KLR-03': { ph_mv: 2095, tds_mv: 1069, turb_v: 3.73, ph_var: 70,  tds_var: 90,  turb_var: 0.25 }, // pH 6.2 | TDS 342 | 3.8 NTU
  'GOM-01': { ph_mv: 2024, tds_mv: 244,  turb_v: 4.43, ph_var: 30,  tds_var: 25,  turb_var: 0.06 }, // pH 7.4 | TDS 78  | 0.1 NTU
  'GOM-02': { ph_mv: 2048, tds_mv: 513,  turb_v: 4.21, ph_var: 45,  tds_var: 45,  turb_var: 0.14 }, // pH 7.0 | TDS 164 | 0.9 NTU
  'PND-01': { ph_mv: 2030, tds_mv: 172,  turb_v: 4.46, ph_var: 25,  tds_var: 20,  turb_var: 0.04 }, // pH 7.3 | TDS 55  | 0.05 NTU
  'PEL-01': { ph_mv: 2042, tds_mv: 281,  turb_v: 4.39, ph_var: 35,  tds_var: 28,  turb_var: 0.08 }, // pH 7.1 | TDS 90  | 0.2 NTU
}

// Generate a realistic raw sensor packet (what FLO would actually POST)
export function generateRawPacket(stationId = 'KLR-04') {
  const p = STATION_PROFILES[stationId] ?? STATION_PROFILES['KLR-04']
  const ph_mv  = Math.round(p.ph_mv  + (Math.random() - 0.5) * p.ph_var  * 2)
  const tds_mv = Math.round(p.tds_mv + (Math.random() - 0.5) * p.tds_var * 2)
  const turb_v = parseFloat((p.turb_v + (Math.random() - 0.5) * p.turb_var * 2).toFixed(3))
  const checksum = [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')

  return {
    device_id:   `FLO-${stationId}`,
    firmware:    'v2.1.3',
    uptime_s:    Math.round(Date.now() / 1000 - 1_713_000_000),
    battery_pct: Math.round(80 + Math.random() * 15),
    signal_rssi: Math.round(-58 - Math.random() * 16),
    ts:          Math.floor(Date.now() / 1000),
    raw:         { ph_mv, tds_mv, turb_v },
    checksum,
  }
}

// Process raw packet into a clean, storable reading
export function processPacket(packet, stationId = 'KLR-04') {
  const ph         = calibratePh(packet.raw.ph_mv)
  const tds        = calibrateTds(packet.raw.tds_mv)
  const turbidity  = calibrateTurbidity(packet.raw.turb_v)
  const { quality_score, status } = scoreReading({ ph, tds, turbidity })

  return {
    station_id:   stationId,
    device_id:    packet.device_id,
    firmware:     packet.firmware,
    uptime_s:     packet.uptime_s,
    battery_pct:  packet.battery_pct,
    signal_rssi:  packet.signal_rssi,
    ph_mv:        packet.raw.ph_mv,
    tds_mv:       packet.raw.tds_mv,
    turb_v:       packet.raw.turb_v,
    ph,
    tds,
    turbidity,
    quality_score,
    status,
    checksum:     packet.checksum,
  }
}
