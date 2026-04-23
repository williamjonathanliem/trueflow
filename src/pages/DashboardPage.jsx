import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { supabase } from '../lib/supabase'

// ─── Data generators ─────────────────────────────────────────────────────────

function makePhData(n = 60) {
  let v = 7.2
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.5) * 0.1
    v = Math.max(6.7, Math.min(7.9, v))
    return {
      t: `${String(9 + Math.floor(i / 6)).padStart(2, '0')}:${String((i * 10) % 60).padStart(2, '0')}`,
      v: +v.toFixed(2),
    }
  })
}
function makeTdsData(n = 60) {
  let v = 98
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.5) * 8
    v = Math.max(60, Math.min(200, v))
    return {
      t: `${String(9 + Math.floor(i / 6)).padStart(2, '0')}:${String((i * 10) % 60).padStart(2, '0')}`,
      v: +v.toFixed(1),
    }
  })
}
function makeTurbData(n = 60) {
  let v = 0.2
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.5) * 0.08
    v = Math.max(0.01, Math.min(1.5, v))
    return {
      t: `${String(9 + Math.floor(i / 6)).padStart(2, '0')}:${String((i * 10) % 60).padStart(2, '0')}`,
      v: +v.toFixed(3),
    }
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
  { id: 'GOM-01', name: 'Gombak — Stn 01', status: 'NOMINAL', score: 97 },
  { id: 'GOM-02', name: 'Gombak — Stn 02', status: 'WARNING', score: 74 },
  { id: 'PND-01', name: 'Pendang Reservoir', status: 'NOMINAL', score: 99 },
  { id: 'PEL-01', name: 'Pelus — Stn 01', status: 'NOMINAL', score: 93 },
]

const STATUS_COLOR = { NOMINAL: '#22c55e', WARNING: '#f59e0b', ALERT: '#ef4444' }

const alertsData = [
  { id: 1, time: 'Today 14:22', type: 'ALERT', station: 'KLR-03', msg: 'Turbidity exceeded 3 NTU threshold — 3.8 NTU recorded', color: '#ef4444' },
  { id: 2, time: 'Today 11:05', type: 'WARNING', station: 'KLR-02', msg: 'TDS trending upward — 198 ppm (limit: 200 ppm)', color: '#f59e0b' },
  { id: 3, time: 'Today 02:14', type: 'RESOLVED', station: 'KLR-04', msg: 'Turbidity spike at Station 04 — 0.8 NTU — back to normal', color: '#22c55e' },
  { id: 4, time: 'Yesterday 18:30', type: 'INFO', station: 'GOM-01', msg: 'Scheduled calibration completed successfully', color: '#0ea5e9' },
  { id: 5, time: 'Yesterday 09:00', type: 'INFO', station: 'ALL', msg: 'Weekly WHO compliance report generated', color: '#7dd3fc' },
]

const TIME_RANGES = ['1H', '6H', '24H', '7D']

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14,
}

const LABEL = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
}

// ─── Hook: measure navbar height dynamically ──────────────────────────────────

function useNavHeight() {
  const [navH, setNavH] = useState(64)
  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector('nav') || document.querySelector('header')
      if (nav) setNavH(nav.offsetHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return navH
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(1,12,24,0.97)', border: '1px solid rgba(0,212,255,0.18)', borderRadius: 8, padding: '8px 14px', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 3 }}>{label}</p>
      <p style={{ color: '#00d4ff', fontSize: 13, fontWeight: 600 }}>{payload[0].value} {unit}</p>
    </div>
  )
}

