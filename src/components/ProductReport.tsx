import { useMemo, useState } from 'react'
import { formatPLN } from '../lib/format'
import type { ProductAnalysis, StatusKategorii } from '../types'

interface ProductReportProps {
  analizy: ProductAnalysis[]
}

type Filtr = 'wszystkie' | StatusKategorii

const ETYKIETY_FILTROW: Record<Filtr, string> = {
  wszystkie: 'Wszystkie',
  strata: '🔴 Tracą',
  niska_marza: '🟡 Niska marża',
  zdrowy: '🟢 Zdrowe',
}

const STYL_ZNACZNIKA: Record<StatusKategorii, string> = {
  strata: 'bg-red-100 text-red-800',
  niska_marza: 'bg-amber-100 text-amber-800',
  zdrowy: 'bg-emerald-100 text-emerald-800',
}

const IKONA_STATUSU: Record<StatusKategorii, string> = {
  strata: '🔴',
  niska_marza: '🟡',
  zdrowy: '🟢',
}

export function ProductReport({ analizy }: ProductReportProps) {
  const [filtr, setFiltr] = useState<Filtr>('wszystkie')

  const posortowane = useMemo(
    () => [...analizy].sort((a, b) => a.zysk - b.zysk),
    [analizy],
  )

  const widoczne = useMemo(
    () => (filtr === 'wszystkie' ? posortowane : posortowane.filter((a) => a.status === filtr)),
    [posortowane, filtr],
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(ETYKIETY_FILTROW) as Filtr[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltr(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtr === f
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {ETYKIETY_FILTROW[f]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {widoczne.map((a) => (
          <div
            key={`${a.row.sku}-${a.row.platforma}`}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">
                  {IKONA_STATUSU[a.status]} {a.row.nazwaProduktu}
                </p>
                <p className="text-xs text-slate-400">
                  {a.row.sku} · {a.row.platforma} · {a.row.kategoria}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${a.zysk >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                >
                  {formatPLN(a.zysk)}
                </p>
                <p className="text-xs text-slate-400">marża {a.marzaProcent.toFixed(1)}%</p>
              </div>
            </div>
            <div
              className={`mt-3 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${STYL_ZNACZNIKA[a.status]}`}
            >
              {a.rekomendacja}
            </div>
            <p className="mt-2 text-sm text-slate-600">{a.uzasadnienie}</p>
          </div>
        ))}
        {widoczne.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Brak produktów w tej kategorii.
          </p>
        )}
      </div>
    </div>
  )
}
