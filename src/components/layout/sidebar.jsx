import { COLORS } from '../../styles/theme'
import Avatar from './Avatar'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { signOut } from '../../lib/auth'

const navItems = [
  { id: "dashboard",  label: "Dashboard",  icon: "◈", managerOnly: false },
  { id: "attendance", label: "Attendance",  icon: "◉", managerOnly: false },
  { id: "shifts",     label: "Shifts",      icon: "⬡", managerOnly: false },
  { id: "leaves",     label: "Leaves",      icon: "◫", managerOnly: false },
  { id: "analytics",  label: "Analytics",   icon: "▣", managerOnly: false },
  { id: "team",       label: "Team",        icon: "◎", managerOnly: false },
  { id: "overtime",   label: "Overtime",    icon: "⚡", managerOnly: true  },
]

export default function Sidebar({ currentView, onNavigate, user, isManager }) {
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    await signOut()
  }

  const visibleItems = navItems.filter(n => !n.managerOnly || isManager)

  if (isMobile) {
    return (
      <>
        {/* Top Header */}
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 56,
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 100,
        }}>
          <div style={{
            color: COLORS.accent,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}>
            ShiftSync
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials={user?.avatar || '..'} size={32} />
            <button
              onClick={handleSignOut}
              style={{
                background: "none",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: "6px 10px",
                color: COLORS.textMuted,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Out →
            </button>
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          height: 64,
          background: COLORS.surface,
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 100,
          padding: "0 8px",
        }}>
          {visibleItems.map(n => (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: 10,
                color: currentView === n.id ? COLORS.accent : COLORS.textMuted,
              }}
            >
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{
                fontSize: 9,
                fontWeight: currentView === n.id ? 700 : 400,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontFamily: "'DM Mono', monospace",
              }}>
                {n.label}
              </span>
            </button>
          ))}
        </div>
      </>
    )
  }

  return (
    <div style={{
      width: 220,
      background: COLORS.surface,
      borderRight: `1px solid ${COLORS.border}`,
      display: "flex",
      flexDirection: "column",
      padding: "24px 16px",
      gap: 4,
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
    }}>

      {/* Logo */}
      <div style={{ marginBottom: 32, padding: "0 8px" }}>
        <div style={{
          color: COLORS.accent,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}>
          ShiftSync
        </div>
        <div style={{
          color: COLORS.textMuted,
          fontSize: 11,
          marginTop: 2,
          fontFamily: "'DM Mono', monospace",
        }}>
          v1.0.0 · {isManager ? '⭐ Manager' : 'Employee'}
        </div>
      </div>

      {/* Nav Items */}
      {visibleItems.map(n => (
        <button
          key={n.id}
          onClick={() => onNavigate(n.id)}
          style={{
            background: currentView === n.id ? COLORS.accentGlow : "transparent",
            border: currentView === n.id
              ? `1px solid ${COLORS.accent}33`
              : "1px solid transparent",
            borderRadius: 10,
            padding: "10px 14px",
            color: currentView === n.id ? COLORS.accent : COLORS.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: currentView === n.id ? 700 : 400,
            textAlign: "left",
            width: "100%",
            transition: "all 0.15s",
          }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16 }}>
            {n.icon}
          </span>
          {n.label}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* User Profile */}
      <div style={{
        background: COLORS.surfaceAlt,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <Avatar initials={user?.avatar || '..'} size={32} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {user?.name || 'Loading...'}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>
            {isManager ? '⭐ Manager' : 'Employee'}
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        style={{
          background: "none",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: "10px 14px",
          color: COLORS.textMuted,
          cursor: "pointer",
          fontSize: 13,
          width: "100%",
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
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
  )
}