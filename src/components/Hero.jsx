import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'

const gradientText = {
  background: 'linear-gradient(135deg, #0369a1 0%, #7dd3fc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

function WaterCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H
    let t = 0

    const NUM_CURRENTS = 14
    const currents = []
    for (let i = 0; i < NUM_CURRENTS; i++) {
      currents.push({
        baseY: H * ((i + 0.5) / NUM_CURRENTS),
        amplitude: 6 + (i % 3) * 9 + Math.random() * 8,
        freq: 0.004 + (i % 4) * 0.001 + Math.random() * 0.001,
        phase: (i / NUM_CURRENTS) * Math.PI * 2.5,
        speed: 0.003 + (i % 3) * 0.002,
        alpha: 0.035 + (i % 4) * 0.015,
        hue: i % 3,
      })
    }

    const NUM_PARTICLES = 50
    const particles = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.5 + Math.random() * 1.4,
        speed: 0.12 + Math.random() * 0.4,
        alpha: 0.07 + Math.random() * 0.13,
        hue: i % 3,
      })
    }

    const COLORS = ['14,165,233', '6,182,212', '3,105,161']
    const col = (hue, a) => `rgba(${COLORS[hue]},${a})`

    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
      currents.forEach((c, i) => { c.baseY = H * ((i + 0.5) / NUM_CURRENTS) })
    }
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t++
      for (const c of currents) {
        ctx.beginPath()
        for (let x = 0; x <= W; x += 3) {
          const y = c.baseY + Math.sin(x * c.freq + t * c.speed + c.phase) * c.amplitude
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = col(c.hue, c.alpha)
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
      for (const p of particles) {
        p.x += p.speed
        if (p.x > W + 4) p.x = -4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = col(p.hue, p.alpha)
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// Floating live data chips shown over the product image
function DataChip({ label, value, color, style }) {
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3.5 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 10,
        background: 'rgba(2,13,24,0.82)',
        border: `1px solid ${color}30`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}20`,
        ...style,
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }}
      />
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(180,220,255,0.4)', lineHeight: 1 }}>
          {label}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500, color: '#ffffff', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {value}
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh', background: '#020d18' }}
    >
      {/* Canvas background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <WaterCanvas />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(14,165,233,0.06) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to bottom, transparent, #020d18)' }} />
      </motion.div>

      {/* Split layout */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 min-h-screen grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto px-4 sm:px-6"
        style={{ opacity, paddingTop: 80, paddingBottom: 40 }}
      >
        {/* LEFT — text content */}
        <motion.div
          className="flex flex-col items-start text-left"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Live badge */}
          <div
            className="mb-7 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.22)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#7dd3fc', boxShadow: '0 0 8px rgba(125,211,252,0.8)' }} />
            <span style={{ color: '#7dd3fc', fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Live · Malaysia Water Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(36px, 4.5vw, 68px)',
            lineHeight: 1.06,
            letterSpacing: '-0.035em',
            color: '#ffffff',
            maxWidth: 620,
          }}>
            Clean water should not be{' '}
            <span style={gradientText}>assumed.</span>
            <br />
            It should be{' '}
            <span style={gradientText}>proven.</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(15px, 1.4vw, 18px)',
            lineHeight: 1.75,
            color: 'rgba(180,220,255,0.55)',
            maxWidth: 500,
            marginTop: 24,
          }}>
            TrueFlow deploys independent sensor intelligence across Malaysia's water sources — giving consumers, brands, and regulators the truth in real time.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4" style={{ marginTop: 40 }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(14,165,233,0.45)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
                  color: '#ffffff',
                  borderRadius: 10,
                  padding: '13px 30px',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  boxShadow: '0 0 24px rgba(14,165,233,0.25)',
                }}
              >
                See Live Dashboard
              </motion.div>
            </Link>
            <Link to="/stations" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.03, background: 'rgba(14,165,233,0.08)', borderColor: 'rgba(14,165,233,0.5)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'transparent',
                  color: 'rgba(220,240,255,0.8)',
                  border: '1px solid rgba(14,165,233,0.28)',
                  borderRadius: 10,
                  padding: '13px 30px',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                View All Stations
              </motion.div>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-6 md:gap-12" style={{ marginTop: 40 }}>
            {[
              { value: '4',    unit: 'Parameters', label: 'pH · TDS · Turbidity · DO' },
              { value: '<5s',  unit: 'Latency',    label: 'Source to dashboard' },
              { value: '24/7', unit: 'Monitoring', label: 'Continuous uptime' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 2.5vw, 36px)', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {stat.value}
                </span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700, color: '#0ea5e9', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {stat.unit}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(180,220,255,0.3)' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — product image */}
        <motion.div
          className="relative hidden md:flex items-center justify-center"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glow behind image */}
          <div style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            background: 'radial-gradient(ellipse, rgba(14,165,233,0.18) 0%, transparent 70%)',
            filter: 'blur(32px)',
            zIndex: 0,
          }} />

          {/* Product image */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <img
              src={heroImg}
              alt="FLO water quality sensor"
              style={{
                width: '100%',
                maxWidth: 480,
                objectFit: 'contain',
                filter: 'drop-shadow(0 24px 64px rgba(14,165,233,0.22))',
              }}
            />
          </motion.div>

          {/* Floating data chips */}
          <DataChip
            label="pH Level"
            value="7.21 pH"
            color="#22c55e"
            style={{ top: '12%', right: '2%' }}
          />
          <DataChip
            label="TDS Level"
            value="112 ppm"
            color="#7dd3fc"
            style={{ bottom: '28%', left: '0%' }}
          />
          <DataChip
            label="Dissolved O₂"
            value="7.2 mg/L"
            color="#34d399"
            style={{ bottom: '44%', right: '4%' }}
          />
          <DataChip
            label="Station KLR-04"
            value="NOMINAL"
            color="#22c55e"
            style={{ bottom: '8%', right: '8%' }}
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span style={{ color: 'rgba(180,220,255,0.25)', fontSize: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(14,165,233,0.8), transparent)', borderRadius: 1 }}
        />
      </motion.div>
    </section>
  )
}
