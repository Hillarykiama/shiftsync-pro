import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import MetricCard from '../layout/MetricCard'
import Avatar from '../layout/Avatar'
import { getEmployees, getTodayAttendance } from '../../lib/db'
import { useAuth, useIsManager } from '../../context/AuthContext'

export default function Dashboard({ onClockIn }) {
  const { currentEmployee } = useAuth()
  const isManager = useIsManager()

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

  // ── Metrics ───────────────────────────────────────────────
  const countBy = status => attendance.filter(a => a.status === status).length
  const presentToday = attendance.filter(a => a.status !== 'absent').length
  const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0)

  // ── My own attendance record ──────────────────────────────
  const myRecord = attendance.find(a => a.employee_id === currentEmployee?.id)
  const myHours = myRecord?.hours_today || 0
  const myOvertime = myRecord?.overtime || 0
  const myStatus = myRecord?.status || 'absent'

  // ── Greeting ──────────────────────────────────────────────
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

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
            {greeting}, {currentEmployee?.name?.split(' ')[0] || 'there'} 👋
          </div>
          <div style={{ color: COLORS.textMuted, marginTop: 4, fontSize: 14 }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {isManager && (
              <span style={{
                marginLeft: 12,
                background: COLORS.accentGlow,
                border: `1px solid ${COLORS.accent}33`,
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 11,
                color: COLORS.accent,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
              }}>
                ⭐ MANAGER
              </span>
            )}
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

      {/* ── MANAGER METRICS ── */}
      {isManager && (
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
            sub="across team today"
            color={COLORS.red}
            icon="⚡"
          />
        </div>
      )}

      {/* ── EMPLOYEE METRICS ── */}
      {!isManager && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}>
          <MetricCard
            label="My Status"
            value={myStatus.replace('-', ' ')}
            sub="current status"
            color={
              myStatus === 'clocked-in'  ? COLORS.green  :
              myStatus === 'on-break'    ? COLORS.amber  :
              myStatus === 'clocked-out' ? COLORS.purple :
              COLORS.red
            }
            icon="◉"
          />
          <MetricCard
            label="Hours Today"
            value={`${myHours}h`}
            sub="clocked today"
            color={COLORS.accent}
            icon="⏱"
          />
          <MetricCard
            label="Overtime"
            value={`${myOvertime}h`}
            sub="today"
            color={myOvertime > 0 ? COLORS.red : COLORS.textMuted}
            icon="⚡"
          />
          <MetricCard
            label="My Shift"
            value={`${currentEmployee?.shift_start || '09:00'}`}
            sub={`ends ${currentEmployee?.shift_end || '17:00'}`}
            color={COLORS.purple}
            icon="📅"
          />
        </div>
      )}

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
            <span style={{ color: COLORS.accent }}>◈</span>
            {isManager ? 'Recent Activity' : 'My Activity Today'}
          </div>

          {(isManager
            ? attendance
            : attendance.filter(a => a.employee_id === currentEmployee?.id)
          ).slice(0, isManager ? 4 : 1).map((a, i) => {
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
                borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none",
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
            {
              label: "Hours Worked",
              value: `${myHours}h`,
              progress: myHours / 8,
              color: COLORS.accent,
            },
            {
              label: "Overtime",
              value: `${myOvertime}h`,
              progress: myOvertime / 10,
              color: COLORS.red,
            },
            {
              label: "Punctuality",
              value: myStatus !== 'absent' ? "On time ✓" : "Absent",
              progress: myStatus !== 'absent' ? 1 : 0,
              color: myStatus !== 'absent' ? COLORS.green : COLORS.red,
            },
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
                  width: `${Math.min(m.progress * 100, 100)}%`,
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
            <span style={{ color: COLORS.accent }}>📅</span> Shift:{" "}
            <strong>
              {currentEmployee?.shift_start || '09:00'} – {currentEmployee?.shift_end || '17:00'}
            </strong>
          </div>
        </div>

      </div>
    </div>
  )
}