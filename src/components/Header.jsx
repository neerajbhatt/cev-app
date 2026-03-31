export default function Header({ total, filtered }) {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #002677 0%, #196ECF 100%)',
      color: '#fff',
      padding: '24px 32px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: '#FF6900',
            borderRadius: 8,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}>📋</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.3 }}>
              CEV Requirements Portal
            </h1>
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
              Continuous Eligibility Verification — Accelerator Requirements
              &nbsp;·&nbsp;
              <span style={{ color: '#FF6900', fontWeight: 600 }}>
                {filtered} of {total} requirements
              </span>
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
