import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import sdg6Logo from '../assets/SDG6.png'

const gradientText = {
  background: 'linear-gradient(135deg, #0369a1 0%, #7dd3fc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

function RippleCanvas() {
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

    // Origin — slightly above center, like a water drop landing
    const NUM_RINGS = 6
    const CYCLE = 5.5

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.005

      const ox = W / 2
      const oy = H * 0.46

      // Expanding water ripple rings
      for (let i = 0; i < NUM_RINGS; i++) {
        const phase = ((t + i * (CYCLE / NUM_RINGS)) % CYCLE) / CYCLE
        const r = phase * Math.max(W, H) * 0.72
        const alpha = (1 - phase) * (1 - phase) * 0.09

        ctx.beginPath()
        ctx.ellipse(ox, oy, r, r * 0.38, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(14,165,233,${alpha})`
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // Very faint horizontal water-surface lines
      ctx.lineWidth = 1
      for (let row = 0; row < H; row += 55) {
        const wave = Math.sin(t * 0.4 + row * 0.02) * 2
        ctx.beginPath()
        ctx.moveTo(0, row + wave)
        ctx.lineTo(W, row + wave)
        ctx.strokeStyle = 'rgba(14,165,233,0.025)'
        ctx.stroke()
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
      style={{ minHeight: '100vh', background: '#020d18' }}
    >
      <RippleCanvas />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 46%, rgba(14,165,233,0.09) 0%, transparent 65%)',
        }}
      />

      {/* Fade from previous section */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #051a2d, transparent)' }}
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
            color: '#0ea5e9',
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
          Water quality.{' '}
          <span style={gradientText}>Visible.</span>
          <br />
          Transparent.{' '}
          <span style={gradientText}>Trusted.</span>
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
            color: 'rgba(180,220,255,0.45)',
            marginTop: 28,
            letterSpacing: '0.01em',
          }}
        >
          Malaysia's independent water quality monitoring platform
        </motion.p>

        {/* SDG badge + sensors */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-6 mt-16"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{
              background: 'rgba(14,165,233,0.07)',
              border: '1px solid rgba(14,165,233,0.18)',
            }}
          >
            <img src={sdg6Logo} alt="SDG 6" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }} />
            <div className="flex flex-col">
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#0ea5e9', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SDG 6
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(180,220,255,0.4)' }}>
                Clean Water & Sanitation
              </span>
            </div>
          </div>

          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.08)' }} />

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
                color: '#7dd3fc',
                letterSpacing: '-0.01em',
              }}>
                {s.label}
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                color: 'rgba(180,220,255,0.3)',
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
            color: 'rgba(180,220,255,0.2)',
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
