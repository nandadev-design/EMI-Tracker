import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getSupabase, isCloudConfigured } from '@/lib/supabase'
import type { TrackerItem, EnrichedItem, ItemFormData, ToastState, ToastKind } from '@/types'

/* ─── Seed data ───────────────────────────────────────────────────────────── */
const SEED: TrackerItem[] = [
  { id:1,  name:'Navi Loans',       type:'EMI',          amount:3700,  baseBalance:38263, dueDay:1,  rate:'',    endDate:null,       notes:'~13 months remaining', status:'Active' },
  { id:2,  name:'Amazon Pay Later', type:'EMI',          amount:13565, baseBalance:22163, dueDay:5,  rate:'',    endDate:null,       notes:'~4 months remaining',  status:'Active' },
  { id:3,  name:'Credit Bee',       type:'EMI',          amount:4500,  baseBalance:16726, dueDay:10, rate:'',    endDate:null,       notes:'~3 months remaining',  status:'Active' },
  { id:4,  name:'Credit Card',      type:'EMI',          amount:4350,  baseBalance:650,   dueDay:5,  rate:'42%', endDate:null,       notes:'~3 months remaining',  status:'Active' },
  { id:5,  name:'Money View',       type:'EMI',          amount:2879,  baseBalance:23484, dueDay:5,  rate:'23%', endDate:null,       notes:'~12 months remaining', status:'Active' },
  { id:6,  name:'iPad',             type:'EMI',          amount:1500,  baseBalance:26000, dueDay:1,  rate:'',    endDate:'Sep 2027', notes:'Ends Sep 2027',        status:'Active' },
  { id:7,  name:'Fibe',             type:'EMI',          amount:3500,  baseBalance:10244, dueDay:3,  rate:'',    endDate:null,       notes:'~2 months remaining',  status:'Active' },
  { id:8,  name:'LazyPay',          type:'EMI',          amount:2128,  baseBalance:13763, dueDay:3,  rate:'',    endDate:'Dec 2026', notes:'Ends Dec 2026',        status:'Active' },
  { id:9,  name:'Kissht',           type:'EMI',          amount:1406,  baseBalance:5037,  dueDay:3,  rate:'36%', endDate:null,       notes:'~7 months remaining',  status:'Active' },
  { id:10, name:'Room Rent',        type:'Subscription', amount:3667,  baseBalance:null,  dueDay:10, rate:'',    endDate:'Jun 2026', notes:'Moving out June 2026', status:'Active' },
  { id:11, name:'Current Bill',     type:'Subscription', amount:300,   baseBalance:null,  dueDay:9,  rate:'',    endDate:'Jun 2026', notes:'Ends June 2026',       status:'Active' },
  { id:12, name:'Apple One',        type:'Subscription', amount:195,   baseBalance:null,  dueDay:1,  rate:'',    endDate:null,       notes:'',                     status:'Active' },
  { id:13, name:'Chair Rent',       type:'Subscription', amount:800,   baseBalance:null,  dueDay:1,  rate:'',    endDate:null,       notes:'',                     status:'Active' },
  { id:14, name:'Google One',       type:'Subscription', amount:59,    baseBalance:null,  dueDay:1,  rate:'',    endDate:null,       notes:'',                     status:'Active' },
  { id:15, name:'YouTube Premium',  type:'Subscription', amount:300,   baseBalance:null,  dueDay:1,  rate:'',    endDate:null,       notes:'',                     status:'Active' },
  { id:16, name:'Room Amenities',   type:'Subscription', amount:344,   baseBalance:null,  dueDay:1,  rate:'',    endDate:null,       notes:'',                     status:'Active' },
  { id:17, name:'Netflix',          type:'Subscription', amount:649,   baseBalance:null,  dueDay:1,  rate:'',    endDate:null,       notes:'',                     status:'Closed' },
  { id:18, name:'Gentler Streak',   type:'Subscription', amount:300,   baseBalance:null,  dueDay:1,  rate:'',    endDate:null,       notes:'',                     status:'Closed' },
]

