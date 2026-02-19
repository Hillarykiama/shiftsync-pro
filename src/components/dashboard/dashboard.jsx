import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import MetricCard from '../layout/MetricCard'
import Avatar from '../layout/Avatar'
import { getEmployees, getTodayAttendance } from '../../lib/db'

export default function Dashboard({ onClockIn }) {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    async function load() {
      const [emps, att] = await Promise.all([
        getEmployees(),
        getTodayAttendance(),
      ])
      setEmployees(emps)
      setAttendance(att)
    }
    load()
  }, [])

  const countBy = status => attendance.filter(a => a.status === status).length
  const presentToday = attendance.filter(a => a.status !== 'absent').length
  const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0)

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
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
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
        <MetricCard
          label="Present Today"
          value={presentToday}
          sub={`of ${employees.length} employees`}
          color={COLORS.green}
          icon="✓"
        />
        <MetricCard
          label="On Leave"
          value={countBy('clocked-out')}
          sub="clocked out today"
          color={COLORS.purple}
          icon="🌙"
        />
        <MetricCard
          label="Absent Today"
          value={countBy('absent')}
          sub="not clocked in"
          color={COLORS.amber}
          icon="⏳"
        />
        <MetricCard
          label="Overtime Hours"
          value={totalOvertime.toFixed(1)}
          sub="today"
          color={COLORS.red}
          icon="⚡"
        />
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
          <div style={{
            fontWeight: 700,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ color: COLORS.accent }}>◈</span> Recent Activity
          </div>

          {attendance.slice(0, 4).map((a, i) => {
            const emp = a.employees
            const statusColor = {
              'clocked-in':  COLORS.green,
              'on-break':    COLORS.amber,
              'clocked-out': COLORS.textMuted,
              'absent':      COLORS.red,
            }[a.status] || COLORS.textMuted

            const statusLabel = {
              'clocked-in':  'Clocked in',
              'on-break':    'On break',
              'clocked-out': 'Clocked out',
              'absent':      'Absent',
            }[a.status] || a.status

            return (
              <div key={a.id} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: i < Math.min(attendance.length, 4) - 1
                  ? `1px solid ${COLORS.border}`
                  : "none",
              }}>
                <Avatar
                  initials={emp?.avatar || '??'}
                  size={34}
                  color={statusColor}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {emp?.name || 'Unknown'}
                  </span>
                  <span style={{ color: COLORS.textMuted, fontSize: 13 }}>
                    {' '}· {statusLabel}
                  </span>
                </div>
                <span style={{
                  color: COLORS.textDim,
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {a.clock_in
                    ? new Date(a.clock_in).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'
                  }
                </span>
              </div>
            )
          })}

          {attendance.length === 0 && (
            <div style={{
              color: COLORS.textMuted,
              fontSize: 14,
              textAlign: 'center',
              padding: '20px 0',
            }}>
              No attendance records for today
            </div>
          )}
        </div>

        {/* My Week */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{
            fontWeight: 700,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ color: COLORS.accent }}>◉</span> My Week
          </div>

          {[
            { label: "Hours Worked", value: "38.5h", progress: 38.5 / 40, color: COLORS.accent },
            { label: "Overtime",     value: "2.5h",  progress: 2.5 / 10,  color: COLORS.red   },
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