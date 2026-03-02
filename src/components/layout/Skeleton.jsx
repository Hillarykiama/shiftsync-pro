import { COLORS } from '../../styles/theme'

export function SkeletonBlock({ height = 100, width = "100%", radius = 16 }) {
  return (
    <>
      <div style={{
        height,
        width,
        background: COLORS.surfaceAlt,
        borderRadius: radius,
        animation: "shimmer 1.5s infinite",
      }} />
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 16,
      padding: 24,
    }}>
      <div style={{ height: 20, width: 160, background: COLORS.surfaceAlt, borderRadius: 6, animation: "shimmer 1.5s infinite" }} />
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.surfaceAlt, animation: "shimmer 1.5s infinite", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 14, width: "60%", background: COLORS.surfaceAlt, borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
              <div style={{ height: 10, width: "40%", background: COLORS.surfaceAlt, borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
            </div>
            <div style={{ height: 24, width: 80, background: COLORS.surfaceAlt, borderRadius: 20, animation: "shimmer 1.5s infinite" }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

export function SkeletonCards({ count = 4 }) {
  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 16,
      }}>
        {[...Array(count)].map((_, i) => (
          <div key={i} style={{ height: 100, background: COLORS.surfaceAlt, borderRadius: 16, animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </>
  )
}