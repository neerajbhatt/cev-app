import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, register } = useApp()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', dob: '', ssn: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return }
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.dob) { setError('Please fill in all required fields.'); return }
      setError(''); setStep(2)
    } else {
      if (!form.email || !form.password || !form.phone) { setError('Please fill in all required fields.'); return }
      setError('')
      setLoading(true)
      try {
        await register({ firstName: form.firstName, lastName: form.lastName, dob: form.dob, email: form.email, password: form.password, phone: form.phone })
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.')
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
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>State Benefits Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>Continuous Eligibility Verification</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setStep(1); setError('') }} style={{
                flex: 1, padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                color: tab === t ? '#002677' : '#94a3b8',
                borderBottom: tab === t ? '2px solid #002677' : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{t === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          <div style={{ padding: '28px 28px 24px' }}>
            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  Sign in with your registered email and password to access your benefits portal.
                </p>
                <Field label="Email Address" type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@email.com" />
                <Field label="Password" type="password" value={form.password} onChange={v => set('password', v)} placeholder="••••••••" />
                <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
                  <a href="#" style={{ fontSize: 12, color: '#196ECF', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                {error && <ErrorMsg msg={error} />}
                <SubmitBtn label={loading ? 'Signing in…' : 'Sign In'} disabled={loading} />
                <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
                  Demo: demo@cev.gov / demo1234
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[1, 2].map(s => (
                    <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? '#002677' : '#e2e8f0', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Step {step} of 2: {step === 1 ? 'Personal Information' : 'Account Setup'}</p>

                {step === 1 ? (<>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Field label="First Name" value={form.firstName} onChange={v => set('firstName', v)} placeholder="First" />
                    <Field label="Last Name" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Last" />
                  </div>
                  <Field label="Date of Birth" type="date" value={form.dob} onChange={v => set('dob', v)} />
                  <Field label="SSN (last 4)" value={form.ssn} onChange={v => set('ssn', v)} placeholder="####" maxLength={4} />
                </>) : (<>
                  <Field label="Email Address" type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@email.com" />
                  <Field label="Mobile Phone" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="(555) 000-0000" />
                  <Field label="Create Password" type="password" value={form.password} onChange={v => set('password', v)} placeholder="Min. 8 characters" />
                </>)}

                {error && <ErrorMsg msg={error} />}
                <SubmitBtn label={loading ? 'Creating account…' : step === 1 ? 'Continue →' : 'Create Account'} disabled={loading} />
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 20 }}>
          Protected by HIPAA · MARS-E · NIST 800-63
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
