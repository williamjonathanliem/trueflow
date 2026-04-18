import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import Problem from './components/Problem'
import FloReveal from './components/FloReveal'
import HowItWorks from './components/HowItWorks'
import Dashboard from './components/Dashboard'
import Impact from './components/Impact'
import Team from './components/Team'
import ClosingCTA from './components/ClosingCTA'

const TOTAL_FRAMES = 120

function Preloader({ progress, done }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: '#050510' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-8"
          >
            <div className="flex items-center gap-1">
              <span style={{
                color: '#0066ff',
                fontSize: 32,
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                letterSpacing: '-1px',
                lineHeight: 1
              }}>
                //
              </span>
              <span style={{
                color: '#ffffff',
                fontSize: 32,
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                letterSpacing: '-1px',
                lineHeight: 1,
                marginLeft: 4
              }}>
                TrueFlow
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-64 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #1a1aff, #00d4ff)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}>
                Initializing sensors — {Math.round(progress)}%
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [framesLoaded, setFramesLoaded] = useState(false)
  const [preloaderDone, setPreloaderDone] = useState(false)

  useEffect(() => {
    let loaded = 0
    let completed = false

    const finish = () => {
      if (completed) return
      completed = true
      setLoadProgress(100)
      setFramesLoaded(true)
      setTimeout(() => setPreloaderDone(true), 500)
    }

    const onProgress = () => {
      loaded++
      const pct = (loaded / TOTAL_FRAMES) * 100
      setLoadProgress(pct)
      if (loaded >= TOTAL_FRAMES) finish()
    }

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      const idx = String(i).padStart(3, '0')
      img.src = `/frames/flo_${idx}.webp`
      img.onload = onProgress
      img.onerror = onProgress
    }

    // Safety: proceed after 2.5s regardless
    const timeout = setTimeout(finish, 2500)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      <Preloader progress={loadProgress} done={preloaderDone} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: preloaderDone ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Hero />
        <Problem />
        <FloReveal />
        <HowItWorks />
        <Dashboard />
        <Impact />
        <Team />
        <ClosingCTA />
      </motion.div>
    </>
  )
}
