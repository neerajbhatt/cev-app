import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useI18n } from '../i18n'

const DOC_TYPES = ['CE Activity Proof', 'Exemption Documentation', 'Income Verification', 'Identity Documentation', 'Hardship Documentation', 'Training Enrollment Letter', 'Employer Verification Form', 'Appeals Related']

const STATUS_STYLE = {
  'Accepted':              { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', icon: '✅' },
  'Processing':            { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', icon: '🔄' },
  'Uploaded':              { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0', icon: '📤' },
  'Sent to State':         { bg: '#FAF5FF', color: '#6D28D9', border: '#DDD6FE', icon: '📨' },
  'Additional Action Required': { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', icon: '⚠️' },
}

export default function Documents() {
  const { documents, addDocument, REQUIRED_DOCS } = useApp()
  const { t } = useI18n()
  const [dragging, setDragging] = useState(false)
  const [form, setForm] = useState({ type: '', month: 'Mar 2026', notes: '' })
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFiles = (files) => {
    const file = files[0]
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/tiff']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|heic|tiff)$/i)) {
      setError(t('doc.typeNotSupported'))
      return
    }
    const maxMB = 25
    if (file.size > maxMB * 1024 * 1024) {
      setError(t('doc.sizeExceeds', maxMB))
      return
    }
    setError('')
    setPreview(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleUpload = async () => {
    if (!preview) { setError(t('doc.selectFile')); return }
    if (!form.type) { setError(t('doc.selectDocType')); return }
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', preview)
      fd.append('type', form.type)
      fd.append('month', form.month)
      await addDocument(fd)
      setPreview(null)
      setForm({ type: '', month: 'Mar 2026', notes: '' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err.message || t('doc.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#002677' }}>{t('doc.title')}</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          {t('doc.desc')}
        </p>
      </div>

      {/* Required docs reminder */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: '#92400E', fontSize: 13, marginBottom: 8 }}>{t('doc.requiredFor')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {REQUIRED_DOCS.map(d => (
            <span key={d} style={{ background: '#fff', border: '1px solid #FDE68A', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#78350F' }}>📎 {d}</span>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#002677', marginBottom: 16 }}>{t('doc.uploadTitle')}</h2>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? '#196ECF' : preview ? '#22C55E' : '#CBD5E1'}`,
            borderRadius: 12,
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? '#EFF6FF' : preview ? '#F0FDF4' : '#F8FAFC',
            transition: 'all 0.2s',
            marginBottom: 16,
          }}
        >
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.tiff" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          {preview ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{preview.name.endsWith('.pdf') ? '📄' : '🖼️'}</div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>{preview.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {preview.size > 1024 * 1024 ? `${(preview.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(preview.size / 1024)} KB`}
              </div>
              <button onClick={e => { e.stopPropagation(); setPreview(null) }} style={{ marginTop: 10, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>{t('act.remove')}</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 10 }}>☁️</div>
              <div style={{ fontWeight: 700, color: '#374151', fontSize: 14 }}>{t('doc.dragDrop')}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{t('doc.fileTypes')}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t('doc.mobileCapture')}</div>
            </>
          )}
        </div>

        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 14 }}>{error}</div>}

        {/* Form fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('doc.docType')}</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
              <option value="">{t('doc.selectType')}</option>
              {DOC_TYPES.map(tp => <option key={tp}>{tp}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('doc.forMonth')}</label>
            <select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
              {['Mar 2026', 'Feb 2026', 'Jan 2026', 'Dec 2025'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 14 }}>
            {t('doc.success')}
          </div>
        )}

        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#64748b', marginBottom: 16 }}>
          {t('doc.secureNote')}
        </div>

        <button onClick={handleUpload} disabled={uploading} style={{
          padding: '10px 28px', background: uploading ? '#94a3b8' : '#002677', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
        }}>
          {uploading ? t('doc.uploading') : t('doc.uploadBtn')}
        </button>
      </div>

      {/* Document list */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#002677' }}>{t('doc.myDocs')}</h3>
        </div>
        {documents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{t('doc.noDocs')}</div>
        ) : (
          documents.map(doc => {
            const s = STATUS_STYLE[doc.status] || STATUS_STYLE['Uploaded']
            return (
              <div key={doc.id} style={{ padding: '14px 24px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, background: '#F1F5F9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {doc.name.endsWith('.pdf') ? '📄' : '🖼️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{doc.type} · {doc.month} · {doc.size}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t('doc.uploaded')} {doc.uploadedAt}</div>
                </div>
                <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {s.icon} {doc.status}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
