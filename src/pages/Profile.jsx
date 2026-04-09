import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../i18n'
import { api } from '../api'

export default function Profile() {
  const { user, delegates, addDelegate, removeDelegate } = useApp()
  const { t, setLang } = useI18n()
  const [activeTab, setActiveTab] = useState('profile')
  const [showDelegateForm, setShowDelegateForm] = useState(false)
  const [delegateForm, setDelegateForm] = useState({ name: '', relation: '', email: '', permissions: [] })
  const [saved, setSaved] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    language: user?.language || 'en',
  })

  // Security modals
  const [modal, setModal] = useState(null) // 'password' | 'mfa' | 'history' | 'sessions'
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [mfaEnabled, setMfaEnabled] = useState(!!user?.mfa_enabled)
  const [mfaPhone, setMfaPhone] = useState(user?.mfa_phone || '')
  const [mfaMsg, setMfaMsg] = useState('')
  const [loginHistory, setLoginHistory] = useState([])
  const [sessions, setSessions] = useState([])
  const [loadingModal, setLoadingModal] = useState(false)

  // Language state
  const [selectedLang, setSelectedLang] = useState(user?.language || 'en')
  const [langSaved, setLangSaved] = useState(false)

  const handleSave = async () => {
    try {
      await api.updateProfile({
        name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        phone: profileForm.phone,
        dob: profileForm.dob,
        language: profileForm.language,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert(e.message)
    }
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

  const openModal = async (type) => {
    setModal(type)
    setPwError('')
    setPwSuccess('')
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setMfaMsg('')
    if (type === 'mfa') {
      try {
        const data = await api.getMfa()
        setMfaEnabled(!!data.mfa_enabled)
        setMfaPhone(data.mfa_phone || '')
      } catch {}
    }
    if (type === 'history') {
      setLoadingModal(true)
      try { setLoginHistory(await api.getLoginHistory()) } catch {}
      setLoadingModal(false)
    }
    if (type === 'sessions') {
      setLoadingModal(true)
      try { setSessions(await api.getSessions()) } catch {}
      setLoadingModal(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError('')
    setPwSuccess('')
    if (!pwForm.currentPassword || !pwForm.newPassword) return setPwError('All fields are required')
    if (pwForm.newPassword.length < 8) return setPwError('New password must be at least 8 characters')
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('New passwords do not match')
    try {
      await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwSuccess('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) {
      setPwError(e.message)
    }
  }

  const handleMfaSave = async () => {
    setMfaMsg('')
    try {
      await api.updateMfa({ enabled: mfaEnabled, phone: mfaPhone })
      setMfaMsg('MFA settings updated successfully!')
    } catch (e) {
      setMfaMsg(e.message)
    }
  }

  const handleRevokeSession = async (id) => {
    try {
      await api.revokeSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      alert(e.message)
    }
  }

  const handleLangSelect = async (code) => {
    setSelectedLang(code)
    setLang(code)
    try {
      await api.updateProfile({ language: code })
      setLangSaved(true)
      setTimeout(() => setLangSaved(false), 2500)
    } catch (e) {
      alert(e.message)
    }
  }

  const passwordAge = user?.password_changed_at
    ? Math.floor((Date.now() - new Date(user.password_changed_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const TABS = ['profile', 'delegation', 'security', 'language']

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#002677' }}>{t('profile.title')}</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{t('profile.desc')}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid #E2E8F0', marginBottom: 24 }}>
        {TABS.map(tb => (
          <button key={tb} onClick={() => setActiveTab(tb)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            color: activeTab === tb ? '#002677' : '#94a3b8',
            borderBottom: activeTab === tb ? '2px solid #002677' : '2px solid transparent',
            marginBottom: -2,
          }}>{
            tb === 'profile' ? t('profile.tab.profile') :
            tb === 'delegation' ? t('profile.tab.delegation') :
            tb === 'security' ? t('profile.tab.security') :
            t('profile.tab.language')
          }</button>
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
            <Field label={t('profile.firstName')} value={profileForm.firstName} onChange={v => setProfileForm(f => ({ ...f, firstName: v }))} />
            <Field label={t('profile.lastName')} value={profileForm.lastName} onChange={v => setProfileForm(f => ({ ...f, lastName: v }))} />
            <Field label={t('profile.email')} value={user.email} type="email" disabled />
            <Field label={t('profile.phone')} value={profileForm.phone} type="tel" onChange={v => setProfileForm(f => ({ ...f, phone: v }))} />
            <Field label={t('profile.dob')} value={profileForm.dob} type="date" onChange={v => setProfileForm(f => ({ ...f, dob: v }))} />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('profile.language')}</label>
              <select value={profileForm.language} onChange={e => setProfileForm(f => ({ ...f, language: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="zh">中文</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {saved && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#166534', fontWeight: 600, marginTop: 16 }}>{t('profile.saved')}</div>}

          <button onClick={handleSave} style={{ marginTop: 20, padding: '10px 28px', background: '#002677', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {t('profile.saveChanges')}
          </button>
        </div>
      )}

      {/* Delegation tab */}
      {activeTab === 'delegation' && (
        <div>
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#1E40AF' }}>
            You can authorize a caregiver, family member, or representative to access your portal on your behalf. All actions taken by a delegate are clearly labeled in audit logs.
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
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 20 }}>{t('profile.securityTitle')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SecurityItem title={t('profile.password')} desc={passwordAge != null ? t('profile.lastChanged', passwordAge) : t('profile.neverChanged')} action={t('profile.changePassword')} onClick={() => openModal('password')} />
            <SecurityItem title={t('profile.mfa')} desc={user?.mfa_enabled ? `${t('profile.mfaEnabled')} · ${user.mfa_phone || ''}` : t('profile.mfaNotEnabled')} action={t('profile.manageMfa')} onClick={() => openModal('mfa')} status={user?.mfa_enabled ? t('profile.enabled') : t('profile.disabled')} statusColor={user?.mfa_enabled ? undefined : '#DC2626'} />
            <SecurityItem title={t('profile.loginHistory')} desc={t('profile.viewRecentLogins')} action={t('profile.viewHistory')} onClick={() => openModal('history')} />
            <SecurityItem title={t('profile.activeSessions')} desc={t('profile.manageSessions')} action={t('profile.viewSessions')} onClick={() => openModal('sessions')} />
          </div>
          <div style={{ marginTop: 24, background: '#F8FAFC', borderRadius: 8, padding: '14px 18px', fontSize: 12, color: '#64748b' }}>
            {t('profile.securityFooter')}
          </div>
        </div>
      )}

      {/* Language tab */}
      {activeTab === 'language' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 8 }}>{t('profile.langTitle')}</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{t('profile.langDesc')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['en', 'English'], ['es', 'Español'], ['zh', '中文 (Chinese)'], ['vi', 'Tiếng Việt'], ['ar', 'العربية (Arabic)'], ['fr', 'Français']].map(([code, label]) => (
              <button key={code} onClick={() => handleLangSelect(code)} style={{
                padding: '12px 16px', border: code === selectedLang ? '2px solid #002677' : '1.5px solid #E2E8F0',
                borderRadius: 8, background: code === selectedLang ? '#EFF6FF' : '#fff',
                color: code === selectedLang ? '#002677' : '#374151', fontSize: 14, fontWeight: code === selectedLang ? 700 : 400,
                cursor: 'pointer', textAlign: 'left',
              }}>
                {code === selectedLang && '✓ '}{label}
              </button>
            ))}
          </div>
          {langSaved && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#166534', fontWeight: 600, marginTop: 16 }}>{t('profile.langSaved')}</div>}
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 16 }}>{t('profile.langNote')}</p>
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px', width: 480, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>

            {/* Change Password Modal */}
            {modal === 'password' && (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#002677', marginBottom: 20 }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Current Password" type="password" value={pwForm.currentPassword} onChange={v => setPwForm(f => ({ ...f, currentPassword: v }))} />
                  <Field label="New Password" type="password" value={pwForm.newPassword} onChange={v => setPwForm(f => ({ ...f, newPassword: v }))} />
                  <Field label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={v => setPwForm(f => ({ ...f, confirmPassword: v }))} />
                </div>
                {pwError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#DC2626', fontWeight: 600, marginTop: 14 }}>{pwError}</div>}
                {pwSuccess && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#166534', fontWeight: 600, marginTop: 14 }}>{pwSuccess}</div>}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={handleChangePassword} style={btnPrimary}>Update Password</button>
                  <button onClick={() => setModal(null)} style={btnSecondary}>Cancel</button>
                </div>
              </>
            )}

            {/* Manage MFA Modal */}
            {modal === 'mfa' && (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#002677', marginBottom: 20 }}>Manage Multi-Factor Authentication</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: '14px 16px', background: '#F8FAFC', borderRadius: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                    <input type="checkbox" checked={mfaEnabled} onChange={e => setMfaEnabled(e.target.checked)} style={{ width: 18, height: 18 }} />
                    Enable SMS Verification
                  </label>
                </div>
                {mfaEnabled && (
                  <Field label="Phone Number for SMS Codes" type="tel" value={mfaPhone} onChange={v => setMfaPhone(v)} />
                )}
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 12 }}>When enabled, you will receive a one-time code via SMS each time you log in.</p>
                {mfaMsg && <div style={{ background: mfaMsg.includes('success') ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${mfaMsg.includes('success') ? '#BBF7D0' : '#FECACA'}`, borderRadius: 8, padding: '10px 16px', fontSize: 13, color: mfaMsg.includes('success') ? '#166534' : '#DC2626', fontWeight: 600, marginTop: 14 }}>{mfaMsg}</div>}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={handleMfaSave} style={btnPrimary}>Save MFA Settings</button>
                  <button onClick={() => setModal(null)} style={btnSecondary}>Cancel</button>
                </div>
              </>
            )}

            {/* Login History Modal */}
            {modal === 'history' && (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#002677', marginBottom: 20 }}>Login History</h3>
                {loadingModal ? <p style={{ color: '#64748b', fontSize: 13 }}>Loading...</p> : (
                  loginHistory.length === 0 ? <p style={{ color: '#64748b', fontSize: 13 }}>No login history available.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {loginHistory.map(h => (
                        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, borderLeft: `3px solid ${h.status === 'success' ? '#22C55E' : '#EF4444'}` }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{h.user_agent || 'Unknown device'}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>IP: {h.ip || 'Unknown'} · {new Date(h.created_at).toLocaleString()}</div>
                          </div>
                          <span style={{
                            background: h.status === 'success' ? '#F0FDF4' : '#FEF2F2',
                            color: h.status === 'success' ? '#166534' : '#DC2626',
                            border: `1px solid ${h.status === 'success' ? '#BBF7D0' : '#FECACA'}`,
                            borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                          }}>{h.status === 'success' ? 'Success' : 'Failed'}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={() => setModal(null)} style={btnSecondary}>Close</button>
                </div>
              </>
            )}

            {/* Sessions Modal */}
            {modal === 'sessions' && (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#002677', marginBottom: 20 }}>Active Sessions</h3>
                {loadingModal ? <p style={{ color: '#64748b', fontSize: 13 }}>Loading...</p> : (
                  sessions.length === 0 ? <p style={{ color: '#64748b', fontSize: 13 }}>No active sessions.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {sessions.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: s.is_current ? '1.5px solid #002677' : '1px solid #E2E8F0' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                              {s.user_agent || 'Unknown device'}
                              {s.is_current && <span style={{ background: '#EFF6FF', color: '#002677', border: '1px solid #BFDBFE', borderRadius: 10, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>Current</span>}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              IP: {s.ip || 'Unknown'} · Last active: {new Date(s.last_active).toLocaleString()}
                            </div>
                          </div>
                          {!s.is_current && (
                            <button onClick={() => handleRevokeSession(s.id)} style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={() => setModal(null)} style={btnSecondary}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const btnPrimary = { padding: '9px 20px', background: '#002677', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const btnSecondary = { padding: '9px 16px', background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }

function Field({ label, value, type = 'text', onChange, disabled }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: disabled ? '#F8FAFC' : '#fff' }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = '#196ECF' }}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  )
}

function SecurityItem({ title, desc, action, status, statusColor, onClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          {status && <span style={{ background: statusColor ? '#FEF2F2' : '#F0FDF4', color: statusColor || '#166534', border: `1px solid ${statusColor ? '#FECACA' : '#BBF7D0'}`, borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{status}</span>}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{desc}</div>
      </div>
      <button onClick={onClick} style={{ padding: '7px 14px', background: '#fff', color: '#002677', border: '1.5px solid #002677', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{action}</button>
    </div>
  )
}
