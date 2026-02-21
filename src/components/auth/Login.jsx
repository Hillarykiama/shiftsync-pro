import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { COLORS } from '../../styles/theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const inp = {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "12px 16px",
    color: COLORS.text,
    fontSize: 15,
    outline: "none",
    width: "100%",
    fontFamily: "'Sora', sans-serif",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>

      {/* Background glow */}
      <div style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.accentGlow}, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 24,
        padding: "48px 40px",
        width: "100%",
        maxWidth: 420,
        position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.accent,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}>
            ShiftSync
          </div>
          <div style={{
            color: COLORS.textMuted,
            fontSize: 14,
          }}>
            Smart Shift & Attendance Management
          </div>
        </div>

        {/* Welcome */}
        <div style={{
          fontSize: 22,
          fontWeight: 800,
          marginBottom: 6,
          letterSpacing: "-0.02em",
        }}>
          Welcome back 👋
        </div>
        <div style={{
          color: COLORS.textMuted,
          fontSize: 14,
          marginBottom: 32,
        }}>
          Sign in to your account to continue
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: COLORS.redDim,
            border: `1px solid ${COLORS.red}44`,
            borderRadius: 10,
            padding: "10px 14px",
            color: COLORS.red,
            fontSize: 13,
            marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Email */}
          <div>
            <label style={{
              color: COLORS.textMuted,
              fontSize: 12,
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@shiftsync.com"
              style={{ ...inp }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              color: COLORS.textMuted,
              fontSize: 12,
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{ ...inp }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: loading
                ? COLORS.surfaceAlt
                : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
              border: "none",
              borderRadius: 12,
              padding: "14px",
              color: loading ? COLORS.textMuted : "#0a0e1a",
              fontWeight: 800,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.05em",
              marginTop: 8,
              boxShadow: loading ? "none" : `0 4px 20px ${COLORS.accentGlow}`,
              transition: "all 0.2s",
            }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN →'}
          </button>
        </div>

        {/* Demo accounts */}
        <div style={{
          marginTop: 32,
          padding: "16px",
          background: COLORS.surfaceAlt,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
        }}>
          <div style={{
            color: COLORS.textMuted,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
            fontFamily: "'DM Mono', monospace",
          }}>
            Demo Accounts
          </div>
          {[
            { name: "Sarah Chen",   email: "sarah.chen@shiftsync.com",   role: "Manager"  },
            { name: "Marcus Reid",  email: "marcus.reid@shiftsync.com",  role: "Employee" },
            { name: "James Okafor", email: "james.okafor@shiftsync.com", role: "Employee" },
          ].map(u => (
            <button
              key={u.email}
              onClick={() => {
                setEmail(u.email)
                setPassword('Password123!')
              }}
              style={{
                background: "none",
                border: "none",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                cursor: "pointer",
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <span style={{ color: COLORS.text, fontSize: 13 }}>{u.name}</span>
              <span style={{
                color: u.role === 'Manager' ? COLORS.accent : COLORS.textMuted,
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
              }}>
                {u.role}
              </span>
            </button>
          ))}
          <div style={{
            color: COLORS.textDim,
            fontSize: 11,
            marginTop: 8,
            textAlign: "center",
          }}>
            Click any account to autofill credentials
          </div>
        </div>

      </div>
    </div>
  )
}