import { useApp } from '../context/AppContext'

const NAV = [
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard' },
  { id: 'activity',   icon: '📅', label: 'Activity Reporting' },
  { id: 'documents',  icon: '📄', label: 'Documents' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'profile',    icon: '👤', label: 'My Account' },
]

export default function Sidebar({ page, setPage, onLogout }) {
  const { user, unreadCount } = useApp()

  return (
    <aside style={{
      width: 220,
      background: '#002677',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#FF6900', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏛️</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>State Benefits</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>CEV Portal</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 38, height: 38, background: '#FF6900', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{user.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>ID: {user.id}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          {user.programs.map(p => (
            <span key={p} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 10, padding: '1px 7px', borderRadius: 20 }}>{p}</span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px' }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 10px',
              background: page === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              color: page === item.id ? '#fff' : 'rgba(255,255,255,0.65)',
              fontSize: 13, fontWeight: page === item.id ? 700 : 400,
              textAlign: 'left', marginBottom: 2,
              transition: 'all 0.15s',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
            {item.id === 'notifications' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#EF4444', color: '#fff',
                borderRadius: 20, fontSize: 10, fontWeight: 700,
                padding: '1px 6px', minWidth: 18, textAlign: 'center',
              }}>{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 10px', background: 'transparent', border: 'none',
          borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.55)',
          fontSize: 13, textAlign: 'left',
        }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
