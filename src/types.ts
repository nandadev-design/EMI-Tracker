export type EntryType   = 'EMI' | 'Subscription'
export type EntryStatus = 'Active' | 'Closed'

export interface TrackerItem {
  id:          number
  name:        string
  type:        EntryType
  amount:      number
  baseBalance: number | null
  dueDay:      number
  rate:        string
  endDate:     string | null
  notes:       string
  status:      EntryStatus
}

export interface EnrichedItem extends TrackerItem {
  bal:      number | null
  hist:     number[]
  lastPaid: string | null
}

export interface ItemFormData {
  name:        string
  type:        EntryType
  amount:      string
  baseBalance: string
  dueDay:      string
  rate:        string
  endDate:     string
  notes:       string
  status:      EntryStatus
}

export type ToastKind = 'ok' | 'undo' | 'err'
export interface ToastState { msg: string; kind: ToastKind }
