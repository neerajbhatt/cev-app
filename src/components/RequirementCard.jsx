import { EPIC_COLORS } from './Filters'

export default function RequirementCard({ item }) {
  const color = EPIC_COLORS[item.epic] || '#1F4E79'

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      padding: '18px 20px',
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          background: color,
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 10px',
          borderRadius: 20,
          letterSpacing: 0.3,
          whiteSpace: 'nowrap',
        }}>{item.epic}</span>
        <span style={{
          background: '#F0FDF4',
          color: '#166534',
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 10px',
          borderRadius: 20,
          border: '1px solid #BBF7D0',
          whiteSpace: 'nowrap',
        }}>{item.userStory}</span>
        <span style={{
          marginLeft: 'auto',
          background: '#FEF9C3',
          color: '#92400E',
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 6,
          border: '1px solid #FDE68A',
          whiteSpace: 'nowrap',
        }}>Req {item.reqNum}</span>
        <span style={{
          background: '#EFF6FF',
          color: '#1D4ED8',
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 6,
          border: '1px solid #BFDBFE',
          whiteSpace: 'nowrap',
        }}>{item.phase}</span>
      </div>

      {/* User story description */}
      {item.storyDesc && (
        <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', lineHeight: 1.5 }}>
          {item.storyDesc}
        </p>
      )}

      {/* Requirements text */}
      <div style={{ fontSize: 13.5, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
        {item.requirements}
      </div>
    </div>
  )
}
