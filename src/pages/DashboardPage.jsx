import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from 'recharts'
import { supabase } from '../lib/supabase'

// --- Data generators ---
function makePhData(n = 60) {
  let v = 7.2
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.5) * 0.1
    v = Math.max(6.7, Math.min(7.9, v))
    return { t: `${String(9 + Math.floor(i / 6)).padStart(2,'0')}:${String((i * 10) % 60).padStart(2,'0')}`, v: +v.toFixed(2) }
  })
}
function makeTdsData(n = 60) {
  let v = 98
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.5) * 8
    v = Math.max(60, Math.min(200, v))
    return { t: `${String(9 + Math.floor(i / 6)).padStart(2,'0')}:${String((i * 10) % 60).padStart(2,'0')}`, v: +v.toFixed(1) }
  })
}
function makeTurbData(n = 60) {
  let v = 0.2
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.5) * 0.08
    v = Math.max(0.01, Math.min(1.5, v))
    return { t: `${String(9 + Math.floor(i / 6)).padStart(2,'0')}:${String((i * 10) % 60).padStart(2,'0')}`, v: +v.toFixed(3) }
  })
}

const phDataFull = makePhData()
const tdsDataFull = makeTdsData()
const turbDataFull = makeTurbData()

const stations = [
  { id: 'KLR-04', name: 'Klang R. — Stn 04', status: 'NOMINAL', score: 94 },
  { id: 'KLR-01', name: 'Klang R. — Stn 01', status: 'NOMINAL', score: 91 },
  { id: 'KLR-02', name: 'Klang R. — Stn 02', status: 'WARNING', score: 68 },
  { id: 'KLR-03', name: 'Klang R. — Stn 03', status: 'ALERT', score: 41 },
  { id: 'GOM-01', name: 'Gombak — Stn 01',   status: 'NOMINAL', score: 97 },
  { id: 'GOM-02', name: 'Gombak — Stn 02',   status: 'WARNING', score: 74 },
  { id: 'PND-01', name: 'Pendang Reservoir',  status: 'NOMINAL', score: 99 },
  { id: 'PEL-01', name: 'Pelus — Stn 01',    status: 'NOMINAL', score: 93 },
]

const statusColors = { NOMINAL: '#22c55e', WARNING: '#f59e0b', ALERT: '#ef4444' }

const alerts = [
  { id: 1, time: 'Today  14:22', type: 'ALERT',    station: 'KLR-03', msg: 'Turbidity exceeded 3 NTU threshold — 3.8 NTU recorded', color: '#ef4444' },
  { id: 2, time: 'Today  11:05', type: 'WARNING',  station: 'KLR-02', msg: 'TDS trending upward — 198 ppm (limit: 200 ppm)', color: '#f59e0b' },
  { id: 3, time: 'Today  02:14', type: 'RESOLVED', station: 'KLR-04', msg: 'Turbidity spike at Station 04 — 0.8 NTU — back to normal', color: '#22c55e' },
  { id: 4, time: 'Yesterday  18:30', type: 'INFO', station: 'GOM-01', msg: 'Scheduled calibration completed successfully', color: '#0ea5e9' },
  { id: 5, time: 'Yesterday  09:00', type: 'INFO', station: 'ALL',    msg: 'Weekly WHO compliance report generated', color: '#7dd3fc' },
]

const timeRanges = ['1H', '6H', '24H', '7D']

// --- Sub-components ---
function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(2,13,24,0.96)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter', marginBottom: 3 }}>{label}</p>
      <p style={{ color: '#7dd3fc', fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
        {payload[0].value} {unit}
      </p>
    </div>
  )
}