const KEY = 'emi-tracker-v1'

/* ─── Date helpers ────────────────────────────────────────────────────────── */
function today0() { const d = new Date(); d.setHours(0,0,0,0); return d }
export const todayStr  = () => { const d = today0(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
export const todayDay  = () => today0().getDate()
export const monthName = () => today0().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
const todayYear = () => today0().getFullYear()

export function getDueDates(dd: number) {
  const T = today0(), y = T.getFullYear(), m = T.getMonth()
  const cur = new Date(y, m, dd), nxt = new Date(y, m+1, dd), prv = new Date(y, m-1, dd)
  return { lastDue: T >= cur ? cur : prv, nextDue: T >= cur ? nxt : cur }
}
const diff = (a: Date, b: Date) => Math.round((b.getTime()-a.getTime())/86400000)
const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year: d.getFullYear()!==todayYear()?'numeric':undefined })

export function payStatus(dueDay: number, lastPaid: string|null) {
  const T = today0(), { lastDue, nextDue } = getDueDates(dueDay), dtn = diff(T, nextDue)
  const paid = lastPaid && new Date(lastPaid) >= lastDue
  if (paid) { const ago = diff(new Date(lastPaid!), T); return { label: ago===0?'Paid today':`Paid ${ago}d ago`, sub:`Next due ${fmtDate(nextDue)} · in ${dtn}d`, color:'#15803d', bg:'#f0fdf4', border:'#bbf7d0', dot:'#22c55e', kind:'paid' as const } }
  const od = diff(lastDue, T)
  if (od > 0) return { label:`Overdue by ${od}d`,  sub:`Was due ${fmtDate(lastDue)}`,        color:'#dc2626', bg:'#fef2f2', border:'#fecaca', dot:'#ef4444', kind:'overdue'  as const }
  if (dtn <= 3) return { label:`Due in ${dtn}d`,   sub:`Due ${fmtDate(nextDue)}`,             color:'#b45309', bg:'#fffbeb', border:'#fde68a', dot:'#f59e0b', kind:'soon'    as const }
  return { label:`Due ${fmtDate(nextDue)}`,         sub:`In ${dtn} days`,                     color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', dot:'#d1d5db', kind:'upcoming' as const }
}

export const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`
export const ord = (n: number) => { const s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]) }

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
type Bals  = Record<number, number>
type Hists = Record<number, number[]>
type Dates = Record<number, string>

function premark(items: TrackerItem[], lb: Bals, lh: Hists, ld: Dates) {
  const ts = todayStr(), td = todayDay()
  let nb = {...lb}, nh = {...lh}, nd = {...ld}
  for (const it of items) {
    if (it.status==='Closed') continue
    const gotBal = it.id in nb, gotDate = it.id in nd
    if (!gotDate && it.dueDay<=td) {
      nd = {...nd, [it.id]: ts}
      if (it.type==='EMI' && !gotBal && it.baseBalance!=null) {
        nb = {...nb, [it.id]: Math.max(0, it.baseBalance-it.amount)}
        nh = {...nh, [it.id]: [it.baseBalance]}
      }
    }
  }
  return { nb, nh, nd }
}
const nextId = (items: TrackerItem[]) => items.reduce((m,i)=>Math.max(m,i.id),0)+1
function drop(lb: Bals, lh: Hists, ld: Dates, id: number) {
  const nb={...lb}, nh={...lh}, nd={...ld}; delete nb[id]; delete nh[id]; delete nd[id]; return {nb,nh,nd}
}

/* ─── Hook ────────────────────────────────────────────────────────────────── */
export function useTracker() {
  const [items, setItems] = useState<TrackerItem[]>([])
  const [bals,  setBals ] = useState<Bals>({})
  const [hists, setHists] = useState<Hists>({})
  const [dates, setDates] = useState<Dates>({})
  const [loading, setLoading] = useState(true)
  const [ready,   setReady  ] = useState(false)
  const [toast,   setToast  ] = useState<ToastState|null>(null)
  const [cloudActive, setCloudActive] = useState(false)
  const [syncLine,    setSyncLine   ] = useState('')
  const sbRef  = useRef<ReturnType<typeof getSupabase>>(null)
  const uidRef = useRef<string|null>(null)

  const flash = useCallback((msg: string, kind: ToastKind = 'ok') => {
    setToast({msg,kind}); setTimeout(()=>setToast(null), 3200)
  }, [])

  /* load */
  useEffect(()=>{
    let dead = false;
    (async()=>{
      let its=SEED, lb:Bals={}, lh:Hists={}, ld:Dates={}, fromCloud=false
      const sb = getSupabase()
      if (sb) {
        sbRef.current = sb
        try {
          const { data:sess } = await sb.auth.getSession()
          let user = sess?.session?.user ?? null
          if (!user) { const {data:a,error:e}=await sb.auth.signInAnonymously(); if(e) throw e; user=a?.user??null }
          if (user) {
            uidRef.current = user.id
            const {data:row,error:re}=await sb.from('emi_tracker_state').select('data').eq('user_id',user.id).maybeSingle()
            if (!re && row?.data && Array.isArray(row.data.items) && row.data.items.length) {
              its=row.data.items; lb=row.data.bals||{}; lh=row.data.hists||{}; ld=row.data.dates||{}; fromCloud=true
            }
            if (!dead) { setCloudActive(true); setSyncLine(fromCloud?'Loaded from cloud':'Cloud ready — changes will sync') }
          }
        } catch(e) {
          console.error(e); sbRef.current=null; uidRef.current=null
          if (!dead) { setCloudActive(false); setSyncLine('Cloud unavailable — local only'); setToast({msg:'Could not connect to cloud',kind:'err'}); setTimeout(()=>setToast(null),3200) }
        }
      } else if (!dead) setSyncLine(isCloudConfigured()?'':'Local only — add Supabase keys to enable cloud sync')

      if (!fromCloud) {
        try { const raw=localStorage.getItem(KEY); if(raw){const d=JSON.parse(raw); if(Array.isArray(d.items)&&d.items.length){its=d.items;lb=d.bals||{};lh=d.hists||{};ld=d.dates||{}}} } catch{}
        const m=premark(its,lb,lh,ld); lb=m.nb; lh=m.nh; ld=m.nd
      }
      if (dead) return
      setItems(its); setBals(lb); setHists(lh); setDates(ld); setLoading(false); setReady(true)
    })()
    return ()=>{ dead=true }
  }, [])

  /* persist localStorage */
  useEffect(()=>{
    if (!ready) return
    try { localStorage.setItem(KEY, JSON.stringify({v:1,items,bals,hists,dates})) } catch(e){console.error(e)}
  }, [items,bals,hists,dates,ready])

  /* sync supabase */
  useEffect(()=>{
    if (!ready||!cloudActive||!uidRef.current||!sbRef.current) return
    const sb=sbRef.current, uid=uidRef.current
    setSyncLine(s=>s.startsWith('Saving')?s:'Saving to cloud…')
    const t=setTimeout(async()=>{
      const {error}=await sb.from('emi_tracker_state').upsert({user_id:uid,data:{v:1,items,bals,hists,dates},updated_at:new Date().toISOString()},{onConflict:'user_id'})
      if (error){console.error(error);setSyncLine('Cloud save failed');setToast({msg:error.message||'Cloud save failed',kind:'err'});setTimeout(()=>setToast(null),3200)}
      else setSyncLine(`Saved to cloud · ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`)
    }, 800)
    return ()=>clearTimeout(t)
  }, [items,bals,hists,dates,ready,cloudActive])

  /* derived */
  const getBal = useCallback((it:TrackerItem)=>it.id in bals?bals[it.id]:it.baseBalance??0,[bals])
  const enriched = useMemo<EnrichedItem[]>(()=>items.map(it=>({...it,bal:it.type==='EMI'?getBal(it):null,hist:hists[it.id]||[],lastPaid:dates[it.id]||null})),[items,hists,dates,getBal])

  /* actions */
  const payEMI = useCallback((it:EnrichedItem)=>{
    const cur=it.bal??0; if(cur<=0) return
    const nb=Math.max(0,cur-it.amount), hist=[...(hists[it.id]||[]),cur]
    setBals(p=>({...p,[it.id]:nb})); setHists(p=>({...p,[it.id]:hist})); setDates(p=>({...p,[it.id]:todayStr()}))
    flash(`${it.name} — ${fmt(it.amount)} deducted · Balance ${fmt(nb)}`)
  },[hists,flash])

  const undoPay = useCallback((it:EnrichedItem)=>{
    const hist=hists[it.id]||[]; if(!hist.length) return
    const prev=hist[hist.length-1], nh=hist.slice(0,-1)
    setBals(p=>({...p,[it.id]:prev})); setHists(p=>({...p,[it.id]:nh}))
    if(!nh.length) setDates(p=>{const n={...p};delete n[it.id];return n})
    flash(`Undone — ${it.name} restored to ${fmt(prev)}`,'undo')
  },[hists,flash])

  const addItem = useCallback((f:ItemFormData)=>{
    const dd=Math.min(31,Math.max(1,parseInt(f.dueDay,10)||1))
    const bb=f.type==='EMI'?(Number(f.baseBalance)||0):null
    const id=nextId(items)
    setItems(p=>[...p,{id,name:f.name.trim(),type:f.type,amount:Number(f.amount),baseBalance:bb,dueDay:dd,rate:f.rate.trim(),endDate:f.endDate.trim()||null,notes:f.notes.trim(),status:f.status}])
    
    if (f.type === 'EMI') {
      const cbStr = f.currentBalance.trim()
      const cb = cbStr ? Number(cbStr) : bb
      if (cb != null && !isNaN(cb)) setBals(p=>({...p, [id]: cb}))
    }
    
    flash(`Added "${f.name.trim()}"`)
  },[items,flash])

  const editItem = useCallback((id:number,f:ItemFormData)=>{
    const dd=Math.min(31,Math.max(1,parseInt(f.dueDay,10)||1))
    const bb=f.type==='EMI'?(Number(f.baseBalance)||0):null
    setItems(p=>p.map(i=>i.id===id?{...i,name:f.name.trim(),type:f.type,amount:Number(f.amount),baseBalance:bb,dueDay:dd,rate:f.rate.trim(),endDate:f.endDate.trim()||null,notes:f.notes.trim(),status:f.status}:i))
    
    if(f.type!=='EMI'){
      const {nb,nh,nd}=drop(bals,hists,dates,id);setBals(nb);setHists(nh);setDates(nd)
    } else {
      const cbStr = f.currentBalance.trim()
      if (cbStr) {
        const cb = Number(cbStr)
        if (!isNaN(cb)) setBals(p=>({...p, [id]: cb}))
      }
    }
    flash(`Updated "${f.name.trim()}"`)
  },[bals,hists,dates,flash])

  const deleteItem = useCallback((it:TrackerItem)=>{
    const {nb,nh,nd}=drop(bals,hists,dates,it.id)
    setItems(p=>p.filter(i=>i.id!==it.id)); setBals(nb); setHists(nh); setDates(nd)
    flash(`Removed "${it.name}"`,'undo')
  },[bals,hists,dates,flash])

  return { enriched, loading, toast, cloudActive, syncLine, payEMI, undoPay, addItem, editItem, deleteItem, flash }
}
