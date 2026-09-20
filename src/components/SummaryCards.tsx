import { useMemo } from 'react'
import { formatPLN } from '../lib/format'
import type { ProductAnalysis } from '../types'

interface SummaryCardsProps {
  analizy: ProductAnalysis[]
}

export function SummaryCards({ analizy }: SummaryCardsProps) {
  const dane = useMemo(() => {
    const sumaZysku = analizy.reduce((suma, a) => suma + a.zysk, 0)
    const stratne = analizy.filter((a) => a.status === 'strata')
    const niskaMarza = analizy.filter((a) => a.status === 'niska_marza')
    const zdrowe = analizy.filter((a) => a.status === 'zdrowy')
    const sumaStrat = stratne.reduce((suma, a) => suma + a.zysk, 0)

    return { sumaZysku, stratne, niskaMarza, zdrowe, sumaStrat }
  }, [analizy])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Karta
        etykieta="Łączny zysk netto"
        wartosc={formatPLN(dane.sumaZysku)}
        podtekst={`z ${analizy.length} pozycji w raporcie`}
        kolor={dane.sumaZysku >= 0 ? 'text-emerald-700' : 'text-red-700'}
      />
      <Karta
        etykieta="Tracą pieniądze"
        wartosc={`${dane.stratne.length}`}
        podtekst={
          dane.stratne.length > 0
            ? `łącznie ${formatPLN(Math.abs(dane.sumaStrat))} straty / mies.`
            : 'żaden produkt nie przynosi straty'
        }
        kolor="text-red-700"
      />
      <Karta
        etykieta="Niska marża"
        wartosc={`${dane.niskaMarza.length}`}
        podtekst="warto zoptymalizować cenę lub koszty"
        kolor="text-amber-600"
      />
      <Karta
        etykieta="Zdrowe produkty"
        wartosc={`${dane.zdrowe.length}`}
        podtekst="marża 15% lub więcej"
        kolor="text-emerald-700"
      />
    </div>
  )
}

function Karta({
  etykieta,
  wartosc,
  podtekst,
  kolor,
}: {
  etykieta: string
  wartosc: string
  podtekst: string
  kolor: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{etykieta}</p>
      <p className={`mt-2 text-2xl font-semibold ${kolor}`}>{wartosc}</p>
      <p className="mt-1 text-xs text-slate-400">{podtekst}</p>
    </div>
  )
}
