import { COLORS } from '../../styles/theme';

export default function StatusBadge({ status }) {
  const config = {
    "clocked-in":  { color: COLORS.green,    bg: COLORS.greenDim,  label: "Clocked In" },
    "clocked-out": { color: COLORS.textMuted, bg: "rgba(107,122,153,0.1)", label: "Clocked Out" },
    "on-break":    { color: COLORS.amber,     bg: COLORS.amberDim,  label: "On Break" },
    "absent":      { color: COLORS.red,       bg: COLORS.redDim,    label: "Absent" },
    "pending":     { color: COLORS.amber,     bg: COLORS.amberDim,  label: "Pending" },
    "approved":    { color: COLORS.green,     bg: COLORS.greenDim,  label: "Approved" },
    "rejected":    { color: COLORS.red,       bg: COLORS.redDim,    label: "Rejected" },
  }[status] || { color: COLORS.textMuted, bg: "transparent", label: status };

  return (
    <span style={{
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.color}33`,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}>
      {config.label}
    </span>
  );
}