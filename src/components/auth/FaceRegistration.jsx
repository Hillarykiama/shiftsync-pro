import { useState, useEffect, useRef } from 'react'
import { COLORS } from '../../styles/theme'
import { loadModels, getFaceDescriptor } from '../../lib/faceRecognition'
import { saveFaceDescriptor } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'

export default function FaceRegistration({ onClose, onSuccess }) {
  const { currentEmployee } = useAuth()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [step, setStep] = useState('loading')
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(3)
  const [showWarning, setShowWarning] = useState(false)
  const alreadyRegistered = currentEmployee?.face_registered === true

  useEffect(() => {
    init()
    return () => stopCamera()
  }, [])

  async function init() {
    try {
      setStep('loading')
      await loadModels()
      await startCamera()
      // If already registered show warning first
      if (alreadyRegistered) {
        setStep('warning')
      } else {
        setStep('ready')
      }
    } catch (err) {
      setError('Could not load camera or models: ' + err.message)
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

  async function handleCapture() {
    setStep('capturing')
    let count = 3
    setCountdown(count)

    const timer = setInterval(() => {
      count--
      setCountdown(count)
      if (count === 0) clearInterval(timer)
    }, 1000)

    await new Promise(r => setTimeout(r, 3000))
    setStep('processing')

    try {
      const descriptor = await getFaceDescriptor(videoRef.current)
      if (!descriptor) {
        setError('No face detected. Please look directly at the camera.')
        setStep('ready')
        return
      }

      await saveFaceDescriptor(currentEmployee.id, descriptor)
      stopCamera()
      setStep('success')
      setTimeout(() => onSuccess?.(), 2000)
    } catch (err) {
      setError('Failed to register face: ' + err.message)
      setStep('ready')
    }
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.9)",
      zIndex: 2000,
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
        width: 500,
        textAlign: "center",
        position: "relative",
      }}>

        {/* Close */}
        <button
          onClick={() => { stopCamera(); onClose?.() }}
          style={{
            position: "absolute", top: 16, right: 16,
            background: COLORS.surfaceAlt,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8, color: COLORS.textMuted,
            cursor: "pointer", fontSize: 16,
            width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          Register Your Face
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
          This will be used for clock in verification
        </div>

        {/* Loading */}
        {step === 'loading' && (
          <div style={{ padding: "40px 0", color: COLORS.accent }}>
            Loading AI models...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: COLORS.redDim,
            border: `1px solid ${COLORS.red}44`,
            borderRadius: 10,
            padding: "10px 14px",
            color: COLORS.red,
            fontSize: 13,
            marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Already registered warning */}
        {step === 'warning' && (
          <div style={{ padding: "10px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
            <div style={{
              background: COLORS.amberDim,
              border: `1px solid ${COLORS.amber}44`,
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
            }}>
              <div style={{ color: COLORS.amber, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                Face Already Registered
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13 }}>
                You already have a face registered for clock in.
                Re-registering will replace your existing face data.
                Are you sure you want to continue?
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { stopCamera(); onClose?.() }}
                style={{
                  flex: 1,
                  background: COLORS.surfaceAlt,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12, padding: "12px",
                  color: COLORS.textMuted, fontWeight: 700,
                  fontSize: 14, cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                CANCEL
              </button>
              <button
                onClick={() => setStep('ready')}
                style={{
                  flex: 1,
                  background: COLORS.amberDim,
                  border: `1px solid ${COLORS.amber}44`,
                  borderRadius: 12, padding: "12px",
                  color: COLORS.amber, fontWeight: 700,
                  fontSize: 14, cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                RE-REGISTER
              </button>
            </div>
          </div>
        )}

        {/* Camera */}
        {(step === 'ready' || step === 'capturing' || step === 'processing') && (
          <>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  borderRadius: 16,
                  border: `2px solid ${
                    step === 'capturing'  ? COLORS.amber  :
                    step === 'processing' ? COLORS.accent :
                    COLORS.border
                  }`,
                  boxShadow: step === 'capturing'
                    ? `0 0 30px ${COLORS.amberDim}`
                    : step === 'processing'
                    ? `0 0 30px ${COLORS.accentGlow}`
                    : 'none',
                  transform: "scaleX(-1)",
                }}
              />

              {/* Corner Markers */}
              {[
                { top: 12, left: 12,     borderTop: `2px solid ${COLORS.accent}`,    borderLeft:  `2px solid ${COLORS.accent}` },
                { top: 12, right: 12,    borderTop: `2px solid ${COLORS.accent}`,    borderRight: `2px solid ${COLORS.accent}` },
                { bottom: 12, left: 12,  borderBottom: `2px solid ${COLORS.accent}`, borderLeft:  `2px solid ${COLORS.accent}` },
                { bottom: 12, right: 12, borderBottom: `2px solid ${COLORS.accent}`, borderRight: `2px solid ${COLORS.accent}` },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 24, height: 24, ...s }} />
              ))}

              {/* Countdown Overlay */}
              {step === 'capturing' && countdown > 0 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                }}>
                  <div style={{
                    fontSize: 80,
                    fontWeight: 800,
                    color: COLORS.accent,
                    fontFamily: "'DM Mono', monospace",
                    textShadow: `0 0 40px ${COLORS.accentGlow}`,
                  }}>
                    {countdown}
                  </div>
                </div>
              )}

              {/* Processing Overlay */}
              {step === 'processing' && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: 14,
                }}>
                  <div style={{
                    color: COLORS.accent,
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    animation: "pulse 1s infinite",
                  }}>
                    PROCESSING...
                  </div>
                </div>
              )}
            </div>

            {alreadyRegistered && step === 'ready' && (
              <div style={{
                background: COLORS.amberDim,
                border: `1px solid ${COLORS.amber}44`,
                borderRadius: 10,
                padding: "8px 14px",
                color: COLORS.amber,
                fontSize: 12,
                marginBottom: 16,
              }}>
                ⚠️ This will replace your existing face data
              </div>
            )}

            <button
              onClick={handleCapture}
              disabled={step !== 'ready'}
              style={{
                background: step !== 'ready'
                  ? COLORS.surfaceAlt
                  : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentMid})`,
                border: "none",
                borderRadius: 12,
                padding: "14px",
                color: step !== 'ready' ? COLORS.textMuted : "#0a0e1a",
                fontWeight: 800,
                fontSize: 15,
                cursor: step !== 'ready' ? "not-allowed" : "pointer",
                fontFamily: "'DM Mono', monospace",
                width: "100%",
                boxShadow: step === 'ready' ? `0 4px 20px ${COLORS.accentGlow}` : 'none',
              }}
            >
              📸 CAPTURE FACE
            </button>
          </>
        )}

        {/* Success */}
        {step === 'success' && (
          <div style={{ padding: "20px 0" }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: "50%",
              background: COLORS.greenDim,
              border: `2px solid ${COLORS.green}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              margin: "0 auto 16px",
            }}>
              ✓
            </div>
            <div style={{ color: COLORS.green, fontSize: 20, fontWeight: 800 }}>
              Face Registered!
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 8 }}>
              You can now use facial recognition to clock in
            </div>
          </div>
        )}

        {/* Error state */}
        {step === 'error' && (
          <div style={{ padding: "30px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <div style={{ color: COLORS.red, fontSize: 14 }}>
              Camera access required for facial recognition.
              Please allow camera access and try again.
            </div>
            <button
              onClick={init}
              style={{
                marginTop: 16,
                background: COLORS.surfaceAlt,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10, padding: "10px 20px",
                color: COLORS.textMuted, cursor: "pointer",
                fontSize: 13, fontFamily: "'DM Mono', monospace",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 16 }}>
          Your face data is stored securely and never shared
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
      `}</style>
    </div>
  )
}