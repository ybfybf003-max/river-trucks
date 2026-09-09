'use client'

import { useEffect, useState } from 'react'
import { ActionButton } from '@/components/ActionButton'
import { StatsCards } from '@/components/StatsCards'
import { getTodayTickets, todayString, isDayClosed } from '@/lib/storage'
import { calculateDailyStats } from '@/lib/calculations'
import { getCurrentShift, getShiftLabel } from '@/lib/shifts'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-lg font-extrabold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export function Dashboard() {
  const [count, setCount] = useState(0)
  const [totalNet, setTotalNet] = useState(0)
  const [shift, setShift] = useState(1)
  const [date, setDate] = useState('')
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    const today = todayString()
    const tickets = getTodayTickets(today)
    const stats = calculateDailyStats(tickets)
    setCount(stats.count)
    setTotalNet(stats.totalNet)
    setShift(getCurrentShift())
    setDate(today)
    setClosed(isDayClosed(today))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <StatsCards
        items={[
          { label: 'التاريخ', value: date || '—' },
          { label: 'الوردية الحالية', value: getShiftLabel(shift) },
          { label: 'عدد التذاكر', value: count },
          { label: 'الوزن الصافي الإجمالي', value: totalNet, accent: true },
        ]}
      />

      {closed ? (
        <p className="rounded-2xl bg-reports/10 px-4 py-3 text-center font-bold text-reports">
          تم إنهاء وحفظ بيانات هذا اليوم. يمكنك مراجعتها أو بدء يوم جديد.
        </p>
      ) : null}

      <Section title="🎯 العمليات الرئيسية">
        <ActionButton
          href="/manual"
          variant="manual"
          size="lg"
          emoji="✏️"
          label="إدخال البيانات يدوياً"
          subtitle="الطريقة الأساسية لإنشاء تذكرة"
          className="min-h-28"
        />
        <ActionButton
          href="/capture"
          variant="camera"
          emoji="📷"
          label="التقاط تذكرة بالكاميرا"
          subtitle="اختياري - يملأ النموذج تلقائياً"
        />
      </Section>

      <Section title="⚡ عمليات سريعة">
        <div className="grid grid-cols-2 gap-3">
          <ActionButton href="/reports" variant="reports" emoji="📊" label="التقارير" />
          <ActionButton href="/settings" variant="settings" emoji="⚙️" label="الإعدادات" />
        </div>
        <ActionButton href="/tickets" variant="neutral" emoji="📋" label="تذاكر اليوم" />
      </Section>

      <Section title="💾 البيانات والتصدير">
        <ActionButton
          href="/export"
          variant="export"
          emoji="📤"
          label="تصدير ومشاركة البيانات"
        />
        <ActionButton
          href="/export?endDay=1"
          variant="danger"
          emoji="🏁"
          label="إنهاء اليوم وحفظ البيانات"
        />
      </Section>
    </div>
  )
}
