import React from 'react'
import type { DashboardData } from './types'

interface Props {
  open: boolean
  onClose: () => void
  data: DashboardData | null
  onRefresh: () => void
}

const statusBadge = (status: string) => {
  const active = status === 'ok' || status === 'active'
  return (
    <span
      className={`text-[9.5px] px-2 py-0.5 rounded-full whitespace-nowrap border ${
        active
          ? 'bg-green/[.13] text-green border-green/30'
          : 'bg-orange/[.13] text-orange border-orange/30'
      }`}
    >
      {active ? 'active' : 'error'}
    </span>
  )
}

export default function Drawer({ open, onClose, data, onRefresh }: Props) {
  const cronCount = data?.cron?.length ?? 0
  const skillsCount = data?.skills_count ?? '—'
  const tasksCount = data?.tasks_today ?? '—'
  const memoryPct = data?.memory_pct ?? '—'

  return (
    <div
      className={`fixed inset-0 bg-black/50 transition-opacity z-[15] ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`absolute top-0 left-0 h-full w-[84%] bg-panel border-r border-border transition-transform duration-300 ease-out z-20 flex flex-col overflow-hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 pt-[18px] pb-3 border-b border-[#171d27] flex items-start justify-between">
          <div>
            <div className="text-[15px] font-bold">Dashboard</div>
            <div className="text-[11px] text-muted">Agent vitals & controls</div>
          </div>
          <button
            onClick={onRefresh}
            className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-sm flex-shrink-0"
            aria-label="Refresh live data"
            title="Refresh live data"
          >
            ⟳
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3.5 drawer-body">
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <StatCard label="Cron Jobs" value={cronCount} color="cyan" />
            <StatCard label="Skills" value={skillsCount} color="purple" />
            <StatCard label="Tasks" value={tasksCount} color="green" />
            <StatCard label="Memory" value={memoryPct} color="blue" />
          </div>

          <div className="text-[11.5px] uppercase tracking-wider text-muted my-3.5">Cron Pulse</div>
          {(data?.cron ?? []).length === 0 && (
            <div className="text-xs text-muted mb-2">No cron jobs found.</div>
          )}
          {(data?.cron ?? []).map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#111621]/60 border border-border rounded-xl px-3 py-2.5 mb-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] bg-cyan/[.13]">⏰</div>
                <div>
                  <div className="text-[12.5px] font-semibold">{c.name}</div>
                  <div className="text-[10.5px] text-muted">{c.schedule}</div>
                </div>
              </div>
              {statusBadge(c.status)}
            </div>
          ))}

          <div className="text-[11.5px] uppercase tracking-wider text-muted my-3.5">Pending Approvals</div>
          {(data?.anomalies ?? []).length === 0 && (
            <div className="text-xs text-muted mb-2">Nothing pending. 🎉</div>
          )}
          {(data?.anomalies ?? []).map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between bg-[#111621]/60 border border-border rounded-xl px-3 py-2.5 mb-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] bg-purple/[.13]">
                  {a.severity === 'alert' ? '🚨' : '✉️'}
                </div>
                <div>
                  <div className="text-[12.5px] font-semibold">{a.title}</div>
                  <div className="text-[10.5px] text-muted max-w-[200px]">{a.detail}</div>
                </div>
              </div>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full whitespace-nowrap border bg-orange/[.13] text-orange border-orange/30">
                review
              </span>
            </div>
          ))}

          <div className="text-[10px] text-muted mt-4 pt-3 border-t border-[#171d27]">
            {data?.generated_at
              ? `Last synced: ${new Date(data.generated_at).toLocaleString()}`
              : 'Not yet synced'}
            {data?.memory_is_placeholder && (
              <div className="text-orange mt-1">Memory % is a placeholder — no live source wired.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan border-cyan/30',
    purple: 'text-purple border-purple/30',
    green: 'text-green border-green/30',
    blue: 'text-blue border-blue/30',
  }
  return (
    <div className={`glass-card rounded-[14px] p-3 border ${colorMap[color]}`}>
      <div className="text-[10.5px] text-muted mb-1">{label}</div>
      <div className={`text-lg font-bold ${colorMap[color].split(' ')[0]}`}>{value}</div>
    </div>
  )
}
