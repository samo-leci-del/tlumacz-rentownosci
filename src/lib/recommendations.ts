import type { SalesRow, StatusKategorii } from '../types'
import { formatPLN as fmt } from './format'
import { STAWKI_PROWIZJI } from './platformRates'
import type { Metryki } from './profitability'

/** Poniżej tej liczby sztuk/mies. uznajemy popyt na produkt za niski. */
const PROG_WOLUMENU = 20
/** Granica między "niską marżą" a "zdrowym" produktem. */
const PROG_ZDROWEJ_MARZY = 15
/** Docelowa marża, do której liczymy sugerowaną podwyżkę ceny. */
const DOCELOWA_MARZA = 0.1
/** Powyżej tego wskaźnika zwrotów dopisujemy ostrzeżenie w uzasadnieniu. */
const PROG_WYSOKICH_ZWROTOW = 0.15

/**
 * Cena sprzedaży, przy której marża osiągnęłaby DOCELOWA_MARZA — przy założeniu
 * niezmienionego wolumenu sprzedaży, wydatków Ads i liczby zwrotów.
 * Wyprowadzone z: zysk(cena) = cena*[szt*(1-stawka) - zwroty] - stałeKoszty,
 * gdzie stałeKoszty = kosztZakupu + wydatkiAds + zwroty*cenaZakupu.
 * Zwraca null, gdy sama podwyżka ceny nie wystarczy (mianownik <= 0).
 */
function cenaDlaDocelowejMarzy(row: SalesRow, metryki: Metryki): number | null {
  const stawka = STAWKI_PROWIZJI[row.platforma]
  const staleKoszty = metryki.kosztZakupu + row.wydatkiAds + row.liczbaZwrotow * row.cenaZakupu
  const mianownik = row.sprzedaneSzt * (1 - stawka - DOCELOWA_MARZA) - row.liczbaZwrotow

  if (mianownik <= 0) return null
  return staleKoszty / mianownik
}

function najwiekszyKoszt(row: SalesRow, metryki: Metryki): { nazwa: string; kwota: number } {
  const skladniki = [
    { nazwa: 'prowizję platformy', kwota: metryki.prowizja },
    { nazwa: 'wydatki na reklamę', kwota: row.wydatkiAds },
    { nazwa: 'straty na zwrotach', kwota: metryki.kosztZwrotow },
  ]
  return skladniki.reduce((a, b) => (b.kwota > a.kwota ? b : a))
}

function zdanieOZwrotach(metryki: Metryki): string {
  if (metryki.wskaznikZwrotow <= PROG_WYSOKICH_ZWROTOW) return ''
  const procent = Math.round(metryki.wskaznikZwrotow * 100)
  return ` Uwaga: aż ${procent}% sprzedanych sztuk wraca jako zwrot — warto sprawdzić opis produktu, zdjęcia albo rozmiarówkę.`
}

export function zbudujRekomendacje(
  row: SalesRow,
  metryki: Metryki,
): { status: StatusKategorii; rekomendacja: string; uzasadnienie: string } {
  const zyskNaSztuke = row.sprzedaneSzt > 0 ? metryki.zysk / row.sprzedaneSzt : metryki.zysk

  if (metryki.marzaProcent < 0) {
    const dobryPopyt = row.sprzedaneSzt >= PROG_WOLUMENU

    if (dobryPopyt) {
      const sugerowanaCena = cenaDlaDocelowejMarzy(row, metryki)
      const rekomendacja = sugerowanaCena
        ? `Podnieś cenę do ok. ${fmt(sugerowanaCena)} (obecnie ${fmt(row.cenaSprzedazy)})`
        : 'Podnieś cenę — obecna nie pokrywa kosztów nawet przy dużej sprzedaży'
      const uzasadnienie =
        `Sprzedałeś ${row.sprzedaneSzt} szt., ale tracisz ${fmt(Math.abs(zyskNaSztuke))} na sztuce ` +
        `(łącznie ${fmt(Math.abs(metryki.zysk))} straty). Jest popyt, więc warto podnieść cenę zamiast wycofywać produkt.` +
        zdanieOZwrotach(metryki)
      return { status: 'strata', rekomendacja, uzasadnienie }
    }

    const rekomendacja = 'Wycofaj produkt z oferty'
    const uzasadnienie =
      `Sprzedałeś tylko ${row.sprzedaneSzt} szt. i przy tym tracisz ${fmt(Math.abs(metryki.zysk))} łącznie. ` +
      `Niski popyt i strata na każdej sztuce — utrzymywanie tej oferty nie ma sensu.` +
      zdanieOZwrotach(metryki)
    return { status: 'strata', rekomendacja, uzasadnienie }
  }

  if (metryki.marzaProcent < PROG_ZDROWEJ_MARZY) {
    const { nazwa, kwota } = najwiekszyKoszt(row, metryki)
    const rekomendacja = 'Rozważ podniesienie ceny albo ograniczenie kosztów'
    const uzasadnienie =
      `Marża wynosi tylko ${metryki.marzaProcent.toFixed(1)}% (${fmt(metryki.zysk)} zysku z ${fmt(metryki.przychod)} przychodu). ` +
      `Najwięcej zjada ${nazwa} (${fmt(kwota)}) — to pierwsze miejsce do optymalizacji.` +
      zdanieOZwrotach(metryki)
    return { status: 'niska_marza', rekomendacja, uzasadnienie }
  }

  const rekomendacja = 'Produkt rentowny — kontynuuj sprzedaż'
  const uzasadnienie =
    `Zdrowa marża ${metryki.marzaProcent.toFixed(1)}% (${fmt(metryki.zysk)} zysku z ${fmt(metryki.przychod)} przychodu przy ${row.sprzedaneSzt} szt.).` +
    zdanieOZwrotach(metryki)
  return { status: 'zdrowy', rekomendacja, uzasadnienie }
}
