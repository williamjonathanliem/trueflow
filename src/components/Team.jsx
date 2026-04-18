import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const members = [
  { name: 'David Christian Priyanto', role: 'Fullstack Developer', initials: 'DC' },
  { name: 'Evelyn Novelia Chandra', role: 'Data & Logic', initials: 'EN' },
  { name: 'Gilang Suherlambang', role: 'Data & Logic, Strategy', initials: 'GS' },
  { name: 'Ng Jee Chian', role: 'Business Strategy & Pitcher', initials: 'NJ' },
  { name: 'William Jonathan', role: 'Fullstack Developer', initials: 'WJ' },
]

const avatarColors = [
  { from: '#1a1aff', to: '#0066ff' },
  { from: '#0066ff', to: '#00a0c7' },
  { from: '#00a0c7', to: '#00d4ff' },
  { from: '#1a1aff', to: '#4040ff' },
  { from: '#0066ff', to: '#00d4ff' },
]

export default function Team() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative w-full px-6 py-28 md:py-36 overflow-hidden"
      style={{ background: '#070714' }}
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,102,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0066ff', marginBottom: 20 }}
        >
          The Team
        </motion.p>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
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
            }}
          >
            Built By
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{
              background: 'rgba(0,102,255,0.08)',
              border: '1px solid rgba(0,102,255,0.2)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs"
              style={{
                background: 'linear-gradient(135deg, #0066ff, #00a0c7)',
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800,
              }}
            >
              APU
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
              APU 3rd Sustainable Hackathon
            </span>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {members.map((m, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{
                y: -6,
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
              }}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'default',
              }}
            >
              {/* Avatar */}
              <motion.div
                whileHover={{ boxShadow: '0 0 28px rgba(0,102,255,0.5)' }}
                transition={{ duration: 0.25 }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-lg"
                style={{
                  background: `linear-gradient(135deg, ${avatarColors[i].from}, ${avatarColors[i].to})`,
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  boxShadow: `0 0 16px ${avatarColors[i].from}44`,
                  letterSpacing: '-0.01em',
                }}
              >
                {m.initials}
              </motion.div>

              <div className="flex flex-col gap-1">
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                }}>
                  {m.name}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.4,
                }}>
                  {m.role}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
