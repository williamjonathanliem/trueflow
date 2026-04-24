import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { supabase } from '../lib/supabase'

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

const statusConfig = {
  NOMINAL: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', dot: '#22c55e' },
  WARNING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b' },
  ALERT:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  dot: '#ef4444' },
}

const CARD = {
  background: '#051a2d',
  border: '1px solid rgba(34,197,94,0.1)',
  borderRadius: 16,
}

const LABEL = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
}

function InputField({ label, value, onChange, unit, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(34,197,94,0.55)' }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          step="any"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(34,197,94,0.15)',
            borderRadius: 8,
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 15,
            fontWeight: 500,
            padding: '10px 40px 10px 14px',
            outline: 'none',
            transition: 'border-color 0.15s, background 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(34,197,94,0.4)'
            e.target.style.background = 'rgba(34,197,94,0.05)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(34,197,94,0.15)'
            e.target.style.background = 'rgba(255,255,255,0.04)'
          }}
        />
        <style>{`
          input::placeholder {
            color: rgba(180,220,255,0.28) !important;
            opacity: 1 !important;
          }
          input::-webkit-placeholder {
            color: rgba(180,220,255,0.28) !important;
            opacity: 1 !important;
          }
          input::-moz-placeholder {
            color: rgba(180,220,255,0.28) !important;
            opacity: 1 !important;
          }
        `}</style>
        <span style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          pointerEvents: 'none',
        }}>
          {unit}
        </span>
      </div>
    </div>
  )
}

function BotCard({ station, index, inView, inputs, onInputChange, onSend, onClear, sendState }) {
  const cfg = statusConfig[station.status]

  const robotIcon = (
    <svg width="56" height="56" viewBox="0 0 44 44" fill="none" style={{ display: 'block' }}>
      <circle cx="22" cy="22" r="14" stroke="rgba(34,197,94,0.6)" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="9" stroke="rgba(34,197,94,0.3)" strokeWidth="1" strokeDasharray="2 3" />
      <rect x="20" y="4" width="4" height="6" rx="2" stroke="rgba(34,197,94,0.6)" strokeWidth="1.5" />
      <circle cx="22" cy="3" r="2" stroke="rgba(34,197,94,0.6)" strokeWidth="1.5" />
      <circle cx="12" cy="16" r="2" fill="rgba(34,197,94,0.7)" />
      <circle cx="32" cy="16" r="2" fill="rgba(34,197,94,0.7)" />
      <circle cx="12" cy="28" r="2" fill="rgba(34,197,94,0.7)" />
      <circle cx="32" cy="28" r="2" fill="rgba(34,197,94,0.7)" />
      <circle cx="22" cy="34" r="2" fill="rgba(34,197,94,0.7)" />
    </svg>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.05 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...CARD,
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 6 }}>
        {robotIcon}
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block', boxShadow: `0 0 5px ${cfg.dot}`, flexShrink: 0 }}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(34,197,94,0.5)',
              letterSpacing: '0.08em',
              marginBottom: 2,
            }}>
              {station.id}
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: '#ffffff',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              margin: 0,
            }}>
              {station.name}
            </h3>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 6,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            flexShrink: 0,
          }}>
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField
            label="pH"
            value={inputs.ph}
            onChange={v => onInputChange('ph', v)}
            unit="pH"
            placeholder="7.0"
          />
          <InputField
            label="TDS"
            value={inputs.tds}
            onChange={v => onInputChange('tds', v)}
            unit="ppm"
            placeholder="150"
          />
          <InputField
            label="Turbidity"
            value={inputs.turbidity}
            onChange={v => onInputChange('turbidity', v)}
            unit="NTU"
            placeholder="0.5"
          />
          <InputField
            label="Dissolved O₂"
            value={inputs.do_mgl}
            onChange={v => onInputChange('do_mgl', v)}
            unit="mg/L"
            placeholder="7.0"
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onSend}
            disabled={sendState === 'loading'}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid rgba(34,197,94,0.3)',
              background: sendState === 'loading' ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)',
              color: sendState === 'loading' ? 'rgba(34,197,94,0.5)' : '#22c55e',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: sendState === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            onMouseEnter={e => {
              if (sendState !== 'loading') {
                e.currentTarget.style.background = 'rgba(34,197,94,0.15)'
                e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'
              }
            }}
            onMouseLeave={e => {
              if (sendState !== 'loading') {
                e.currentTarget.style.background = 'rgba(34,197,94,0.08)'
                e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'
              }
            }}
          >
            {sendState === 'loading' ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(34,197,94,0.3)', borderTopColor: '#22c55e', borderRadius: '50%' }}
                />
                Sending...
              </>
            ) : sendState === 'success' ? (
              <>
                <span>✓</span> Sent
              </>
            ) : sendState === 'error' ? (
              <>
                <span>✗</span> Retry
              </>
            ) : (
              'Send Data'
            )}
          </button>

          <button
            onClick={onClear}
            disabled={sendState === 'loading'}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.35)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              cursor: sendState === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.01em',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (sendState !== 'loading') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
              }
            }}
            onMouseLeave={e => {
              if (sendState !== 'loading') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
              }
            }}
          >
            Clear
          </button>
        </div>

        <AnimatePresence>
          {sendState === 'success' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#22c55e',
                textAlign: 'center',
              }}
            >
              Data inserted successfully to Supabase.
            </motion.div>
          )}
          {sendState === 'error' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                color: '#ef4444',
                textAlign: 'center',
              }}
            >
              Insert failed. Please try again.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ValidationWarning({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '12px 16px',
        borderRadius: 10,
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.25)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        color: '#f59e0b',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 16 }}>⚠</span>
      {message}
    </motion.div>
  )
}