function LiveArea({ data, color, unit, refValue, min, max }) {
  const [visible, setVisible] = useState([data[0]])
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    let i = 1
    const iv = setInterval(() => {
      if (i >= data.length) { clearInterval(iv); return }
      setVisible(data.slice(0, i + 1))
      i++
    }, 40)
    return () => clearInterval(iv)
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={130}>
      <AreaChart data={visible} margin={{ top: 6, right: 8, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} interval={11} />
        <YAxis domain={[min, max]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickCount={3} />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        {refValue && (
          <ReferenceLine y={refValue} stroke={`${color}44`} strokeDasharray="4 4" />
        )}
        <Area
          type="monotoneX"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#grad-${color})`}
          dot={false}
          activeDot={{ r: 3, fill: color, stroke: `${color}44`, strokeWidth: 4 }}
          isAnimationActive={false}
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function GaugeArc({ score }) {
  const r = 52, cx = 70, cy = 70
  const arcLen = Math.PI * r
  const fill = (score / 100) * arcLen
  const color = score >= 85 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ position: 'relative', width: 140, height: 80 }}>
      <svg width="140" height="80" viewBox="0 0 140 80" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugePageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="url(#gaugePageGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${arcLen} ${arcLen}`}
          initial={{ strokeDashoffset: arcLen }}
          animate={{ strokeDashoffset: arcLen - fill }}
          transition={{ duration: 1.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 32, color: '#ffffff', letterSpacing: '-0.03em' }}>
          {score}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'Inter' }}>/100</span>
      </div>
    </div>
  )
}

function MetricBig({ label, value, unit, sub, color, chart, chartUnit, chartRef, chartMin, chartMax }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div className="flex items-start justify-between">
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.5)', marginBottom: 6 }}>
            {label}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 28, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {value}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'Inter' }}>{unit}</span>
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: 6,
          background: `${color}14`,
          border: `1px solid ${color}30`,
          color,
          fontSize: 11,
          fontFamily: 'Inter',
          fontWeight: 700,
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}>
          {sub}
        </div>
      </div>
      <LiveArea data={chart} color={color} unit={chartUnit} refValue={chartRef} min={chartMin} max={chartMax} />
    </div>
  )
}

