import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function FadeIn({ children, delay = 0, y = 20 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

const pillars = [
  {
    label: 'Transparency',
    body: 'Water quality data should be open and readable by anyone — not locked behind lab reports or government dashboards.',
  },
  {
    label: 'Real-time',
    body: 'Contamination events happen in minutes. Our sensor network surfaces problems as they occur, not weeks after the fact.',
  },
  {
    label: 'Trust',
    body: 'Every reading is timestamped, station-attributed, and scored against international standards so the data speaks for itself.',
  },
]

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020d18', paddingTop: 80 }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(14,165,233,0.08)', padding: '64px 24px 72px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
            About TrueFlow
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 64px)',
              letterSpacing: '-0.035em',
              lineHeight: 1.08,
              color: '#ffffff',
              marginBottom: 32,
            }}
          >
            Water is transparent.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #0369a1 0%, #7dd3fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Why shouldn't the data be?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'rgba(180,220,255,0.5)',
              lineHeight: 1.75,
              maxWidth: 640,
            }}
          >
            Clean water should not be assumed.
            <br />It should be proven.
          </motion.p>
        </div>
      </div>

      {/* ── Origin ────────────────────────────────────────── */}
      <div style={{ padding: '80px 24px', borderBottom: '1px solid rgba(14,165,233,0.06)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <FadeIn delay={0}>
            <p style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#0ea5e9',
              marginBottom: 20,
            }}>
              Why we exist
            </p>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(24px, 3vw, 36px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: '#ffffff',
              marginBottom: 0,
            }}>
              We noticed something missing from every bottle on the shelf.
            </h2>
          </FadeIn>

          <FadeIn delay={0.12}>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              color: 'rgba(180,220,255,0.55)',
              lineHeight: 1.85,
              marginBottom: 20,
            }}>
              Today, consumers have limited visibility into the actual quality of the water they drink.
              You get a sticker. Maybe a number. But no source, no history, no real-time picture of
              what's actually in the water coming out of the ground — or the pipe.
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              color: 'rgba(180,220,255,0.55)',
              lineHeight: 1.85,
            }}>
              TrueFlow was built to change that. AI-powered sensor nodes deployed across water sources
              in Malaysia — including those used by commercial brands — collect real-time data on mineral
              content and purity, then surface it on an open, accessible platform anyone can read.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* ── Mission ───────────────────────────────────────── */}
      <div style={{ padding: '80px 24px', background: '#051a2d', borderBottom: '1px solid rgba(14,165,233,0.06)' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn delay={0}>
            <p style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#0ea5e9',
              marginBottom: 28,
            }}>
              Mission
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <blockquote style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(20px, 3vw, 30px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.55,
              color: 'rgba(240,248,255,0.88)',
              borderLeft: '3px solid #0ea5e9',
              paddingLeft: 28,
              margin: 0,
            }}>
              We aim to make water quality{' '}
              <span style={{ color: '#7dd3fc' }}>visible</span>,{' '}
              <span style={{ color: '#7dd3fc' }}>transparent</span>, and{' '}
              <span style={{ color: '#7dd3fc' }}>trusted</span> — for every person, in every city,
              from every source.
            </blockquote>
          </FadeIn>
        </div>
      </div>

      {/* ── Pillars ───────────────────────────────────────── */}
      <div style={{ padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn delay={0}>
            <p style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#0ea5e9',
              marginBottom: 48,
            }}>
              What we stand for
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <FadeIn key={p.label} delay={0.08 + i * 0.1}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(14,165,233,0.1)',
                  borderRadius: 16,
                  padding: '28px 24px',
                  height: '100%',
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(14,165,233,0.1)',
                    border: '1px solid rgba(14,165,233,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0ea5e9',
                  }}>
                    0{i + 1}
                  </div>
                  <h3 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#ffffff',
                    letterSpacing: '-0.01em',
                    marginBottom: 10,
                  }}>
                    {p.label}
                  </h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13.5,
                    color: 'rgba(180,220,255,0.45)',
                    lineHeight: 1.75,
                    margin: 0,
                  }}>
                    {p.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* ── Closing ───────────────────────────────────────── */}
      <div style={{
        padding: '64px 24px 96px',
        background: '#051a2d',
        borderTop: '1px solid rgba(14,165,233,0.06)',
        textAlign: 'center',
      }}>
        <FadeIn delay={0}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(22px, 3.5vw, 40px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            color: '#ffffff',
            marginBottom: 16,
          }}>
            Let's make water quality visible.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            color: 'rgba(180,220,255,0.35)',
            lineHeight: 1.7,
          }}>
            Built in Malaysia. For every person who deserves to know what's in their water.
          </p>
        </FadeIn>
      </div>

    </div>
  )
}
