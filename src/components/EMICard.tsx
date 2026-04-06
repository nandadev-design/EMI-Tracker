import { Progress } from '@/components/ui/Progress'
import { payStatus, fmt, ord } from '@/hooks/useTracker'
import type { EnrichedItem } from '@/types'

function Avatar({ name }: { name: string }) {
  const init = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-muted)', color:'var(--color-foreground)', fontFamily:'var(--font-body)', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {init}
    </div>
  )
}

const CalIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{flexShrink:0}}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
const ClkIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
const UndoIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>

interface Props {
  item: EnrichedItem
  index: number
  onPay: (item: EnrichedItem) => void
  onUndo: (item: EnrichedItem) => void
  onEdit: (item: EnrichedItem) => void
  onDelete: (item: EnrichedItem) => void
}

export function EMICard({ item, index, onPay, onUndo, onEdit, onDelete }: Props) {
  const isEMI   = item.type === 'EMI'
  const closed  = item.status === 'Closed'
  const bal     = item.bal ?? 0
  const paidOff = isEMI && bal <= 0
  const canUndo = item.hist.length > 0
  const ps      = !closed ? payStatus(item.dueDay, item.lastPaid) : null
  const base    = item.baseBalance ?? 0
  const ratio   = isEMI && base > 0 ? Math.min(1, (base-bal)/base) : 0
  const moLeft  = isEMI && bal>0 && item.amount>0 ? Math.ceil(bal/item.amount) : 0
  const pct     = Math.round(ratio*100)
  const note    = moLeft > 0 ? `~${moLeft} mo` : ''

  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: closed ? 0.72 : 1,
        transition: 'all 0.2s',
        animation: `fade-up 0.34s ease ${index*0.04}s both`,
      }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.04)';e.currentTarget.style.transform='translateY(-1px)'}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}
    >
      {/* header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'20px 20px 16px', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
          <Avatar name={item.name} />
          <div style={{ minWidth:0, display:'flex', flexDirection:'column', gap:2 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:400, fontFamily:'var(--font-body)', color:'var(--color-foreground)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</h3>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <span style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'var(--font-body)', color: isEMI?'var(--color-primary)':closed?'var(--color-muted-foreground)':'#8b5cf6' }}>{item.type}</span>
              {closed && <span style={{ fontSize:10, fontWeight:600, fontFamily:'var(--font-body)', color:'var(--color-muted-foreground)' }}>Closed</span>}
              {item.rate && <span style={{ fontSize:10, fontWeight:600, fontFamily:'var(--font-body)', color:'var(--color-warning)' }}>{item.rate.includes('%')?item.rate:`${item.rate}%`} p.a.</span>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          <button onClick={()=>onEdit(item)} style={{ fontSize:10, padding:'4px 10px', borderRadius:4, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)', cursor:'pointer' }}>Edit</button>
          <button onClick={()=>{if(confirm(`Remove "${item.name}"?`)) onDelete(item)}} style={{ padding:'4px 8px', borderRadius:4, border:'1px solid hsl(0 65% 52% / 0.15)', background:'transparent', color:'var(--color-destructive)', fontFamily:'var(--font-body)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{fontSize:10,lineHeight:1}}>×</span></button>
        </div>
      </div>

      {/* EMI */}
      {isEMI && (
        <div style={{ padding:'0 20px 20px', flex:1, display:'flex', flexDirection:'column' }}>
          <p style={{ margin:0, fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)', fontWeight:600 }}>Balance remaining</p>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:22, fontFamily:'var(--font-mono)', fontWeight:400, color: bal<item.amount?'var(--color-success)':'var(--color-foreground)' }}>{fmt(bal)}</span>
            {note && <span style={{ fontSize:11, color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)' }}>{note}</span>}
          </div>
          <p style={{ margin:'4px 0 0', fontSize:12, color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)' }}>Monthly <span style={{ color:'var(--color-foreground)' }}>{fmt(item.amount)}</span></p>

          {base > 0 && (
            <div style={{ marginTop:16 }}>
              <Progress value={pct} className='h-[3px]' />
              <p style={{ margin:'6px 0 0', fontSize:10, color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)' }}>{pct}% paid of {fmt(base)}</p>
            </div>
          )}

          <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:16, color:'var(--color-muted-foreground)' }}>
            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--font-body)' }}><CalIcon /> Due {ord(item.dueDay)}</span>
            {item.endDate && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--font-body)' }}><ClkIcon /> Ends {item.endDate}</span>}
          </div>

          {ps && !paidOff && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginTop:16, padding:'12px', borderRadius:6, background:ps.bg }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:ps.dot, marginTop:4, flexShrink:0 }} />
              <div>
                <p style={{ margin:0, fontSize:12, fontWeight:400, fontFamily:'var(--font-body)', color:ps.color }}>{ps.label}</p>
                <p style={{ margin:'2px 0 0', fontSize:10, color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)' }}>{ps.sub}</p>
              </div>
            </div>
          )}
          {paidOff && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16, padding:'12px', borderRadius:6, background:'hsl(145 60% 40% / 0.06)' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--color-success)', flexShrink:0 }} />
              <p style={{ margin:0, fontSize:12, fontWeight:400, fontFamily:'var(--font-body)', color:'var(--color-success)' }}>Fully paid off</p>
            </div>
          )}

          <div style={{ flex:1 }} />

          {!closed && (
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <button
                onClick={()=>onPay(item)} disabled={paidOff}
                style={{ flex:1, padding:'10px 0', borderRadius:6, border:'none', fontFamily:'var(--font-body)', fontSize:13, fontWeight:400, cursor:paidOff?'not-allowed':'pointer', background:paidOff?'var(--color-muted)':'var(--color-primary)', color:paidOff?'var(--color-muted-foreground)':'var(--color-primary-foreground)', transition:'opacity 0.15s' }}
              >{paidOff?'Paid off':`Pay ${fmt(item.amount)}`}</button>
              {canUndo && (
                <button
                  onClick={()=>onUndo(item)} title={`Restore to ${fmt(item.hist[item.hist.length-1])}`}
                  style={{ width:40, borderRadius:6, border:'1px solid var(--color-border)', background:'var(--color-card)', color:'var(--color-muted-foreground)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                ><UndoIcon /></button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subscription */}
      {!isEMI && (
        <div style={{ padding:'0 20px 20px', flex:1, display:'flex', flexDirection:'column' }}>
          <p style={{ margin:0, fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)', fontWeight:600 }}>Monthly amount</p>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:22, fontFamily:'var(--font-mono)', fontWeight:400, color:'var(--color-foreground)' }}>{fmt(item.amount)}</span>
            <span style={{ fontSize:11, color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)' }}>/ month</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:16, color:'var(--color-muted-foreground)' }}>
            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--font-body)' }}><CalIcon /> Renews {ord(item.dueDay)}</span>
            {item.endDate && <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--font-body)' }}><ClkIcon /> Ends {item.endDate}</span>}
          </div>
          {ps && !closed && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginTop:16, padding:'12px', borderRadius:6, background:ps.bg }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:ps.dot, marginTop:4, flexShrink:0 }} />
              <div>
                <p style={{ margin:0, fontSize:12, fontWeight:400, fontFamily:'var(--font-body)', color:ps.color }}>{ps.label}</p>
                <p style={{ margin:'2px 0 0', fontSize:10, color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)' }}>{ps.sub}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// needed for JSX
import React from 'react'
