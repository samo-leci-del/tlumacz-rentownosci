import { useMemo, useState } from 'react'
import { formatPLN } from '../lib/format'
import { STATUS_STYLE } from '../lib/statusStyles'
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
                ? 'bg-ink text-paper'
                : 'bg-paper text-ink-muted shadow-sm hover:text-ink'
            }`}
          >
            {ETYKIETY_FILTROW[f]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {widoczne.map((a) => {
          const styl = STATUS_STYLE[a.status]
          return (
            <div
              key={`${a.row.sku}-${a.row.platforma}`}
              className={`rounded-xl bg-paper p-5 shadow-sm ${
                a.status === 'strata' ? 'border-l-4 border-accent' : ''
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {styl.ikona} {a.row.nazwaProduktu}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink-faint">
                    {a.row.sku} · {a.row.platforma} · {a.row.kategoria}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-2xl font-bold ${styl.tekst}`}>
                    {formatPLN(a.zysk)}
                  </p>
                  <p className="font-mono text-xs text-ink-faint">
                    marża {a.marzaProcent.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div
                className={`mt-3 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${styl.tlo} ${styl.tekst}`}
              >
                {a.rekomendacja}
              </div>
              <p className="mt-2 text-sm text-ink-muted">{a.uzasadnienie}</p>
            </div>
          )
        })}
        {widoczne.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-faint">
            Brak produktów w tej kategorii.
          </p>
        )}
      </div>
    </div>
  )
}
