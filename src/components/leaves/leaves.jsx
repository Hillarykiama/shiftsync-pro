import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import StatusBadge from '../layout/StatusBadge'
import { getLeaves, createLeave, updateLeaveStatus } from '../../lib/db'
import { useAuth, useIsManager } from '../../context/AuthContext'

export default function Leaves({ showNotif }) {
  const { currentEmployee } = useAuth()
  const isManager = useIsManager()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    type: 'Annual Leave',
    from: '',
    to: '',
    reason: '',
  })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const lvs = await getLeaves()
    setLeaves(lvs)
    setLoading(false)
  }

  const handleApprove = async (id) => {
    await updateLeaveStatus(id, 'approved')
    showNotif('Leave request approved!')
    load()
  }

  const handleReject = async (id) => {
    await updateLeaveStatus(id, 'rejected')
    showNotif('Leave request rejected', COLORS.red)
    load()
  }

  const handleSubmit = async () => {
    if (!form.from || !form.to) {
      showNotif('Please fill all required fields', COLORS.amber)
      return
    }
    const me = currentEmployee
    if (!me) return

    const fromDate = new Date(form.from)
    const toDate = new Date(form.to)
    const days = Math.max(1, Math.round(
      (toDate - fromDate) / (1000 * 60 * 60 * 24)
    ) + 1)

    await createLeave({
      employeeId: me.id,
      type: form.type,
      fromDate: form.from,
      toDate: form.to,
      days,
      reason: form.reason || 'No reason provided',
    })
    showNotif('Leave request submitted!')
    setForm({ type: 'Annual Leave', from: '', to: '', reason: '' })
    load()
  }

  const inp = {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: "10px 14px",
    color: COLORS.text,
    fontSize: 14,
    outline: "none",
    width: "100%",
    fontFamily: "'Sora', sans-serif",
  }

  const leaveBalance = [
    { type: "Annual",   used: 7,  total: 25 },
    { type: "Sick",     used: 3,  total: 10 },
    { type: "Parental", used: 0,  total: 90 },
  ]

  const visibleLeaves = isManager
    ? leaves
    : leaves.filter(l => l.employee_id === currentEmployee?.id)

  if (loading) return (
    <div style={{ color: COLORS.accent, fontSize: 16, padding: 40, textAlign: 'center' }}>
      Loading leaves...
    </div>
  )

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Leave Management
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          {isManager
            ? 'Manage all employee leave requests'
            : 'Submit and track your leave requests'
          }
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
              New Request
            </div>
            <div style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{
                    color: COLORS.textMuted, fontSize: 12,
                    display: "block", marginBottom: 6,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    Leave Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ ...inp }}
                  >
                    {["Annual Leave", "Sick Leave", "Emergency Leave",
                      "Unpaid Leave", "Parental Leave"].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{
                      color: COLORS.textMuted, fontSize: 12,
                      display: "block", marginBottom: 6,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      From *
                    </label>
                    <input
                      type="date"
                      value={form.from}
                      onChange={e => setForm({ ...form, from: e.target.value })}
                      style={{ ...inp }}
                    />
                  </div>
                  <div>
                    <label style={{
                      color: COLORS.textMuted, fontSize: 12,
                      display: "block", marginBottom: 6,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      To *
                    </label>
                    <input
                      type="date"
                      value={form.to}
                      onChange={e => setForm({ ...form, to: e.target.value })}
                      style={{ ...inp }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    color: COLORS.textMuted, fontSize: 12,
                    display: "block", marginBottom: 6,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
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
                    border: "none",
                    borderRadius: 10,
                    padding: "12px",
                    color: "#0a0e1a",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    width: "100%",
                  }}
                >
                  Submit Leave Request
                </button>
              </div>
            </div>
          </div>

          {/* Leave Balance */}
          <div style={{
            background: COLORS.purpleDim,
            border: `1px solid ${COLORS.purple}33`,
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 16, color: COLORS.purple, fontSize: 15 }}>
              Leave Balance
            </div>
            {leaveBalance.map(b => (
              <div key={b.type} style={{ marginBottom: 14 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 13, marginBottom: 6,
                }}>
                  <span style={{ color: COLORS.textMuted }}>{b.type}</span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    color: COLORS.purple, fontWeight: 700,
                  }}>
                    {b.total - b.used} days left
                  </span>
                </div>
                <div style={{
                  background: `${COLORS.purple}22`,
                  borderRadius: 4, height: 6, overflow: "hidden",
                }}>
                  <div style={{
                    width: `${(b.used / b.total) * 100}%`,
                    background: COLORS.purple,
                    height: "100%", borderRadius: 4,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
            {isManager
              ? `All Requests (${leaves.length})`
              : `My Requests (${visibleLeaves.length})`
            }
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visibleLeaves.length === 0 && (
              <div style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: 24,
                color: COLORS.textMuted, textAlign: 'center',
              }}>
                No leave requests yet
              </div>
            )}
            {visibleLeaves.map(r => (
              <div key={r.id} style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16, padding: "16px 20px",
                borderLeft: `3px solid ${
                  r.status === 'approved' ? COLORS.green :
                  r.status === 'rejected' ? COLORS.red :
                  COLORS.amber
                }`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {r.employees?.name || 'Unknown'}
                      </span>
                      <span style={{
                        background: COLORS.purpleDim, color: COLORS.purple,
                        border: `1px solid ${COLORS.purple}33`,
                        borderRadius: 20, padding: "2px 8px",
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {r.type}
                      </span>
                    </div>
                    <div style={{
                      color: COLORS.textMuted, fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {r.from_date} → {r.to_date} · {r.days} day{r.days > 1 ? 's' : ''}
                    </div>
                    <div style={{
                      color: COLORS.textDim, fontSize: 12,
                      marginTop: 6, fontStyle: "italic",
                    }}>
                      "{r.reason}"
                    </div>
                  </div>

                  <div style={{
                    display: "flex", flexDirection: "column",
                    gap: 8, alignItems: "flex-end", marginLeft: 12,
                  }}>
                    <StatusBadge status={r.status} />
                    {r.status === 'pending' && isManager && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleApprove(r.id)}
                          style={{
                            background: COLORS.greenDim,
                            border: `1px solid ${COLORS.green}44`,
                            borderRadius: 8, padding: "5px 12px",
                            color: COLORS.green, fontWeight: 700,
                            fontSize: 12, cursor: "pointer",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          style={{
                            background: COLORS.redDim,
                            border: `1px solid ${COLORS.red}44`,
                            borderRadius: 8, padding: "5px 12px",
                            color: COLORS.red, fontWeight: 700,
                            fontSize: 12, cursor: "pointer",
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
    </div>
  )
}