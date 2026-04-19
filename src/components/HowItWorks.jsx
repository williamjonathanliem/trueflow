import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    number: '01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#7dd3fc" strokeWidth="1.5" />
        <circle cx="12" cy="9" r="2.5" stroke="#7dd3fc" strokeWidth="1.5" />
      </svg>
    ),
    title: 'FLO Deployed',
    desc: 'FLO is installed directly at the water source — river, reservoir, or supply point.',
  },
  {
    number: '02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#7dd3fc" strokeWidth="1.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Sensors Activate',
    desc: 'pH, TDS, and Turbidity are measured continuously — not quarterly, not self-reported.',
  },
  {
    number: '03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5L12 6l7 6.5" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 17.5L12 11l7 6.5" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <path d="M12 6v12" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Data Transmitted',
    desc: 'Readings leave the source instantly via wireless antenna and reach TrueFlow in under 5 seconds.',
  },
  {
    number: '04',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#7dd3fc" strokeWidth="1.5" />
        <path d="M8 16l3-5 2.5 3 2-2.5L18 16" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="1.5" fill="#7dd3fc" />
      </svg>
    ),
    title: 'AI Scores Quality',
    desc: 'Our AI cross-references readings against WHO and Malaysian water standards in real time.',
  },
  {
    number: '05',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#7dd3fc" strokeWidth="1.5" />
        <path d="M6 9h12M6 12h8M6 15h5" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="18" cy="14" r="3" fill="#020d18" stroke="#10b981" strokeWidth="1.2" />
        <path d="M16.8 14l.8.9 1.6-1.6" stroke="#10b981" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Dashboard Updates',
    desc: 'Stakeholders see live quality scores, trend graphs, and location data on the TrueFlow dashboard.',
  },
  {
    number: '06',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a7 7 0 0 1 7 7c0 4-3 7-7 11C8 16 5 13 5 9a7 7 0 0 1 7-7z" stroke="#f87171" strokeWidth="1.5" />
        <path d="M12 7v4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="14" r="1" fill="#f87171" />
      </svg>
    ),
    title: 'Alerts Triggered',
    desc: 'Threshold breaches fire instant alerts to regulators, brands, and consumers before harm occurs.',
  },
]

function StepCard({ step, index, inView }) {
  const isAlert = index === 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
      className="flex flex-col items-center gap-4"
    >
      {/* Icon box */}
      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: isAlert ? 'rgba(248,113,113,0.07)' : 'rgba(14,165,233,0.07)',
            border: `1px solid ${isAlert ? 'rgba(248,113,113,0.18)' : 'rgba(14,165,233,0.18)'}`,
          }}
        >
          {step.icon}
        </div>
        {/* Step number badge */}
        <div
          style={{
            position: 'absolute',
            top: -7,
            right: -7,
            background: isAlert ? '#ef4444' : '#0ea5e9',
            borderRadius: 5,
            padding: '2px 5px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 500,
            color: '#fff',
            letterSpacing: '0.04em',
            lineHeight: 1.5,
          }}
        >
          {step.number}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          margin: 0,
        }}>
          {step.title}
        </h3>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 12.5,
          lineHeight: 1.65,
          color: 'rgba(180,220,255,0.4)',
          fontWeight: 400,
          margin: 0,
        }}>
          {step.desc}
        </p>
      </div>
    </motion.div>
  )
}

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const lineRef = useRef(null)
  const lineInView = useInView(lineRef, { once: true, margin: '-40px' })

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative w-full px-6 py-28 md:py-36 overflow-hidden"
      style={{ background: '#051a2d' }}
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#0ea5e9',
            marginBottom: 20,
          }}
        >
          How It Works
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 52px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#ffffff',
            maxWidth: 580,
            marginBottom: 80,
          }}
        >
          From source to screen
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #0369a1 0%, #7dd3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            in seconds.
          </span>
        </motion.h2>

        {/* Steps */}
        <div className="relative" ref={lineRef}>
          {/* Connecting line — SVG-based, avoids positioning glitches */}
          <div
            className="hidden lg:block absolute"
            style={{ top: 28, left: 0, right: 0, height: 1, zIndex: 0 }}
          >
            {/* Track */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
            {/* Animated fill */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={lineInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #0369a1, #0ea5e9, #7dd3fc)',
                transformOrigin: 'left',
                borderRadius: 1,
                boxShadow: '0 0 10px rgba(14,165,233,0.35)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} inView={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
