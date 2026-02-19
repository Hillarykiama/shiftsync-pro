import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import Avatar from '../layout/Avatar'
import StatusBadge from '../layout/StatusBadge'
import { getEmployees, getTodayAttendance } from '../../lib/db'

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [emps, att] = await Promise.all([
        getEmployees(),
        getTodayAttendance(),
      ])
      setEmployees(emps)
      setAttendance(att)
      setLoading(false)
    }
    load()
  }, [])

  // Merge employees with their attendance for today
  const rows = employees.map(emp => {
    const att = attendance.find(a => a.employee_id === emp.id)
    return {
      ...emp,
      status: att?.status || 'absent',
      clockIn: att?.clock_in
        ? new Date(att.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null,
      hoursToday: att?.hours_today || 0,
      overtime: att?.overtime || 0,
      shift: `${emp.shift_start}–${emp.shift_end}`,
    }
  })

  const countBy = status => rows.filter(r => r.status === status).length

  if (loading) return (
    <div style={{ color: COLORS.accent, fontSize: 16, padding: 40, textAlign: 'center' }}>
      Loading attendance...
    </div>
  )

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Live Attendance
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          Real-time employee status · GPS + IP verified
        </div>
      </div>

      {/* Status Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: "Clocked In",  count: countBy('clocked-in'),  color: COLORS.green     },
          { label: "On Break",    count: countBy('on-break'),     color: COLORS.amber     },
          { label: "Clocked Out", count: countBy('clocked-out'),  color: COLORS.textMuted },
          { label: "Absent",      count: countBy('absent'),       color: COLORS.red       },
        ].map((s, i) => (
          <div key={i} style={{
            background: `${s.color}08`,
            border: `1px solid ${s.color}33`,
            borderRadius: 16,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 800,
              color: s.color,
              fontFamily: "'DM Mono', monospace",
            }}>
              {s.count}
            </div>
            <div style={{ color: s.color, fontSize: 14, fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 24,
        overflowX: "auto",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["Employee", "Department", "Shift", "Clock In", "Hours Today", "Status", "Overtime"].map(h => (
                <th key={h} style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  color: COLORS.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((emp, i) => (
              <tr
                key={emp.id}
                style={{
                  borderBottom: i < rows.length - 1
                    ? `1px solid ${COLORS.border}`
                    : "none",
                }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceAlt}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={emp.avatar} size={34} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                      <div style={{ color: COLORS.textMuted, fontSize: 12 }}>{emp.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 12px", color: COLORS.textMuted, fontSize: 13 }}>
                  {emp.department}
                </td>
                <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                  {emp.shift}
                </td>
                <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: emp.clockIn ? COLORS.text : COLORS.textDim }}>
                  {emp.clockIn || "—"}
                </td>
                <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.accent }}>
                  {emp.hoursToday}h
                </td>
                <td style={{ padding: "14px 12px" }}>
                  <StatusBadge status={emp.status} />
                </td>
                <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: emp.overtime > 0 ? COLORS.red : COLORS.textDim }}>
                  {emp.overtime > 0 ? `+${emp.overtime}h` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}