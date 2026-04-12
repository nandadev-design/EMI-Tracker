import { useState, useMemo } from 'react'
import { StatCard } from '@/components/StatCard'
import { EMICard } from '@/components/EMICard'
import { ItemModal, blankForm, toForm } from '@/components/ItemModal'
import { useTracker, monthName, fmt } from '@/hooks/useTracker'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import type { EnrichedItem, ItemFormData } from '@/types'

type Filter = 'All' | 'EMI' | 'Subscriptions' | 'Closed'

export default function App() {
  const { enriched, loading, toast, cloudActive, payEMI, undoPay, addItem, editItem, deleteItem, flash } = useTracker()
  const { theme, toggleTheme } = useTheme()

  const [filter, setFilter] = useState<Filter>('All')
  const [open,   setOpen  ] = useState(false)
  const [isNew,  setIsNew ] = useState(true)
  const [editing, setEditing] = useState<EnrichedItem|null>(null)
  const [form, setForm] = useState<ItemFormData>(blankForm())

  const emis   = enriched.filter(i=>i.type==='EMI'          && i.status==='Active')
  const subs   = enriched.filter(i=>i.type==='Subscription'  && i.status==='Active')
  const closed = enriched.filter(i=>i.status==='Closed')
  const list   = useMemo(()=> filter==='EMI'?emis : filter==='Subscriptions'?subs : filter==='Closed'?closed : [...emis,...subs], [filter,emis,subs,closed])
  const stats  = useMemo(()=>({ debt:emis.reduce((s,i)=>s+(i.bal||0),0), mEMI:emis.reduce((s,i)=>s+i.amount,0), mSub:subs.reduce((s,i)=>s+i.amount,0) }),[emis,subs])

  const openAdd  = () => { setForm(blankForm()); setIsNew(true);  setEditing(null); setOpen(true) }
  const openEdit = (it:EnrichedItem) => { setForm(toForm(it)); setIsNew(false); setEditing(it); setOpen(true) }

  const save = (f:ItemFormData) => {
    if (!f.name.trim())                                                 { flash('Please enter a name','err'); return }
    if (!Number.isFinite(Number(f.amount)) || Number(f.amount)<0)       { flash('Enter a valid amount','err'); return }
    if (f.type==='EMI') {
      if (!Number.isFinite(Number(f.baseBalance))||Number(f.baseBalance)<0) { flash('Enter original loan amount','err'); return }
      if (f.currentBalance.trim() && (!Number.isFinite(Number(f.currentBalance))||Number(f.currentBalance)<0)) { flash('Enter valid current balance','err'); return }
    }
    isNew ? addItem(f) : editItem(editing!.id, f)
    setOpen(false)
  }

  const FILTERS: {key:Filter; count:number}[] = [
    {key:'All', count:emis.length+subs.length},
    {key:'EMI', count:emis.length},
    {key:'Subscriptions', count:subs.length},
    {key:'Closed', count:closed.length},
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'var(--color-background)' }}>
      <div style={{ width:28, height:28, border:'3px solid var(--color-border)', borderTopColor:'var(--color-primary)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <p style={{ color:'var(--color-muted-foreground)', fontSize:13, fontFamily:'var(--font-body)' }}>Loading your tracker…</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--color-background)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:16, right:16, zIndex:9999,
          padding:'11px 16px', borderRadius:8, fontSize:13, fontWeight:400,
          fontFamily:'var(--font-body)', maxWidth:340,
          boxShadow:'0 4px 20px rgba(0,0,0,0.08)',
          background: toast.kind==='undo'?'#eff6ff' : toast.kind==='err'?'#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.kind==='undo'?'#bfdbfe':toast.kind==='err'?'#fecaca':'#bbf7d0'}`,
          color:   toast.kind==='undo'?'#1d4ed8':toast.kind==='err'?'#dc2626':'#15803d',
          animation:'slide-in 0.25s ease',
        }}>
          {toast.kind==='undo'?'↩ ':toast.kind==='err'?'✕ ':'✓ '}{toast.msg}
        </div>
      )}

      {/* Modal */}
      <ItemModal key={editing?.id??'new'} open={open} isNew={isNew} initialForm={form} onClose={()=>setOpen(false)} onSave={save} />

      {/* Header */}
      <header style={{ }}>
        <div style={{ maxWidth:1160, margin:'0 auto', padding:'48px 24px 24px' }}>
          <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.18em', fontFamily:'var(--font-body)', color:'var(--color-muted-foreground)' }}>
            ✦ Tracker / {monthName()}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <h1 style={{ margin:0, fontSize:28, fontWeight:700, fontFamily:'var(--font-heading)', color:'var(--color-foreground)', letterSpacing:'-0.5px', lineHeight:1 }}>
              EMI &amp; Subscription Tracker
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <button onClick={toggleTheme} title="Toggle theme" style={{ padding:'8px', borderRadius:'5px', background:'var(--color-muted)', color:'var(--color-foreground)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={openAdd} style={{ padding:'8px 20px', borderRadius:'5px', border:'none', background:'var(--color-primary)', color:'var(--color-primary-foreground)', fontSize:14, fontWeight:400, fontFamily:'var(--font-body)', cursor:'pointer' }}>
                + Add
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1160, margin:'0 auto', padding:'0 24px 80px' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:16, marginBottom:32 }}>
          <StatCard label="Total Outstanding" value={fmt(stats.debt)}           subtitle={`${emis.length} active EMIs`}       accentColor="hsl(0 60% 70%)" />
          <StatCard label="Monthly EMI"       value={fmt(stats.mEMI)}           subtitle={`across ${emis.length} loans`}      accentColor="var(--color-primary)" />
          <StatCard label="Monthly Subs"      value={fmt(stats.mSub)}           subtitle={`${subs.length} subscriptions`}     accentColor="hsl(270 50% 70%)" />
          <StatCard label="Total Monthly Out" value={fmt(stats.mEMI+stats.mSub)} subtitle="EMIs + subscriptions"             accentColor="hsl(190 60% 60%)" />
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:24, marginBottom:24, borderBottom:'1px solid var(--color-border)', paddingBottom:12, width:'100%' }}>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{
              padding:0, border:'none', fontSize:14,
              fontFamily:'var(--font-body)', cursor:'pointer', transition:'all 0.1s',
              background: 'transparent',
              color:      filter===f.key ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              fontWeight: filter===f.key ? 600 : 400,
              borderBottom: filter===f.key ? '2px solid var(--color-foreground)' : '2px solid transparent',
              marginBottom: -13, /* Pull down to overlap the borderBottom of the container */
            }}>
              {f.key}
              <span style={{ marginLeft:6, fontSize:11, fontFamily:'var(--font-mono)', opacity:0.55 }}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {list.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:20 }}>
            {list.map((it,idx)=>(
              <EMICard key={it.id} item={it} index={idx} onPay={payEMI} onUndo={undoPay} onEdit={openEdit} onDelete={deleteItem} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <p style={{ color:'var(--color-muted-foreground)', fontSize:14, fontFamily:'var(--font-body)' }}>No entries for this filter.</p>
          </div>
        )}

        <p style={{ textAlign:'center', marginTop:64, fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--color-muted-foreground)', opacity:0.45, fontFamily:'var(--font-body)' }}>
          Local copy in this browser{cloudActive?' · Cloud copy in Supabase':''}
        </p>
      </main>
    </div>
  )
}
