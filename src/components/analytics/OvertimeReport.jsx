import { useState, useEffect } from 'react'
import { COLORS } from '../../styles/theme'
import Avatar from '../layout/Avatar'
import { getOvertimeReport, getOvertimeRules } from '../../lib/db'

export default function OvertimeReport() {
  const [report, setReport] = useState([])
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [rep, rls] = await Promise.all([
        getOvertimeReport(),
        getOvertimeRules(),
      ])
      setReport(rep)
      setRules(rls)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ color: COLORS.accent, fontSize: 16, padding: 40, textAlign: 'center' }}>
      Loading overtime report...
    </div>
  )

  const totalOT  = report.reduce((sum, r) => sum + (r.overtime_hours || 0), 0)
  const totalDT  = report.reduce((sum, r) => sum + (r.double_time_hours || 0), 0)
  const totalPay = report.reduce((sum, r) => sum + (r.overtime_amount || 0), 0)

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Overtime Report
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
          Detailed overtime breakdown · Auto calculated on clock out
        </div>
      </div>

      {/* Rules Card */}
      {rules && (
        <div style={{
          background: COLORS.accentGlow,
          border: `1px solid ${COLORS.accent}33`,
          borderRadius: 16,
          padding: "16px 24px",
          marginBottom: 24,
          display: "flex",
          gap: 32,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>
            ⚙️ Overtime Rules
          </div>
          {[
            { label: "Daily Threshold",   value: `${rules.daily_threshold}h`        },
            { label: "Weekly Threshold",  value: `${rules.weekly_threshold}h`       },
            { label: "OT Rate",           value: `${rules.rate_multiplier}x`        },
            { label: "Double Time After", value: `${rules.double_time_threshold}h`  },
            { label: "Double Time Rate",  value: `${rules.double_time_multiplier}x` },
          ].map(r => (
            <div key={r.label}>
              <div style={{
                color: COLORS.textMuted, fontSize: 11,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {r.label}
              </div>
              <div style={{
                color: COLORS.accent,
                fontFamily: "'DM Mono', monospace",
                fontWeight: 800,
                fontSize: 15,
              }}>
                {r.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        {[
          { label: "Total OT Hours",    value: `${totalOT.toFixed(1)}h`,  color: COLORS.amber },
          { label: "Total Double Time", value: `${totalDT.toFixed(1)}h`,  color: COLORS.red   },
          { label: "Total OT Pay",      value: `$${totalPay.toFixed(2)}`, color: COLORS.green },
        ].map((s, i) => (
          <div key={i} style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: "20px 24px",
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{
              fontSize: 28, fontWeight: 800,
              color: s.color,
              fontFamily: "'DM Mono', monospace",
            }}>
              {s.value}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>
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
        <div style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: COLORS.accent }}>⚡</span> Overtime Records
        </div>

        {report.length === 0 ? (
          <div style={{ color: COLORS.textMuted, textAlign: 'center', padding: '20px 0' }}>
            No overtime records yet — clock out to generate records
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {["Employee", "Date", "Total Hours", "Regular", "Overtime", "Double Time", "OT Pay"].map(h => (
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
              {report.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: i < report.length - 1 ? `1px solid ${COLORS.border}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceAlt}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={r.employees?.avatar || '??'} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.employees?.name}</div>
                        <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{r.employees?.department}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: COLORS.textMuted }}>
                    {r.date}
                  </td>
                  <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>
                    {r.hours_today}h
                  </td>
                  <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.green }}>
                    {r.regular_hours || 0}h
                  </td>
                  <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.amber, fontWeight: 700 }}>
                    +{r.overtime_hours || 0}h
                  </td>
                  <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.red, fontWeight: 700 }}>
                    {r.double_time_hours > 0 ? `+${r.double_time_hours}h` : '—'}
                  </td>
                  <td style={{ padding: "14px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: COLORS.green, fontWeight: 700 }}>
                    ${(r.overtime_amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}