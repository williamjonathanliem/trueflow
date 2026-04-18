import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    number: '01',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#00d4ff" strokeWidth="1.5" />
        <circle cx="12" cy="9" r="2.5" stroke="#00d4ff" strokeWidth="1.5" />
      </svg>
    ),
    title: 'FLO Deployed',
    desc: 'FLO unit is installed directly at the water source — river, reservoir, or supply point.',
  },
  {
    number: '02',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#00d4ff" strokeWidth="1.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Sensors Activate',
    desc: 'pH, TDS, and Turbidity are measured continuously — not quarterly, not self-reported.',
  },
  {
    number: '03',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5L12 6l7 6.5" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 17.5L12 11l7 6.5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <path d="M12 6v12" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Data Transmitted',
    desc: 'Readings leave the source instantly via wireless antenna and reach TrueFlow API in under 5 seconds.',
  },
  {
    number: '04',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#00d4ff" strokeWidth="1.5" />
        <path d="M8 16l3-5 2.5 3 2-2.5L18 16" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="1.5" fill="#00d4ff" />
      </svg>
    ),
    title: 'AI Scores Quality',
    desc: 'Our AI engine cross-references readings against WHO and Malaysian water quality standards in real time.',
  },
  {
    number: '05',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#00d4ff" strokeWidth="1.5" />
        <path d="M6 9h12M6 12h8M6 15h5" stroke="#00d4ff" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="18" cy="14" r="3" fill="#050510" stroke="#22c55e" strokeWidth="1.2" />
        <path d="M16.8 14l.8.9 1.6-1.6" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Dashboard Updates',
    desc: 'Stakeholders see live quality scores, trend graphs, and location data on the TrueFlow dashboard.',
  },
  {
    number: '06',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a7 7 0 0 1 7 7c0 4-3 7-7 11C8 16 5 13 5 9a7 7 0 0 1 7-7z" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M12 7v4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="14" r="1" fill="#ef4444" />
      </svg>
    ),
    title: 'Alerts Triggered',
    desc: 'Threshold breaches fire instant alerts to regulators, brands, and consumers before harm occurs.',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const lineRef = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const lineInView = useInView(lineRef, { once: true, margin: '-40px' })

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative w-full px-6 py-28 md:py-36 overflow-hidden"
      style={{ background: '#070714' }}
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,102,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,102,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#0066ff',
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
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 52px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#ffffff',
            maxWidth: 600,
            marginBottom: 80,
          }}
        >
          From Source to Screen{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            In Seconds
          </span>
        </motion.h2>

        {/* Steps grid */}
        <div className="relative">
          {/* Animated connecting line (desktop) */}
          <div
            ref={lineRef}
            className="hidden md:block absolute"
            style={{ top: 28, left: '8.33%', right: '8.33%', height: 1, zIndex: 0 }}
          >
            <div style={{ position: 'relative', height: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={lineInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, #1a1aff, #0066ff, #00d4ff)',
                  transformOrigin: 'left',
                  borderRadius: 1,
                  boxShadow: '0 0 8px rgba(0,212,255,0.4)',
                }}
              />
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
                }}
                whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
                className="flex flex-col items-start gap-4"
              >
                {/* Icon circle */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.15)',
                  }}
                >
                  {step.icon}
                  <span
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: '#0066ff',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      borderRadius: 4,
                      padding: '2px 5px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 style={{
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#ffffff',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 400,
                  }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
