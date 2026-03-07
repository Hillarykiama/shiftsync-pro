import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import Avatar from '../layout/Avatar'
import { SkeletonTable } from '../layout/Skeleton'
import { getEmployees, updateEmployee, deactivateEmployee, resetEmployeePassword } from '../../lib/db'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales']
const SHIFTS = [
  { label: 'Morning   06:00 – 14:00', start: '06:00', end: '14:00' },
  { label: 'Day       09:00 – 17:00', start: '09:00', end: '17:00' },
  { label: 'Afternoon 14:00 – 22:00', start: '14:00', end: '22:00' },
  { label: 'Night     22:00 – 06:00', start: '22:00', end: '06:00' },
]

const emptyForm = {
  name: '', email: '', department: 'Engineering',
  role: '', shiftStart: '09:00', shiftEnd: '17:00', roleType: 'employee',
}

export default function AdminPanel({ showNotif }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [tab, setTab] = useState('employees')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const emps = await getEmployees()
    setEmployees(emps)
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.role) {
      showNotif('Please fill name, email and role', COLORS.amber)
      return
    }
    setSubmitting(true)
    try {
      const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession())
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-employee`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name:       form.name,
            email:      form.email,
            department: form.department,
            role:       form.role,
            shiftStart: form.shiftStart,
            shiftEnd:   form.shiftEnd,
            roleType:   form.roleType,
          }),
        }
      )
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      showNotif(`✅ ${form.name} created — invite email sent!`)
      setForm(emptyForm)
      setTab('employees')
      load()
    } catch (err) {
      showNotif(`Error: ${err.message}`, COLORS.red)
    }
    setSubmitting(false)
  }

  const handleUpdate = async (id) => {
    setSubmitting(true)
    try {
      await updateEmployee(id, {
        name:        form.name,
        department:  form.department,
        role:        form.role,
        shift_start: form.shiftStart,
        shift_end:   form.shiftEnd,
        role_type:   form.roleType,
      })
      showNotif('Employee updated!')
      setEditingId(null)
      setForm(emptyForm)
      setTab('employees')
      load()
    } catch (err) {
      showNotif(`Error: ${err.message}`, COLORS.red)
    }
    setSubmitting(false)
  }

  const handleDeactivate = async (emp) => {
    if (!window.confirm(`Deactivate ${emp.name}? They will lose access immediately.`)) return
    try {
      await deactivateEmployee(emp.id)
      showNotif(`${emp.name} deactivated`)
      load()
    } catch (err) {
      showNotif(`Error: ${err.message}`, COLORS.red)
    }
  }

  const handleResetPassword = async (emp) => {
    if (!window.confirm(`Send password reset email to ${emp.email}?`)) return
    try {
      await resetEmployeePassword(emp.email)
      showNotif(`Password reset email sent to ${emp.email}!`)
    } catch (err) {
      showNotif(`Error: ${err.message}`, COLORS.red)
    }
  }

  const startEdit = (emp) => {
    setForm({
      name:       emp.name,
      email:      emp.email || '',
      department: emp.department,
      role:       emp.role,
      shiftStart: emp.shift_start,
      shiftEnd:   emp.shift_end,
      roleType:   emp.role_type,
    })
    setEditingId(emp.id)
    setTab('create')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setTab('employees')
  }

  const inp = {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10, padding: "10px 14px",
    color: COLORS.text, fontSize: 14, outline: "none",
    width: "100%", fontFamily: "'Sora', sans-serif",
    boxSizing: "border-box",
  }

  const lbl = (text) => (
    <label style={{
      color: COLORS.textMuted, fontSize: 12, display: "block",
      marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      {text}
    </label>
  )

  const activeEmployees   = employees.filter(e => e.active !== false)
  const inactiveEmployees = employees.filter(e => e.active === false)

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Admin Panel
          </div>
          <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
            Manage employees · Assign roles · Control access
          </div>
        </div>
        <button
          onClick={() => { if (tab === 'create') { cancelEdit() } else { setTab('create') } }}
          style={{
            background: tab === 'create'
              ? COLORS.surfaceAlt
              : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
            border: tab === 'create' ? `1px solid ${COLORS.border}` : "none",
            borderRadius: 12, padding: "10px 20px",
            color: tab === 'create' ? COLORS.textMuted : "#0a0e1a",
            fontWeight: 800, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {tab === 'create' ? '← BACK' : '+ ADD EMPLOYEE'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total",    value: employees.length,                                         color: COLORS.accent  },
          { label: "Active",   value: activeEmployees.length,                                   color: COLORS.green   },
          { label: "Managers", value: employees.filter(e => e.role_type === 'manager').length,  color: COLORS.purple  },
          { label: "Inactive", value: inactiveEmployees.length,                                 color: COLORS.red     },
        ].map((s, i) => (
          <div key={i} style={{
            background: `${s.color}08`, border: `1px solid ${s.color}33`,
            borderRadius: 16, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>
              {s.value}
            </div>
            <div style={{ color: s.color, fontSize: 13, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT FORM */}
      {tab === 'create' && (
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 16, padding: 28, marginBottom: 24,
          borderTop: `3px solid ${COLORS.accent}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
            {editingId ? '✏️ Edit Employee' : '➕ Create New Employee'}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              {lbl("Full Name *")}
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Smith"
                style={inp}
              />
            </div>

            <div>
              {lbl("Email *")}
              <input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="john@company.com"
                disabled={!!editingId}
                style={{ ...inp, opacity: editingId ? 0.5 : 1 }}
              />
            </div>

            <div>
              {lbl("Job Title *")}
              <input
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Senior Engineer"
                style={inp}
              />
            </div>

            <div>
              {lbl("Department")}
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inp}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              {lbl("Shift")}
              <select
                value={`${form.shiftStart}-${form.shiftEnd}`}
                onChange={e => {
                  const shift = SHIFTS.find(s => `${s.start}-${s.end}` === e.target.value)
                  if (shift) setForm({ ...form, shiftStart: shift.start, shiftEnd: shift.end })
                }}
                style={inp}
              >
                {SHIFTS.map(s => (
                  <option key={s.label} value={`${s.start}-${s.end}`}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              {lbl("Role Type")}
              <select value={form.roleType} onChange={e => setForm({ ...form, roleType: e.target.value })} style={inp}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {!editingId && (
            <div style={{
              background: COLORS.accentGlow, border: `1px solid ${COLORS.accent}22`,
              borderRadius: 10, padding: "10px 14px",
              color: COLORS.textMuted, fontSize: 12, marginTop: 16,
            }}>
              📧 An invite email will be sent so the employee can set their own password.
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
              disabled={submitting}
              style={{
                flex: 1,
                background: submitting
                  ? COLORS.surfaceAlt
                  : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
                border: "none", borderRadius: 10, padding: "12px",
                color: submitting ? COLORS.textMuted : "#0a0e1a",
                fontWeight: 800, fontSize: 14,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {submitting
                ? (editingId ? 'SAVING...' : 'CREATING...')
                : (editingId ? 'SAVE CHANGES' : 'CREATE EMPLOYEE')}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                style={{
                  background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "12px 20px",
                  color: COLORS.textMuted, fontWeight: 700, fontSize: 14,
                  cursor: "pointer", fontFamily: "'DM Mono', monospace",
                }}
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      )}

      {/* EMPLOYEE LIST */}
      {tab === 'employees' && (
        <>
          {loading ? <SkeletonTable rows={5} /> : (
            <div style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
                Active Employees ({activeEmployees.length})
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeEmployees.map(emp => (
                  <div key={emp.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: COLORS.surfaceAlt,
                    borderRadius: 12,
                    border: `1px solid ${COLORS.border}`,
                  }}>
                    <Avatar initials={emp.avatar} size={40} />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</span>
                        <span style={{
                          background: emp.role_type === 'admin'   ? `${COLORS.red}22`    :
                                      emp.role_type === 'manager' ? `${COLORS.purple}22` : `${COLORS.accent}11`,
                          color:      emp.role_type === 'admin'   ? COLORS.red    :
                                      emp.role_type === 'manager' ? COLORS.purple : COLORS.accent,
                          border: `1px solid ${
                                      emp.role_type === 'admin'   ? `${COLORS.red}33`    :
                                      emp.role_type === 'manager' ? `${COLORS.purple}33` : `${COLORS.accent}22`}`,
                          borderRadius: 20, padding: "1px 8px",
                          fontSize: 10, fontWeight: 800,
                          fontFamily: "'DM Mono', monospace",
                          textTransform: "uppercase",
                        }}>
                          {emp.role_type}
                        </span>
                        {emp.face_registered && (
                          <span style={{ color: COLORS.green, fontSize: 11 }}>✓ Face</span>
                        )}
                      </div>
                      <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                        {emp.role} · {emp.department} · {emp.shift_start}–{emp.shift_end}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(emp)}
                        style={{
                          background: COLORS.accentGlow, border: `1px solid ${COLORS.accent}33`,
                          borderRadius: 8, padding: "6px 12px",
                          color: COLORS.accent, fontWeight: 700, fontSize: 12, cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(emp)}
                        style={{
                          background: COLORS.purpleDim, border: `1px solid ${COLORS.purple}33`,
                          borderRadius: 8, padding: "6px 12px",
                          color: COLORS.purple, fontWeight: 700, fontSize: 12, cursor: "pointer",
                        }}
                      >
                        🔑 Reset
                      </button>
                      <button
                        onClick={() => handleDeactivate(emp)}
                        style={{
                          background: COLORS.redDim, border: `1px solid ${COLORS.red}33`,
                          borderRadius: 8, padding: "6px 12px",
                          color: COLORS.red, fontWeight: 700, fontSize: 12, cursor: "pointer",
                        }}
                      >
                        🚫 Deactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inactive */}
              {inactiveEmployees.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15, color: COLORS.textMuted }}>
                    Inactive Employees ({inactiveEmployees.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {inactiveEmployees.map(emp => (
                      <div key={emp.id} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 16px", background: COLORS.surfaceAlt,
                        borderRadius: 12, border: `1px solid ${COLORS.border}`, opacity: 0.5,
                      }}>
                        <Avatar initials={emp.avatar} size={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                          <div style={{ color: COLORS.textMuted, fontSize: 11 }}>
                            {emp.role} · {emp.department}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            await updateEmployee(emp.id, { active: true })
                            showNotif(`${emp.name} reactivated!`)
                            load()
                          }}
                          style={{
                            background: COLORS.greenDim, border: `1px solid ${COLORS.green}33`,
                            borderRadius: 8, padding: "6px 12px",
                            color: COLORS.green, fontWeight: 700, fontSize: 12, cursor: "pointer",
                          }}
                        >
                          ✓ Reactivate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}