// --- Main Page ---
export default function DashboardPage() {
  const [activeStation, setActiveStation] = useState(stations[0])
  const [activeRange, setActiveRange] = useState('6H')

  // KLR-04 live reading from Supabase Realtime
  const [liveReading, setLiveReading] = useState(null)
  const [realtimeFlash, setRealtimeFlash] = useState(false)

  useEffect(() => {
    setLiveReading(null)

    // Fetch latest reading for this station
    supabase
      .from('sensor_readings')
      .select('*')
      .eq('station_id', activeStation.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.length) setLiveReading(data[0]) })

    // Subscribe to new inserts for this station
    const channel = supabase
      .channel(`station-live-${activeStation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        filter: `station_id=eq.${activeStation.id}`,
      }, (payload) => {
        setLiveReading(payload.new)
        setRealtimeFlash(true)
        setTimeout(() => setRealtimeFlash(false), 800)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeStation.id])

  const currentPh    = liveReading ? liveReading.ph            : activeStation.score >= 90 ? '7.2' : activeStation.score >= 70 ? '7.0' : '6.3'
  const currentTds   = liveReading ? liveReading.tds           : activeStation.score >= 90 ? 98    : activeStation.score >= 70 ? 164   : 342
  const currentTurb  = liveReading ? liveReading.turbidity     : activeStation.score >= 90 ? '0.2' : activeStation.score >= 70 ? '0.9' : '3.8'
  const stationScore = liveReading ? liveReading.quality_score : activeStation.score
  const isLive = true

  return (
    <div style={{ minHeight: '100vh', background: '#020d18', paddingTop: 64 }}>
      <div className="flex" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* Sidebar */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          background: '#051a2d',
          borderRight: '1px solid rgba(14,165,233,0.08)',
          flexDirection: 'column',
          padding: '20px 0',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
          className="hidden md:flex"
        >
          <div style={{ padding: '0 16px 12px', fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.4)' }}>
            Stations
          </div>

          {stations.map(s => {
            const active = s.id === activeStation.id
            const sc = statusColors[s.status]
            return (
              <button
                key={s.id}
                onClick={() => setActiveStation(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  background: active ? 'rgba(14,165,233,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid #0ea5e9' : '2px solid transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0, boxShadow: `0 0 6px ${sc}` }}
                />
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#ffffff' : 'rgba(180,220,255,0.45)', lineHeight: 1.3 }}>
                    {s.name}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(14,165,233,0.4)', letterSpacing: '0.04em' }}>
                    {s.id}
                  </div>
                </div>
              </button>
            )
          })}

          <div style={{ marginTop: 'auto', padding: '20px 16px 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link
              to="/stations"
              style={{
                textDecoration: 'none',
                display: 'block',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(14,165,233,0.06)',
                border: '1px solid rgba(14,165,233,0.12)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: '#0ea5e9',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              All Stations →
            </Link>
            <Link
              to="/demo"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                background: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.15)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: '#fbbf24',
                fontWeight: 600,
                textAlign: 'center',
                letterSpacing: '0.02em',
              }}
            >
              <span style={{ fontSize: 9 }}>⬡</span> Data Pipeline
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: 'clamp(16px, 4vw, 24px)', overflowY: 'auto' }}>

          {/* Mobile station selector — only visible below md */}
          <div className="md:hidden mb-5">
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.4)', marginBottom: 8 }}>
              Select Station
            </div>
            <select
              value={activeStation.id}
              onChange={e => setActiveStation(stations.find(s => s.id === e.target.value))}
              style={{
                width: '100%',
                background: '#051a2d',
                border: '1px solid rgba(14,165,233,0.2)',
                borderRadius: 10,
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                padding: '12px 14px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              {stations.map(s => {
                const dot = s.status === 'NOMINAL' ? '🟢' : s.status === 'WARNING' ? '🟡' : '🔴'
                return (
                  <option key={s.id} value={s.id} style={{ background: '#051a2d' }}>
                    {dot} {s.name} — {s.status}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.5)', marginBottom: 4 }}>
                Monitoring Station
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(18px, 2.5vw, 26px)', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                {activeStation.name.replace('Stn', 'Station')}
              </h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 14px', borderRadius: 8,
                  background: `${statusColors[activeStation.status]}12`,
                  border: `1px solid ${statusColors[activeStation.status]}28`,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColors[activeStation.status], display: 'inline-block', boxShadow: `0 0 8px ${statusColors[activeStation.status]}` }} />
                <span style={{ color: statusColors[activeStation.status], fontSize: 12, fontWeight: 700, fontFamily: 'Inter', letterSpacing: '0.05em' }}>
                  {activeStation.status === 'NOMINAL' ? 'ALL SYSTEMS NOMINAL' : activeStation.status}
                </span>
              </motion.div>
              {isLive && (
                <motion.div
                  key={realtimeFlash ? 'flash' : 'idle'}
                  animate={{ opacity: realtimeFlash ? [1, 0.4, 1] : 1, scale: realtimeFlash ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 6,
                    background: liveReading ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                    border: liveReading ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: '50%', background: liveReading ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
                  />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: liveReading ? '#22c55e' : 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.04em' }}>
                    {liveReading ? 'REALTIME' : 'CONNECTING'}
                  </span>
                </motion.div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'Inter' }}>
                {liveReading ? `Updated ${new Date(liveReading.created_at).toLocaleTimeString()}` : 'Updated just now'}
              </div>
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-2 mb-6">
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginRight: 4 }}>Range:</span>
            {timeRanges.map(r => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                style={{
                  padding: '4px 12px', borderRadius: 6,
                  background: activeRange === r ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.03)',
                  border: activeRange === r ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: activeRange === r ? '#0ea5e9' : 'rgba(255,255,255,0.3)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Score + summary row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Quality gauge */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              gridColumn: '1',
            }}>
              <GaugeArc score={stationScore} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stationScore >= 85 ? '#22c55e' : stationScore >= 60 ? '#f59e0b' : '#ef4444' }}>
                Quality Score
              </span>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(180,220,255,0.35)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                Cross-referenced against WHO & Malaysian standards
              </p>
            </div>

            {/* Quick metrics */}
            {[
              { label: 'pH Level',   value: '7.2', unit: 'pH',  status: 'SAFE',  color: '#22c55e', sub: 'Normal range 6.5–8.5' },
              { label: 'TDS',        value: '98',  unit: 'ppm', status: 'SAFE',  color: '#22c55e', sub: 'Limit: 500 ppm (WHO)' },
              { label: 'Turbidity',  value: '0.2', unit: 'NTU', status: 'SAFE',  color: '#22c55e', sub: 'Limit: 1 NTU (drinking)' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.45)' }}>
                  {m.label}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 30, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {m.value}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'Inter' }}>{m.unit}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, boxShadow: `0 0 6px ${m.color}` }}
                  />
                  <span style={{ color: m.color, fontSize: 11, fontFamily: 'Inter', fontWeight: 700, letterSpacing: '0.05em' }}>{m.status}</span>
                </div>
                <div style={{ marginTop: 4, fontFamily: 'Inter', fontSize: 11, color: 'rgba(180,220,255,0.25)', lineHeight: 1.4 }}>
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricBig
              label="pH Over Time"
              value="7.20" unit="pH"
              sub="SAFE"
              color="#0ea5e9"
              chart={phDataFull}
              chartUnit="pH"
              chartRef={7.5}
              chartMin={6.5}
              chartMax={8.2}
            />
            <MetricBig
              label="TDS Over Time"
              value="98" unit="ppm"
              sub="SAFE"
              color="#7dd3fc"
              chart={tdsDataFull}
              chartUnit="ppm"
              chartRef={null}
              chartMin={40}
              chartMax={220}
            />
            <MetricBig
              label="Turbidity"
              value="0.200" unit="NTU"
              sub="SAFE"
              color="#06b6d4"
              chart={turbDataFull}
              chartUnit="NTU"
              chartRef={1.0}
              chartMin={0}
              chartMax={1.6}
            />
          </div>

          {/* Alert feed + compliance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Alert feed — takes 2 cols */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 20,
            }}
              className="md:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.5)' }}>
                  Alert Feed
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                  {alerts.length} events
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {alerts.map(a => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: a.id * 0.07 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${a.color}18`,
                    }}
                  >
                    <span style={{
                      padding: '2px 8px', borderRadius: 4,
                      background: `${a.color}14`, border: `1px solid ${a.color}28`,
                      color: a.color, fontSize: 10, fontWeight: 700,
                      fontFamily: 'Inter', letterSpacing: '0.05em',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {a.type}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(14,165,233,0.5)', letterSpacing: '0.04em' }}>
                          {a.station}
                        </span>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{a.time}</span>
                      </div>
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, margin: 0 }}>
                        {a.msg}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Compliance panel */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,165,233,0.5)' }}>
                Compliance
              </span>
              {[
                { std: 'WHO 2022',     pct: 96, color: '#22c55e' },
                { std: 'MS 1500:2019', pct: 94, color: '#22c55e' },
                { std: 'DOE Class II', pct: 88, color: '#0ea5e9' },
              ].map(c => (
                <div key={c.std} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(180,220,255,0.55)' }}>{c.std}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, color: c.color }}>{c.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: '100%', background: c.color, borderRadius: 2, boxShadow: `0 0 8px ${c.color}66` }}
                    />
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 8, padding: '14px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22c55e', marginBottom: 6 }}>
                  SDG 6 Alignment
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(180,220,255,0.4)', lineHeight: 1.5, margin: 0 }}>
                  Station data contributes to Malaysia's UN SDG 6 clean water reporting.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
