import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import Avatar from '../layout/Avatar'
import StatusBadge from '../layout/StatusBadge'
import { getEmployees, getTodayAttendance } from '../../lib/db'
import { useAuth, useIsManager } from '../../context/AuthContext'

export default function Attendance() {
  const { currentEmployee } = useAuth()
  const isManager = useIsManager()
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

  const filteredEmployees = isManager
    ? employees
    : employees.filter(e => e.id === currentEmployee?.id)

  const rows = filteredEmployees.map(emp => {
    const att = attendance.find(a => a.employee_id === emp.id)
    return {
      ...emp,
      status: att?.status || 'absent',
      clockIn: att?.clock_in
        ? new Date(att.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null,
      clockOut: att?.clock_out
        ? new Date(att.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null,
      hoursToday: att?.hours_today || 0,
      overtime: att?.overtime || 0,
      shift: `${emp.shift_start}–${emp.shift_end}`,
      ipAddress: att?.ip_address || '—',
    }
  })

  const countBy = status => attendance.filter(a => a.status === status).length

  if (loading) return (
    <div style={{ color: COLORS.accent, fontSize: 16, padding: 40, textAlign: 'center' }}>
      Loading attendance...
    </div>
  )

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          {isManager ? 'Live Attendance' : 'My Attendance'}
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          {isManager
            ? 'Real-time employee status · GPS + IP verified'
            : 'Your attendance record for today'
          }
        </div>
      </div>

      {isManager && (
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
      )}

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
              {[
                "Employee",
                "Department",
                "Shift",
                "Clock In",
                "Clock Out",
                "Hours",
                "Status",
                "Overtime",
                ...(isManager ? ["IP Address"] : []),
              ].map(h => (
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
                <td style={{
                  padding: "14px 12px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                }}>
                  {emp.shift}
                </td>
                <td style={{
                  padding: "14px 12px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: emp.clockIn ? COLORS.green : COLORS.textDim,
                }}>
                  {emp.clockIn || '—'}
                </td>
                <td style={{
                  padding: "14px 12px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: emp.clockOut ? COLORS.textMuted : COLORS.textDim,
                }}>
                  {emp.clockOut || '—'}
                </td>
                <td style={{
                  padding: "14px 12px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: COLORS.accent,
                }}>
                  {emp.hoursToday}h
                </td>
                <td style={{ padding: "14px 12px" }}>
                  <StatusBadge status={emp.status} />
                </td>
                <td style={{
                  padding: "14px 12px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: emp.overtime > 0 ? COLORS.red : COLORS.textDim,
                }}>
                  {emp.overtime > 0 ? `+${emp.overtime}h` : '—'}
                </td>
                {isManager && (
                  <td style={{
                    padding: "14px 12px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: COLORS.textMuted,
                  }}>
                    {emp.ipAddress}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}