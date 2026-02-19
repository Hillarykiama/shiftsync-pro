import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import StatusBadge from '../layout/StatusBadge'
import { getEmployees, getShifts, createShiftSwap, updateShiftStatus } from '../../lib/db'

export default function Shifts({ showNotif }) {
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ swapWith: '', date: '', reason: '' })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [emps, shfts] = await Promise.all([
      getEmployees(),
      getShifts(),
    ])
    setEmployees(emps)
    setShifts(shfts)
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
    if (!form.swapWith || !form.date) {
      showNotif('Please fill all required fields', COLORS.amber)
      return
    }
    const me = employees.find(e => e.name === 'Sarah Chen')
    const swapWith = employees.find(e => e.id === form.swapWith)
    if (!me || !swapWith) return

    await createShiftSwap({
      employeeId: me.id,
      swapWithId: swapWith.id,
      date: form.date,
      shift: `${me.shift_start}–${me.shift_end}`,
      reason: form.reason || 'No reason provided',
    })
    showNotif('Shift swap request submitted!')
    setForm({ swapWith: '', date: '', reason: '' })
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

  if (loading) return (
    <div style={{ color: COLORS.accent, fontSize: 16, padding: 40, textAlign: 'center' }}>
      Loading shifts...
    </div>
  )

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Shift Management
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          Request swaps · Manager approval workflow
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>

        {/* Request Form */}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
            Request Shift Swap
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
                  Swap With *
                </label>
                <select
                  value={form.swapWith}
                  onChange={e => setForm({ ...form, swapWith: e.target.value })}
                  style={{ ...inp }}
                >
                  <option value="">Select employee...</option>
                  {employees
                    .filter(e => e.name !== 'Sarah Chen')
                    .map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} · {e.shift_start}–{e.shift_end}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label style={{
                  color: COLORS.textMuted, fontSize: 12,
                  display: "block", marginBottom: 6,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  style={{ ...inp }}
                />
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
                  placeholder="Brief reason for swap..."
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
                  letterSpacing: "0.04em",
                  width: "100%",
                }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
            Swap Requests ({shifts.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shifts.length === 0 && (
              <div style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 24,
                color: COLORS.textMuted,
                textAlign: 'center',
              }}>
                No shift swap requests yet
              </div>
            )}
            {shifts.map(s => (
              <div key={s.id} style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "16px 20px",
                borderLeft: `3px solid ${
                  s.status === 'approved' ? COLORS.green :
                  s.status === 'rejected' ? COLORS.red :
                  COLORS.amber
                }`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {s.employee?.name || 'Unknown'}
                    </div>
                    <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 3 }}>
                      ↔ {s.swap_with?.name || 'Unknown'} · {s.shift_date}
                    </div>
                    <div style={{
                      color: COLORS.textDim,
                      fontSize: 12,
                      marginTop: 2,
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {s.shift_time}
                    </div>
                    <div style={{
                      color: COLORS.textMuted,
                      fontSize: 12,
                      marginTop: 8,
                      fontStyle: "italic",
                    }}>
                      "{s.reason}"
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    <StatusBadge status={s.status} />
                    {s.status === 'pending' && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleApprove(s.id)}
                          style={{
                            background: COLORS.greenDim,
                            border: `1px solid ${COLORS.green}44`,
                            borderRadius: 8,
                            padding: "5px 12px",
                            color: COLORS.green,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(s.id)}
                          style={{
                            background: COLORS.redDim,
                            border: `1px solid ${COLORS.red}44`,
                            borderRadius: 8,
                            padding: "5px 12px",
                            color: COLORS.red,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer",
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