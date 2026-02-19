import { COLORS } from '../../styles/theme';

export default function MetricCard({ label, value, sub, color = COLORS.accent, icon }) {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 16,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontSize: 32,
        fontWeight: 800,
        color,
        fontFamily: "'DM Mono', monospace",
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 6,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {label}
      </div>
      {sub && (
        <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}