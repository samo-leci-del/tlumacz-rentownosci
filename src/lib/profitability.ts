import type { ProductAnalysis, SalesRow } from '../types'
import { STAWKI_PROWIZJI } from './platformRates'
import { zbudujRekomendacje } from './recommendations'

export interface Metryki {
  przychod: number
  kosztZakupu: number
  prowizja: number
  kosztZwrotow: number
  zysk: number
  marzaProcent: number
  wskaznikZwrotow: number
}

/**
 * Wzór per wiersz (jeden produkt na jednej platformie):
 * zysk = przychód − koszt zakupu − prowizja platformy − wydatki Ads − koszt zwrotów
 * koszt zwrotów = liczba zwrotów × (cena sprzedaży + cena zakupu) — zwrócona sztuka
 * to utracony przychód (zwrot pieniędzy) i utracony koszt zakupu (towar nie wraca do sprzedaży).
 */
export function obliczMetryki(row: SalesRow): Metryki {
  const stawka = STAWKI_PROWIZJI[row.platforma]

  const przychod = row.cenaSprzedazy * row.sprzedaneSzt
  const kosztZakupu = row.cenaZakupu * row.sprzedaneSzt
  const prowizja = przychod * stawka
  const kosztZwrotow = row.liczbaZwrotow * (row.cenaSprzedazy + row.cenaZakupu)
  const zysk = przychod - kosztZakupu - prowizja - row.wydatkiAds - kosztZwrotow
  const marzaProcent = przychod > 0 ? (zysk / przychod) * 100 : 0
  const wskaznikZwrotow = row.sprzedaneSzt > 0 ? row.liczbaZwrotow / row.sprzedaneSzt : 0

  return { przychod, kosztZakupu, prowizja, kosztZwrotow, zysk, marzaProcent, wskaznikZwrotow }
}

export function analizujProdukt(row: SalesRow): ProductAnalysis {
  const metryki = obliczMetryki(row)
  const { status, rekomendacja, uzasadnienie } = zbudujRekomendacje(row, metryki)

  return {
    row,
    ...metryki,
    status,
    rekomendacja,
    uzasadnienie,
  }
}

export function analizujWszystkie(rows: SalesRow[]): ProductAnalysis[] {
  return rows.map(analizujProdukt)
}
