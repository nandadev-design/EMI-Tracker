import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import type { TrackerItem, ItemFormData } from '@/types'

export const blankForm = (): ItemFormData => ({ name:'', type:'EMI', amount:'', baseBalance:'', dueDay:'1', rate:'', endDate:'', notes:'', status:'Active' })

export const toForm = (it: TrackerItem): ItemFormData => ({
  name: it.name, type: it.type, amount: String(it.amount),
  baseBalance: it.baseBalance!=null ? String(it.baseBalance) : '',
  dueDay: String(it.dueDay), rate: it.rate||'', endDate: it.endDate||'', notes: it.notes||'', status: it.status,
})

const inp: React.CSSProperties = { display:'block', width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid var(--color-border)', fontSize:13, fontFamily:'var(--font-body)', background:'var(--color-background)', color:'var(--color-foreground)', outline:'none', boxSizing:'border-box', marginTop:5 }
const lbl: React.CSSProperties = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'var(--font-body)', color:'var(--color-muted-foreground)' }

interface Props {
  open: boolean
  isNew: boolean
  initialForm: ItemFormData
  onClose: () => void
  onSave: (form: ItemFormData) => void
}

export function ItemModal({ open, isNew, initialForm, onClose, onSave }: Props) {
  const [f, setF] = useState<ItemFormData>(initialForm)
  const set = (p: Partial<ItemFormData>) => setF(prev=>({...prev,...p}))

  return (
    <Dialog open={open} onOpenChange={o=>{ if(!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add loan or subscription' : 'Edit entry'}</DialogTitle>
        </DialogHeader>

        <div style={{ padding:'16px 24px', display:'flex', flexDirection:'column', gap:14, maxHeight:'62vh', overflowY:'auto' }}>
          <label style={lbl}>Name<input style={inp} placeholder='e.g. Home Loan' value={f.name} onChange={e=>set({name:e.target.value})} /></label>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <label style={lbl}>Type
              <select style={inp} value={f.type} onChange={e=>set({type:e.target.value as ItemFormData['type']})}>
                <option value='EMI'>EMI</option>
                <option value='Subscription'>Subscription</option>
              </select>
            </label>
            <label style={lbl}>Status
              <select style={inp} value={f.status} onChange={e=>set({status:e.target.value as ItemFormData['status']})}>
                <option value='Active'>Active</option>
                <option value='Closed'>Closed</option>
              </select>
            </label>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <label style={lbl}>Monthly Amount (₹)<input style={inp} type='number' min={0} placeholder='0' value={f.amount} onChange={e=>set({amount:e.target.value})} /></label>
            <label style={lbl}>Due Day (1–31)<input style={inp} type='number' min={1} max={31} placeholder='1' value={f.dueDay} onChange={e=>set({dueDay:e.target.value})} /></label>
          </div>

          {f.type==='EMI' && <label style={lbl}>Outstanding Balance (₹)<input style={inp} type='number' min={0} placeholder='0' value={f.baseBalance} onChange={e=>set({baseBalance:e.target.value})} /></label>}

          <label style={lbl}>Interest Rate (optional)<input style={inp} placeholder='e.g. 12%' value={f.rate} onChange={e=>set({rate:e.target.value})} /></label>
          <label style={lbl}>End Date (optional)<input style={inp} placeholder='e.g. Dec 2026' value={f.endDate} onChange={e=>set({endDate:e.target.value})} /></label>
          <label style={lbl}>Notes<textarea style={{...inp, minHeight:64, resize:'vertical'}} placeholder='Any extra info…' value={f.notes} onChange={e=>set({notes:e.target.value})} /></label>
        </div>

        <DialogFooter>
          <button onClick={onClose} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-muted-foreground)', fontFamily:'var(--font-body)', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>onSave(f)} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'var(--color-primary)', color:'var(--color-primary-foreground)', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, cursor:'pointer' }}>{isNew?'Add':'Save'}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


