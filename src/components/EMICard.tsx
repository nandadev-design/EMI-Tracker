
import { payStatus, fmt, ord } from '@/hooks/useTracker'
import type { EnrichedItem } from '@/types'

function Avatar({ name }: { name: string }) {
  const init = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="w-11 h-11 rounded-full bg-muted dark:bg-status-box flex items-center justify-center flex-shrink-0 text-foreground font-body text-xs font-semibold">
      {init}
    </div>
  )
}

const CalIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="opacity-40 shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
const ClkIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="opacity-40 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
const UndoIcon = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="opacity-40"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>

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
  
  const totalBars = 35

  return (
    <div 
      className={`rounded-xl bg-card border border-border p-5 sm:p-6 transition-all hover:shadow-lg hover:-translate-y-[2px] duration-200 flex flex-col ${closed ? 'opacity-70' : 'opacity-100'}`}
      style={{ animation: `fade-up 0.34s ease ${index*0.04}s both` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Avatar name={item.name} />
          <div>
            <h3 className="text-[15px] font-body font-semibold text-foreground leading-tight">{item.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-[11px] font-body font-semibold uppercase tracking-wide ${isEMI ? 'text-primary' : closed ? 'text-muted-foreground' : 'text-[#8b5cf6]'}`}>
                {item.type}
              </span>
              {closed && <span className="text-[10px] font-bold font-body text-muted-foreground">CLOSED</span>}
              {item.rate && <span className="text-[10px] font-bold font-body text-warning">{item.rate.includes('%') ? item.rate : `${item.rate}%`} p.a.</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="text-[11px] px-3 py-1.5 rounded-[5px] border border-border flex items-center justify-center hover:bg-muted font-body text-muted-foreground transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => { if (confirm(`Remove "${item.name}"?`)) onDelete(item) }}
            className="w-[28px] rounded-[5px] border border-destructive/30 flex items-center justify-center hover:bg-destructive/10 text-destructive font-body cursor-pointer transition-colors"
          >
            <span className="text-[14px]">×</span>
          </button>
        </div>
      </div>

      {/* EMI view */}
      {isEMI && (
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-1">Balance Remaining</p>
            <div className="flex items-baseline justify-between mt-2">
              <p className={`font-mono text-[32px] font-semibold leading-none tracking-tight ${bal < item.amount ? 'text-success' : 'text-foreground'}`}>
                {fmt(bal)}
              </p>
              {moLeft > 0 && (
                <span className="text-[13px] text-muted-foreground font-body font-medium bg-muted/50 px-2.5 py-1 rounded-md">~{moLeft} mo left</span>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-body mb-5">
            Monthly <span className="font-mono font-semibold text-foreground">{fmt(item.amount)}</span>
          </p>

          {/* Completion progress bar */}
          {base > 0 && (
            <div className="mb-5">
              <div className="w-full flex gap-[3px]">
                {Array.from({ length: totalBars }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-[20px] rounded-[3px] ${i < Math.round((pct / 100) * totalBars) ? 'bg-primary' : 'bg-progress-track'}`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground font-body mt-2">
                {pct}% paid of {fmt(base)}
              </p>
            </div>
          )}

          <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground font-body mb-5">
            <span className="flex items-center gap-1.5"><CalIcon /> Due {ord(item.dueDay)}</span>
            {item.endDate && <span className="flex items-center gap-1.5"><ClkIcon /> Ends {item.endDate}</span>}
          </div>

          {/* Payment status */}
          {ps && !paidOff && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-[5px] ${ps.kind === 'overdue' ? 'bg-overdue-box text-destructive' : ps.kind === 'paid' ? 'bg-paid-box text-success' : 'bg-status-box text-warning'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${ps.kind === 'overdue' ? 'bg-destructive' : ps.kind === 'paid' ? 'bg-success' : 'bg-warning'}`} />
              <div>
                <p className="text-sm font-body font-medium m-0">{ps.label}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5 mb-0">{ps.sub}</p>
              </div>
            </div>
          )}

          {paidOff && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-[5px] bg-paid-box text-success">
              <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
              <p className="text-sm font-body font-medium m-0">Fully paid off</p>
            </div>
          )}

          {/* Spacer to push button box to bottom */}
          <div className="flex-1" />

          {/* Pay button + undo in separate box */}
          {!closed && (
            <div className="bg-button-box rounded-b-[11px] border-t border-border/50 px-5 py-5 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onPay(item)} disabled={paidOff}
                  className={`flex-1 py-[14px] rounded-[5px] text-[13px] font-body font-semibold cursor-pointer transition-colors ${paidOff ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                >
                  {paidOff ? 'Paid off' : `Pay ${fmt(item.amount)}`}
                </button>
                {canUndo && (
                  <button 
                    onClick={() => onUndo(item)} title={`Restore to ${fmt(item.hist[item.hist.length-1])}`}
                    className="w-[46px] h-[46px] rounded-[5px] bg-card border border-border flex items-center justify-center hover:bg-muted dark:bg-undo-button dark:border-transparent dark:hover:bg-undo-button/80 transition-colors flex-shrink-0 cursor-pointer text-foreground"
                  >
                    <UndoIcon />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscription view */}
      {!isEMI && (
        <div className="flex-1 flex flex-col">
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-1">Monthly amount</p>
          <div className="flex items-baseline justify-between mt-2 mb-6">
            <p className="font-mono text-[32px] font-semibold text-foreground leading-none tracking-tight">
              {fmt(item.amount)}
            </p>
            <span className="text-[13px] text-muted-foreground font-body font-medium bg-muted/50 px-2.5 py-1 rounded-md">/ month</span>
          </div>

          <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground font-body mb-5">
            <span className="flex items-center gap-1.5"><CalIcon /> Renews {ord(item.dueDay)}</span>
            {item.endDate && <span className="flex items-center gap-1.5"><ClkIcon /> Ends {item.endDate}</span>}
          </div>

          {ps && !closed && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-[5px] ${ps.kind === 'overdue' ? 'bg-overdue-box text-destructive' : ps.kind === 'paid' ? 'bg-paid-box text-success' : 'bg-status-box text-warning'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${ps.kind === 'overdue' ? 'bg-destructive' : ps.kind === 'paid' ? 'bg-success' : 'bg-warning'}`} />
              <div>
                <p className="text-sm font-body font-medium m-0">{ps.label}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5 mb-0">{ps.sub}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
