import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const problems = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M14 8v6l4 2" stroke="#0066ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="8" y1="20" x2="20" y2="20" stroke="#0066ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Consumers are blind.',
    stat: '100%',
    statLabel: 'trust based on labels alone',
    body: 'People drink bottled water trusting brand labels with zero independent verification. The water inside the bottle could be anything.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="18" rx="2" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M3 10h22" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M9 15h10M9 19h6" stroke="#0066ff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="22" cy="6" r="4" fill="#050510" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M20.5 6h3M22 4.5v3" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Self-reported data is broken.',
    stat: '0',
    statLabel: 'neutral third-party auditors',
    body: 'Water brands run their own lab tests and publish their own results. There is no neutral party. It\'s the equivalent of grading your own exam.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C8 3 3 8 3 14s5 11 11 11 11-5 11-11S20 3 14 3z" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M14 8v7l5 2.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 17s2-3 5-2 4 3 4 3" stroke="#0066ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Contamination goes undetected.',
    stat: 'Days',
    statLabel: 'before incidents are reported',
    body: 'Pollution events in shared water sources can go unreported for days or weeks. By the time action is taken, the damage is already done.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

export default function Problem() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative w-full px-6 py-28 md:py-36"
      style={{ background: '#f8f9ff' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
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
          The Problem
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 56px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#08080f',
            maxWidth: 680,
            marginBottom: 64,
          }}
        >
          Water is transparent.{' '}
          <span style={{ color: '#0066ff' }}>The data behind it isn't.</span>
        </motion.h2>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {problems.map((p, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{
                y: -6,
                boxShadow: '0 24px 60px rgba(0,102,255,0.12)',
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
              }}
              className="flex flex-col gap-5 p-8 rounded-2xl"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,102,255,0.07)', flexShrink: 0 }}
              >
                {p.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: '#08080f',
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}>
                {p.title}
              </h3>

              {/* Stat */}
              <div className="flex flex-col gap-1">
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 42,
                  color: '#0066ff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  {p.stat}
                </span>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'rgba(8,8,15,0.45)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}>
                  {p.statLabel}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

              {/* Body */}
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.7,
                color: 'rgba(8,8,15,0.55)',
              }}>
                {p.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
