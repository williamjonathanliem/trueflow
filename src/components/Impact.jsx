import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const pillars = [
  {
    number: '01',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M10 16.5l4 4 8-8" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Consumer Trust',
    body: 'Independent real-time verification that goes beyond brand claims. Consumers see the actual data, not a label.',
  },
  {
    number: '02',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="8" width="28" height="20" rx="3" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M2 14h28" stroke="#0066ff" strokeWidth="1.5" />
        <circle cx="22" cy="4" r="4" fill="#050510" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M20.5 4h3M22 2.5v3" stroke="#0066ff" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8 19h8M8 23h5" stroke="#0066ff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Transparency',
    body: 'Continuous monitoring replaces quarterly self-reported lab tests. Data is public, auditable, and timestamped.',
  },
  {
    number: '03',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4l3.09 6.26L26 11.27l-5 4.87 1.18 6.86L16 19.77l-6.18 3.23L11 16.14 6 11.27l6.91-1.01z" stroke="#0066ff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Market Differentiation',
    body: 'Clean water brands can prove their quality, not just claim it. TrueFlow certification becomes a competitive advantage.',
  },
  {
    number: '04',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="#0066ff" strokeWidth="1.5" />
        <path d="M16 10v6l4 2" stroke="#0066ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 22c2-4 5-6 8-6s6 2 8 6" stroke="#0066ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'SDG 6 Alignment',
    body: "Directly supporting Malaysia's commitment to clean water and sanitation under the UN Sustainable Development Goals.",
  },
]

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
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0066ff', marginBottom: 20 }}
        >
          Why It Matters
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
            color: '#08080f',
            maxWidth: 560,
            marginBottom: 72,
          }}
        >
          Why TrueFlow{' '}
          <span style={{ color: '#0066ff' }}>Matters</span>
        </motion.h2>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{
                y: -4,
                boxShadow: '0 16px 48px rgba(0,102,255,0.1)',
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
              }}
              className="flex gap-6 p-8 rounded-2xl"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex flex-col gap-1 items-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.1)' }}
                >
                  {p.icon}
                </div>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 11,
                  color: 'rgba(0,102,255,0.35)',
                  letterSpacing: '0.06em',
                }}>
                  {p.number}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#08080f',
                  letterSpacing: '-0.01em',
                }}>
                  {p.title}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'rgba(8,8,15,0.55)',
                  fontWeight: 400,
                }}>
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* SDG badge strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-6 mt-16 p-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0,102,255,0.04) 0%, rgba(0,212,255,0.04) 100%)',
            border: '1px solid rgba(0,102,255,0.1)',
          }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center font-black text-white"
            style={{
              background: 'linear-gradient(135deg, #0066ff, #00a0c7)',
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.02em',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            SDG<br/>6
          </div>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 18, color: '#08080f', letterSpacing: '-0.01em' }}>
              UN Sustainable Development Goal 6
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(8,8,15,0.5)', marginTop: 4 }}>
              Clean Water and Sanitation — TrueFlow directly advances SDG 6 for Malaysia
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