export default function LiveRobotPage() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const [cardInputs, setCardInputs] = useState(() =>
    Object.fromEntries(stations.map(s => [s.id, { ph: '', tds: '', turbidity: '', do_mgl: '' }]))
  )

  const [sendStates, setSendStates] = useState(() =>
    Object.fromEntries(stations.map(s => [s.id, null]))
  )

  const [warning, setWarning] = useState(null)

  const handleInputChange = (stationId, field, value) => {
    setCardInputs(prev => ({
      ...prev,
      [stationId]: { ...prev[stationId], [field]: value },
    }))
  }

  const handleClear = (stationId) => {
    setCardInputs(prev => ({
      ...prev,
      [stationId]: { ph: '', tds: '', turbidity: '', do_mgl: '' },
    }))
    setSendStates(prev => ({ ...prev, [stationId]: null }))
  }

  const handleSend = async (stationId) => {
    const inputs = cardInputs[stationId]
    const values = [inputs.ph, inputs.tds, inputs.turbidity, inputs.do_mgl]
    const filledCount = values.filter(v => v !== '' && v != null).length

    if (filledCount > 0 && filledCount < 4) {
      setWarning('All 4 parameters must be filled, or all must be empty. Please fill all fields or clear all.')
      setTimeout(() => setWarning(null), 4000)
      return
    }

    if (filledCount === 0) {
      setWarning('No data to send. Please fill in all 4 parameters.')
      setTimeout(() => setWarning(null), 4000)
      return
    }

    setWarning(null)
    setSendStates(prev => ({ ...prev, [stationId]: 'loading' }))

    const station = stations.find(s => s.id === stationId)

    const { error } = await supabase.from('sensor_readings').insert({
      station_id: stationId,
      device_id: `${stationId}-SIM`,
      firmware: 'SIM-v1.0',
      uptime_s: Math.floor(Math.random() * 86400),
      battery_pct: Math.floor(Math.random() * 30) + 70,
      signal_rssi: Math.floor(Math.random() * 30) + 60,
      ph: parseFloat(inputs.ph),
      tds: parseFloat(inputs.tds),
      turbidity: parseFloat(inputs.turbidity),
      do_mgl: parseFloat(inputs.do_mgl),
      quality_score: station.score,
      status: station.status,
      checksum: `SIM-${Date.now()}`,
    })

    if (error) {
      setSendStates(prev => ({ ...prev, [stationId]: 'error' }))
    } else {
      setSendStates(prev => ({ ...prev, [stationId]: 'success' }))
      setTimeout(() => {
        setSendStates(prev => ({ ...prev, [stationId]: null }))
      }, 3000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020d18', paddingTop: 80, fontFamily: 'Inter, sans-serif' }}>
      <div
        style={{
          borderBottom: '1px solid rgba(34,197,94,0.08)',
          background: 'rgba(5,26,45,0.6)',
          padding: '32px 24px 28px',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#22c55e', marginBottom: 10 }}
          >
            Robot Simulation
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
            Live Robot Test
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(180,220,255,0.4)', lineHeight: 1.6, maxWidth: 600 }}
          >
            Simulate real-world robot data injection. Fill in pH, TDS, Turbidity, and Dissolved Oxygen for each bot, then send to Supabase. Each bot requires all 4 fields to be filled or all empty.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }}
            />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
              {stations.length} Bots Connected
            </span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence>
          {warning && (
            <div style={{ marginBottom: 16 }}>
              <ValidationWarning message={warning} />
            </div>
          )}
        </AnimatePresence>

        <div ref={ref} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {stations.map((s, i) => (
            <BotCard
              key={s.id}
              station={s}
              index={i}
              inView={inView}
              inputs={cardInputs[s.id]}
              onInputChange={(field, value) => handleInputChange(s.id, field, value)}
              onSend={() => handleSend(s.id)}
              onClear={() => handleClear(s.id)}
              sendState={sendStates[s.id]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}