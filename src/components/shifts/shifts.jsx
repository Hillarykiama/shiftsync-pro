import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import StatusBadge from '../layout/StatusBadge'
import Avatar from '../layout/Avatar'
import { SkeletonTable } from '../layout/Skeleton'
import { getShifts, createShiftSwap, updateShiftStatus, getEmployees, getMyNotifications } from '../../lib/db'
import { useAuth, useIsManager } from '../../context/AuthContext'

export default function Shifts({ showNotif }) {
  const { currentEmployee } = useAuth()
  const isManager = useIsManager()
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ swapWithId: '', date: '', shift: '', reason: '' })

  useEffect(() => { load() }, [currentEmployee])

  async function load() {
    setLoading(true)
    const [s, emps] = await Promise.all([getShifts(), getEmployees()])
    setShifts(s)
    setEmployees(emps)
    if (currentEmployee) {
      const notifs = await getMyNotifications(currentEmployee.id)
      setNotifications(notifs.filter(n => n.type === 'shift'))
    }
    setLoading(false)
  }

  const handleApprove = async (id) => {
    await updateShiftStatus(id, 'approved')
    showNotif('Shift swap approved!')
    load()
  }

  const handleReject = async (id) => {
    await updateShiftStatus(id, 'rejected')
    showNotif('Shift swap rejected', COLORS.red)
    load()
  }

  const handleSubmit = async () => {
    if (!form.swapWithId || !form.date || !form.shift) {
      showNotif('Please fill all required fields', COLORS.amber)
      return
    }
    await createShiftSwap({
      employeeId: currentEmployee.id,
      swapWithId: form.swapWithId,
      date: form.date,
      shift: form.shift,
      reason: form.reason || 'No reason provided',
    })
    showNotif('Shift swap requested!')
    setForm({ swapWithId: '', date: '', shift: '', reason: '' })
    load()
  }

  const inp = {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10, padding: "10px 14px",
    color: COLORS.text, fontSize: 14, outline: "none",
    width: "100%", fontFamily: "'Sora', sans-serif",
  }

  const visibleShifts = isManager
    ? shifts
    : shifts.filter(s => s.employee_id === currentEmployee?.id)

  const otherEmployees = employees.filter(e => e.id !== currentEmployee?.id)

  if (loading) return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ height: 28, width: 200, background: COLORS.surfaceAlt, borderRadius: 8, marginBottom: 8, animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 14, width: 280, background: COLORS.surfaceAlt, borderRadius: 6, animation: "shimmer 1.5s infinite" }} />
      </div>
      <SkeletonTable rows={5} />
      <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  )

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Shift Management
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          {isManager ? 'Manage all shift swap requests' : 'Request and track your shift swaps'}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Form */}
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Request Swap</div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ color: COLORS.textMuted, fontSize: 12, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Swap With *
                  </label>
                  <select value={form.swapWithId} onChange={e => setForm({ ...form, swapWithId: e.target.value })} style={inp}>
                    <option value="">Select employee...</option>
                    {otherEmployees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} · {e.department}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: COLORS.textMuted, fontSize: 12, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Date *
                  </label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ color: COLORS.textMuted, fontSize: 12, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Shift *
                  </label>
                  <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} style={inp}>
                    <option value="">Select shift...</option>
                    {["Morning (06:00–14:00)", "Day (09:00–17:00)", "Afternoon (14:00–22:00)", "Night (22:00–06:00)"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: COLORS.textMuted, fontSize: 12, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Reason
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    rows={3}
                    placeholder="Describe your reason..."
                    style={{ ...inp, resize: "none" }}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
                    border: "none", borderRadius: 10, padding: "12px",
                    color: "#0a0e1a", fontWeight: 800, fontSize: 14,
                    cursor: "pointer", fontFamily: "'DM Mono', monospace", width: "100%",
                  }}
                >
                  Submit Swap Request
                </button>
              </div>
            </div>
          </div>

          {/* Notifications — employees only */}
          {!isManager && notifications.length > 0 && (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                🔔 Notifications
                <span style={{
                  background: COLORS.accent, color: "#0a0e1a",
                  borderRadius: 20, padding: "1px 8px",
                  fontSize: 11, fontWeight: 800, fontFamily: "'DM Mono', monospace",
                }}>
                  {notifications.length}
                </span>
              </div>
              {notifications.map((n, i) => (
                <div key={n.id} style={{
                  display: "flex", gap: 10, padding: "10px 0",
                  borderBottom: i < notifications.length - 1 ? `1px solid ${COLORS.border}` : "none",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                    background: n.status === 'approved' ? COLORS.green : COLORS.red,
                  }} />
                  <div>
                    <div style={{ fontSize: 13 }}>{n.message}</div>
                    <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(n.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — requests */}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
            {isManager ? `All Swap Requests (${shifts.length})` : `My Requests (${visibleShifts.length})`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visibleShifts.length === 0 && (
              <div style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: 24,
                color: COLORS.textMuted, textAlign: 'center',
              }}>
                No shift swap requests yet
              </div>
            )}
            {visibleShifts.map(s => (
              <div key={s.id} style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: "16px 20px",
                borderLeft: `3px solid ${s.status === 'approved' ? COLORS.green : s.status === 'rejected' ? COLORS.red : COLORS.amber}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <Avatar initials={s.employee?.avatar || '??'} size={28} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{s.employee?.name}</span>
                      <span style={{ color: COLORS.textMuted, fontSize: 13 }}>→</span>
                      <Avatar initials={s.swap_with?.avatar || '??'} size={28} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.swap_with?.name}</span>
                    </div>
                    <div style={{ color: COLORS.textMuted, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                      {s.shift_date} · {s.shift_time}
                    </div>
                    {s.reason && (
                      <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 6, fontStyle: "italic" }}>
                        "{s.reason}"
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", marginLeft: 12 }}>
                    <StatusBadge status={s.status} />
                    {s.status === 'pending' && isManager && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleApprove(s.id)}
                          style={{
                            background: COLORS.greenDim, border: `1px solid ${COLORS.green}44`,
                            borderRadius: 8, padding: "5px 12px",
                            color: COLORS.green, fontWeight: 700, fontSize: 12, cursor: "pointer",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(s.id)}
                          style={{
                            background: COLORS.redDim, border: `1px solid ${COLORS.red}44`,
                            borderRadius: 8, padding: "5px 12px",
                            color: COLORS.red, fontWeight: 700, fontSize: 12, cursor: "pointer",
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}