import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import Avatar from '../layout/Avatar'
import StatusBadge from '../layout/StatusBadge'
import { getEmployees, getTodayAttendance } from '../../lib/db'
import { useAuth, useIsManager } from '../../context/AuthContext'

export default function Team() {
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

  // Managers see all, employees see only themselves
  const visibleEmployees = isManager
    ? employees
    : employees.filter(e => e.id === currentEmployee?.id)

  const getAttendanceForEmployee = (empId) => {
    return attendance.find(a => a.employee_id === empId)
  }

  const countBy = status => attendance.filter(a => a.status === status).length

  if (loading) return (
    <div style={{ color: COLORS.accent, fontSize: 16, padding: 40, textAlign: 'center' }}>
      Loading team...
    </div>
  )

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          {isManager ? 'Team Overview' : 'My Profile'}
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          {isManager
            ? 'All employees · Live status'
            : 'Your profile and attendance summary'
          }
        </div>
      </div>

      {/* Summary Bar — managers only */}
      {isManager && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}>
          {[
            { label: "Total Employees", count: employees.length,       color: COLORS.accent     },
            { label: "Active Now",      count: countBy('clocked-in'),  color: COLORS.green      },
            { label: "On Break",        count: countBy('on-break'),    color: COLORS.amber      },
            { label: "Absent Today",    count: countBy('absent'),      color: COLORS.red        },
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

      {/* Employee Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isManager ? "repeat(3, 1fr)" : "1fr",
        gap: 16,
        maxWidth: isManager ? "100%" : 480,
      }}>
        {visibleEmployees.map(emp => {
          const att = getAttendanceForEmployee(emp.id)
          const status = att?.status || 'absent'
          const hoursToday = att?.hours_today || 0
          const overtime = att?.overtime || 0
          const clockIn = att?.clock_in
            ? new Date(att.clock_in).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit'
              })
            : '—'

          const statusColor = {
            'clocked-in':  COLORS.green,
            'on-break':    COLORS.amber,
            'clocked-out': COLORS.textMuted,
            'absent':      COLORS.red,
          }[status] || COLORS.textMuted

          const weeklyHours = hoursToday
          const weeklyProgress = Math.min((weeklyHours / 40) * 100, 100)

          return (
            <div
              key={emp.id}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 24,
                transition: "all 0.2s",
                borderTop: `3px solid ${statusColor}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              {/* Top Row */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar initials={emp.avatar} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                      {emp.role}
                    </div>
                    <div style={{
                      color: COLORS.textDim,
                      fontSize: 11,
                      marginTop: 2,
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {emp.department}
                    </div>
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Shift Time */}
              <div style={{
                background: COLORS.surfaceAlt,
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                fontSize: 12,
              }}>
                <span style={{ color: COLORS.textMuted }}>Shift</span>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  color: COLORS.text,
                  fontWeight: 600,
                }}>
                  {emp.shift_start} – {emp.shift_end}
                </span>
              </div>

              {/* Stats Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 16,
              }}>
                {[
                  { label: "Clock In",    value: clockIn,           color: COLORS.green  },
                  { label: "Today",       value: `${hoursToday}h`,  color: COLORS.accent },
                  { label: "Overtime",    value: overtime > 0 ? `+${overtime}h` : '—', color: overtime > 0 ? COLORS.red : COLORS.textDim },
                  { label: "Role",        value: emp.role_type === 'manager' ? '⭐ Mgr' : 'Staff', color: emp.role_type === 'manager' ? COLORS.amber : COLORS.textMuted },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: COLORS.surfaceAlt,
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}>
                    <div style={{ color: COLORS.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {s.label}
                    </div>
                    <div style={{
                      color: s.color,
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 700,
                      fontSize: 13,
                      marginTop: 2,
                    }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Progress */}
              <div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: COLORS.textMuted,
                  marginBottom: 5,
                }}>
                  <span>Today's Progress</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>
                    {hoursToday}h / 8h
                  </span>
                </div>
                <div style={{
                  background: COLORS.surfaceAlt,
                  borderRadius: 4,
                  height: 6,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${Math.min((hoursToday / 8) * 100, 100)}%`,
                    height: "100%",
                    background: overtime > 0 ? COLORS.red : COLORS.accent,
                    borderRadius: 4,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}