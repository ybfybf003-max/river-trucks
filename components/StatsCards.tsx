'use client'

interface StatItem {
  label: string
  value: string | number
  accent?: boolean
}

export function StatsCards({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p
            className={`mt-1 text-2xl font-extrabold tabular-nums ${
              item.accent ? 'text-manual' : 'text-card-foreground'
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
