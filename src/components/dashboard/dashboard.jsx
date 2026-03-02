import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import MetricCard from '../layout/MetricCard'
import Avatar from '../layout/Avatar'
import { SkeletonBlock, SkeletonCards } from '../layout/Skeleton'
import { getEmployees, getTodayAttendance, getMyWeeklyData, getMyNotifications } from '../../lib/db'
import { useAuth, useIsManager } from '../../context/AuthContext'

export default function Dashboard({ onClockIn }) {
  const { currentEmployee } = useAuth()
  const isManager = useIsManager()

  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [notifications, setNotifications] = useState([])
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

      if (currentEmployee) {
        const [weekly, notifs] = await Promise.all([
          getMyWeeklyData(currentEmployee.id),
          getMyNotifications(currentEmployee.id),
        ])
        setWeeklyData(weekly)
        setNotifications(notifs)
      }
      setLoading(false)
    }
    load()
  }, [currentEmployee])

  // ── Team metrics ──────────────────────────────────────────
  const countBy = status => attendance.filter(a => a.status === status).length
  const presentToday = attendance.filter(a => a.status !== 'absent').length
  const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0)

  // ── My record ─────────────────────────────────────────────
  const myRecord = attendance.find(a => a.employee_id === currentEmployee?.id)
  const myHours    = myRecord?.hours_today || 0
  const myOvertime = myRecord?.overtime || 0
  const myStatus   = myRecord?.status || 'absent'

  // ── Real weekly stats ─────────────────────────────────────
  const weeklyHours   = weeklyData.reduce((sum, r) => sum + (r.hours_today || 0), 0)
  const weeklyOvertime = weeklyData.reduce((sum, r) => sum + (r.overtime || 0), 0)
  const daysPresent   = weeklyData.filter(r =>
    ['clocked-in', 'clocked-out', 'on-break'].includes(r.status)
  ).length
  const workdaysThisWeek = (() => {
    const day = new Date().getDay()
    return day === 0 ? 5 : day === 6 ? 5 : day
  })()
  const punctualityRate = workdaysThisWeek > 0
    ? Math.round((daysPresent / workdaysThisWeek) * 100)
    : 0

  // ── Greeting ──────────────────────────────────────────────
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <SkeletonBlock height={32} width={280} radius={8} />
          <div style={{ marginTop: 8 }}>
            <SkeletonBlock height={16} width={200} radius={6} />
          </div>
        </div>
        <SkeletonBlock height={48} width={160} radius={14} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <SkeletonCards count={4} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <SkeletonBlock height={280} />
        <SkeletonBlock height={280} />
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )

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
          <div style={{ color: COLORS.textMuted, marginTop: 4, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
            {isManager && (
              <span style={{
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <MetricCard label="Present Today"  value={presentToday}             sub={`of ${employees.length} employees`} color={COLORS.green}  icon="✓"  />
          <MetricCard label="On Leave"        value={countBy('clocked-out')}   sub="clocked out today"                  color={COLORS.purple} icon="🌙" />
          <MetricCard label="Absent Today"    value={countBy('absent')}        sub="not clocked in"                     color={COLORS.amber}  icon="⏳" />
          <MetricCard label="Overtime Hours"  value={totalOvertime.toFixed(1)} sub="across team today"                  color={COLORS.red}    icon="⚡" />
        </div>
      )}

      {/* ── EMPLOYEE METRICS ── */}
      {!isManager && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
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
          <MetricCard label="Hours Today"  value={`${myHours}h`}                  sub="clocked today"         color={COLORS.accent}                                    icon="⏱" />
          <MetricCard label="This Week"    value={`${weeklyHours.toFixed(1)}h`}    sub={`${daysPresent} days present`} color={COLORS.purple}                           icon="📅" />
          <MetricCard label="Punctuality"  value={`${punctualityRate}%`}           sub="this week"             color={punctualityRate >= 80 ? COLORS.green : COLORS.amber} icon="⭐" />
        </div>
      )}

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* Activity / Notifications */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.accent }}>◈</span>
            {isManager ? 'Recent Activity' : 'My Notifications'}
            {!isManager && notifications.length > 0 && (
              <span style={{
                background: COLORS.accent,
                color: "#0a0e1a",
                borderRadius: 20,
                padding: "1px 8px",
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'DM Mono', monospace",
              }}>
                {notifications.length}
              </span>
            )}
          </div>

          {/* Manager: activity feed */}
          {isManager && attendance.slice(0, 4).map((a, i) => {
            const emp = a.employees
            const statusColor = {
              'clocked-in':  COLORS.green,
              'on-break':    COLORS.amber,
              'clocked-out': COLORS.textMuted,
              'absent':      COLORS.red,
            }[a.status] || COLORS.textMuted
            const statusLabel = {
              'clocked-in': 'Clocked in', 'on-break': 'On break',
              'clocked-out': 'Clocked out', 'absent': 'Absent',
            }[a.status] || a.status

            return (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0",
                borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none",
              }}>
                <Avatar initials={emp?.avatar || '??'} size={34} color={statusColor} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{emp?.name || 'Unknown'}</span>
                  <span style={{ color: COLORS.textMuted, fontSize: 13 }}>{' '}· {statusLabel}</span>
                </div>
                <span style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                  {a.clock_in ? new Date(a.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            )
          })}

          {isManager && attendance.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              No attendance records for today
            </div>
          )}

          {/* Employee: notifications */}
          {!isManager && notifications.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              No notifications yet — submit a leave or shift swap to get started
            </div>
          )}

          {!isManager && notifications.map((n, i) => (
            <div key={n.id} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "12px 0",
              borderBottom: i < notifications.length - 1 ? `1px solid ${COLORS.border}` : "none",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: n.status === 'approved' ? COLORS.green : COLORS.red,
                marginTop: 5, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{n.message}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                  {new Date(n.time).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
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
            {
              label: "Hours Worked",
              value: `${weeklyHours.toFixed(1)}h`,
              progress: weeklyHours / 40,
              sub: "of 40h",
              color: COLORS.accent,
            },
            {
              label: "Overtime",
              value: `${weeklyOvertime.toFixed(1)}h`,
              progress: weeklyOvertime / 10,
              sub: "this week",
              color: COLORS.red,
            },
            {
              label: "Punctuality",
              value: `${punctualityRate}%`,
              progress: punctualityRate / 100,
              sub: `${daysPresent} of ${workdaysThisWeek} days`,
              color: punctualityRate >= 80 ? COLORS.green : COLORS.amber,
            },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: COLORS.textMuted }}>{m.label}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: m.color, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{m.value}</span>
                  <span style={{ color: COLORS.textDim, fontSize: 11, marginLeft: 4 }}>{m.sub}</span>
                </div>
              </div>
              <div style={{ background: COLORS.surfaceAlt, borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(m.progress * 100, 100)}%`,
                  background: m.color,
                  borderRadius: 4,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          ))}

          {/* Day Pills */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              color: COLORS.textMuted, fontSize: 11,
              marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              This Week
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {['M', 'T', 'W', 'T', 'F'].map((day, i) => {
                const record    = weeklyData[i]
                const isPresent = record && ['clocked-in', 'clocked-out', 'on-break'].includes(record.status)
                const isAbsent  = record && record.status === 'absent'

                return (
                  <div key={i} style={{
                    flex: 1, height: 32,
                    borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    background: isPresent ? COLORS.greenDim : isAbsent ? COLORS.redDim : COLORS.surfaceAlt,
                    color: isPresent ? COLORS.green : isAbsent ? COLORS.red : COLORS.textDim,
                    border: `1px solid ${isPresent ? `${COLORS.green}44` : isAbsent ? `${COLORS.red}44` : COLORS.border}`,
                  }}>
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{
            background: COLORS.accentGlow,
            border: `1px solid ${COLORS.accent}22`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            marginTop: 16,
          }}>
            <span style={{ color: COLORS.accent }}>📅</span> Shift:{" "}
            <strong>{currentEmployee?.shift_start || '09:00'} – {currentEmployee?.shift_end || '17:00'}</strong>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  )
}