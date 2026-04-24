import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const stations = [
  {
    id: 'KLR-01',
    name: 'Klang River — Station 01',
    location: 'Upstream, Hulu Langat',
    status: 'NOMINAL',
    ph: 7.1,
    tds: 112,
    turbidity: 0.3,
    do_mgl: 7.2,
    score: 91,
    lastUpdated: '2 min ago',
    coords: { lat: '3.1319° N', lng: '101.6841° E' },
  },
  {
    id: 'KLR-02',
    name: 'Klang River — Station 02',
    location: 'Midstream, Cheras',
    status: 'WARNING',
    ph: 6.8,
    tds: 198,
    turbidity: 1.4,
    do_mgl: 5.8,
    score: 68,
    lastUpdated: '1 min ago',
    coords: { lat: '3.0838° N', lng: '101.7456° E' },
  },
  {
    id: 'KLR-03',
    name: 'Klang River — Station 03',
    location: 'Industrial Zone, Shah Alam',
    status: 'ALERT',
    ph: 6.2,
    tds: 342,
    turbidity: 3.8,
    do_mgl: 4.2,
    score: 41,
    lastUpdated: 'Just now',
    coords: { lat: '3.0738° N', lng: '101.5183° E' },
  },
  {
    id: 'KLR-04',
    name: 'Klang River — Station 04',
    location: 'Downstream, Port Klang',
    status: 'NOMINAL',
    ph: 7.2,
    tds: 98,
    turbidity: 0.2,
    do_mgl: 7.8,
    score: 94,
    lastUpdated: 'Just now',
    coords: { lat: '3.0361° N', lng: '101.4048° E' },
  },
  {
    id: 'GOM-01',
    name: 'Gombak River — Station 01',
    location: 'Templer Park, Rawang',
    status: 'NOMINAL',
    ph: 7.4,
    tds: 78,
    turbidity: 0.1,
    do_mgl: 8.1,
    score: 97,
    lastUpdated: '3 min ago',
    coords: { lat: '3.2715° N', lng: '101.6408° E' },
  },
  {
    id: 'GOM-02',
    name: 'Gombak River — Station 02',
    location: 'Junction, Kuala Lumpur',
    status: 'WARNING',
    ph: 7.0,
    tds: 164,
    turbidity: 0.9,
    do_mgl: 6.4,
    score: 74,
    lastUpdated: '5 min ago',
    coords: { lat: '3.1579° N', lng: '101.7027° E' },
  },
  {
    id: 'PND-01',
    name: 'Pendang Reservoir',
    location: 'Kedah Supply Zone',
    status: 'NOMINAL',
    ph: 7.3,
    tds: 55,
    turbidity: 0.05,
    do_mgl: 8.5,
    score: 99,
    lastUpdated: '1 min ago',
    coords: { lat: '5.9876° N', lng: '100.5714° E' },
  },
  {
    id: 'PEL-01',
    name: 'Pelus River — Station 01',
    location: 'Perak Tengah',
    status: 'NOMINAL',
    ph: 7.1,
    tds: 90,
    turbidity: 0.2,
    do_mgl: 7.5,
    score: 93,
    lastUpdated: '4 min ago',
    coords: { lat: '4.0281° N', lng: '101.0917° E' },
  },
]

const statusConfig = {
  NOMINAL: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', dot: '#22c55e' },
  WARNING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b' },
  ALERT:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  dot: '#ef4444' },
}

function ScoreBadge({ score }) {
  const color = score >= 85 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const pct = score / 100
  const r = 14
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 10, color,
      }}>
        {score}
      </span>
    </div>
  )
}

