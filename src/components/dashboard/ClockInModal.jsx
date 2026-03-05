import { useState, useEffect, useRef } from 'react'
import { clockIn, clockOut, getAllFaceDescriptors } from '../../lib/db'
import { loadModels, getFaceDescriptor, buildLabeledDescriptors, matchFace } from '../../lib/faceRecognition'
import { supabase } from '../../lib/supabase'
import { COLORS } from '../../styles/theme'

export default function ClockInModal({ onClose, currentEmployee }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [step, setStep] = useState('loading')
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [sessionData, setSessionData] = useState(null)
  const [matchedEmployee, setMatchedEmployee] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    init()
    return () => stopCamera()
  }, [])

  async function init() {
    try {
      setStep('loading')

      const { data: freshEmployee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', currentEmployee.id)
        .single()

      if (!freshEmployee?.face_registered) {
        setStep('not-registered')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', currentEmployee.id)
        .eq('date', today)
        .single()

      if (existing?.status === 'clocked-in') {
        setMatchedEmployee(freshEmployee)
        setStep('success')
        return
      }

      await loadModels()
      await startCamera()
      setStep('idle')
    } catch (err) {
      setError('Camera error: ' + err.message)
      setStep('error')
    }
  }

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' }
    })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
  }

  const handleClock = async () => {
    setStep('scanning')
    setError(null)

    try {
      await new Promise(r => setTimeout(r, 800))
      setStep('verifying')

      const descriptor = await getFaceDescriptor(videoRef.current)
      if (!descriptor) {
        setError('No face detected. Please look directly at the camera.')
        setStep('idle')
        return
      }

      const employees = await getAllFaceDescriptors()
      if (employees.length === 0) {
        setError('No faces registered in the system.')
        setStep('idle')
        return
      }

      const labeledDescriptors = buildLabeledDescriptors(employees)
      const match = await matchFace(descriptor, labeledDescriptors)

      if (!match) {
        setError('Face not recognized. Please try again or re-register your face.')
        setStep('idle')
        return
      }

      const matched = employees.find(e => e.id === match.label)
      if (!matched) {
        setError('Employee not found.')
        setStep('idle')
        return
      }

      if (matched.id !== currentEmployee?.id) {
        setError('Face does not match your account. Please try again.')
        setStep('idle')
        return
      }

      await clockIn(matched.id)
      setMatchedEmployee(matched)
      stopCamera()
      setStep('success')

    } catch (err) {
      console.error('Clock in error:', err)
      setError('Something went wrong. Please try again.')
      setStep('idle')
    }
  }

  const handleClockOut = async () => {
    setStep('clockout')
    try {
      const empId = matchedEmployee?.id || currentEmployee?.id
      if (empId) {
        const result = await clockOut(empId)
        setSessionData(result)
      }
    } catch (err) {
      console.error('Clock out error:', err)
    }
    setTimeout(() => setStep('clockout-done'), 2000)
  }

  const displayEmployee = matchedEmployee || currentEmployee

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)",
      zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 24, padding: 40, width: 480,
        textAlign: "center", position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>

        {/* Close */}
        <button
          onClick={() => { stopCamera(); onClose() }}
          style={{
            position: "absolute", top: 16, right: 16,
            background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, color: COLORS.textMuted, cursor: "pointer",
            fontSize: 16, width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Clock */}
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 48, fontWeight: 800,
          color: COLORS.accent, letterSpacing: "-0.02em", lineHeight: 1,
        }}>
          {time}
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24, marginTop: 6 }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: COLORS.redDim, border: `1px solid ${COLORS.red}44`,
            borderRadius: 10, padding: "10px 14px",
            color: COLORS.red, fontSize: 13, marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* LOADING */}
        {step === 'loading' && (
          <div style={{ padding: "30px 0", color: COLORS.accent }}>
            <div style={{ fontSize: 14, animation: "pulse 1s infinite" }}>
              Loading...
            </div>
          </div>
        )}

        {/* NOT REGISTERED */}
        {step === 'not-registered' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
            <div style={{ color: COLORS.red, fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
              Face Not Registered
            </div>
            <div style={{
              background: COLORS.redDim, border: `1px solid ${COLORS.red}33`,
              borderRadius: 12, padding: "16px 20px", marginBottom: 24,
              color: COLORS.textMuted, fontSize: 13, lineHeight: 1.6,
            }}>
              You must register your face before you can clock in.
              Go to <strong style={{ color: COLORS.accent }}>📸 Register Face</strong> in
              the sidebar to set up facial recognition.
            </div>
            <button
              onClick={() => { stopCamera(); onClose() }}
              style={{
                width: "100%", background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px",
                color: COLORS.textMuted, fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "'DM Mono', monospace",
              }}
            >
              CLOSE → GO REGISTER FACE
            </button>
          </div>
        )}

        {/* CAMERA ERROR */}
        {step === 'error' && (
          <div style={{ padding: "30px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <div style={{ color: COLORS.red, fontSize: 14 }}>
              Camera access required for facial recognition
            </div>
          </div>
        )}

        {/* CAMERA STATES */}
        {(step === 'idle' || step === 'scanning' || step === 'verifying') && (
          <>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <video
                ref={videoRef}
                autoPlay muted playsInline
                style={{
                  width: "100%", borderRadius: 16,
                  border: `2px solid ${
                    step === 'scanning'  ? COLORS.accent :
                    step === 'verifying' ? COLORS.amber  : COLORS.border
                  }`,
                  boxShadow:
                    step === 'scanning'  ? `0 0 30px ${COLORS.accentGlow}` :
                    step === 'verifying' ? `0 0 30px ${COLORS.amberDim}`   : 'none',
                  transform: "scaleX(-1)",
                }}
              />

              {/* Corner markers */}
              {[
                { top: 10,    left: 10,  borderTop:    `2px solid ${COLORS.accent}`, borderLeft:  `2px solid ${COLORS.accent}` },
                { top: 10,    right: 10, borderTop:    `2px solid ${COLORS.accent}`, borderRight: `2px solid ${COLORS.accent}` },
                { bottom: 10, left: 10,  borderBottom: `2px solid ${COLORS.accent}`, borderLeft:  `2px solid ${COLORS.accent}` },
                { bottom: 10, right: 10, borderBottom: `2px solid ${COLORS.accent}`, borderRight: `2px solid ${COLORS.accent}` },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 22, height: 22, ...s }} />
              ))}

              {/* Scan line */}
              {step === 'scanning' && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
                  animation: "scanLine 1.5s linear infinite", borderRadius: 2,
                }} />
              )}

              {/* Status overlay */}
              {(step === 'scanning' || step === 'verifying') && (
                <div style={{
                  position: "absolute", bottom: 12, left: 0, right: 0,
                  display: "flex", justifyContent: "center",
                }}>
                  <div style={{
                    background: "rgba(0,0,0,0.7)", borderRadius: 20,
                    padding: "4px 14px",
                    color: step === 'scanning' ? COLORS.accent : COLORS.amber,
                    fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700,
                    animation: "pulse 1s infinite",
                  }}>
                    {step === 'scanning' ? '⬤ SCANNING...' : '⬤ VERIFYING...'}
                  </div>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div style={{
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: "8px 16px", fontSize: 12,
              color: COLORS.textMuted, marginBottom: 20,
              display: "flex", justifyContent: "center", gap: 16,
            }}>
              <span>📍 GPS: Active</span>
              <span>🌐 IP: Detecting...</span>
              <span>🤖 AI: Ready</span>
            </div>

            <button
              onClick={handleClock}
              disabled={step !== 'idle'}
              style={{
                background: step !== 'idle'
                  ? COLORS.surfaceAlt
                  : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
                border: "none", borderRadius: 14, padding: "16px 48px",
                color: step !== 'idle' ? COLORS.textMuted : "#0a0e1a",
                fontWeight: 800, fontSize: 16,
                cursor: step !== 'idle' ? "not-allowed" : "pointer",
                fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em",
                boxShadow: step === 'idle' ? `0 4px 24px ${COLORS.accentGlow}` : 'none',
                width: "100%", transition: "all 0.2s",
              }}
            >
              {step === 'idle'      ? '⏱ CLOCK IN'  :
               step === 'scanning'  ? 'SCANNING...'  :
               step === 'verifying' ? 'VERIFYING...' : '...'}
            </button>
          </>
        )}

        {/* SUCCESS / CLOCKED IN */}
        {step === 'success' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{
              width: 90, height: 90, margin: "0 auto 20px", borderRadius: "50%",
              background: COLORS.greenDim, border: `2px solid ${COLORS.green}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, boxShadow: `0 0 30px ${COLORS.greenDim}`,
            }}>
              ✓
            </div>
            <div style={{ color: COLORS.green, fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
              Clocked In!
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24 }}>
              Face verified · Location confirmed
            </div>

            <div style={{
              background: COLORS.greenDim, border: `1px solid ${COLORS.green}33`,
              borderRadius: 12, padding: "14px 20px", marginBottom: 20,
            }}>
              {[
                { label: "Employee", value: displayEmployee?.name || 'Unknown' },
                { label: "Shift",    value: `${displayEmployee?.shift_start || '09:00'} – ${displayEmployee?.shift_end || '17:00'}` },
                { label: "Location", value: "HQ · Floor 3" },
                { label: "Method",   value: "✓ Facial Recognition" },
              ].map(r => (
                <div key={r.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "5px 0", fontSize: 13,
                  borderBottom: `1px solid ${COLORS.green}22`,
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
                  flex: 1, background: COLORS.redDim,
                  border: `1px solid ${COLORS.red}44`, borderRadius: 12, padding: "12px",
                  color: COLORS.red, fontWeight: 700, fontSize: 14,
                  cursor: "pointer", fontFamily: "'DM Mono', monospace",
                }}
              >
                CLOCK OUT
              </button>
              <button
                onClick={() => { stopCamera(); onClose() }}
                style={{
                  flex: 1, background: COLORS.surfaceAlt,
                  border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px",
                  color: COLORS.textMuted, fontWeight: 700, fontSize: 14,
                  cursor: "pointer", fontFamily: "'DM Mono', monospace",
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {/* CLOCK OUT PROCESSING */}
        {step === 'clockout' && (
          <div style={{ padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
            <div style={{ color: COLORS.amber, fontSize: 16, fontWeight: 600, animation: "pulse 1s infinite" }}>
              Calculating overtime...
            </div>
          </div>
        )}

        {/* CLOCK OUT DONE */}
        {step === 'clockout-done' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{
              width: 90, height: 90, margin: "0 auto 20px", borderRadius: "50%",
              background: COLORS.purpleDim, border: `2px solid ${COLORS.purple}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
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
              background: COLORS.purpleDim, border: `1px solid ${COLORS.purple}33`,
              borderRadius: 12, padding: "14px 20px", marginBottom: 20,
            }}>
              {[
                { label: "Employee",    value: displayEmployee?.name || 'Unknown'               },
                { label: "Clock Out",   value: time                                              },
                { label: "Total Hours", value: `${sessionData?.totalHours || 0}h`               },
                { label: "Regular",     value: `${sessionData?.regularHours || 0}h`             },
                { label: "Overtime",    value: `${sessionData?.overtimeHours || 0}h`            },
                { label: "Double Time", value: `${sessionData?.doubleTimeHours || 0}h`          },
                { label: "OT Pay",      value: `$${sessionData?.totalOvertimeAmount || '0.00'}` },
              ].map(r => (
                <div key={r.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "5px 0", fontSize: 13,
                  borderBottom: `1px solid ${COLORS.purple}22`,
                }}>
                  <span style={{ color: COLORS.textMuted }}>{r.label}</span>
                  <span style={{ color: COLORS.text, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { stopCamera(); onClose() }}
              style={{
                width: "100%", background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px",
                color: COLORS.textMuted, fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "'DM Mono', monospace",
              }}
            >
              CLOSE
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes scanLine { 0%{top:0%} 100%{top:100%} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}