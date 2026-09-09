'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Toast, type ToastState } from '@/components/Toast'
import { getSettings, saveSettings, todayString } from '@/lib/storage'
import type { DailySettings } from '@/lib/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<DailySettings>({
    date: todayString(),
    dum: '',
    navire: '',
    produit: '',
    client: '',
  })
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  function update<K extends keyof DailySettings>(key: K, value: DailySettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveSettings(settings)
    setToast({ kind: 'success', message: 'تم حفظ الإعدادات.' })
  }

  const inputClass =
    'w-full rounded-2xl border border-border bg-card px-4 py-3 text-lg text-card-foreground outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'mb-1 block text-sm font-bold text-muted-foreground'

  const fields: { key: keyof DailySettings; label: string; type?: string }[] = [
    { key: 'date', label: 'التاريخ', type: 'date' },
    { key: 'dum', label: 'DUM' },
    { key: 'navire', label: 'Navire' },
    { key: 'produit', label: 'Produit' },
    { key: 'client', label: 'Client' },
  ]

  return (
    <main className="min-h-dvh bg-background pb-10">
      <Header title="⚙️ الإعدادات اليومية" subtitle="تُرفق هذه القيم بسجلات اليوم" backHref="/" />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <form onSubmit={handleSave} className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className={labelClass}>
              {f.label}
            </label>
            <input
              id={f.key}
              type={f.type ?? 'text'}
              value={settings[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              className={inputClass}
            />
          </div>
        ))}

        <button
          type="submit"
          className="mt-2 w-full rounded-2xl bg-settings px-4 py-4 text-lg font-bold text-settings-foreground shadow-sm active:scale-[0.98]"
        >
          💾 حفظ الإعدادات
        </button>
      </form>
    </main>
  )
}
