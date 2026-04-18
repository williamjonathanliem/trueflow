import { useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

function ClosingCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H
    let t = 0
    let raf

    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.006

      // Multiple slow expanding rings from center
      for (let i = 0; i < 5; i++) {
        const phase = (t + i * 1.2) % 5
        const r = (phase / 5) * Math.max(W, H) * 0.7
        const alpha = (1 - phase / 5) * 0.07
        ctx.beginPath()
        ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,102,255,${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Grid
      ctx.strokeStyle = 'rgba(0,102,255,0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

export default function ClosingCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh', background: '#050510' }}
    >
      <ClosingCanvas />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,102,255,0.1) 0%, transparent 65%)',
        }}
      />

      {/* Bottom border top fade from previous section */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #070714, transparent)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-1 mb-12"
        >
          <span style={{
            color: '#0066ff',
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            //
          </span>
          <span style={{
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            letterSpacing: '-0.5px',
            lineHeight: 1,
            marginLeft: 3,
          }}>
            TrueFlow
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(36px, 5.5vw, 76px)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            maxWidth: 860,
          }}
        >
          WATER QUALITY.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            VISIBLE.
          </span>
          {' '}TRANSPARENT.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            TRUSTED.
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 18,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.45)',
            marginTop: 28,
            letterSpacing: '0.01em',
          }}
        >
          TrueFlow — APU 3rd Sustainable Hackathon
        </motion.p>

        {/* SDG badge + divider */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-6 mt-16"
        >
          {/* SDG 6 badge */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{
              background: 'rgba(0,102,255,0.08)',
              border: '1px solid rgba(0,102,255,0.2)',
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #0066ff, #00a0c7)',
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800,
                fontSize: 10,
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              SDG<br/>6
            </div>
            <div className="flex flex-col">
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#0066ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SDG 6
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                Clean Water & Sanitation
              </span>
            </div>
          </div>

          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />

          {/* Sensor stats */}
          {[
            { label: 'pH', desc: 'Continuous' },
            { label: 'TDS', desc: 'Real-Time' },
            { label: 'Turbidity', desc: 'Verified' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: '#00d4ff',
                letterSpacing: '-0.01em',
              }}>
                {s.label}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {s.desc}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: 80,
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Malaysia's Independent Water Intelligence Layer
        </motion.div>
      </div>
    </section>
  )
}
