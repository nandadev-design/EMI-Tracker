interface StatCardProps {
  label: string
  value: string
  subtitle: string
  accentColor?: string
}

export function StatCard({ label, value, subtitle, accentColor='var(--color-primary)' }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)', fontWeight:600, margin:0 }}>{label}</p>
      <p style={{ fontSize:28, fontFamily:'var(--font-mono)', color:'var(--color-foreground)', margin:0, letterSpacing:'-0.04em', fontWeight:400 }}>{value}</p>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:accentColor, flexShrink:0 }} />
        <span style={{ fontSize:12, color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)' }}>{subtitle}</span>
      </div>
    </div>
  )
}
