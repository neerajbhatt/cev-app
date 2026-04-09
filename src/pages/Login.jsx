import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../i18n'

export default function Login() {
  const { login, register } = useApp()
  const { t } = useI18n()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', dob: '', ssn: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError(t('login.emailRequired')); return }
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      setError(err.message || t('login.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.dob) { setError(t('login.fieldsRequired')); return }
      setError(''); setStep(2)
    } else {
      if (!form.email || !form.password || !form.phone) { setError(t('login.fieldsRequired')); return }
      setError('')
      setLoading(true)
      try {
        await register({ firstName: form.firstName, lastName: form.lastName, dob: form.dob, email: form.email, password: form.password, phone: form.phone })
      } catch (err) {
        setError(err.message || t('login.registerFailed'))
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #002677 0%, #196ECF 60%, #FF6900 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: '#FF6900', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(255,105,0,0.4)'
          }}>🏛️</div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>{t('login.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{t('login.subtitle')}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            {['login', 'register'].map(tb => (
              <button key={tb} onClick={() => { setTab(tb); setStep(1); setError('') }} style={{
                flex: 1, padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                color: tab === tb ? '#002677' : '#94a3b8',
                borderBottom: tab === tb ? '2px solid #002677' : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{tb === 'login' ? t('login.signIn') : t('login.createAccount')}</button>
            ))}
          </div>

          <div style={{ padding: '28px 28px 24px' }}>
            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  {t('login.signInDesc')}
                </p>
                <Field label={t('login.email')} type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@email.com" />
                <Field label={t('login.password')} type="password" value={form.password} onChange={v => set('password', v)} placeholder="••••••••" />
                <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
                  <a href="#" style={{ fontSize: 12, color: '#196ECF', textDecoration: 'none' }}>{t('login.forgotPassword')}</a>
                </div>
                {error && <ErrorMsg msg={error} />}
                <SubmitBtn label={loading ? t('login.signingIn') : t('login.signIn')} disabled={loading} />
                <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
                  {t('login.demo')}
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[1, 2].map(s => (
                    <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? '#002677' : '#e2e8f0', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{t('login.step')} {step} {t('login.of')} 2: {step === 1 ? t('login.personalInfo') : t('login.accountSetup')}</p>

                {step === 1 ? (<>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Field label={t('login.firstName')} value={form.firstName} onChange={v => set('firstName', v)} placeholder="First" />
                    <Field label={t('login.lastName')} value={form.lastName} onChange={v => set('lastName', v)} placeholder="Last" />
                  </div>
                  <Field label={t('login.dob')} type="date" value={form.dob} onChange={v => set('dob', v)} />
                  <Field label={t('login.ssn')} value={form.ssn} onChange={v => set('ssn', v)} placeholder="####" maxLength={4} />
                </>) : (<>
                  <Field label={t('login.email')} type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@email.com" />
                  <Field label={t('login.phone')} type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="(555) 000-0000" />
                  <Field label={t('login.createPassword')} type="password" value={form.password} onChange={v => set('password', v)} placeholder="Min. 8 characters" />
                </>)}

                {error && <ErrorMsg msg={error} />}
                <SubmitBtn label={loading ? t('login.creatingAccount') : step === 1 ? t('login.continue') : t('login.createAccount')} disabled={loading} />
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 20 }}>
          {t('login.protected')}
        </p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, maxLength }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder} maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
          borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#196ECF'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  )
}

function ErrorMsg({ msg }) {
  return <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#B91C1C', marginBottom: 12 }}>{msg}</div>
}

function SubmitBtn({ label, disabled }) {
  return (
    <button type="submit" disabled={disabled} style={{
      width: '100%', padding: '11px', background: disabled ? '#94a3b8' : 'linear-gradient(135deg, #002677, #196ECF)',
      color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 4,
    }}>{label}</button>
  )
}
