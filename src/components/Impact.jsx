import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import sdg6Logo from '../assets/SDG6.png'

const gradientText = {
  background: 'linear-gradient(135deg, #0369a1 0%, #7dd3fc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const pillars = [
  {
    number: '01',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="#0ea5e9" strokeWidth="1.5" />
        <path d="M10 16.5l4 4 8-8" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Consumer Trust',
    body: 'Independent real-time verification that goes beyond brand claims. Consumers see actual data, not a label.',
  },
  {
    number: '02',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="8" width="28" height="20" rx="3" stroke="#0ea5e9" strokeWidth="1.5" />
        <path d="M2 14h28" stroke="#0ea5e9" strokeWidth="1.5" />
        <circle cx="22" cy="4" r="4" fill="#f0f8ff" stroke="#0ea5e9" strokeWidth="1.5" />
        <path d="M20.5 4h3M22 2.5v3" stroke="#0ea5e9" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8 19h8M8 23h5" stroke="#0ea5e9" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Full Transparency',
    body: 'Continuous monitoring replaces quarterly self-reported lab tests. Data is public, auditable, and timestamped.',
  },
  {
    number: '03',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4l3.09 6.26L26 11.27l-5 4.87 1.18 6.86L16 19.77l-6.18 3.23L11 16.14 6 11.27l6.91-1.01z" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Market Differentiation',
    body: 'Clean water brands can prove their quality, not just claim it. TrueFlow verification becomes a competitive advantage.',
  },
  {
    number: '04',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="#0ea5e9" strokeWidth="1.5" />
        <path d="M16 10v6l4 2" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 22c2-4 5-6 8-6s6 2 8 6" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'SDG 6 Alignment',
    body: "Directly supporting Malaysia's commitment to clean water and sanitation under the UN Sustainable Development Goals.",
  },
]

function PillarCard({ pillar, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.12 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(14,165,233,0.09)', transition: { duration: 0.22 } }}
      className="flex gap-6 p-8 rounded-2xl"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(5,20,40,0.06)',
        boxShadow: '0 4px 24px rgba(5,20,40,0.05)',
      }}
    >
      <div className="flex flex-col gap-1 items-center flex-shrink-0">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}
        >
          {pillar.icon}
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          fontSize: 10,
          color: 'rgba(14,165,233,0.4)',
          letterSpacing: '0.04em',
          marginTop: 4,
        }}>
          {pillar.number}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 19,
          color: '#051428',
          letterSpacing: '-0.01em',
          margin: 0,
        }}>
          {pillar.title}
        </h3>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          lineHeight: 1.7,
          color: 'rgba(5,20,40,0.55)',
          fontWeight: 400,
          margin: 0,
        }}>
          {pillar.body}
        </p>
      </div>
    </motion.div>
  )
}

export default function Impact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative w-full px-6 py-28 md:py-36"
      style={{ background: '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto">
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
          Why It Matters
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
            color: '#051428',
            maxWidth: 560,
            marginBottom: 72,
          }}
        >
          Why TrueFlow{' '}
          <span style={gradientText}>matters.</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, i) => (
            <PillarCard key={i} pillar={p} index={i} inView={inView} />
          ))}
        </div>

        {/* SDG strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-6 mt-16 p-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.04) 0%, rgba(6,182,212,0.04) 100%)',
            border: '1px solid rgba(14,165,233,0.1)',
          }}
        >
          <img src={sdg6Logo} alt="SDG 6" style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#051428', letterSpacing: '-0.01em', margin: 0 }}>
              UN Sustainable Development Goal 6
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(5,20,40,0.5)', marginTop: 4 }}>
              Clean Water and Sanitation — TrueFlow directly advances SDG 6 for Malaysia
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
