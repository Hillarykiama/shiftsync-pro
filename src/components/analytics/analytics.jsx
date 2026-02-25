import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import { getEmployees, getAttendanceAnalytics, getWeeklyAttendance } from '../../lib/db'
import { useAuth, useIsManager } from '../../context/AuthContext'

export default function Analytics() {
  const { currentEmployee } = useAuth()
  const isManager = useIsManager()
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [emps, att, wkly] = await Promise.all([
        getEmployees(),
        getAttendanceAnalytics(),
        getWeeklyAttendance(),
      ])
      setEmployees(emps)
      setAttendance(att)
      setWeekly(wkly)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ color: COLORS.accent, fontSize: 16, padding: 40, textAlign: 'center' }}>
      Loading analytics...
    </div>
  )

  // ── Filter by role ────────────────────────────────────────
  const myAttendance = attendance.filter(a => a.employee_id === currentEmployee?.id)
  const relevantAttendance = isManager ? attendance : myAttendance
  const relevantWeekly = isManager
    ? weekly
    : weekly.filter(w => w.employee_id === currentEmployee?.id)

  // ── Key Metrics ───────────────────────────────────────────
  const totalRecords = relevantAttendance.length
  const presentRecords = relevantAttendance.filter(a =>
    ['clocked-in', 'clocked-out', 'on-break'].includes(a.status)
  ).length
  const attendanceRate = totalRecords > 0
    ? ((presentRecords / totalRecords) * 100).toFixed(1)
    : 0

  const absentRecords = relevantAttendance.filter(a => a.status === 'absent').length
  const absenteeismRate = totalRecords > 0
    ? ((absentRecords / totalRecords) * 100).toFixed(1)
    : 0

  const totalOvertime = relevantAttendance.reduce((sum, a) => sum + (a.overtime || 0), 0)
  const totalHours = relevantAttendance.reduce((sum, a) => sum + (a.hours_today || 0), 0)

  // ── Weekly Chart ──────────────────────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const chartData = last7Days.map(date => {
    const dayRecords = relevantWeekly.filter(w => w.date === date)
    const present = dayRecords.filter(w =>
      ['clocked-in', 'clocked-out', 'on-break'].includes(w.status)
    ).length
    const absent = dayRecords.filter(w => w.status === 'absent').length
    const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
    return { date, label, present, absent }
  })

  const maxBarValue = Math.max(...chartData.map(d => d.present + d.absent), 1)

  // ── Department Breakdown (manager only) ───────────────────
  const departments = [...new Set(employees.map(e => e.department))]
  const deptData = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept)
    const deptIds = deptEmployees.map(e => e.id)
    const deptRecords = attendance.filter(a => deptIds.includes(a.employee_id))
    const present = deptRecords.filter(a =>
      ['clocked-in', 'clocked-out', 'on-break'].includes(a.status)
    ).length
    const rate = deptRecords.length > 0
      ? Math.round((present / deptRecords.length) * 100)
      : 0
    return { dept, rate, count: deptEmployees.length }
  })

  // ── Overtime Leaderboard (manager only) ───────────────────
  const overtimeByEmployee = employees.map(emp => {
    const empRecords = attendance.filter(a => a.employee_id === emp.id)
    const totalOT = empRecords.reduce((sum, a) => sum + (a.overtime || 0), 0)
    return { name: emp.name, avatar: emp.avatar, overtime: totalOT, department: emp.department }
  }).sort((a, b) => b.overtime - a.overtime).slice(0, 4)

  // ── My Weekly Summary (employee only) ─────────────────────
  const myWeekRecords = last7Days.map(date => {
    const rec = myAttendance.find(a => a.date === date)
    return {
      date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      status: rec?.status || 'absent',
      hours: rec?.hours_today || 0,
      overtime: rec?.overtime || 0,
      clockIn: rec?.clock_in
        ? new Date(rec.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—',
      clockOut: rec?.clock_out
        ? new Date(rec.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—',
    }
  })

  const deptColors = [COLORS.accent, COLORS.purple, COLORS.green, COLORS.amber]

  const statusColor = {
    'clocked-in':  COLORS.green,
    'on-break':    COLORS.amber,
    'clocked-out': COLORS.textMuted,
    'absent':      COLORS.red,
  }

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Analytics
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          {isManager ? 'Real-time workforce insights' : 'Your personal attendance insights'}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        {[
          {
            label: isManager ? "Attendance Rate"  : "My Attendance Rate",
            value: `${attendanceRate}%`,
            sub: `${presentRecords} of ${totalRecords} records`,
            color: COLORS.green,
            icon: "✓",
          },
          {
            label: isManager ? "Absenteeism Rate" : "My Absenteeism",
            value: `${absenteeismRate}%`,
            sub: `${absentRecords} absent records`,
            color: COLORS.red,
            icon: "✗",
          },
          {
            label: isManager ? "Total Hours"      : "My Total Hours",
            value: `${totalHours.toFixed(0)}h`,
            sub: isManager ? "across all employees" : "this period",
            color: COLORS.accent,
            icon: "⏱",
          },
          {
            label: isManager ? "Total Overtime"   : "My Overtime",
            value: `${totalOvertime.toFixed(1)}h`,
            sub: isManager ? "across all employees" : "this period",
            color: COLORS.amber,
            icon: "⚡",
          },
        ].map((m, i) => (
          <div key={i} style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: "20px 24px",
            borderTop: `3px solid ${m.color}`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: m.color,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "-0.02em",
            }}>
              {m.value}
            </div>
            <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, marginTop: 4 }}>
              {m.label}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── MANAGER VIEW ── */}
      {isManager && (
        <>
          {/* Weekly Chart + Department */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* Weekly Bar Chart */}
            <div style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: COLORS.accent }}>▣</span> Weekly Attendance
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                {[
                  { label: "Present", color: COLORS.accent },
                  { label: "Absent",  color: COLORS.red    },
                ].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                    <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
                {chartData.map((d, i) => (
                  <div key={i} style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    height: "100%",
                    justifyContent: "flex-end",
                  }}>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, justifyContent: "flex-end" }}>
                      {d.absent > 0 && (
                        <div style={{
                          width: "100%",
                          height: `${(d.absent / maxBarValue) * 120}px`,
                          background: COLORS.red,
                          borderRadius: "4px 4px 0 0",
                          opacity: 0.7,
                          minHeight: 4,
                        }} />
                      )}
                      {d.present > 0 && (
                        <div style={{
                          width: "100%",
                          height: `${(d.present / maxBarValue) * 120}px`,
                          background: COLORS.accent,
                          borderRadius: d.absent > 0 ? 0 : "4px 4px 0 0",
                          minHeight: 4,
                        }} />
                      )}
                      {d.present === 0 && d.absent === 0 && (
                        <div style={{ width: "100%", height: 4, background: COLORS.border, borderRadius: 4 }} />
                      )}
                    </div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                      {d.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Breakdown */}
            <div style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: COLORS.accent }}>◎</span> By Department
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {deptData.map((d, i) => (
                  <div key={d.dept}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: COLORS.text, fontWeight: 600 }}>{d.dept}</span>
                      <span style={{
                        color: deptColors[i % deptColors.length],
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 700,
                      }}>
                        {d.rate}%
                      </span>
                    </div>
                    <div style={{ background: COLORS.surfaceAlt, borderRadius: 4, height: 8, overflow: "hidden" }}>
                      <div style={{
                        width: `${d.rate}%`,
                        height: "100%",
                        background: deptColors[i % deptColors.length],
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 3 }}>
                      {d.count} employee{d.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overtime Leaderboard */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: COLORS.accent }}>⚡</span> Top Overtime Contributors
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {overtimeByEmployee.map((emp, i) => (
                <div key={emp.name} style={{
                  background: COLORS.surfaceAlt,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "center",
                  borderTop: `2px solid ${i === 0 ? COLORS.amber : COLORS.border}`,
                }}>
                  <div style={{
                    fontSize: 11,
                    color: i === 0 ? COLORS.amber : COLORS.textMuted,
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}>
                    #{i + 1}
                  </div>
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${COLORS.accent}33, ${COLORS.purple}33)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                    color: COLORS.accent,
                    margin: "0 auto 10px",
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {emp.avatar}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                    {emp.name.split(' ')[0]}
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 8 }}>
                    {emp.department}
                  </div>
                  <div style={{
                    color: COLORS.red,
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 800,
                    fontSize: 16,
                  }}>
                    +{emp.overtime.toFixed(1)}h
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── EMPLOYEE VIEW ── */}
      {!isManager && (
        <>
          {/* My Weekly Chart */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: COLORS.accent }}>▣</span> My Last 7 Days
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myWeekRecords.map((d, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: COLORS.surfaceAlt,
                  borderRadius: 10,
                  borderLeft: `3px solid ${statusColor[d.status] || COLORS.border}`,
                }}>
                  <div style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    fontFamily: "'DM Mono', monospace",
                    width: 32,
                    fontWeight: 700,
                  }}>
                    {d.label}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: statusColor[d.status] || COLORS.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    width: 90,
                  }}>
                    {d.status.replace('-', ' ')}
                  </div>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    color: COLORS.textMuted,
                    flex: 1,
                  }}>
                    {d.clockIn !== '—' ? `${d.clockIn} → ${d.clockOut}` : '—'}
                  </div>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.accent,
                    width: 40,
                    textAlign: "right",
                  }}>
                    {d.hours > 0 ? `${d.hours}h` : '—'}
                  </div>
                  {d.overtime > 0 && (
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: COLORS.red,
                      fontWeight: 700,
                    }}>
                      +{d.overtime}h OT
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* My Summary Card */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: COLORS.accent }}>◉</span> My Summary
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                {
                  label: "Days Present",
                  value: presentRecords,
                  total: totalRecords,
                  color: COLORS.green,
                },
                {
                  label: "Hours Worked",
                  value: `${totalHours.toFixed(1)}h`,
                  total: null,
                  color: COLORS.accent,
                },
                {
                  label: "Overtime",
                  value: `${totalOvertime.toFixed(1)}h`,
                  total: null,
                  color: COLORS.red,
                },
              ].map((s, i) => (
                <div key={i} style={{
                  background: COLORS.surfaceAlt,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 20,
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: s.color,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {s.value}
                  </div>
                  {s.total !== null && (
                    <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>
                      of {s.total} days
                    </div>
                  )}
                  <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}