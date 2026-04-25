import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { AnimatePresence, motion } from 'framer-motion'

const SUGGESTED = [
  "Is KLR-03 safe to drink?",
  "Which station is cleanest?",
  "How often does data update?",
  "What does ALERT status mean?",
  "How is the quality score calculated?",
  "What sensors does TrueFlow use?",
]

const S = {
  // Scoped CSS injected once — prefix flo-chat- to avoid Tailwind conflicts
  css: `
    @keyframes flo-pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.6; transform: scale(0.8); }
    }
    @keyframes flo-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30%           { transform: translateY(-5px); opacity: 1; }
    }
    @keyframes flo-fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .flo-chat-messages::-webkit-scrollbar { width: 4px; }
    .flo-chat-messages::-webkit-scrollbar-track { background: transparent; }
    .flo-chat-messages::-webkit-scrollbar-thumb {
      background: rgba(0,162,255,0.18);
      border-radius: 4px;
    }

    .flo-chat-msg-row {
      display: flex;
      margin-bottom: 14px;
      align-items: flex-end;
      gap: 8px;
      animation: flo-fade-up 0.22s ease forwards;
    }
    .flo-chat-msg-row.user     { justify-content: flex-end; }
    .flo-chat-msg-row.assistant{ justify-content: flex-start; }

    .flo-chat-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00a2ff;
      box-shadow: 0 0 6px rgba(0,162,255,0.5);
      animation: flo-bounce 1.3s infinite;
    }

    .flo-live-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00ff88;
      box-shadow: 0 0 6px #00ff88;
      animation: flo-pulse-dot 2s infinite;
    }

    .flo-chat-chip {
      padding: 5px 12px;
      border-radius: 20px;
      border: 1px solid rgba(0,162,255,0.25);
      background: rgba(0,162,255,0.05);
      color: rgba(200,225,255,0.7);
      font-size: 11.5px;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.15s ease;
      letter-spacing: -0.1px;
    }
    .flo-chat-chip:hover {
      background: rgba(0,162,255,0.14);
      border-color: rgba(0,162,255,0.5);
      color: #c8dff5;
      transform: translateY(-1px);
    }

    .flo-chat-textarea {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid rgba(0,162,255,0.2);
      background: rgba(255,255,255,0.04);
      color: #c8dff5;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      resize: none;
      line-height: 1.5;
      min-height: 42px;
      max-height: 110px;
      transition: border-color 0.18s, box-shadow 0.18s;
      outline: none;
    }
    .flo-chat-textarea::placeholder { color: rgba(255,255,255,0.2); }
    .flo-chat-textarea:focus {
      border-color: rgba(0,162,255,0.45);
      box-shadow: 0 0 0 3px rgba(0,162,255,0.08);
    }

    .flo-send-btn {
      width: 42px; height: 42px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s ease;
      background: linear-gradient(135deg, #0052cc, #0077e6);
      box-shadow: 0 4px 16px rgba(0,100,230,0.3);
    }
    .flo-send-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 22px rgba(0,120,255,0.4);
      background: linear-gradient(135deg, #0060ee, #0088ff);
    }
    .flo-send-btn:active:not(:disabled) { transform: translateY(0); }
    .flo-send-btn:disabled {
      background: rgba(255,255,255,0.06);
      box-shadow: none;
      cursor: not-allowed;
    }

    .flo-chat-md p              { margin-bottom: 5px; }
    .flo-chat-md p:last-child   { margin-bottom: 0; }
    .flo-chat-md ul,
    .flo-chat-md ol             { padding-left: 16px; margin-bottom: 5px; }
    .flo-chat-md li             { margin-bottom: 2px; }
    .flo-chat-md strong         { font-weight: 600; color: #a8d4ff; }
    .flo-chat-md.user strong    { color: #fff; }
    .flo-chat-md h1,
    .flo-chat-md h2,
    .flo-chat-md h3             { font-size: 12px; font-weight: 600; margin: 6px 0 3px; color: #60b4ff; }
    .flo-chat-md.user h1,
    .flo-chat-md.user h2,
    .flo-chat-md.user h3        { color: #fff; }
    .flo-chat-md code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: rgba(0,162,255,0.1);
      border: 1px solid rgba(0,162,255,0.15);
      border-radius: 4px;
      padding: 1px 4px;
      color: #60b4ff;
    }

    .flo-toggle-btn {
      width: 52px; height: 52px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: linear-gradient(135deg, #0052cc, #0ea5e9);
      box-shadow: 0 4px 20px rgba(0,120,255,0.45), 0 0 0 1px rgba(0,162,255,0.2);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
      position: relative;
    }
    .flo-toggle-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0,130,255,0.55), 0 0 0 1px rgba(0,162,255,0.35);
    }
    .flo-toggle-btn:active { transform: scale(0.97); }
  `,
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I'm FLO — TrueFlow's water quality intelligence assistant. Ask me about station readings, sensor data, water quality thresholds, or how the platform works.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const styleInjected = useRef(false)

  // Inject scoped CSS once
  useEffect(() => {
    if (styleInjected.current) return
    const tag = document.createElement('style')
    tag.id = 'flo-chat-styles'
    tag.textContent = S.css
    document.head.appendChild(tag)
    styleInjected.current = true
    return () => {
      const el = document.getElementById('flo-chat-styles')
      if (el) el.remove()
      styleInjected.current = false
    }
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  // Focus textarea when popup opens
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 120)
  }, [open])

  function autoResize() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 110) + 'px'
  }

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setShowSuggestions(false)
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_CHATBOT_URL || 'http://localhost:3001'
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply || data.error || 'Sorry, something went wrong.' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Couldn't reach the FLO server. Make sure the backend is running on port 3001." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>

      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="flo-chat-popup"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 380,
              height: 520,
              background: 'rgba(8, 14, 24, 0.97)',
              border: '1px solid rgba(0,162,255,0.2)',
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(0,162,255,0.06), 0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(0,162,255,0.05)',
              backdropFilter: 'blur(24px)',
              transformOrigin: 'bottom right',
            }}
          >
            {/* Scanline texture */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 18, zIndex: 10,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,162,255,0.012) 2px, rgba(0,162,255,0.012) 4px)',
            }} />

            {/* Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(0,162,255,0.12)',
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(0,162,255,0.03)',
              flexShrink: 0,
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, fontWeight: 700,
                color: '#0ea5e9', letterSpacing: '0.04em', userSelect: 'none',
              }}>
                // <span style={{ color: 'rgba(255,255,255,0.45)' }}>TRUE</span>FLOW
              </div>
              <div style={{ width: 1, height: 18, background: 'rgba(0,162,255,0.2)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e8f4ff', letterSpacing: '-0.2px' }}>
                  FLO — Water Intelligence
                </div>
                <div style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.03em',
                }}>
                  Powered by Llama 3.2
                </div>
              </div>
              <div style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
                borderRadius: 20, padding: '3px 9px',
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                color: '#00ff88', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
              }}>
                <div className="flo-live-dot" />
                Live
              </div>
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', fontSize: 18, lineHeight: 1,
                  padding: '0 2px', transition: 'color 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div
              className="flo-chat-messages"
              style={{
                flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
                display: 'flex', flexDirection: 'column', gap: 0,
                scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,162,255,0.15) transparent',
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flo-chat-msg-row ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: 'linear-gradient(135deg, #0052cc, #0ea5e9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, boxShadow: '0 0 10px rgba(0,162,255,0.3)',
                    }}>
                      💧
                    </div>
                  )}
                  <div style={{
                    maxWidth: '76%', padding: '10px 13px',
                    fontSize: 13, lineHeight: 1.6,
                    ...(msg.role === 'assistant' ? {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(0,162,255,0.14)',
                      borderRadius: '4px 14px 14px 14px',
                      color: '#c8dff5',
                    } : {
                      background: 'linear-gradient(135deg, #0052cc, #0077e6)',
                      borderRadius: '14px 14px 4px 14px',
                      color: '#fff',
                      boxShadow: '0 4px 18px rgba(0,100,230,0.3)',
                    }),
                  }}>
                    <div className={`flo-chat-md${msg.role === 'user' ? ' user' : ''}`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flo-chat-msg-row assistant">
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'linear-gradient(135deg, #0052cc, #0ea5e9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  }}>
                    💧
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(0,162,255,0.14)',
                    borderRadius: '4px 14px 14px 14px',
                    padding: '12px 16px',
                    display: 'flex', gap: 5, alignItems: 'center',
                  }}>
                    <div className="flo-chat-dot" style={{ animationDelay: '0s' }} />
                    <div className="flo-chat-dot" style={{ animationDelay: '0.2s' }} />
                    <div className="flo-chat-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}

              {showSuggestions && !loading && (
                <div style={{ marginTop: 8, marginBottom: 4 }}>
                  <p style={{
                    fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                    color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase',
                    letterSpacing: '0.1em', marginBottom: 8,
                  }}>
                    · Suggested queries ·
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {SUGGESTED.map((q, i) => (
                      <button key={i} className="flo-chat-chip" onClick={() => sendMessage(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 14px 12px',
              borderTop: '1px solid rgba(0,162,255,0.1)',
              display: 'flex', gap: 8, alignItems: 'flex-end',
              background: 'rgba(0,162,255,0.02)',
              flexShrink: 0,
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  className="flo-chat-textarea"
                  value={input}
                  onChange={e => { setInput(e.target.value); autoResize() }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Ask about stations, water quality..."
                  rows={1}
                />
              </div>
              <button
                className="flo-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 8L14 8M14 8L9 3M14 8L9 13"
                    stroke={input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.25)'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        className="flo-toggle-btn"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Close FLO chat' : 'Open FLO chat'}
        title={open ? 'Close FLO' : 'Ask FLO'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.18 }}
              style={{ color: '#fff', fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center' }}
            >
              ×
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 22, lineHeight: 1, display: 'flex', alignItems: 'center' }}
            >
              💧
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread pulse when closed */}
        {!open && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: 2, right: 2,
              width: 10, height: 10, borderRadius: '50%',
              background: '#00ff88',
              border: '2px solid #020d18',
              boxShadow: '0 0 6px #00ff88',
            }}
          />
        )}
      </motion.button>
    </div>
  )
}
