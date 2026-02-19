import { COLORS } from '../../styles/theme';

export default function Avatar({ initials, size = 36, color = COLORS.accent }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${color}33, ${color}11)`,
      border: `1.5px solid ${color}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.35,
      fontWeight: 700,
      color,
      fontFamily: "'DM Mono', monospace",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}