import { COLORS } from '../../styles/theme';

export default function Notification({ message, color = COLORS.green }) {
  if (!message) return null;

  return (
    <div style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 2000,
      background: COLORS.surface,
      border: `1px solid ${color}44`,
      borderRadius: 12,
      padding: "12px 20px",
      color: color,
      fontWeight: 600,
      fontSize: 14,
      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      animation: "fadeIn 0.3s ease",
    }}>
      ✓ {message}
    </div>
  );
}