import Papa from 'papaparse'
import type { ParseError, ParseResult, Platform, SalesRow } from '../types'

type Kanoniczne =
  | 'sku'
  | 'nazwaProduktu'
  | 'kategoria'
  | 'platforma'
  | 'cenaZakupu'
  | 'cenaSprzedazy'
  | 'sprzedaneSzt'
  | 'wydatkiAds'
  | 'liczbaZwrotow'

const NAZWY_PL: Record<Kanoniczne, string> = {
  sku: 'SKU',
  nazwaProduktu: 'Nazwa produktu',
  kategoria: 'Kategoria',
  platforma: 'Platforma',
  cenaZakupu: 'Cena zakupu',
  cenaSprzedazy: 'Cena sprzedazy',
  sprzedaneSzt: 'Sprzedane szt',
  wydatkiAds: 'Wydatki Ads',
  liczbaZwrotow: 'Liczba zwrotow',
}

const PLATFORMY: Record<string, Platform> = {
  allegro: 'Allegro',
  empik: 'Empik',
  'empik place': 'Empik',
  amazon: 'Amazon',
  'amazon.pl': 'Amazon',
  erli: 'Erli',
}

export function usunPolskieZnaki(tekst: string): string {
  return tekst
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/[óo]/g, 'o')
    .replace(/ś/g, 's')
    .replace(/[źż]/g, 'z')
}

