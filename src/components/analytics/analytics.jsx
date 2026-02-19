import { COLORS } from '../../styles/theme'
import MetricCard from '../layout/MetricCard'
import { mockEmployees, weekData } from '../../data/mockData'

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.present))
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 140, padding: "0 8px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, justifyContent: "flex-end", height: 110 }}>
            <div style={{
              width: "100%",
              height: `${(d.late / max) * 100}px`,
              background: COLORS.amber,
              borderRadius: "3px 3px 0 0",
              opacity: 0.7,
              minHeight: d.late > 0 ? 4 : 0,
            }} />
            <div style={{
              width: "100%",
              height: `${(d.present / max) * 100}px`,
              background: `linear-gradient(180deg, ${COLORS.accent}, ${COLORS.accentMid})`,
              borderRadius: "3px 3px 0 0",
            }} />
          </div>
          <span style={{
            color: COLORS.textMuted,
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
          }}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const topOvertime = [...mockEmployees]
    .sort((a, b) => b.overtime - a.overtime)
    .slice(0, 4)

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Attendance Analytics
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          Insights into patterns, tardiness and absenteeism
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        <MetricCard label="Attendance Rate"  value="92%"   sub="↑ 3% vs last month"    color={COLORS.green}  icon="📈" />
        <MetricCard label="Avg Tardiness"    value="4.2%"  sub="↓ 1% improvement"      color={COLORS.amber}  icon="⏱" />
        <MetricCard label="Absenteeism"      value="3.8%"  sub="industry avg: 5.1%"    color={COLORS.red}    icon="📉" />
        <MetricCard label="Total OT Hours"   value="142h"  sub="this month"            color={COLORS.purple} icon="⚡" />
      </div>

      {/* Row 2 — Bar Chart + Dept Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Bar Chart */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}>
            <div style={{ fontWeight: 700 }}>Weekly Attendance Overview</div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { label: "Present", color: COLORS.accent },
                { label: "Late",    color: COLORS.amber  },
              ].map(l => (
                <span key={l.label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  color: COLORS.textMuted, fontSize: 12,
                }}>
                  <span style={{
                    width: 8, height: 8,
                    borderRadius: 2,
                    background: l.color,
                    display: "inline-block",
                  }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <BarChart data={weekData} />
        </div>

        {/* Dept Attendance */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 20 }}>Dept Attendance</div>
          {[
            { dept: "Engineering", rate: 94, color: COLORS.accent  },
            { dept: "Product",     rate: 89, color: COLORS.purple  },
            { dept: "Finance",     rate: 97, color: COLORS.green   },
            { dept: "HR",          rate: 91, color: COLORS.amber   },
          ].map(d => (
            <div key={d.dept} style={{ marginBottom: 16 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 6,
              }}>
                <span style={{ color: COLORS.textMuted }}>{d.dept}</span>
                <span style={{
                  color: d.color,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                }}>
                  {d.rate}%
                </span>
              </div>
              <div style={{
                background: COLORS.surfaceAlt,
                borderRadius: 4,
                height: 6,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${d.rate}%`,
                  background: `linear-gradient(90deg, ${d.color}, ${d.color}88)`,
                  height: "100%",
                  borderRadius: 4,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3 — Overtime + Heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Overtime Leaderboard */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 20 }}>
            Top Overtime Contributors
          </div>
          {topOvertime.map((emp, i) => (
            <div key={emp.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < topOvertime.length - 1 ? `1px solid ${COLORS.border}` : "none",
            }}>
              <span style={{
                color: COLORS.textDim,
                fontFamily: "'DM Mono', monospace",
                width: 20,
                fontSize: 12,
              }}>
                #{i + 1}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: COLORS.redDim,
                border: `1px solid ${COLORS.red}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: COLORS.red,
                fontFamily: "'DM Mono', monospace",
              }}>
                {emp.avatar}
              </div>
              <span style={{ flex: 1, fontSize: 14 }}>{emp.name}</span>
              <span style={{
                color: COLORS.red,
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
              }}>
                +{emp.overtime}h
              </span>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>
            Attendance Heatmap · This Month
          </div>

          {/* Day Labels */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            marginBottom: 4,
          }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} style={{
                textAlign: "center",
                color: COLORS.textDim,
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
          }}>
            {Array.from({ length: 28 }, (_, i) => {
              const levels = [COLORS.red, COLORS.amber, COLORS.accent, COLORS.green]
              const level  = Math.floor(Math.random() * 4)
              const color  = levels[level]
              const opacity = [0.25, 0.4, 0.6, 0.85][level]
              return (
                <div key={i} style={{
                  height: 26,
                  borderRadius: 4,
                  background: `${color}`,
                  opacity,
                  border: `1px solid ${color}33`,
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = opacity}
                />
              )
            })}
          </div>

          {/* Legend */}
          <div style={{
            display: "flex",
            gap: 16,
            marginTop: 16,
            justifyContent: "center",
          }}>
            {[
              ["Low",    COLORS.red    ],
              ["Medium", COLORS.amber  ],
              ["High",   COLORS.accent ],
              ["Full",   COLORS.green  ],
            ].map(([label, color]) => (
              <span key={label} style={{
                display: "flex", alignItems: "center",
                gap: 5, fontSize: 11, color: COLORS.textMuted,
              }}>
                <span style={{
                  width: 8, height: 8,
                  borderRadius: 2,
                  background: color,
                  display: "inline-block",
                }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}