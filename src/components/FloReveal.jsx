import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'

const TOTAL_FRAMES = 120

const callouts = [
  {
    frameStart: 0,
    frameEnd: 20,
    title: 'Meet FLO',
    body: 'Your independent water truth-teller. Deployed directly at the source. No bias. No brand allegiance. Just data.',
  },
  {
    frameStart: 21,
    frameEnd: 40,
    title: 'Solar Powered',
    body: 'Fully autonomous energy. No infrastructure needed. No cables. No maintenance schedule. Just deploy and trust.',
  },
  {
    frameStart: 41,
    frameEnd: 60,
    title: 'Real-Time Sensors',
    body: 'pH, TDS, and Turbidity measured continuously. Not once a quarter. Not self-reported. Now.',
  },
  {
    frameStart: 61,
    frameEnd: 80,
    title: 'Wireless Transmission',
    body: 'Data leaves the water source instantly via antenna and hits our platform in seconds. Zero human in the loop.',
  },
  {
    frameStart: 81,
    frameEnd: 100,
    title: 'Stainless Steel Probes',
    body: 'Industrial grade sensor probes built for long-term underwater deployment. Corrosion resistant. Field proven.',
  },
  {
    frameStart: 101,
    frameEnd: 119,
    title: 'One Device. Total Truth.',
    body: 'FLO is the missing layer between water sources and the people who depend on them.',
  },
]

function FloCanvas({ frameIndex, isScrolling }) {
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const glowAnimRef = useRef(null)
  const floatAnimRef = useRef(null)
  const floatYRef = useRef(0)
  const floatPhaseRef = useRef(0)

  useEffect(() => {
    // Preload all frames (they were loaded in App already, but cache them here too)
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      const idx = String(i).padStart(3, '0')
      img.src = `/frames/flo_${idx}.webp`
      imagesRef.current[i] = img
    }
  }, [])

  const drawFrame = useCallback((idx, floatY = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Cyan glow behind FLO
    const cx = W / 2
    const cy = H / 2 + floatY
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.45)
    grad.addColorStop(0, 'rgba(0, 212, 255, 0.12)')
    grad.addColorStop(0.5, 'rgba(0, 102, 255, 0.06)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Draw FLO frame
    const img = imagesRef.current[idx]
    if (img && img.complete && img.naturalWidth > 0) {
      const imgAspect = img.naturalWidth / img.naturalHeight
      let drawW = W * 0.85
      let drawH = drawW / imgAspect
      if (drawH > H * 0.85) {
        drawH = H * 0.85
        drawW = drawH * imgAspect
      }
      const dx = (W - drawW) / 2
      const dy = (H - drawH) / 2 + floatY
      ctx.drawImage(img, dx, dy, drawW, drawH)
    } else {
      // Placeholder while frames load
      ctx.strokeStyle = 'rgba(0,212,255,0.3)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      ctx.roundRect(W * 0.15, H * 0.1, W * 0.7, H * 0.8, 16)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(0,212,255,0.5)'
      ctx.font = '500 14px Inter'
      ctx.textAlign = 'center'
      ctx.fillText('FLO', W / 2, H / 2)
    }
  }, [])

  // Redraw on frame change
  useEffect(() => {
    if (!isScrolling) return
    cancelAnimationFrame(floatAnimRef.current)
    drawFrame(frameIndex, floatYRef.current)
  }, [frameIndex, isScrolling, drawFrame])

  // Float animation when not scrolling
  useEffect(() => {
    if (isScrolling) {
      cancelAnimationFrame(floatAnimRef.current)
      return
    }

    const animate = () => {
      floatPhaseRef.current += 0.018
      floatYRef.current = Math.sin(floatPhaseRef.current) * 8
      drawFrame(frameIndex, floatYRef.current)
      floatAnimRef.current = requestAnimationFrame(animate)
    }
    floatAnimRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(floatAnimRef.current)
  }, [isScrolling, frameIndex, drawFrame])

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const parent = canvas.parentElement
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
      drawFrame(frameIndex, floatYRef.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  )
}

export default function FloReveal() {
  const containerRef = useRef(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [activeCallout, setActiveCallout] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const rawFrame = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1])

  useMotionValueEvent(rawFrame, 'change', (v) => {
    const idx = Math.round(Math.max(0, Math.min(TOTAL_FRAMES - 1, v)))
    setFrameIndex(idx)
    setIsScrolling(true)

    // Find which callout is active
    for (let i = callouts.length - 1; i >= 0; i--) {
      if (idx >= callouts[i].frameStart) {
        setActiveCallout(i)
        break
      }
    }

    clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150)
  })

  const current = callouts[activeCallout]

  return (
    <section
      ref={containerRef}
      className="relative"
      // Each frame gets ~1vh of scroll travel → 120 frames × 6px ≈ tall section
      style={{ height: '700vh', background: '#050510' }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: '100vh' }}>
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 30% 50%, rgba(0,26,60,0.9) 0%, #050510 70%)',
          }}
        />

        <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-6 md:px-16 gap-8 md:gap-16">
          {/* Left: Canvas */}
          <div className="relative flex-1 h-full flex items-center justify-center">
            <div className="relative w-full" style={{ maxWidth: 560, aspectRatio: '1/1' }}>
              <FloCanvas frameIndex={frameIndex} isScrolling={isScrolling} />
            </div>

            {/* Frame counter */}
            <div
              className="absolute bottom-8 left-8"
              style={{
                fontFamily: 'Inter, monospace',
                fontSize: 11,
                color: 'rgba(0,212,255,0.4)',
                letterSpacing: '0.1em',
                fontWeight: 500,
              }}
            >
              FRAME {String(frameIndex).padStart(3, '0')} / {String(TOTAL_FRAMES - 1).padStart(3, '0')}
            </div>
          </div>

          {/* Right: Text callouts */}
          <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: 480 }}>
            {/* Section label */}
            <div
              className="mb-6 inline-flex items-center gap-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#0066ff',
              }}
            >
              <span
                className="w-6 h-[1px]"
                style={{ background: '#0066ff' }}
              />
              The Device
            </div>

            {/* Animated callout */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCallout}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-5"
              >
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(36px, 4vw, 60px)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  color: '#ffffff',
                }}>
                  {current.title}
                </h2>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 300,
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.55)',
                  maxWidth: 420,
                }}>
                  {current.body}
                </p>

                {/* Spec pills for relevant callouts */}
                {activeCallout === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-wrap gap-2 mt-2"
                  >
                    {['pH 0–14', 'TDS 0–9999ppm', 'Turbidity 0–4000 NTU'].map((spec) => (
                      <span key={spec} style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        background: 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: '#00d4ff',
                        fontSize: 13,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        letterSpacing: '0.01em',
                      }}>
                        {spec}
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center gap-3 mt-12">
              {callouts.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === activeCallout ? 24 : 6,
                    background: i === activeCallout ? '#0066ff' : 'rgba(255,255,255,0.2)',
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: 6,
                    borderRadius: 3,
                    boxShadow: i === activeCallout ? '0 0 12px rgba(0,102,255,0.6)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Scroll hint */}
            <div style={{
              marginTop: 32,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.06em',
            }}>
              Scroll to explore FLO
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