function StationCard({ station, index, inView }) {
  const cfg = statusConfig[station.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.05 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: '0 16px 48px rgba(14,165,233,0.08)', transition: { duration: 0.2 } }}
      style={{
        background: '#051a2d',
        border: '1px solid rgba(14,165,233,0.1)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            color: 'rgba(14,165,233,0.5)',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}>
            {station.id}
          </div>
          <h3 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            margin: 0,
          }}>
            {station.name}
          </h3>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(180,220,255,0.35)',
            margin: '3px 0 0',
          }}>
            {station.location}
          </p>
        </div>
        <ScoreBadge score={station.score} />
      </div>

      {/* Status */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        width: 'fit-content',
      }}>
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }}
        />
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          color: cfg.color,
          letterSpacing: '0.06em',
        }}>
          {station.status}
        </span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'pH', value: station.ph, unit: '' },
          { label: 'TDS', value: station.tds, unit: 'ppm' },
          { label: 'Turb', value: station.turbidity, unit: 'NTU' },
          { label: 'DO', value: station.do_mgl, unit: 'mg/L' },
        ].map(m => (
          <div
            key={m.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '8px 10px',
            }}
          >
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 700, color: 'rgba(14,165,233,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 500, color: '#ffffff', letterSpacing: '-0.01em', lineHeight: 1 }}>
              {m.value}
              {m.unit && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>{m.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {station.isLive && (
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }}
            />
          )}
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: station.isLive ? 'rgba(34,197,94,0.5)' : 'rgba(180,220,255,0.25)' }}>
            {station.isLive ? station.lastUpdated : `Updated ${station.lastUpdated}`}
          </span>
        </div>
        <Link
          to={`/dashboard?station=${station.id}`}
          style={{
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            color: '#0ea5e9',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View live →
        </Link>
      </div>
    </motion.div>
  )
}

export default function StationsPage() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [filter, setFilter] = useState('ALL')

  // Live readings from Supabase — keyed by station_id
  const [liveData, setLiveData] = useState({})

  useEffect(() => {
    // Fetch latest reading per station
    supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return
        const latest = {}
        for (const row of data) {
          if (!latest[row.station_id]) latest[row.station_id] = row
        }
        setLiveData(latest)
      })

    // Subscribe to new inserts from any station
    const channel = supabase
      .channel('stations-live')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
      }, (payload) => {
        setLiveData(prev => ({ ...prev, [payload.new.station_id]: payload.new }))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Merge static metadata with live readings
  const merged = stations.map(s => {
    const live = liveData[s.id]
    if (!live) return s
    return {
      ...s,
      ph: live.ph,
      tds: live.tds,
      turbidity: live.turbidity,
      do_mgl: live.do_mgl,
      score: live.quality_score,
      status: live.status,
      lastUpdated: new Date(live.created_at).toLocaleTimeString(),
      isLive: true,
    }
  })

  const filtered = filter === 'ALL' ? merged : merged.filter(s => s.status === filter)
  const counts = {
    ALL: merged.length,
    NOMINAL: merged.filter(s => s.status === 'NOMINAL').length,
    WARNING: merged.filter(s => s.status === 'WARNING').length,
    ALERT:   merged.filter(s => s.status === 'ALERT').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020d18', paddingTop: 80 }}>
      {/* Page header */}
      <div
        style={{
          borderBottom: '1px solid rgba(14,165,233,0.08)',
          background: 'rgba(5,26,45,0.6)',
          padding: '32px 24px 28px',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 10 }}
          >
            Monitoring Network
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            All Stations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(180,220,255,0.4)', lineHeight: 1.6 }}
          >
            {stations.length} active monitoring stations across Malaysia — live data, updated every 60 seconds.
          </motion.p>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {Object.entries(counts).map(([key, count]) => {
              const cfg = key === 'ALL' ? null : statusConfig[key]
              const active = filter === key
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: active ? `1px solid ${cfg?.border || 'rgba(14,165,233,0.25)'}` : '1px solid rgba(255,255,255,0.06)',
                    background: active ? (cfg?.bg || 'rgba(14,165,233,0.08)') : 'rgba(255,255,255,0.03)',
                    color: active ? (cfg?.color || '#0ea5e9') : 'rgba(180,220,255,0.35)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s',
                  }}
                >
                  {key}
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: active ? (cfg?.border || 'rgba(14,165,233,0.2)') : 'rgba(255,255,255,0.05)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Station grid */}
      <div ref={ref} className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s, i) => (
            <StationCard key={s.id} station={s} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </div>
  )
}
