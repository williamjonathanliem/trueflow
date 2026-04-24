import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/stations', label: 'Stations' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Footer() {
  const location = useLocation()

  return (
    <footer style={{
      background: '#020d18',
      borderTop: '1px solid rgba(14,165,233,0.08)',
      padding: '48px 24px 36px',
    }}>
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-10"
          style={{ borderBottom: '1px solid rgba(14,165,233,0.06)', paddingBottom: 36 }}
        >
          {/* Logo + tagline */}
          <div>
            <div className="flex items-center gap-1" style={{ marginBottom: 10 }}>
              <span style={{
                color: '#0ea5e9',
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-1px',
                lineHeight: 1,
              }}>//</span>
              <span style={{
                color: '#ffffff',
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-1px',
                lineHeight: 1,
                marginLeft: 4,
              }}>TrueFlow</span>
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12.5,
              color: 'rgba(180,220,255,0.3)',
              lineHeight: 1.6,
              maxWidth: 280,
              margin: 0,
            }}>
              Real-time water quality intelligence across Malaysia.
              Water is transparent — the data should be too.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {nav.map(({ to, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: active ? '#0ea5e9' : 'rgba(180,220,255,0.4)',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.target.style.color = 'rgba(180,220,255,0.75)' }}
                  onMouseLeave={e => { if (!active) e.target.style.color = 'rgba(180,220,255,0.4)' }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'rgba(180,220,255,0.18)',
            margin: 0,
          }}>
            © {new Date().getFullYear()} TrueFlow. Built in Malaysia.
          </p>

          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'inline-block',
                boxShadow: '0 0 6px #22c55e',
              }}
            />
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              color: 'rgba(34,197,94,0.45)',
            }}>
              All stations live
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}
