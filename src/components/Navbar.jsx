import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/', label: 'Home' },
  { to: '/stations', label: 'Stations' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        background: scrolled ? 'rgba(2,13,24,0.88)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(14,165,233,0.1)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div
        className="max-w-6xl mx-auto flex items-center justify-between"
        style={{ padding: '14px 24px' }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{
            color: '#0ea5e9',
            fontSize: 18,
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>//</span>
          <span style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.5px',
            lineHeight: 1,
            marginLeft: 4,
          }}>TrueFlow</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#0ea5e9' : 'rgba(180,220,255,0.5)',
                  background: active ? 'rgba(14,165,233,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(14,165,233,0.15)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </Link>
            )
          })}
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              marginLeft: 8,
              padding: '7px 18px',
              borderRadius: 8,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
              boxShadow: '0 0 20px rgba(14,165,233,0.25)',
              letterSpacing: '0.01em',
            }}
          >
            Live Data
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{
                rotate: menuOpen && i === 0 ? 45 : menuOpen && i === 2 ? -45 : 0,
                y: menuOpen && i === 0 ? 8 : menuOpen && i === 2 ? -8 : 0,
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
              style={{
                display: 'block',
                width: 22,
                height: 1.5,
                background: '#7dd3fc',
                borderRadius: 2,
                transformOrigin: 'center',
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(2,13,24,0.97)',
              borderTop: '1px solid rgba(14,165,233,0.1)',
              overflow: 'hidden',
            }}
          >
            <div className="flex flex-col p-4 gap-1">
              {links.map(({ to, label }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      textDecoration: 'none',
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 15,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#0ea5e9' : 'rgba(180,220,255,0.6)',
                      background: active ? 'rgba(14,165,233,0.08)' : 'transparent',
                    }}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
