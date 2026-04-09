import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../i18n'

const ACTIVITY_TYPES = ['Employment', 'Self-Employment', 'Vocational Training', 'Education', 'Volunteering', 'Job Search', 'Workforce Program', 'SNAP/TANF Work Program']
const MONTHS_OPEN = ['Mar 2026']

const STATUS_STYLE = {
  'Compliant (Verified)':  { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  'Compliant (Exempt)':    { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  'Pending Member Action': { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  'Non-Compliant':         { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  'Compliant (Hardship)':  { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
}

export default function ActivityReporting() {
  const { compliance, activities, addActivity, deleteActivity } = useApp()
  const { t } = useI18n()
  const [selectedMonth, setSelectedMonth] = useState('Mar 2026')
  const [showForm, setShowForm] = useState(false)
  const [showExemption, setShowExemption] = useState(false)
  const [form, setForm] = useState({ type: '', employer: '', hours: '', startDate: '', endDate: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const monthActivities = activities.filter(a => a.month === selectedMonth)
  const totalHours = monthActivities.reduce((s, a) => s + Number(a.hours), 0)
  const monthData = compliance.find(c => c.month === selectedMonth)
  const required = monthData?.required || 80
  const progress = Math.min(100, Math.round((totalHours / required) * 100))
  const isOpen = MONTHS_OPEN.includes(selectedMonth)

  const validate = () => {
    const e = {}
    if (!form.type) e.type = t('act.typeRequired')
    if (!form.hours || isNaN(form.hours) || Number(form.hours) <= 0) e.hours = t('act.validHours')
    if (Number(form.hours) > 744) e.hours = t('act.maxHours')
    if (!form.startDate) e.startDate = t('act.startRequired')
    if (!form.endDate) e.endDate = t('act.endRequired')
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = t('act.endAfterStart')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    addActivity({ ...form, month: selectedMonth })
    setForm({ type: '', employer: '', hours: '', startDate: '', endDate: '', notes: '' })
    setErrors({})
    setShowForm(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#002677' }}>{t('act.title')}</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          {t('act.desc')}
        </p>
      </div>

      {/* Month selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {compliance.map(c => {
          const s = STATUS_STYLE[c.status] || STATUS_STYLE['Pending Member Action']
          const isSelected = selectedMonth === c.month
          return (
            <button key={c.month} onClick={() => setSelectedMonth(c.month)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: isSelected ? '#002677' : '#fff',
              color: isSelected ? '#fff' : '#374151',
              border: isSelected ? 'none' : `1.5px solid ${s.border}`,
              boxShadow: isSelected ? '0 2px 8px rgba(0,38,119,0.3)' : 'none',
            }}>
              {c.month}
              {MONTHS_OPEN.includes(c.month) && <span style={{ marginLeft: 6, fontSize: 10, background: '#22C55E', color: '#fff', borderRadius: 10, padding: '1px 6px' }}>OPEN</span>}
            </button>
          )
        })}
      </div>

      {/* Month summary */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#002677' }}>{selectedMonth}</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{totalHours} {t('act.ofRequired', required)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: progress >= 100 ? '#22C55E' : '#FF6900' }}>{progress}%</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{t('act.complete')}</div>
          </div>
        </div>
        <div style={{ background: '#F1F5F9', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: progress >= 100 ? '#22C55E' : '#FF6900', borderRadius: 8, transition: 'width 0.4s' }} />
        </div>
        {monthData && (
          <div style={{ display: 'inline-block', marginTop: 8, background: (STATUS_STYLE[monthData.status] || {}).bg || '#F1F5F9', color: (STATUS_STYLE[monthData.status] || {}).color || '#374151', border: `1px solid ${(STATUS_STYLE[monthData.status] || {}).border || '#e2e8f0'}`, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
            {monthData.status}
          </div>
        )}
      </div>

      {/* Success toast */}
      {submitted && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#166534', fontWeight: 600, fontSize: 14 }}>
          {t('act.success')}
        </div>
      )}

      {/* Actions */}
      {isOpen && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={() => { setShowForm(!showForm); setShowExemption(false) }} style={{
            padding: '9px 20px', background: '#002677', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>{t('act.addActivity')}</button>
          <button onClick={() => { setShowExemption(!showExemption); setShowForm(false) }} style={{
            padding: '9px 20px', background: '#fff', color: '#7C3AED', border: '1.5px solid #7C3AED',
            borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>{t('act.declareExemption')}</button>
          <button style={{
            padding: '9px 20px', background: '#fff', color: '#0891B2', border: '1.5px solid #0891B2',
            borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>{t('act.reportHardship')}</button>
        </div>
      )}

      {/* Add Activity Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 20, border: '1.5px solid #BFDBFE' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 16 }}>{t('act.addActivityTitle')} — {selectedMonth}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label={t('act.activityType')} error={errors.type}>
                <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
                  <option value="">{t('act.selectType')}</option>
                  {ACTIVITY_TYPES.map(tp => <option key={tp}>{tp}</option>)}
                </select>
              </FormField>
              <FormField label={t('act.employer')} error={errors.employer}>
                <input style={inputStyle} value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="e.g. City Market, Community College" />
              </FormField>
              <FormField label={t('act.hours')} error={errors.hours}>
                <input style={inputStyle} type="number" min="0.5" max="744" step="0.5" value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="e.g. 40" />
              </FormField>
              <div />
              <FormField label={t('act.startDate')} error={errors.startDate}>
                <input style={inputStyle} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </FormField>
              <FormField label={t('act.endDate')} error={errors.endDate}>
                <input style={inputStyle} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </FormField>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField label={t('act.notes')}>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional details..." />
                </FormField>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14, background: '#F8FAFC', padding: '8px 12px', borderRadius: 6 }}>
              {t('act.hoursInfo')}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ padding: '9px 24px', background: '#002677', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{t('act.save')}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 16px', background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>{t('act.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Exemption panel */}
      {showExemption && (
        <div style={{ background: '#FAF5FF', border: '1.5px solid #DDD6FE', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#6D28D9', marginBottom: 12 }}>{t('act.exemptionTitle')}</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>{t('act.exemptionDesc')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[t('exempt.medical'), t('exempt.caregiver'), t('exempt.student'), t('exempt.tribal'), t('exempt.pregnant'), t('exempt.domestic')].map(ex => (
              <button key={ex} style={{ padding: '10px 14px', background: '#fff', border: '1.5px solid #DDD6FE', borderRadius: 8, fontSize: 13, color: '#6D28D9', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                + {ex}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>{t('act.exemptionNote')}</p>
        </div>
      )}

      {/* Activities list */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#002677' }}>{t('act.activities')} — {selectedMonth}</h3>
          <span style={{ fontSize: 13, color: '#64748b' }}>{monthActivities.length} {t('act.totalHours', totalHours)}</span>
        </div>
        {monthActivities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <p style={{ fontWeight: 600 }}>{t('act.noActivities')}</p>
            {isOpen && <p style={{ fontSize: 13, marginTop: 4 }}>{t('act.getStarted')}</p>}
          </div>
        ) : (
          monthActivities.map(act => (
            <div key={act.id} style={{ padding: '14px 24px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, background: '#EFF6FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {act.type === 'Employment' ? '💼' : act.type.includes('Training') ? '🎓' : act.type === 'Volunteering' ? '🤝' : '📚'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{act.type}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{act.employer} · {act.startDate} to {act.endDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#002677' }}>{act.hours}h</div>
                <span style={{ fontSize: 11, background: act.verified ? '#F0FDF4' : '#FFFBEB', color: act.verified ? '#166534' : '#92400E', border: `1px solid ${act.verified ? '#BBF7D0' : '#FDE68A'}`, borderRadius: 10, padding: '1px 8px', fontWeight: 600 }}>
                  {act.verified ? `✓ ${t('act.verified')}` : t('act.pending')}
                </span>
              </div>
              {isOpen && (
                <button onClick={() => deleteActivity(act.id)} style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>{t('act.remove')}</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff',
}

function FormField({ label, children, error }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>{error}</div>}
    </div>
  )
}
