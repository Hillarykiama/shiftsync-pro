# ShiftSync Pro 

A comprehensive Smart Shift & Attendance Management System built with React + Vite.

## Features

- 📊 **Dashboard** — Live metrics, recent activity, and personal weekly stats
- ✅ **Attendance Tracking** — Real-time employee status with GPS + IP verification
- 🔄 **Shift Management** — Shift swap requests with manager approval workflow
- 🌙 **Leave Management** — Leave requests, approvals, and balance tracking
- 📈 **Analytics** — Attendance patterns, heatmaps, and overtime insights
- 👥 **Team Overview** — Employee profiles and performance summaries
- 📷 **Facial Recognition Clock-in** — Simulated biometric check-in flow
- 📱 **Mobile Responsive** — Full bottom navigation for mobile devices

## Tech Stack

- ⚛️ React 18
- ⚡ Vite
- 🎨 CSS-in-JS (inline styles)
- 🔤 Google Fonts — Sora + DM Mono

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/shiftsync-pro.git

# Navigate into the project
cd shiftsync-pro

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure
```
src/
├── components/
│   ├── layout/         # Shared UI components
│   │   ├── Avatar.jsx
│   │   ├── MetricCard.jsx
│   │   ├── Notification.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatusBadge.jsx
│   ├── dashboard/      # Dashboard + Clock-in modal
│   ├── attendance/     # Live attendance table
│   ├── shifts/         # Shift swap workflow
│   ├── leaves/         # Leave request workflow
│   ├── analytics/      # Charts and heatmap
│   └── team/           # Employee cards
├── data/
│   └── mockData.js     # Mock employee data
├── hooks/
│   └── useMediaQuery.js
├── styles/
│   └── theme.js        # Global color tokens
├── App.jsx
└── main.jsx
```

## Roadmap

- [ ] Supabase backend integration
- [ ] Authentication (login/logout)
- [ ] Real GPS verification
- [ ] Payroll integration
- [ ] Push notifications
- [ ] Dark/Light theme toggle
- [ ] Export reports to PDF

## License


