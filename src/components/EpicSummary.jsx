import { EPIC_COLORS } from './Filters'
import { requirements } from '../data/requirements'

export default function EpicSummary({ onSelectEpic, activeEpic }) {
  const epicCounts = {}
  requirements.forEach(r => {
    epicCounts[r.epic] = (epicCounts[r.epic] || 0) + 1
  })

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 32px 0' }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Object.entries(epicCounts).map(([epic, count]) => {
          const color = EPIC_COLORS[epic] || '#1F4E79'
          const isActive = activeEpic === epic
          return (
            <button
              key={epic}
              onClick={() => onSelectEpic(isActive ? '' : epic)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 8,
                border: `2px solid ${isActive ? color : '#e2e8f0'}`,
                background: isActive ? color : '#fff',
                color: isActive ? '#fff' : '#374151',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                transition: 'all 0.15s',
                boxShadow: isActive ? `0 2px 8px ${color}44` : 'none',
              }}
            >
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : color,
                color: '#fff',
                borderRadius: 20,
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 700,
              }}>{count}</span>
              {epic}
            </button>
          )
        })}
      </div>
    </div>
  )
}
