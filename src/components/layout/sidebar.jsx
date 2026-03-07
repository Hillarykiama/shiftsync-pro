import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import Avatar from './Avatar'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { signOut } from '../../lib/auth'
import FaceRegistration from '../auth/FaceRegistration'

const navItems = [
  { id: "dashboard",  label: "Dashboard",  icon: "◈", managerOnly: false, adminOnly: false },
  { id: "attendance", label: "Attendance",  icon: "◉", managerOnly: false, adminOnly: false },
  { id: "shifts",     label: "Shifts",      icon: "⬡", managerOnly: false, adminOnly: false },
  { id: "leaves",     label: "Leaves",      icon: "◫", managerOnly: false, adminOnly: false },
  { id: "analytics",  label: "Analytics",   icon: "▣", managerOnly: false, adminOnly: false },
  { id: "team",       label: "Team",        icon: "◎", managerOnly: false, adminOnly: false },
  { id: "overtime",   label: "Overtime",    icon: "⚡", managerOnly: true,  adminOnly: false },
  { id: "admin",      label: "Admin Panel", icon: "⚙️", managerOnly: false, adminOnly: true  },
]

export default function Sidebar({ currentView, onNavigate, user, isManager, isAdmin }) {
  const isMobile = useIsMobile()
  const [showFaceReg, setShowFaceReg] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const handleSignOut = async () => { await signOut() }

  const visibleItems = navItems.filter(n => {
    if (n.adminOnly)   return isAdmin
    if (n.managerOnly) return isManager
    return true
  })

  useEffect(() => {
    function handleClick() { if (showMore) setShowMore(false) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showMore])

  if (isMobile) {
    return (
      <>
        {/* Top Header */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 56,
          background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", zIndex: 100,
        }}>
          <div style={{ color: COLORS.accent, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
            ShiftSync
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setShowFaceReg(true)}
              style={{
                background: "none", border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "6px 10px",
                color: COLORS.textMuted, cursor: "pointer",
                fontSize: 12, fontFamily: "'DM Mono', monospace",
              }}
            >
              📸
            </button>
            <Avatar initials={user?.avatar || '..'} size={32} />
            <button
              onClick={handleSignOut}
              style={{
                background: "none", border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "6px 10px",
                color: COLORS.textMuted, cursor: "pointer",
                fontSize: 12, fontFamily: "'DM Mono', monospace",
              }}
            >
              Out →
            </button>
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, height: 64,
          background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          zIndex: 100, padding: "0 8px",
        }}>
          {visibleItems.slice(0, 5).map(n => (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              style={{
                background: "none", border: "none",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                cursor: "pointer", padding: "6px 8px", borderRadius: 10,
                color: currentView === n.id ? COLORS.accent : COLORS.textMuted,
              }}
            >
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{
                fontSize: 9, fontWeight: currentView === n.id ? 700 : 400,
                textTransform: "uppercase", letterSpacing: "0.04em",
                fontFamily: "'DM Mono', monospace",
              }}>
                {n.label}
              </span>
            </button>
          ))}

          {/* More button */}
          {visibleItems.length > 5 && (
            <div style={{ position: "relative" }}>
              <button
                onClick={e => { e.stopPropagation(); setShowMore(prev => !prev) }}
                style={{
                  background: "none", border: "none",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  cursor: "pointer", padding: "6px 8px", borderRadius: 10,
                  color: visibleItems.slice(5).some(n => n.id === currentView)
                    ? COLORS.accent : COLORS.textMuted,
                }}
              >
                <span style={{ fontSize: 18 }}>⋯</span>
                <span style={{
                  fontSize: 9, fontWeight: 400,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  More
                </span>
              </button>

              {showMore && (
                <div style={{
                  position: "absolute", bottom: 56, right: 0,
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  borderRadius: 12, padding: 8, minWidth: 160,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 200,
                }}>
                  {visibleItems.slice(5).map(n => (
                    <button
                      key={n.id}
                      onClick={() => { onNavigate(n.id); setShowMore(false) }}
                      style={{
                        background: currentView === n.id ? COLORS.accentGlow : "none",
                        border: "none", borderRadius: 8, padding: "10px 14px",
                        color: currentView === n.id ? COLORS.accent : COLORS.textMuted,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                        fontSize: 13, width: "100%", fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      <span>{n.icon}</span> {n.label}
                    </button>
                  ))}
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, margin: "8px 0" }} />
                  <button
                    onClick={() => { setShowFaceReg(true); setShowMore(false) }}
                    style={{
                      background: "none", border: "none", borderRadius: 8, padding: "10px 14px",
                      color: COLORS.textMuted, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      fontSize: 13, width: "100%", fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    📸 Register Face
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {showFaceReg && (
          <FaceRegistration
            onClose={() => setShowFaceReg(false)}
            onSuccess={() => setShowFaceReg(false)}
          />
        )}
      </>
    )
  }

  // ── DESKTOP ───────────────────────────────────────────────
  return (
    <>
      <div style={{
        width: 220, background: COLORS.surface,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex", flexDirection: "column",
        padding: "24px 16px", gap: 4,
        flexShrink: 0, position: "sticky",
        top: 0, height: "100vh", overflowY: "auto",
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 32, padding: "0 8px" }}>
          <div style={{ color: COLORS.accent, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
            ShiftSync
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
            v1.0.0 · {isAdmin ? '🔑 Admin' : isManager ? '⭐ Manager' : 'Employee'}
          </div>
        </div>

        {/* Nav Items */}
        {visibleItems.map(n => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            style={{
              background: currentView === n.id ? COLORS.accentGlow : "transparent",
              border: currentView === n.id ? `1px solid ${COLORS.accent}33` : "1px solid transparent",
              borderRadius: 10, padding: "10px 14px",
              color: currentView === n.id ? COLORS.accent : COLORS.textMuted,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              fontSize: 14, fontWeight: currentView === n.id ? 700 : 400,
              textAlign: "left", width: "100%", transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              if (currentView !== n.id) {
                e.currentTarget.style.background = COLORS.surfaceAlt
                e.currentTarget.style.color = COLORS.text
              }
            }}
            onMouseLeave={e => {
              if (currentView !== n.id) {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = COLORS.textMuted
              }
            }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* User Profile */}
        <div style={{
          background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
          borderRadius: 12, padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Avatar initials={user?.avatar || '..'} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || 'Loading...'}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {isAdmin ? '🔑 Admin' : isManager ? '⭐ Manager' : 'Employee'}
            </div>
          </div>
        </div>

        {/* Register Face */}
        <button
          onClick={() => setShowFaceReg(true)}
          style={{
            background: "none", border: `1px solid ${COLORS.border}`,
            borderRadius: 10, padding: "10px 14px",
            color: COLORS.textMuted, cursor: "pointer", fontSize: 13,
            width: "100%", marginTop: 8,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = COLORS.accentGlow
            e.currentTarget.style.color = COLORS.accent
            e.currentTarget.style.borderColor = `${COLORS.accent}44`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "none"
            e.currentTarget.style.color = COLORS.textMuted
            e.currentTarget.style.borderColor = COLORS.border
          }}
        >
          📸 Register Face
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          style={{
            background: "none", border: `1px solid ${COLORS.border}`,
            borderRadius: 10, padding: "10px 14px",
            color: COLORS.textMuted, cursor: "pointer", fontSize: 13,
            width: "100%", marginTop: 8,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = COLORS.redDim
            e.currentTarget.style.color = COLORS.red
            e.currentTarget.style.borderColor = `${COLORS.red}44`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "none"
            e.currentTarget.style.color = COLORS.textMuted
            e.currentTarget.style.borderColor = COLORS.border
          }}
        >
          <span>→</span> Sign Out
        </button>
      </div>

      {showFaceReg && (
        <FaceRegistration
          onClose={() => setShowFaceReg(false)}
          onSuccess={() => setShowFaceReg(false)}
        />
      )}
    </>
  )
}