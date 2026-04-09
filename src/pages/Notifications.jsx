import { useApp } from '../context/AppContext'
import { useI18n } from '../i18n'

export default function Notifications() {
  const { notifications, markNotificationRead, markAllRead, unreadCount } = useApp()
  const { t } = useI18n()

  const TYPE_STYLE = {
    action:   { bg: '#FFFBEB', border: '#FDE68A', icon: '⚠️', label: t('notif.actionRequired'), color: '#92400E' },
    document: { bg: '#EFF6FF', border: '#BFDBFE', icon: '📄', label: t('notif.document'),        color: '#1E40AF' },
    info:     { bg: '#F0FDF4', border: '#BBF7D0', icon: 'ℹ️',  label: t('notif.information'),     color: '#166534' },
    warning:  { bg: '#FEF2F2', border: '#FECACA', icon: '🚨', label: t('notif.notice'),          color: '#991B1B' },
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#002677' }}>{t('notif.title')}</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {t('notif.desc')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            padding: '8px 16px', background: '#fff', color: '#002677',
            border: '1.5px solid #002677', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{t('notif.markAllRead')}</button>
        )}
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#64748b' }}>
        {t('notif.officialNotice')}
      </div>

      {notifications.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: '60px', textAlign: 'center', color: '#94a3b8', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ fontWeight: 600 }}>{t('notif.noNotifs')}</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>{t('notif.allCaughtUp')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => {
            const s = TYPE_STYLE[n.type] || TYPE_STYLE.info
            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{
                  background: n.read ? '#fff' : s.bg,
                  border: `1px solid ${n.read ? '#E2E8F0' : s.border}`,
                  borderLeft: `4px solid ${n.read ? '#CBD5E1' : s.border}`,
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  boxShadow: n.read ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = n.read ? 'none' : '0 2px 8px rgba(0,0,0,0.06)'}
              >
                <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: n.read ? '#374151' : '#1e293b' }}>{n.title}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {!n.read && <span style={{ width: 8, height: 8, background: '#3B82F6', borderRadius: '50%', display: 'inline-block' }} />}
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.date}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 1.6 }}>{n.body}</div>
                  <span style={{ display: 'inline-block', marginTop: 8, background: '#fff', color: s.color, border: `1px solid ${s.border}`, borderRadius: 10, padding: '1px 10px', fontSize: 11, fontWeight: 600 }}>
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