function normalizujNaglowek(naglowek: string): string {
  return usunPolskieZnaki(naglowek)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function znajdzKolumny(naglowki: string[]): {
  mapowanie: Partial<Record<Kanoniczne, number>>
  brakujace: Kanoniczne[]
} {
  const znormalizowane = naglowki.map(normalizujNaglowek)
  const mapowanie: Partial<Record<Kanoniczne, number>> = {}

  const dopasuj = (klucz: Kanoniczne, test: (h: string) => boolean) => {
    const idx = znormalizowane.findIndex(test)
    if (idx !== -1) mapowanie[klucz] = idx
  }

  dopasuj('sku', (h) => h === 'sku' || h.includes('sku'))
  dopasuj('nazwaProduktu', (h) => h.includes('nazwa'))
  dopasuj('kategoria', (h) => h.includes('kategoria'))
  dopasuj('platforma', (h) => h.includes('platforma'))
  dopasuj('cenaZakupu', (h) => h.includes('cena') && h.includes('zakup'))
  dopasuj('cenaSprzedazy', (h) => h.includes('cena') && h.includes('sprzedaz'))
  dopasuj('sprzedaneSzt', (h) => h.includes('sprzedane') || (h.includes('szt') && !h.includes('cena')))
  dopasuj('wydatkiAds', (h) => h.includes('ads') || h.includes('reklam'))
  dopasuj('liczbaZwrotow', (h) => h.includes('zwrot'))

  const wymagane: Kanoniczne[] = [
    'sku',
    'nazwaProduktu',
    'kategoria',
    'platforma',
    'cenaZakupu',
    'cenaSprzedazy',
    'sprzedaneSzt',
    'wydatkiAds',
    'liczbaZwrotow',
  ]
  const brakujace = wymagane.filter((k) => mapowanie[k] === undefined)

  return { mapowanie, brakujace }
}

function parsujLiczbe(wartosc: string | undefined): number | null {
  if (wartosc === undefined) return null
  const oczyszczona = wartosc.trim().replace(/\s/g, '').replace(',', '.')
  if (oczyszczona === '') return null
  const liczba = Number(oczyszczona)
  return Number.isFinite(liczba) ? liczba : null
}

export function parseCsv(tekstCsv: string): ParseResult {
  const wynik = Papa.parse<string[]>(tekstCsv, {
    skipEmptyLines: true,
  })

  const wiersze = wynik.data
  if (wiersze.length === 0) {
    return {
      rows: [],
      errors: [{ wiersz: null, komunikat: 'Plik CSV jest pusty.' }],
    }
  }

  const [naglowki, ...daneWierszy] = wiersze
  const { mapowanie, brakujace } = znajdzKolumny(naglowki)

  if (brakujace.length > 0) {
    return {
      rows: [],
      errors: [
        {
          wiersz: null,
          komunikat: `W pliku brakuje wymaganych kolumn: ${brakujace
            .map((k) => `"${NAZWY_PL[k]}"`)
            .join(', ')}. Sprawdź nagłówki w pierwszym wierszu pliku.`,
        },
      ],
    }
  }

  const rows: SalesRow[] = []
  const errors: ParseError[] = []

  daneWierszy.forEach((wiersz, idx) => {
    const numerWiersza = idx + 2 // +1 za nagłówek, +1 bo liczymy od 1
    const pobierz = (klucz: Kanoniczne) => wiersz[mapowanie[klucz]!]?.trim()

    const sku = pobierz('sku')
    const nazwaProduktu = pobierz('nazwaProduktu')
    const kategoria = pobierz('kategoria')
    const platformaSurowa = pobierz('platforma')

    if (!sku || !nazwaProduktu) {
      errors.push({
        wiersz: numerWiersza,
        komunikat: `Wiersz ${numerWiersza}: brakuje SKU lub nazwy produktu — wiersz pominięty.`,
      })
      return
    }

    const platforma = platformaSurowa
      ? PLATFORMY[usunPolskieZnaki(platformaSurowa).trim()]
      : undefined
    if (!platforma) {
      errors.push({
        wiersz: numerWiersza,
        komunikat: `Wiersz ${numerWiersza} (${sku}): nierozpoznana platforma "${platformaSurowa ?? ''}" — oczekiwano Allegro / Empik / Amazon / Erli. Wiersz pominięty.`,
      })
      return
    }

    const cenaZakupu = parsujLiczbe(pobierz('cenaZakupu'))
    const cenaSprzedazy = parsujLiczbe(pobierz('cenaSprzedazy'))
    const sprzedaneSzt = parsujLiczbe(pobierz('sprzedaneSzt'))
    const wydatkiAds = parsujLiczbe(pobierz('wydatkiAds'))
    const liczbaZwrotow = parsujLiczbe(pobierz('liczbaZwrotow'))

    const liczboweBledy: string[] = []
    if (cenaZakupu === null) liczboweBledy.push(NAZWY_PL.cenaZakupu)
    if (cenaSprzedazy === null) liczboweBledy.push(NAZWY_PL.cenaSprzedazy)
    if (sprzedaneSzt === null) liczboweBledy.push(NAZWY_PL.sprzedaneSzt)
    if (wydatkiAds === null) liczboweBledy.push(NAZWY_PL.wydatkiAds)
    if (liczbaZwrotow === null) liczboweBledy.push(NAZWY_PL.liczbaZwrotow)

    if (liczboweBledy.length > 0) {
      errors.push({
        wiersz: numerWiersza,
        komunikat: `Wiersz ${numerWiersza} (${sku}): nieprawidłowa wartość liczbowa w kolumnie ${liczboweBledy.join(', ')} — wiersz pominięty.`,
      })
      return
    }

    if (sprzedaneSzt! < 0) {
      errors.push({
        wiersz: numerWiersza,
        komunikat: `Wiersz ${numerWiersza} (${sku}): liczba sprzedanych sztuk nie może być ujemna (wpisano: ${sprzedaneSzt}) — sprawdź dane źródłowe. Wiersz pominięty.`,
      })
      return
    }

    if (liczbaZwrotow! > sprzedaneSzt!) {
      errors.push({
        wiersz: numerWiersza,
        komunikat: `Wiersz ${numerWiersza} (${sku}): liczba zwrotów (${liczbaZwrotow}) jest większa niż liczba sprzedanych sztuk (${sprzedaneSzt}) — sprawdź dane źródłowe. Wiersz pominięty.`,
      })
      return
    }

    rows.push({
      sku,
      nazwaProduktu,
      kategoria: kategoria ?? '',
      platforma,
      cenaZakupu: cenaZakupu!,
      cenaSprzedazy: cenaSprzedazy!,
      sprzedaneSzt: sprzedaneSzt!,
      wydatkiAds: wydatkiAds!,
      liczbaZwrotow: liczbaZwrotow!,
    })
  })

  if (rows.length === 0) {
    errors.unshift({
      wiersz: null,
      komunikat: 'Żaden wiersz z pliku nie zawierał poprawnych danych.',
    })
  }

  return { rows, errors }
}
