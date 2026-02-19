import { COLORS } from '../../styles/theme'
import MetricCard from '../layout/MetricCard'
import Avatar from '../layout/Avatar'
import { mockEmployees } from '../../data/mockData'

export default function Dashboard({ onClockIn }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
      }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Good morning, Sarah 👋
          </div>
          <div style={{ color: COLORS.textMuted, marginTop: 4, fontSize: 14 }}>
            Thursday, February 19, 2026 · Week 8
          </div>
        </div>
        <button
          onClick={onClockIn}
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
            border: "none",
            borderRadius: 14,
            padding: "14px 28px",
            color: "#0a0e1a",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.05em",
            boxShadow: `0 4px 20px ${COLORS.accentGlow}`,
          }}
        >
          ⏱ CLOCK IN / OUT
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        <MetricCard label="Present Today"     value="48" sub="of 55 employees"   color={COLORS.green}  icon="✓" />
        <MetricCard label="On Leave"          value="4"  sub="approved requests" color={COLORS.purple} icon="🌙" />
        <MetricCard label="Pending Requests"  value="5"  sub="need approval"     color={COLORS.amber}  icon="⏳" />
        <MetricCard label="Overtime Hours"    value="28.4" sub="this week"       color={COLORS.red}    icon="⚡" />
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* Recent Activity */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.accent }}>◈</span> Recent Activity
          </div>
          {[
            { avatar: "SC", name: "Sarah Chen",    action: "Clocked in",     time: "08:57 AM", color: COLORS.green },
            { avatar: "MR", name: "Marcus Reid",   action: "Started break",  time: "12:01 PM", color: COLORS.amber },
            { avatar: "TK", name: "Tom Kowalski",  action: "Marked absent",  time: "09:00 AM", color: COLORS.red },
            { avatar: "LM", name: "Lena Müller",   action: "Late check-in",  time: "09:15 AM", color: COLORS.amber },
          ].map((a, i, arr) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : "none",
            }}>
              <Avatar initials={a.avatar} size={34} color={a.color} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                <span style={{ color: COLORS.textMuted, fontSize: 13 }}> · {a.action}</span>
              </div>
              <span style={{
                color: COLORS.textDim,
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}>
                {a.time}
              </span>
            </div>
          ))}
        </div>

        {/* My Week */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.accent }}>◉</span> My Week
          </div>

          {[
            { label: "Hours Worked", value: "38.5h", progress: 38.5 / 40, color: COLORS.accent },
            { label: "Overtime",     value: "2.5h",  progress: 2.5 / 10,  color: COLORS.red },
            { label: "Punctuality",  value: "96%",   progress: 0.96,      color: COLORS.green },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 13,
              }}>
                <span style={{ color: COLORS.textMuted }}>{m.label}</span>
                <span style={{
                  color: m.color,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                }}>
                  {m.value}
                </span>
              </div>
              <div style={{
                background: COLORS.surfaceAlt,
                borderRadius: 4,
                height: 6,
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${m.progress * 100}%`,
                  background: m.color,
                  borderRadius: 4,
                }} />
              </div>
            </div>
          ))}

          {/* Next Shift */}
          <div style={{
            background: COLORS.accentGlow,
            border: `1px solid ${COLORS.accent}22`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            marginTop: 8,
          }}>
            <span style={{ color: COLORS.accent }}>📅</span> Next shift:{" "}
            <strong>Fri, 09:00</strong>
          </div>
        </div>

      </div>
    </div>
  )
}