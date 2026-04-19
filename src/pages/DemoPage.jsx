import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { generateRawPacket, processPacket } from '../lib/dataProcessor'

// ── JSON Syntax Highlighter ───────────────────────────────────────────────────
function JsonTerminal({ entries }) {

  function highlight(json) {
    return JSON.stringify(json, null, 2)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span style="color:#7dd3fc">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span style="color:#86efac">"$1"</span>')
      .replace(/: (-?\d+\.?\d*)/g, ': <span style="color:#fbbf24">$1</span>')
      .replace(/: (true|false|null)/g, ': <span style="color:#f472b6">$1</span>')
  }

  return (
    <div style={{
      background: '#0a0f1a',
      borderRadius: 12,
      border: '1px solid rgba(14,165,233,0.12)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Terminal header */}
      <div style={{
        padding: '10px 16px',
        background: 'rgba(14,165,233,0.05)',
        borderBottom: '1px solid rgba(14,165,233,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(14,165,233,0.5)', letterSpacing: '0.06em', marginLeft: 4 }}>
          flo-sensor-feed — bash
        </span>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#22c55e', textTransform: 'uppercase' }}>LIVE</span>
        </motion.div>
      </div>

      {/* Terminal body — fixed height, scrolls internally */}
      <div style={{ height: 520, overflowY: 'auto', padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace" }}>
        {entries.map((entry, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'rgba(14,165,233,0.4)', marginBottom: 4, letterSpacing: '0.04em' }}>
              <span style={{ color: '#22c55e' }}>→</span>{' '}
              <span style={{ color: 'rgba(180,220,255,0.3)' }}>[{entry.time}]</span>{' '}
              <span style={{ color: '#7dd3fc' }}>POST</span>{' '}
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>/api/ingest/{entry.packet.device_id}</span>
            </div>
            <pre
              style={{ margin: 0, fontSize: 11, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              dangerouslySetInnerHTML={{ __html: highlight(entry.packet) }}
            />
          </div>
        ))}

      </div>
    </div>
  )
}

// ── Processing Pipeline ────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { id: 'rx',       label: 'Packet received',          detail: null },
  { id: 'checksum', label: 'Checksum validated',        detail: null },
  { id: 'calib',    label: 'Raw values calibrated',     detail: null },
  { id: 'score',    label: 'Quality score computed',    detail: null },
  { id: 'store',    label: 'Written to Supabase',       detail: null },
  { id: 'rt',       label: 'Broadcast via Realtime',    detail: null },
]

function Pipeline({ activeStep, processed, raw }) {
  const stepDetails = processed ? {
    rx:       `device_id: ${raw?.device_id}`,
    checksum: `${raw?.checksum} ✓`,
    calib:    `${raw?.raw?.ph_mv}mV → ${processed?.ph} pH`,
    score:    `${processed?.quality_score}/100 — ${processed?.status}`,
    store:    `sensor_readings (KLR-04)`,
    rt:       `channel: sensor-readings`,
  } : {}

  return (
    <div style={{
      background: '#0a0f1a',
      borderRadius: 12,
      border: '1px solid rgba(14,165,233,0.12)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      height: '100%',
    }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.45)', marginBottom: 16 }}>
        Processing Pipeline
      </div>

      {PIPELINE_STEPS.map((step, i) => {
        const done = activeStep > i
        const active = activeStep === i
        return (
          <div key={step.id} style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
            {/* Connector line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
              <motion.div
                animate={{ background: done || active ? '#0ea5e9' : 'rgba(255,255,255,0.1)', boxShadow: active ? '0 0 10px rgba(14,165,233,0.8)' : 'none' }}
                transition={{ duration: 0.3 }}
                style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 2 }}
              />
              {i < PIPELINE_STEPS.length - 1 && (
                <motion.div
                  style={{ width: 1, flex: 1, minHeight: 28, background: done ? '#0ea5e9' : 'rgba(255,255,255,0.06)', marginTop: 2 }}
                  animate={{ background: done ? '#0ea5e9' : 'rgba(255,255,255,0.06)' }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>

            {/* Step content */}
            <div style={{ paddingLeft: 10, paddingBottom: i < PIPELINE_STEPS.length - 1 ? 16 : 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: done || active ? 600 : 400,
                  color: done ? '#22c55e' : active ? '#0ea5e9' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.3s',
                }}>
                  {step.label}
                </span>
                {done && <span style={{ color: '#22c55e', fontSize: 11 }}>✓</span>}
                {active && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#0ea5e9' }}
                  >
                    ...
                  </motion.span>
                )}
              </div>
              {done && stepDetails[step.id] && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(125,211,252,0.5)', marginTop: 2, letterSpacing: '0.02em' }}
                >
                  {stepDetails[step.id]}
                </motion.div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Live Output Card ───────────────────────────────────────────────────────────
function LiveCard({ reading, firing }) {
  const statusColor = reading?.status === 'NOMINAL' ? '#22c55e' : reading?.status === 'WARNING' ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      background: '#0a0f1a',
      borderRadius: 12,
      border: '1px solid rgba(14,165,233,0.12)',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Card header */}
      <div style={{ padding: '10px 16px', background: 'rgba(14,165,233,0.05)', borderBottom: '1px solid rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.45)' }}>
          Live Output — {reading?.station_id ?? '—'}
        </span>
        {reading && (
          <motion.div
            key={reading?.quality_score}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, color: statusColor, fontSize: 10, fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.05em' }}
          >
            {reading?.status}
          </motion.div>
        )}
      </div>

      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!reading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', items: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.04em' }}>
              Awaiting first packet...
            </span>
          </div>
        ) : (
          <>
            {/* Metrics grid */}
            {[
              { label: 'pH', value: reading.ph, unit: 'pH', color: '#0ea5e9' },
              { label: 'TDS', value: reading.tds, unit: 'ppm', color: '#7dd3fc' },
              { label: 'Turbidity', value: reading.turbidity, unit: 'NTU', color: '#06b6d4' },
            ].map(m => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.45)' }}>
                  {m.label}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 16, color: m.color, letterSpacing: '-0.01em' }}>
                  {m.value}
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 3 }}>{m.unit}</span>
                </span>
              </motion.div>
            ))}

            {/* Quality score */}
            <div style={{ padding: '10px 14px', borderRadius: 8, background: `${statusColor}0a`, border: `1px solid ${statusColor}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${statusColor}88` }}>
                Quality Score
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 500, color: statusColor, letterSpacing: '-0.02em' }}>
                {reading.quality_score}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>/100</span>
              </span>
            </div>

            {/* Device info */}
            <div style={{ marginTop: 4, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
              <div className="grid grid-cols-2 gap-y-2">
                {[
                  { k: 'firmware', v: reading.firmware },
                  { k: 'battery',  v: `${reading.battery_pct}%` },
                  { k: 'signal',   v: `${reading.signal_rssi} dBm` },
                  { k: 'checksum', v: reading.checksum },
                ].map(r => (
                  <div key={r.k}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.3)', marginBottom: 1 }}>{r.k}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}>{r.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Simulation config ──────────────────────────────────────────────────────────
// Production: 10 checks/hour, 1 per station per ~5–6 min cycle
// Demo: compressed to 6s per station so all 8 cycle in ~48s
const ALL_STATIONS = ['KLR-04','KLR-01','KLR-02','KLR-03','GOM-01','GOM-02','PND-01','PEL-01']
const DEMO_INTERVAL_MS = 6000   // 6s between stations in demo (5 min in production)
const CHECKS_PER_CYCLE = 10     // 10 checks per hour in production

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [entries, setEntries]           = useState([])
  const [activeStep, setActiveStep]     = useState(-1)
  const [latestRaw, setLatestRaw]       = useState(null)
  const [latestProc, setLatestProc]     = useState(null)
  const [firing, setFiring]             = useState(false)
  const [autoFire, setAutoFire]         = useState(true)
  const [dbStatus, setDbStatus]         = useState('idle')
  const [currentStation, setCurrentStation] = useState(ALL_STATIONS[0])
  const [checkCount, setCheckCount]     = useState(0)
  const autoRef  = useRef(null)
  const stationIndexRef = useRef(0)
  const firingRef = useRef(false)

  async function fireReading(stationId) {
    if (firingRef.current) return
    firingRef.current = true
    setFiring(true)
    setActiveStep(0)
    setCurrentStation(stationId)

    const raw = generateRawPacket(stationId)
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`

    setEntries(prev => [...prev.slice(-6), { time: timeStr, packet: raw, station: stationId }])
    setLatestRaw(raw)

    await delay(500);  setActiveStep(1)
    await delay(480);  setActiveStep(2)

    const processed = processPacket(raw, stationId)
    setLatestProc(processed)

    await delay(520);  setActiveStep(3)
    await delay(420);  setActiveStep(4)

    const { error } = await supabase.from('sensor_readings').insert([processed])
    if (error) { console.warn('Supabase:', error.message); setDbStatus('error') }
    else { setDbStatus('ok') }

    await delay(380);  setActiveStep(5)
    await delay(500);  setActiveStep(PIPELINE_STEPS.length)

    setCheckCount(c => c + 1)
    firingRef.current = false
    setFiring(false)
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  // Auto-cycle through all stations
  useEffect(() => {
    if (!autoFire) { clearInterval(autoRef.current); return }

    // Fire immediately on first station
    const nextStation = ALL_STATIONS[stationIndexRef.current]
    fireReading(nextStation)

    autoRef.current = setInterval(() => {
      stationIndexRef.current = (stationIndexRef.current + 1) % ALL_STATIONS.length
      const sid = ALL_STATIONS[stationIndexRef.current]
      fireReading(sid)
    }, DEMO_INTERVAL_MS)

    return () => clearInterval(autoRef.current)
  }, [autoFire])

  return (
    <div style={{ minHeight: '100vh', background: '#020d18', paddingTop: 64 }}>
      {/* Page header */}
      <div style={{ borderBottom: '1px solid rgba(14,165,233,0.08)', background: 'rgba(5,26,45,0.5)', padding: '24px 28px' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.5)', marginBottom: 6 }}>
              Private · Data Pipeline
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(20px, 2.5vw, 30px)', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Sensor Ingest Simulation
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(180,220,255,0.35)', margin: '4px 0 0', lineHeight: 1.5 }}>
              8 stations × 10 checks/hour = 80 inserts/hour in production (1 per station every 5 min)
              {' '}· Demo accelerated — currently firing{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7dd3fc' }}>{currentStation}</span>
              {' '}· <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'rgba(14,165,233,0.6)' }}>{checkCount}</span> demo checks
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* DB status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: dbStatus === 'ok' ? 'rgba(34,197,94,0.08)' : dbStatus === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${dbStatus === 'ok' ? 'rgba(34,197,94,0.2)' : dbStatus === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: dbStatus === 'ok' ? '#22c55e' : dbStatus === 'error' ? '#ef4444' : 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: dbStatus === 'ok' ? '#22c55e' : dbStatus === 'error' ? '#ef4444' : 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                {dbStatus === 'ok' ? 'Supabase OK' : dbStatus === 'error' ? 'DB Error' : 'Supabase'}
              </span>
            </div>

            {/* Auto toggle */}
            <button
              onClick={() => setAutoFire(v => !v)}
              style={{
                padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
                background: autoFire ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.04)',
                border: autoFire ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(255,255,255,0.08)',
                color: autoFire ? '#0ea5e9' : 'rgba(255,255,255,0.4)',
                fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
              }}
            >
              {autoFire ? '⏸ Auto' : '▶ Auto'}
            </button>

            {/* Fire button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fireReading(currentStation)}
              disabled={firing}
              style={{
                padding: '8px 20px', borderRadius: 8, cursor: firing ? 'not-allowed' : 'pointer',
                background: firing ? 'rgba(14,165,233,0.08)' : 'linear-gradient(135deg, #0369a1, #0ea5e9)',
                border: 'none',
                color: firing ? 'rgba(14,165,233,0.5)' : '#ffffff',
                fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
                boxShadow: firing ? 'none' : '0 0 20px rgba(14,165,233,0.3)',
              }}
            >
              {firing ? 'Processing...' : '▶ Fire Reading'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="max-w-7xl mx-auto p-6" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 0, alignItems: 'start' }}>
        {/* Terminal */}
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.4)', marginBottom: 10 }}>
            01 · Raw Ingest
          </div>
          <JsonTerminal entries={entries} />
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', paddingTop: 28 }}>
          <motion.div
            animate={{ opacity: firing ? [0.3, 1, 0.3] : 0.2 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: '#0ea5e9' }}
          >
            →
          </motion.div>
        </div>

        {/* Pipeline */}
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.4)', marginBottom: 10 }}>
            02 · Processing
          </div>
          <Pipeline activeStep={activeStep} processed={latestProc} raw={latestRaw} />
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', paddingTop: 28 }}>
          <motion.div
            animate={{ opacity: activeStep >= 4 ? [0.3, 1, 0.3] : 0.2 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: '#0ea5e9' }}
          >
            →
          </motion.div>
        </div>

        {/* Live output */}
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.4)', marginBottom: 10 }}>
            03 · Live Output
          </div>
          <LiveCard reading={latestProc} firing={firing} />
        </div>
      </div>

      {/* Info footer */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {[
            { label: 'POST endpoint', value: 'supabase.from("sensor_readings").insert()' },
            { label: 'Realtime channel', value: 'postgres_changes → sensor_readings' },
            { label: 'Interval (production)', value: 'Every 30 seconds per station' },
            { label: 'Stations wired', value: 'KLR-04 (live) · 7 others (static)' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.35)', marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
