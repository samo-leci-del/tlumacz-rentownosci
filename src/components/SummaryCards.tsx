import { useMemo } from 'react'
import { formatPLN } from '../lib/format'
import { STATUS_STYLE } from '../lib/statusStyles'
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
        kolor={dane.sumaZysku >= 0 ? STATUS_STYLE.zdrowy.tekst : STATUS_STYLE.strata.tekst}
      />
      <Karta
        etykieta="Tracą pieniądze"
        wartosc={`${dane.stratne.length}`}
        podtekst={
          dane.stratne.length > 0
            ? `łącznie ${formatPLN(Math.abs(dane.sumaStrat))} straty / mies.`
            : 'żaden produkt nie przynosi straty'
        }
        kolor={STATUS_STYLE.strata.tekst}
      />
      <Karta
        etykieta="Niska marża"
        wartosc={`${dane.niskaMarza.length}`}
        podtekst="warto zoptymalizować cenę lub koszty"
        kolor={STATUS_STYLE.niska_marza.tekst}
      />
      <Karta
        etykieta="Zdrowe produkty"
        wartosc={`${dane.zdrowe.length}`}
        podtekst="marża 15% lub więcej"
        kolor={STATUS_STYLE.zdrowy.tekst}
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
    <div className="rounded-2xl bg-paper p-5 shadow-sm">
      <p className="text-sm font-medium text-ink-muted">{etykieta}</p>
      <p className={`mt-2 font-mono text-2xl font-bold whitespace-nowrap ${kolor}`}>{wartosc}</p>
      <p className="mt-1 text-xs text-ink-faint">{podtekst}</p>
    </div>
  )
}
