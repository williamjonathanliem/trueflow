import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const members = [
  { name: 'David Christian Priyanto', role: 'Fullstack Developer', initials: 'DC' },
  { name: 'Evelyn Novelia Chandra', role: 'Data & Logic', initials: 'EN' },
  { name: 'Gilang Suherlambang', role: 'Data & Logic, Strategy', initials: 'GS' },
  { name: 'Ng Jee Chian', role: 'Business Strategy', initials: 'NJ' },
  { name: 'William Jonathan', role: 'Fullstack Developer', initials: 'WJ' },
]

const avatarGradients = [
  ['#0369a1', '#0ea5e9'],
  ['#0ea5e9', '#06b6d4'],
  ['#06b6d4', '#7dd3fc'],
  ['#0369a1', '#3b82f6'],
  ['#0ea5e9', '#7dd3fc'],
]

function MemberCard({ member, index, inView }) {
  const [from, to] = avatarGradients[index]

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.1 + index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
      className="flex flex-col items-center gap-4 p-6 rounded-2xl text-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(14,165,233,0.1)',
        cursor: 'default',
      }}
    >
      <motion.div
        whileHover={{ boxShadow: `0 0 28px ${from}66` }}
        transition={{ duration: 0.25 }}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white"
        style={{
          background: `linear-gradient(135deg, ${from}, ${to})`,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 18,
          boxShadow: `0 0 18px ${from}33`,
          letterSpacing: '-0.01em',
        }}
      >
        {member.initials}
      </motion.div>

      <div className="flex flex-col gap-1">
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 13.5,
          color: '#ffffff',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          margin: 0,
        }}>
          {member.name}
        </h3>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          color: 'rgba(180,220,255,0.4)',
          lineHeight: 1.4,
          margin: 0,
        }}>
          {member.role}
        </p>
      </div>
    </motion.div>
  )
}

export default function Team() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative w-full px-6 py-28 md:py-36 overflow-hidden"
      style={{ background: '#051a2d' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(14,165,233,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
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
          The Team
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
            marginBottom: 64,
          }}
        >
          Built by{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0369a1 0%, #7dd3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>five.</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {members.map((m, i) => (
            <MemberCard key={i} member={m} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
