import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import StationsPage from './pages/StationsPage'
import DemoPage from './pages/DemoPage'
import AboutPage from './pages/AboutPage'
import LiveRobotPage from './pages/LiveRobotPage'
import Footer from './components/Footer'
import FloatingChat from './components/FloatingChat'

function Preloader({ done }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: '#020d18' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-1">
              <span style={{
                color: '#0ea5e9',
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-1px',
                lineHeight: 1,
              }}>
                //
              </span>
              <span style={{
                color: '#ffffff',
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-1px',
                lineHeight: 1,
                marginLeft: 4,
              }}>
                TrueFlow
              </span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 200,
                height: 1,
                background: 'linear-gradient(90deg, #0369a1, #7dd3fc)',
                transformOrigin: 'left',
                borderRadius: 1,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AppInner({ preloaderDone }) {
  const location = useLocation()
  const noFooter = ['/dashboard', '/demo', '/liverobot'].includes(location.pathname)

  return (
    <>
      <Preloader done={preloaderDone} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: preloaderDone ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stations" element={<StationsPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/liverobot" element={<LiveRobotPage />} />
        </Routes>
        {!noFooter && <Footer />}
        <FloatingChat />
      </motion.div>
    </>
  )
}

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPreloaderDone(true), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <BrowserRouter>
      <AppInner preloaderDone={preloaderDone} />
    </BrowserRouter>
  )
}
