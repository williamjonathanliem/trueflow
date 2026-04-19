import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

// Generate realistic pH data
function generatePhData(points = 40) {
  const data = []
  let ph = 7.2
  for (let i = 0; i < points; i++) {
    ph += (Math.random() - 0.5) * 0.12
    ph = Math.max(6.8, Math.min(7.8, ph))
    const hour = 9 + Math.floor(i * 0.4)
    const min = (i * 24) % 60
    data.push({
      time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      ph: parseFloat(ph.toFixed(2)),
      safe: 7.2,
    })
  }
  return data
}

const fullData = generatePhData(40)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(5,5,20,0.95)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 8,
        padding: '8px 14px',
        fontFamily: 'Inter, sans-serif',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#00d4ff', fontSize: 14, fontWeight: 600 }}>
          pH {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

function LiveChart({ animate }) {
  const [visibleData, setVisibleData] = useState([fullData[0]])

  useEffect(() => {
    if (!animate) return
    let i = 1
    const interval = setInterval(() => {
      if (i >= fullData.length) {
        clearInterval(interval)
        return
      }
      setVisibleData(fullData.slice(0, i + 1))
      i++
    }, 60)
    return () => clearInterval(interval)
  }, [animate])

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={visibleData} margin={{ top: 8, right: 16, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          interval={7}
        />
        <YAxis
          domain={[6.5, 8.0]}
          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          tickLine={false}
          axisLine={false}
          tickCount={4}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={7.0}
          stroke="rgba(239,68,68,0.3)"
          strokeDasharray="4 4"
          label={{ value: 'Min', fill: 'rgba(239,68,68,0.5)', fontSize: 10, fontFamily: 'Inter' }}
        />
        <ReferenceLine
          y={7.5}
          stroke="rgba(34,197,94,0.3)"
          strokeDasharray="4 4"
          label={{ value: 'Opt', fill: 'rgba(34,197,94,0.5)', fontSize: 10, fontFamily: 'Inter' }}
        />
        <Line
          type="monotoneX"
          dataKey="ph"
          stroke="#00d4ff"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#00d4ff', stroke: 'rgba(0,212,255,0.3)', strokeWidth: 4 }}
          isAnimationActive={false}
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.6))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function MetricCard({ label, value, unit, status, color, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
        <span style={{ color, fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.06em' }}>
          {status}
        </span>
      </div>
    </motion.div>
  )
}

function QualityGauge({ score }) {
  // Semi-circle arc: radius 36, center (50, 50), from 180° to 360°
  const r = 36
  const cx = 50
  const cy = 50
  const arcLength = Math.PI * r  // half circumference
  const fill = (score / 100) * arcLength

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div style={{ position: 'relative', width: 100, height: 56 }}>
        <svg width="100" height="56" viewBox="0 0 100 56" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="gaugeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          {/* Track arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <motion.path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="url(#gaugeGrad2)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${arcLength}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: arcLength - fill }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.5))' }}
          />
        </svg>
        {/* Score label centered below arc */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          lineHeight: 1,
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}>
            {score}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>/100</span>
        </div>
      </div>
      <span style={{ color: '#22c55e', fontSize: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Quality Score
      </span>
    </div>
  )
}

export default function Dashboard() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative w-full px-6 py-28 md:py-36"
      style={{ background: '#f0f8ff' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 20 }}
        >
          Live Dashboard
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 52px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#051428',
            maxWidth: 560,
            marginBottom: 60,
          }}
        >
          The Truth,{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Visualized.</span>
        </motion.h2>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)',
          }}
        >
          {/* Browser chrome */}
          <div style={{ background: '#0c1e2f', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 6,
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              maxWidth: 360,
              marginLeft: 8,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <path d="M4 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              </svg>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
                dashboard.trueflow.my/station/KLR-04
              </span>
            </div>
          </div>

          {/* Dashboard content */}
          <div style={{ background: '#020d18', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Monitoring Station
                </div>
                <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", letterSpacing: '-0.01em' }}>
                  Klang River — Station 04
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Status banner */}
                <motion.div
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.25)',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.8)' }} />
                  <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
                    ALL SYSTEMS NOMINAL
                  </span>
                </motion.div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
                  Updated just now
                </div>
              </div>
            </div>

            {/* Metrics + gauge row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="pH Level" value="7.2" unit="pH" status="SAFE" color="#22c55e" delay={0.3} />
              <MetricCard label="TDS" value="98" unit="ppm" status="SAFE" color="#22c55e" delay={0.4} />
              <MetricCard label="Turbidity" value="0.2" unit="NTU" status="SAFE" color="#22c55e" delay={0.5} />
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <QualityGauge score={94} />
              </div>
            </div>

            {/* Chart */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 12px' }}>
              <div className="flex items-center justify-between mb-4">
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  pH Over Time (Today)
                </span>
                <div className="flex items-center gap-3">
                  {['1H', '6H', '24H', '7D'].map((t, i) => (
                    <button
                      key={t}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 5,
                        background: i === 1 ? 'rgba(0,102,255,0.2)' : 'transparent',
                        border: i === 1 ? '1px solid rgba(0,102,255,0.4)' : '1px solid transparent',
                        color: i === 1 ? '#0066ff' : 'rgba(255,255,255,0.3)',
                        fontSize: 11,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <LiveChart animate={inView} />
            </div>

            {/* Alert history */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Alert History
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { time: 'Today 02:14', type: 'RESOLVED', msg: 'Turbidity spike detected at Station 04 — 0.8 NTU', color: '#f59e0b' },
                  { time: 'Yesterday 18:30', type: 'INFO', msg: 'Scheduled sensor calibration completed', color: '#0066ff' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-3" style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: `${alert.color}18`,
                      border: `1px solid ${alert.color}33`,
                      color: alert.color,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '0.05em',
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      {alert.type}
                    </span>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{alert.msg}</p>
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
