export type Platform = 'Allegro' | 'Empik' | 'Amazon' | 'Erli'

/** Jeden wiersz z wgranego CSV, po sparsowaniu i walidacji. */
export interface SalesRow {
  sku: string
  nazwaProduktu: string
  kategoria: string
  platforma: Platform
  cenaZakupu: number
  cenaSprzedazy: number
  sprzedaneSzt: number
  wydatkiAds: number
  liczbaZwrotow: number
}

export type StatusKategorii = 'strata' | 'niska_marza' | 'zdrowy'

export interface ProductAnalysis {
  row: SalesRow
  przychod: number
  kosztZakupu: number
  prowizja: number
  kosztZwrotow: number
  zysk: number
  marzaProcent: number
  wskaznikZwrotow: number
  status: StatusKategorii
  rekomendacja: string
  uzasadnienie: string
}

export interface ParseError {
  wiersz: number | null
  komunikat: string
}

export interface ParseResult {
  rows: SalesRow[]
  errors: ParseError[]
}
