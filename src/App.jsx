import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Notification from './components/layout/Notification'
import Dashboard from './components/dashboard/Dashboard'
import Attendance from './components/attendance/Attendance'
import Shifts from './components/shifts/Shifts'
import Leaves from './components/leaves/Leaves'
import Analytics from './components/analytics/Analytics'
import Team from './components/team/Team'
import ClockInModal from './components/dashboard/ClockInModal'
import { COLORS } from './styles/theme'
import { currentUser } from './data/mockData'
import { useIsMobile } from './hooks/useMediaQuery'

function App() {
  const [view, setView] = useState('dashboard')
  const [notification, setNotification] = useState(null)
  const [showClockIn, setShowClockIn] = useState(false)
  const isMobile = useIsMobile()

  const showNotif = (msg, color = COLORS.green) => {
    setNotification({ msg, color })
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: COLORS.bg,
      flexDirection: isMobile ? 'column' : 'row',
    }}>

      <Sidebar
        currentView={view}
        onNavigate={setView}
        user={currentUser}
      />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '76px 16px 80px' : '32px',
      }}>
        <Notification message={notification?.msg} color={notification?.color} />

        {view === 'dashboard'  && (
          <Dashboard onClockIn={() => setShowClockIn(true)} />
        )}
        {view === 'attendance' && <Attendance />}
        {view === 'shifts'     && <Shifts showNotif={showNotif} />}
        {view === 'leaves'     && <Leaves showNotif={showNotif} />}
        {view === 'analytics'  && <Analytics />}
        {view === 'team'       && <Team />}

        {view !== 'dashboard'  &&
         view !== 'attendance' &&
         view !== 'shifts'     &&
         view !== 'leaves'     &&
         view !== 'analytics'  &&
         view !== 'team'       && (
          <div style={{ color: COLORS.accent, fontSize: 24, fontWeight: 800 }}>
            📍 {view} — coming soon!
          </div>
        )}
      </div>

      {showClockIn && (
        <ClockInModal onClose={() => setShowClockIn(false)} />
      )}

    </div>
  )
}

export default App