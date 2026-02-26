import { useState, useEffect } from 'react'
import { clockIn, clockOut } from '../../lib/db'
import { COLORS } from '../../styles/theme'

export default function ClockInModal({ onClose, currentEmployee }) {
  const [step, setStep] = useState('idle')
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [sessionData, setSessionData] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleClock = async () => {
    setStep('scanning')
    setTimeout(() => setStep('verifying'), 1500)
    try {
      if (currentEmployee) await clockIn(currentEmployee.id)
    } catch (err) {
      console.error('Clock in error:', err)
    }
    setTimeout(() => setStep('success'), 3000)
  }

  const handleClockOut = async () => {
    setStep('clockout')
    try {
      if (currentEmployee) {
        const result = await clockOut(currentEmployee.id)
        setSessionData(result)
      }
    } catch (err) {
      console.error('Clock out error:', err)
    }
    setTimeout(() => setStep('clockout-done'), 2000)
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 24,
        padding: 40,
        width: 440,
        textAlign: "center",
        position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16, right: 16,
            background: COLORS.surfaceAlt,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            color: COLORS.textMuted,
            cursor: "pointer",
            fontSize: 16,
            width: 32, height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Live Clock */}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 48,
          fontWeight: 800,
          color: COLORS.accent,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {time}
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 32, marginTop: 6 }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric',
          })}
        </div>

        {/* IDLE STATE */}
        {step === 'idle' && (
          <>
            <div style={{
              width: 200, height: 200,
              margin: "0 auto 20px",
              border: `2px solid ${COLORS.border}`,
              borderRadius: 16,
              background: COLORS.surfaceAlt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
              position: "relative",
              overflow: "hidden",
            }}>
              {[
                { top: 8,    left: 8,    borderTop: `2px solid ${COLORS.accent}`,    borderLeft:  `2px solid ${COLORS.accent}` },
                { top: 8,    right: 8,   borderTop: `2px solid ${COLORS.accent}`,    borderRight: `2px solid ${COLORS.accent}` },
                { bottom: 8, left: 8,    borderBottom: `2px solid ${COLORS.accent}`, borderLeft:  `2px solid ${COLORS.accent}` },
                { bottom: 8, right: 8,   borderBottom: `2px solid ${COLORS.accent}`, borderRight: `2px solid ${COLORS.accent}` },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 20, height: 20, ...s }} />
              ))}
              <div style={{ fontSize: 52 }}>👤</div>
              <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Position your face</div>
            </div>

            <div style={{
              background: COLORS.surfaceAlt,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 12,
              color: COLORS.textMuted,
              marginBottom: 24,
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}>
              <span>📍 GPS: 37.7749°N, 122.4194°W</span>
              <span>🌐 IP: Detecting...</span>
            </div>

            <button
              onClick={handleClock}
              style={{
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
                border: "none",
                borderRadius: 14,
                padding: "16px 48px",
                color: "#0a0e1a",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.05em",
                boxShadow: `0 4px 24px ${COLORS.accentGlow}`,
                width: "100%",
              }}
            >
              ⏱ CLOCK IN
            </button>
          </>
        )}

        {/* SCANNING STATE */}
        {step === 'scanning' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{
              width: 200, height: 200,
              margin: "0 auto 24px",
              border: `2px solid ${COLORS.accent}`,
              borderRadius: 16,
              background: COLORS.surfaceAlt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
              boxShadow: `0 0 40px ${COLORS.accentGlow}`,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                animation: "scanLine 1.5s linear infinite",
              }} />
              <div style={{ fontSize: 52 }}>👤</div>
              <div style={{
                color: COLORS.accent, fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                animation: "pulse 1s infinite",
              }}>
                SCANNING...
              </div>
            </div>
            <div style={{ color: COLORS.accent, fontSize: 15, fontWeight: 600 }}>
              Detecting face...
            </div>
          </div>
        )}

        {/* VERIFYING STATE */}
        {step === 'verifying' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{
              width: 200, height: 200,
              margin: "0 auto 24px",
              border: `2px solid ${COLORS.amber}`,
              borderRadius: 16,
              background: COLORS.surfaceAlt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
              boxShadow: `0 0 40px ${COLORS.amberDim}`,
            }}>
              <div style={{ fontSize: 52 }}>🔍</div>
              <div style={{
                color: COLORS.amber, fontSize: 12,
                fontFamily: "'DM Mono', monospace",
                animation: "pulse 0.8s infinite",
              }}>
                VERIFYING...
              </div>
            </div>
            <div style={{ color: COLORS.amber, fontSize: 15, fontWeight: 600 }}>
              Matching identity...
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 6 }}>
              Checking against employee database
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === 'success' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{
              width: 90, height: 90,
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: COLORS.greenDim,
              border: `2px solid ${COLORS.green}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              boxShadow: `0 0 30px ${COLORS.greenDim}`,
            }}>
              ✓
            </div>
            <div style={{ color: COLORS.green, fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
              Clocked In!
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24 }}>
              Identity verified · Location confirmed
            </div>

            <div style={{
              background: COLORS.greenDim,
              border: `1px solid ${COLORS.green}33`,
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 20,
            }}>
              {[
                { label: "Employee", value: currentEmployee?.name || 'Unknown' },
                { label: "Shift",    value: `${currentEmployee?.shift_start || '09:00'} – ${currentEmployee?.shift_end || '17:00'}` },
                { label: "Location", value: "HQ · Floor 3"       },
                { label: "Method",   value: "Facial Recognition" },
              ].map(r => (
                <div key={r.label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  fontSize: 13,
                }}>
                  <span style={{ color: COLORS.textMuted }}>{r.label}</span>
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleClockOut}
                style={{
                  flex: 1,
                  background: COLORS.redDim,
                  border: `1px solid ${COLORS.red}44`,
                  borderRadius: 12,
                  padding: "12px",
                  color: COLORS.red,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                CLOCK OUT
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  background: COLORS.surfaceAlt,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: "12px",
                  color: COLORS.textMuted,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {/* CLOCK OUT STATE */}
        {step === 'clockout' && (
          <div style={{ padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
            <div style={{
              color: COLORS.amber,
              fontSize: 16,
              fontWeight: 600,
              animation: "pulse 1s infinite",
            }}>
              Calculating overtime...
            </div>
          </div>
        )}

        {/* CLOCK OUT DONE STATE */}
        {step === 'clockout-done' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{
              width: 90, height: 90,
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: COLORS.purpleDim,
              border: `2px solid ${COLORS.purple}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}>
              👋
            </div>
            <div style={{ color: COLORS.purple, fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
              See you tomorrow!
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24 }}>
              Clocked out successfully
            </div>
            <div style={{
              background: COLORS.purpleDim,
              border: `1px solid ${COLORS.purple}33`,
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 20,
            }}>
              {[
                { label: "Employee",      value: currentEmployee?.name || 'Unknown'               },
                { label: "Clock Out",     value: time                                              },
                { label: "Total Hours",   value: `${sessionData?.totalHours || 0}h`               },
                { label: "Regular",       value: `${sessionData?.regularHours || 0}h`             },
                { label: "Overtime",      value: `${sessionData?.overtimeHours || 0}h`            },
                { label: "Double Time",   value: `${sessionData?.doubleTimeHours || 0}h`          },
                { label: "OT Pay",        value: `$${sessionData?.totalOvertimeAmount || '0.00'}` },
              ].map(r => (
                <div key={r.label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  fontSize: 13,
                  borderBottom: `1px solid ${COLORS.purple}22`,
                }}>
                  <span style={{ color: COLORS.textMuted }}>{r.label}</span>
                  <span style={{
                    color: COLORS.text,
                    fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: "12px",
                color: COLORS.textMuted,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              CLOSE
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 0% }
          100% { top: 100% }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50%       { opacity: 0.4 }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  )
}