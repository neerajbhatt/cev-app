import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Profile() {
  const { user, delegates, addDelegate, removeDelegate } = useApp()
  const [activeTab, setActiveTab] = useState('profile')
  const [showDelegateForm, setShowDelegateForm] = useState(false)
  const [delegateForm, setDelegateForm] = useState({ name: '', relation: '', email: '', permissions: [] })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const togglePermission = (p) => {
    setDelegateForm(f => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p]
    }))
  }

  const handleAddDelegate = () => {
    if (!delegateForm.name || !delegateForm.email) return
    addDelegate(delegateForm)
    setDelegateForm({ name: '', relation: '', email: '', permissions: [] })
    setShowDelegateForm(false)
  }

  const TABS = ['profile', 'delegation', 'security', 'language']

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#002677' }}>My Account</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Manage your profile, delegation settings, and security preferences.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid #E2E8F0', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            color: activeTab === t ? '#002677' : '#94a3b8',
            borderBottom: activeTab === t ? '2px solid #002677' : '2px solid transparent',
            marginBottom: -2,
          }}>{t === 'delegation' ? 'Authorized Representatives' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ width: 60, height: 60, background: '#002677', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22 }}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Member ID: {user.member_id}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {user.programs.map(p => <span key={p} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 10, padding: '1px 10px', fontSize: 11, fontWeight: 600 }}>{p}</span>)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First Name" value={user.name.split(' ')[0]} />
            <Field label="Last Name" value={user.name.split(' ')[1]} />
            <Field label="Email Address" value={user.email} type="email" />
            <Field label="Mobile Phone" value={user.phone} type="tel" />
            <Field label="Date of Birth" value={user.dob} type="date" />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Preferred Language</label>
              <select defaultValue="en" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="zh">中文</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>

          {saved && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#166534', fontWeight: 600, marginTop: 16 }}>✅ Profile updated successfully!</div>}

          <button onClick={handleSave} style={{ marginTop: 20, padding: '10px 28px', background: '#002677', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Save Changes
          </button>
        </div>
      )}

      {/* Delegation tab */}
      {activeTab === 'delegation' && (
        <div>
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#1E40AF' }}>
            ℹ️ You can authorize a caregiver, family member, or representative to access your portal on your behalf. All actions taken by a delegate are clearly labeled in audit logs.
          </div>

          {delegates.map(d => (
            <div key={d.id} style={{ background: '#fff', borderRadius: 12, padding: '18px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{d.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{d.relation} · {d.email}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {d.permissions.map(p => (
                    <span key={p} style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>{p}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Added {d.addedOn}</div>
              </div>
              <button onClick={() => removeDelegate(d.id)} style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Revoke Access</button>
            </div>
          ))}

          {!showDelegateForm ? (
            <button onClick={() => setShowDelegateForm(true)} style={{ padding: '10px 20px', background: '#002677', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
              + Add Authorized Representative
            </button>
          ) : (
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginTop: 12, border: '1.5px solid #BFDBFE' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 16 }}>Add Authorized Representative</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="Full Name" value={delegateForm.name} onChange={v => setDelegateForm(f => ({ ...f, name: v }))} />
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Role</label>
                  <select value={delegateForm.relation} onChange={e => setDelegateForm(f => ({ ...f, relation: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                    <option value="">Select...</option>
                    <option>Caregiver</option>
                    <option>Authorized Representative (AR)</option>
                    <option>Parent/Guardian</option>
                    <option>Household Head</option>
                    <option>Navigator / CBO Worker</option>
                  </select>
                </div>
                <Field label="Email Address" type="email" value={delegateForm.email} onChange={v => setDelegateForm(f => ({ ...f, email: v }))} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Permissions</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['view', 'upload', 'act', 'submit'].map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={delegateForm.permissions.includes(p)} onChange={() => togglePermission(p)} />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleAddDelegate} style={{ padding: '9px 20px', background: '#002677', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Send Invitation</button>
                <button onClick={() => setShowDelegateForm(false)} style={{ padding: '9px 16px', background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 20 }}>Security Settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SecurityItem title="Password" desc="Last changed 45 days ago" action="Change Password" />
            <SecurityItem title="Multi-Factor Authentication (MFA)" desc="SMS verification enabled · (555) 342-1890" action="Manage MFA" status="Enabled" />
            <SecurityItem title="Login History" desc="Last login: March 28, 2026 at 9:42 AM" action="View History" />
            <SecurityItem title="Active Sessions" desc="1 active session" action="View Sessions" />
          </div>
          <div style={{ marginTop: 24, background: '#F8FAFC', borderRadius: 8, padding: '14px 18px', fontSize: 12, color: '#64748b' }}>
            🔒 This portal is protected under HIPAA, MARS-E, IRS 1075, and NIST 800-63 standards. All login activity is logged and may be audited.
          </div>
        </div>
      )}

      {/* Language tab */}
      {activeTab === 'language' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 8 }}>Language Preference</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Select your preferred language. All portal content, notifications, and instructions will be displayed in your selected language.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['en', 'English'], ['es', 'Español'], ['zh', '中文 (Chinese)'], ['vi', 'Tiếng Việt'], ['ar', 'العربية (Arabic)'], ['fr', 'Français']].map(([code, label]) => (
              <button key={code} style={{
                padding: '12px 16px', border: code === 'en' ? '2px solid #002677' : '1.5px solid #E2E8F0',
                borderRadius: 8, background: code === 'en' ? '#EFF6FF' : '#fff',
                color: code === 'en' ? '#002677' : '#374151', fontSize: 14, fontWeight: code === 'en' ? 700 : 400,
                cursor: 'pointer', textAlign: 'left',
              }}>
                {code === 'en' && '✓ '}{label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 16 }}>Content is provided through state-configured translation files. Machine translation is not used.</p>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, type = 'text', onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = '#196ECF'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  )
}

function SecurityItem({ title, desc, action, status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          {status && <span style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{status}</span>}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{desc}</div>
      </div>
      <button style={{ padding: '7px 14px', background: '#fff', color: '#002677', border: '1.5px solid #002677', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{action}</button>
    </div>
  )
}
