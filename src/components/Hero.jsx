import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function MeshCanvas() {
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

    const COLS = 20
    const ROWS = 12
    let time = 0

    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', resize)

    // Pulse rings
    const pulses = [
      { r: 0, maxR: Math.max(W, H) * 0.8, speed: 0.4, opacity: 0 },
      { r: Math.max(W, H) * 0.3, maxR: Math.max(W, H) * 0.8, speed: 0.4, opacity: 0 },
    ]

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      time += 0.008

      // Grid lines
      const cellW = W / COLS
      const cellH = H / ROWS

      ctx.strokeStyle = 'rgba(0, 102, 255, 0.06)'
      ctx.lineWidth = 1
      // Vertical
      for (let c = 0; c <= COLS; c++) {
        const x = c * cellW
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      // Horizontal
      for (let r = 0; r <= ROWS; r++) {
        const y = r * cellH
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // Animated dots at intersections
      for (let c = 0; c <= COLS; c++) {
        for (let r = 0; r <= ROWS; r++) {
          const x = c * cellW
          const y = r * cellH
          const wave = Math.sin(time + c * 0.4 + r * 0.3) * 0.5 + 0.5
          const alpha = wave * 0.18 + 0.04
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`
          ctx.fill()
        }
      }

      // Sonar pulse rings from center
      const cx = W / 2
      const cy = H / 2
      for (const p of pulses) {
        p.r += p.speed
        if (p.r > p.maxR) p.r = 0

        const progress = p.r / p.maxR
        p.opacity = (1 - progress) * 0.12

        ctx.beginPath()
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 102, 255, ${p.opacity})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  )
}

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden flex flex-col items-center justify-center"
      style={{ minHeight: '100vh', background: '#050510' }}
    >
      {/* Mesh background with parallax */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <MeshCanvas />
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,102,255,0.08) 0%, transparent 70%)',
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, #050510)' }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
        style={{ opacity }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(0,102,255,0.1)',
            border: '1px solid rgba(0,102,255,0.25)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
          />
          <span style={{ color: '#00d4ff', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            APU 3rd Sustainable Hackathon
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(36px, 5.5vw, 76px)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            maxWidth: 900,
          }}
        >
          CLEAN WATER SHOULD NOT BE{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ASSUMED.
          </span>
          {' '}IT SHOULD BE{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            PROVEN.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(16px, 1.6vw, 20px)',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 640,
            marginTop: 28,
          }}
        >
          TrueFlow deploys AI-powered sensor intelligence across Malaysia's water sources — giving consumers, brands, and regulators the truth in real time.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-4"
          style={{ marginTop: 44 }}
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(0,102,255,0.5)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(135deg, #1a1aff 0%, #0066ff 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              boxShadow: '0 0 24px rgba(0,102,255,0.3)',
            }}
          >
            See Live Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, background: 'rgba(0,102,255,0.12)', borderColor: 'rgba(0,102,255,0.6)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            How It Works
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          style={{ marginTop: 72 }}
        >
          {[
            { value: '3', unit: 'Parameters', label: 'pH · TDS · Turbidity' },
            { value: '<5s', unit: 'Latency', label: 'Source to dashboard' },
            { value: '24/7', unit: 'Monitoring', label: 'Continuous uptime' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(28px, 3vw, 40px)',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {stat.value}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#0066ff',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {stat.unit}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
              }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 1,
            height: 32,
            background: 'linear-gradient(to bottom, rgba(0,102,255,0.8), transparent)',
            borderRadius: 1,
          }}
        />
      </motion.div>
    </section>
  )
}
