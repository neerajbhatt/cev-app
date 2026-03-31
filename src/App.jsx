import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ActivityReporting from './pages/ActivityReporting'
import Documents from './pages/Documents'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Sidebar from './components/Sidebar'

function Portal() {
  const { user, logout, authLoading } = useApp()
  const [page, setPage] = useState('dashboard')

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #002677 0%, #196ECF 60%, #FF6900 100%)' }}>
      <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Loading…</div>
    </div>
  )

  if (!user) return <Login />

  const PAGES = {
    dashboard:     <Dashboard setPage={setPage} />,
    activity:      <ActivityReporting />,
    documents:     <Documents />,
    notifications: <Notifications />,
    profile:       <Profile />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
      <Sidebar page={page} setPage={setPage} onLogout={logout} />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {PAGES[page] || PAGES.dashboard}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Portal />
    </AppProvider>
  )
}
