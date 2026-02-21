import { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import Notification from './components/layout/Notification'
import Dashboard from './components/dashboard/Dashboard'
import Attendance from './components/attendance/Attendance'
import Shifts from './components/shifts/Shifts'
import Leaves from './components/leaves/Leaves'
import Analytics from './components/analytics/Analytics'
import Team from './components/team/Team'
import ClockInModal from './components/dashboard/ClockInModal'
import Login from './components/auth/Login'
import { COLORS } from './styles/theme'
import { useIsMobile } from './hooks/useMediaQuery'
import { supabase } from './lib/supabase'
import { getCurrentUser } from './lib/auth'

function App() {
  const [view, setView] = useState('dashboard')
  const [notification, setNotification] = useState(null)
  const [showClockIn, setShowClockIn] = useState(false)
  const [session, setSession] = useState(null)
  const [currentEmployee, setCurrentEmployee] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadEmployee()
      else setAuthLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) await loadEmployee()
        else {
          setCurrentEmployee(null)
          setAuthLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadEmployee() {
    setAuthLoading(true)
    const employee = await getCurrentUser()
    setCurrentEmployee(employee)
    setAuthLoading(false)
  }

  const showNotif = (msg, color = COLORS.green) => {
    setNotification({ msg, color })
    setTimeout(() => setNotification(null), 3000)
  }

  // Loading screen
  if (authLoading) return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{
        color: COLORS.accent,
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: "-0.02em",
      }}>
        ShiftSync
      </div>
      <div style={{ color: COLORS.textMuted, fontSize: 14 }}>
        Loading...
      </div>
    </div>
  )

  // Show login if no session
  if (!session) return <Login />

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
        user={currentEmployee || { name: 'Loading...', avatar: '..', role: 'Employee' }}
        isManager={currentEmployee?.role_type === 'manager'}
      />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '76px 16px 80px' : '32px',
      }}>
        <Notification message={notification?.msg} color={notification?.color} />

        {view === 'dashboard'  && (
          <Dashboard
            onClockIn={() => setShowClockIn(true)}
            currentEmployee={currentEmployee}
          />
        )}
        {view === 'attendance' && <Attendance />}
        {view === 'shifts'     && (
          <Shifts
            showNotif={showNotif}
            currentEmployee={currentEmployee}
          />
        )}
        {view === 'leaves'     && (
          <Leaves
            showNotif={showNotif}
            currentEmployee={currentEmployee}
          />
        )}
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
        <ClockInModal
          onClose={() => setShowClockIn(false)}
          currentEmployee={currentEmployee}
        />
      )}
    </div>
  )
}

export default App
