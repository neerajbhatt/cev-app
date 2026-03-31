import { useApp } from '../context/AppContext'

const STATUS_STYLE = {
  'Compliant (Verified)':    { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' },
  'Compliant (Exempt)':      { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' },
  'Compliant (Hardship)':    { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' },
  'Pending Member Action':   { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#FF6900' },
  'Pending Verification':    { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', dot: '#3B82F6' },
  'Non-Compliant':           { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#EF4444' },
}

export default function Dashboard({ setPage }) {
  const { user, compliance, notifications, documents, activities } = useApp()

  const currentMonth = compliance.find(c => !c.locked) || compliance[compliance.length - 1]
  const pendingActions = notifications.filter(n => n.type === 'action' && !n.read)
  const processingDocs = documents.filter(d => d.status === 'Processing')
  const currentActivities = activities.filter(a => a.month === currentMonth?.month)
  const totalHours = currentActivities.reduce((s, a) => s + Number(a.hours), 0)
  const hoursNeeded = Math.max(0, (currentMonth?.required || 80) - totalHours)
  const progress = Math.min(100, Math.round((totalHours / (currentMonth?.required || 80)) * 100))

  if (!currentMonth) return <div style={{ padding: 40, color: '#64748b' }}>Loading dashboard…</div>

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#002677' }}>Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Member ID: {user.id} · Programs: {user.programs.join(', ')} · Reporting Window: Open until April 10, 2026
        </p>
      </div>

      {/* Alert banner */}
      {pendingActions.length > 0 && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '4px solid #FF6900',
          borderRadius: 10, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>{pendingActions[0].title}</div>
            <div style={{ color: '#78350F', fontSize: 13, marginTop: 2 }}>{pendingActions[0].body}</div>
          </div>
          <button onClick={() => setPage('activity')} style={{
            background: '#FF6900', color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Report Now →</button>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="⏱️" label="Hours This Month" value={`${totalHours} / ${currentMonth.required}`} sub={`${hoursNeeded > 0 ? hoursNeeded + ' more needed' : 'Requirement met!'}`} color={hoursNeeded === 0 ? '#22C55E' : '#FF6900'} onClick={() => setPage('activity')} />
        <StatCard icon="📄" label="Pending Documents" value={processingDocs.length} sub="Being reviewed" color="#3B82F6" onClick={() => setPage('documents')} />
        <StatCard icon="🔔" label="Unread Alerts" value={pendingActions.length} sub="Require action" color="#EF4444" onClick={() => setPage('notifications')} />
        <StatCard icon="📋" label="Activities Logged" value={currentActivities.length} sub={`for ${currentMonth.month}`} color="#8B5CF6" onClick={() => setPage('activity')} />
      </div>

      {/* Current month progress */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#002677' }}>March 2026 — Current Reporting Month</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Reporting window closes April 10, 2026</p>
          </div>
          <StatusBadge status={currentMonth.status} />
        </div>
        <div style={{ background: '#F1F5F9', borderRadius: 8, height: 12, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: progress >= 100 ? '#22C55E' : '#FF6900', borderRadius: 8, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
          <span>{totalHours} hours reported</span>
          <span>{progress}% of {currentMonth.required} required</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <ActionBtn label="+ Add Activity" onClick={() => setPage('activity')} primary />
          <ActionBtn label="Upload Document" onClick={() => setPage('documents')} />
        </div>
      </div>

      {/* Compliance history + Required docs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* 6-month compliance */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 16 }}>6-Month Compliance History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {compliance.map(c => {
              const s = STATUS_STYLE[c.status] || STATUS_STYLE['Pending Member Action']
              return (
                <div key={c.month} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 80 }}>{c.month}</span>
                  <span style={{ fontSize: 12, color: s.color, flex: 1 }}>{c.status}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.hours}h</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Required actions */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 16 }}>Required Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActionItem icon="⏱️" text={`Report ${hoursNeeded} more hours for March 2026`} due="Due Apr 10" urgent={hoursNeeded > 0} />
            <ActionItem icon="📄" text="Upload paystub for week of Mar 10–14" due="Due Apr 10" urgent />
            <ActionItem icon="📋" text="Complete attestation for March activities" due="Due Apr 10" urgent={false} />
            {processingDocs.length > 0 && (
              <ActionItem icon="🔄" text={`${processingDocs.length} document(s) being processed`} due="No action needed" urgent={false} />
            )}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Required Documents for March</h3>
            {['Paystub / Wage Statement', 'Training Enrollment Letter'].map(doc => (
              <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                <span>📎</span> {doc}
                <button onClick={() => setPage('documents')} style={{ marginLeft: 'auto', fontSize: 11, color: '#196ECF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Upload →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent notices */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677' }}>Recent Notices</h2>
          <button onClick={() => setPage('notifications')} style={{ fontSize: 12, color: '#196ECF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...notifications].slice(0, 3).map(n => (
            <div key={n.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: n.read ? '#F8FAFC' : '#EFF6FF', borderRadius: 8, border: `1px solid ${n.read ? '#F1F5F9' : '#BFDBFE'}` }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{n.type === 'action' ? '⚠️' : n.type === 'document' ? '📄' : n.type === 'warning' ? '🚨' : 'ℹ️'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{n.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `3px solid ${color}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sub}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE['Pending Member Action']
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
      {status}
    </span>
  )
}

function ActionBtn({ label, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      background: primary ? '#002677' : '#fff',
      color: primary ? '#fff' : '#002677',
      border: primary ? 'none' : '1.5px solid #002677',
    }}>{label}</button>
  )
}

function ActionItem({ icon, text, due, urgent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: urgent ? '#FFFBEB' : '#F8FAFC', borderRadius: 8, border: `1px solid ${urgent ? '#FDE68A' : '#F1F5F9'}` }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#1e293b' }}>{text}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{due}</div>
      </div>
    </div>
  )
}
