const EPIC_COLORS = {
  'Identity & Access Accelerator': '#1F4E79',
  'CE Compliance Accelerator': '#276749',
  'Document Upload & Validation Accelerator': '#744210',
  'Notifications & Messaging Accelerator': '#6B21A8',
  'Eligibility System & Data Exchange': '#9B1C1C',
  'Analytics & Oversight': '#1E40AF',
}

export { EPIC_COLORS }

export default function Filters({ search, setSearch, epic, setEpic, story, setStory, epics, stories, onClear }) {
  const hasFilters = search || epic || story

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search requirements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              border: '1.5px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#2E75B6'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Epic filter */}
        <select
          value={epic}
          onChange={e => { setEpic(e.target.value); setStory('') }}
          style={{
            flex: '1 1 220px',
            padding: '8px 12px',
            border: '1.5px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            background: '#fff',
            cursor: 'pointer',
            minWidth: 180,
          }}
        >
          <option value="">All Epics</option>
          {epics.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        {/* User Story filter */}
        <select
          value={story}
          onChange={e => setStory(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '8px 12px',
            border: '1.5px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            background: '#fff',
            cursor: 'pointer',
            minWidth: 160,
          }}
        >
          <option value="">All User Stories</option>
          {stories.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={onClear}
            style={{
              padding: '8px 16px',
              background: '#fee2e2',
              color: '#b91c1c',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  )
}