// ─── Live area chart ──────────────────────────────────────────────────────────

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

  const gradId = `ag-${color.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={visible} margin={{ top: 4, right: 6, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.18)', fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} interval={11} />
        <YAxis domain={[min, max]} tick={{ fill: 'rgba(255,255,255,0.18)', fontSize: 9, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickCount={3} />
        <Tooltip content={<ChartTooltip unit={unit} />} />
        {refValue != null && <ReferenceLine y={refValue} stroke={`${color}55`} strokeDasharray="4 4" />}
        <Area type="monotoneX" dataKey="v" stroke={color} strokeWidth={1.8}
          fill={`url(#${gradId})`} dot={false} isAnimationActive={false}
          activeDot={{ r: 3, fill: color, stroke: `${color}44`, strokeWidth: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Quality gauge ────────────────────────────────────────────────────────────

function QualityGauge({ score }) {
  const r = 44, cx = 56, cy = 56
  const arcLen = Math.PI * r
  const fill = (score / 100) * arcLen
  const color = score >= 85 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 112, height: 64 }}>
        <svg width="112" height="64" viewBox="0 0 112 64" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="qg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
          <motion.path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="url(#qg)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${arcLen} ${arcLen}`}
            initial={{ strokeDashoffset: arcLen }}
            animate={{ strokeDashoffset: arcLen - fill }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', lineHeight: 1 }}>
          <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>{score}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>/100</span>
        </div>
      </div>
      <span style={{ ...LABEL, color }}>Quality Score</span>
    </div>
  )
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, unit, status, color, sub }) {
  return (
    <div style={{ ...CARD, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={LABEL}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
        <span style={{ color: '#fff', fontSize: 26, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
        <span style={{ color, fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>{status}</span>
      </div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── Chart card ──────────────────────────────────────────────────────────────

function ChartCard({ label, value, unit, status, color, data, chartUnit, refValue, min, max }) {
  return (
    <div style={{ ...CARD, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={LABEL}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>{unit}</span>
          </div>
        </div>
        <span style={{ padding: '3px 9px', borderRadius: 5, background: `${color}14`, border: `1px solid ${color}30`, color, fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em', marginTop: 2 }}>
          {status}
        </span>
      </div>
      <LiveArea data={data} color={color} unit={chartUnit} refValue={refValue} min={min} max={max} />
    </div>
  )
}

// ─── Collapsible sidebar ──────────────────────────────────────────────────────

function Sidebar({ activeStation, onSelect, navH }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="hidden md:flex"
      style={{
        position: 'fixed',
        top: navH,
        left: 0,
        height: `calc(100vh - ${navH}px)`,
        zIndex: 50,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Slim handle — always visible */}
      <div style={{
        width: 6,
        height: '100%',
        flexShrink: 0,
        cursor: 'pointer',
        background: open ? 'rgba(14,165,233,0.4)' : 'rgba(14,165,233,0.12)',
        borderRight: `1px solid ${open ? 'rgba(14,165,233,0.5)' : 'rgba(14,165,233,0.15)'}`,
        transition: 'background 0.2s, border-color 0.2s',
      }} />

      {/* Slide-out panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -224, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -224, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 224,
              height: '100%',
              background: '#040f1c',
              borderRight: '1px solid rgba(14,165,233,0.1)',
              boxShadow: '6px 0 40px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 16px 12px', ...LABEL, color: 'rgba(14,165,233,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
              Stations
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {stations.map(s => {
                const active = s.id === activeStation.id
                const sc = STATUS_COLOR[s.status]
                return (
                  <button
                    key={s.id}
                    onClick={() => { onSelect(s); setOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', width: '100%', textAlign: 'left',
                      background: active ? 'rgba(14,165,233,0.08)' : 'transparent',
                      borderLeft: `2px solid ${active ? '#0ea5e9' : 'transparent'}`,
                      border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0, boxShadow: `0 0 6px ${sc}` }}
                    />
                    <div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(180,220,255,0.4)', lineHeight: 1.3 }}>
                        {s.name}
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(14,165,233,0.4)', letterSpacing: '0.04em', marginTop: 1 }}>
                        {s.id}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <Link to="/stations" style={{
                textDecoration: 'none', display: 'block', padding: '8px 12px', borderRadius: 8,
                background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.15)',
                fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#0ea5e9', fontWeight: 600, textAlign: 'center',
              }}>All Stations →</Link>
              <Link to="/demo" style={{
                textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 8,
                background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
                fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#fbbf24', fontWeight: 600,
              }}>
                <span style={{ fontSize: 9 }}>⬡</span> Data Pipeline
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navH = useNavHeight()

  const [activeStation, setActiveStation] = useState(stations[0])
  const [activeRange, setActiveRange] = useState('6H')
  const [liveReading, setLiveReading] = useState(null)
  const [realtimeFlash, setRealtimeFlash] = useState(false)

  useEffect(() => {
    setLiveReading(null)

    supabase
      .from('sensor_readings').select('*')
      .eq('station_id', activeStation.id)
      .order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.length) setLiveReading(data[0]) })

    const channel = supabase.channel(`live-${activeStation.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
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

  const ph = liveReading?.ph ?? (activeStation.score >= 90 ? '7.2' : activeStation.score >= 70 ? '7.0' : '6.3')
  const tds = liveReading?.tds ?? (activeStation.score >= 90 ? 98 : activeStation.score >= 70 ? 164 : 342)
  const turb = liveReading?.turbidity ?? (activeStation.score >= 90 ? '0.2' : activeStation.score >= 70 ? '0.9' : '3.8')
  const score = liveReading?.quality_score ?? activeStation.score
  const sc = STATUS_COLOR[activeStation.status]
  const metricStatus = activeStation.status === 'NOMINAL' ? 'SAFE' : activeStation.status
  const metricColor = sc

  return (
    <div style={{ minHeight: '100vh', background: '#020d18', paddingTop: navH, fontFamily: 'Inter, sans-serif' }}>

      {/* Hover sidebar — desktop only */}
      <Sidebar activeStation={activeStation} onSelect={setActiveStation} navH={navH} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(16px, 4vw, 28px)' }}>

        {/* Mobile station picker */}
        <div className="md:hidden" style={{ marginBottom: 20 }}>
          <select
            value={activeStation.id}
            onChange={e => setActiveStation(stations.find(s => s.id === e.target.value))}
            style={{
              width: '100%', background: '#040f1c',
              border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10,
              color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 14,
              padding: '11px 14px', outline: 'none', cursor: 'pointer', appearance: 'none',
            }}
          >
            {stations.map(s => (
              <option key={s.id} value={s.id} style={{ background: '#040f1c' }}>
                {s.status === 'NOMINAL' ? '🟢' : s.status === 'WARNING' ? '🟡' : '🔴'} {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Top bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 5 }}>Monitoring Station</div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', margin: 0 }}>
              {activeStation.name.replace('Stn', 'Station')}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <motion.div
              animate={{ opacity: [1, 0.65, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 100, background: `${sc}0d`, border: `1px solid ${sc}28` }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc, boxShadow: `0 0 7px ${sc}` }} />
              <span style={{ color: sc, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
                {activeStation.status === 'NOMINAL' ? 'ALL SYSTEMS NOMINAL' : activeStation.status}
              </span>
            </motion.div>

            <motion.div
              key={realtimeFlash ? 'f' : 'i'}
              animate={{ opacity: realtimeFlash ? [1, 0.4, 1] : 1, scale: realtimeFlash ? [1, 1.04, 1] : 1 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: liveReading ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.03)', border: liveReading ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)' }}
            >
              <motion.div
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: liveReading ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
              />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: liveReading ? '#22c55e' : 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {liveReading ? 'REALTIME' : 'CONNECTING'}
              </span>
            </motion.div>

            <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
              {liveReading ? `Updated ${new Date(liveReading.created_at).toLocaleTimeString()}` : 'Updated just now'}
            </span>
          </div>
        </div>

        {/* Time range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22 }}>
          <span style={{ ...LABEL, marginRight: 4 }}>Range</span>
          {TIME_RANGES.map(r => (
            <button key={r} onClick={() => setActiveRange(r)} style={{
              padding: '4px 11px', borderRadius: 5, cursor: 'pointer',
              background: activeRange === r ? 'rgba(14,165,233,0.14)' : 'rgba(255,255,255,0.03)',
              border: activeRange === r ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
              color: activeRange === r ? '#0ea5e9' : 'rgba(255,255,255,0.28)',
              fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
            }}>{r}</button>
          ))}
        </div>

        {/* Row 1: gauge + metrics — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2 md:col-span-1" style={{ ...CARD, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <QualityGauge score={score} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(180,220,255,0.3)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              Cross-referenced against WHO &amp; Malaysian standards
            </p>
          </div>
          <MetricCard label="pH Level" value={String(ph)} unit="pH" status={metricStatus} color={metricColor} sub="Normal range 6.5–8.5" />
          <MetricCard label="TDS" value={String(tds)} unit="ppm" status={metricStatus} color={metricColor} sub="Limit: 500 ppm (WHO)" />
          <MetricCard label="Turbidity" value={String(turb)} unit="NTU" status={metricStatus} color={metricColor} sub="Limit: 1 NTU (drinking)" />
        </div>

        {/* Row 2: charts — 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <ChartCard label="pH over time" value="7.20" unit="pH" status="SAFE" color="#00d4ff" data={phDataFull} chartUnit="pH" refValue={7.5} min={6.5} max={8.2} />
          <ChartCard label="TDS over time" value="98" unit="ppm" status="SAFE" color="#7dd3fc" data={tdsDataFull} chartUnit="ppm" refValue={null} min={40} max={220} />
          <ChartCard label="Turbidity" value="0.200" unit="NTU" status="SAFE" color="#06b6d4" data={turbDataFull} chartUnit="NTU" refValue={1.0} min={0} max={1.6} />
        </div>

        {/* Row 3: alerts + compliance — 1 col mobile, 3 cols desktop (alerts span 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Alert feed */}
          <div className="md:col-span-2" style={{ ...CARD, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={LABEL}>Alert Feed</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{alertsData.length} events</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertsData.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.018)', border: `1px solid ${a.color}18` }}
                >
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: `${a.color}14`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em', flexShrink: 0, marginTop: 1 }}>
                    {a.type}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(14,165,233,0.5)', letterSpacing: '0.04em' }}>{a.station}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.22)' }}>{a.time}</span>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.45, margin: 0 }}>{a.msg}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div style={{ ...CARD, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={LABEL}>Compliance</span>
            {[
              { std: 'WHO 2022', pct: 96, color: '#22c55e' },
              { std: 'MS 1500:2019', pct: 94, color: '#22c55e' },
              { std: 'DOE Class II', pct: 88, color: '#0ea5e9' },
            ].map(c => (
              <div key={c.std} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(180,220,255,0.5)' }}>{c.std}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: c.color }}>{c.pct}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', background: c.color, borderRadius: 2, boxShadow: `0 0 8px ${c.color}55` }}
                  />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4, padding: 14, borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.14)' }}>
              <div style={{ ...LABEL, color: '#22c55e', marginBottom: 6 }}>SDG 6 Alignment</div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(180,220,255,0.35)', lineHeight: 1.5, margin: 0 }}>
                Station data contributes to Malaysia's UN SDG 6 clean water reporting.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
