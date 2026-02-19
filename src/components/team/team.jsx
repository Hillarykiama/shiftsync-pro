import { COLORS } from '../../styles/theme'
import StatusBadge from '../layout/StatusBadge'
import Avatar from '../layout/Avatar'
import { mockEmployees } from '../../data/mockData'

export default function Team() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Team Overview
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          Employee profiles and performance summaries
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: "Total Employees", value: mockEmployees.length,                                          color: COLORS.accent  },
          { label: "Active Now",      value: mockEmployees.filter(e => e.status === 'clocked-in').length,   color: COLORS.green   },
          { label: "On Break",        value: mockEmployees.filter(e => e.status === 'on-break').length,     color: COLORS.amber   },
          { label: "Absent Today",    value: mockEmployees.filter(e => e.status === 'absent').length,       color: COLORS.red     },
        ].map((s, i) => (
          <div key={i} style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: s.color,
              fontFamily: "'DM Mono', monospace",
            }}>
              {s.value}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Employee Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}>
        {mockEmployees.map(emp => (
          <div
            key={emp.id}
            style={{
              background: COLORS.surface,
              border: `1px solid ${
                emp.status === 'clocked-in' ? `${COLORS.green}44` : COLORS.border
              }`,
              borderRadius: 16,
              padding: 20,
              transition: "transform 0.15s, box-shadow 0.15s",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.3)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            {/* Top Row — Avatar + Name */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}>
              <Avatar initials={emp.avatar} size={44} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                  {emp.role} · {emp.dept}
                </div>
              </div>
            </div>

            {/* Status + Shift */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}>
              <StatusBadge status={emp.status} />
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: COLORS.accent,
              }}>
                {emp.shift}
              </span>
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              background: COLORS.border,
              marginBottom: 16,
            }} />

            {/* Stats Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}>
              {[
                {
                  label: "Today",
                  value: `${emp.hoursToday}h`,
                  color: COLORS.text,
                },
                {
                  label: "This Week",
                  value: `${emp.weekHours}h`,
                  color: COLORS.text,
                },
                {
                  label: "Overtime",
                  value: emp.overtime > 0 ? `+${emp.overtime}h` : "—",
                  color: emp.overtime > 0 ? COLORS.red : COLORS.textDim,
                },
                {
                  label: "Clock In",
                  value: emp.clockIn || "—",
                  color: emp.clockIn ? COLORS.textMuted : COLORS.textDim,
                },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: COLORS.surfaceAlt,
                  borderRadius: 10,
                  padding: "10px 12px",
                }}>
                  <div style={{
                    color: COLORS.textDim,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}>
                    {stat.label}
                  </div>
                  <div style={{
                    color: stat.color,
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                    fontSize: 14,
                  }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Hours Bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: COLORS.textDim,
                marginBottom: 5,
              }}>
                <span>Weekly Progress</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  {emp.weekHours}/40h
                </span>
              </div>
              <div style={{
                background: COLORS.surfaceAlt,
                borderRadius: 4,
                height: 5,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${Math.min((emp.weekHours / 40) * 100, 100)}%`,
                  background: emp.weekHours > 40
                    ? COLORS.red
                    : emp.weekHours > 35
                    ? COLORS.green
                    : COLORS.accent,
                  height: "100%",
                  borderRadius: 4,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}