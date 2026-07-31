export interface CronItem {
  name: string
  schedule: string
  next_run_at: string | null
  status: string
  deliver: string
}

export interface LinkedinDraft {
  exists: boolean
  file?: string
  date?: string
  age_days?: number
  preview_chars?: number
  preview?: string
}

export interface CalendarEvent {
  time: string
  cal: string
  title: string
}

export interface Anomaly {
  id: string
  title: string
  detail: string
  severity: string
}

export interface DashboardData {
  generated_at: string
  calendar: CalendarEvent[]
  cron: CronItem[]
  linkedin: LinkedinDraft
  anomalies: Anomaly[]
  skills_count?: number
  tasks_today?: number
  memory_pct?: string
  memory_is_placeholder?: boolean
}
