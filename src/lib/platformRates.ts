import { usunPolskieZnaki } from './csvParser'
import type { Platform } from '../types'

/**
 * Stawki domyślne — używane, gdy kategoria z CSV nie pasuje do żadnego
 * wiersza w STAWKI_KATEGORII (literówka, kategoria spoza listy poniżej).
 * To dawne "jedyne" stawki platformowe, teraz w roli fallbacku.
 */
export const STAWKI_DOMYSLNE: Record<Platform, number> = {
  Allegro: 0.12,
  Empik: 0.09,
  Amazon: 0.1,
  Erli: 0.08,
}

/**
 * Stawki prowizji per kategoria × platforma — realistyczne przybliżenia
 * w widełkach z brief'u (Allegro 1–17% + ~1,2% opłaty transakcyjnej wliczone,
 * Empik 2,5–15,5%, Amazon 5–15%, Erli 5–10%). Klucze znormalizowane przez
 * usunPolskieZnaki (małe litery, bez polskich znaków).
 */
export const STAWKI_KATEGORII: Record<string, Record<Platform, number>> = {
  elektronika: { Allegro: 0.04, Empik: 0.08, Amazon: 0.07, Erli: 0.05 },
  zabawki: { Allegro: 0.11, Empik: 0.09, Amazon: 0.15, Erli: 0.08 },
  'dom i kuchnia': { Allegro: 0.12, Empik: 0.1, Amazon: 0.15, Erli: 0.08 },
  'moda i odziez': { Allegro: 0.16, Empik: 0.13, Amazon: 0.15, Erli: 0.1 },
  'uroda i zdrowie': { Allegro: 0.12, Empik: 0.11, Amazon: 0.1, Erli: 0.09 },
  'sport i rekreacja': { Allegro: 0.1, Empik: 0.1, Amazon: 0.15, Erli: 0.08 },
  'ksiazki i multimedia': { Allegro: 0.05, Empik: 0.05, Amazon: 0.1, Erli: 0.05 },
  motoryzacja: { Allegro: 0.07, Empik: 0.09, Amazon: 0.1, Erli: 0.07 },
}

/**
 * Podkategorie z przykładowych danych (sklep z zabawkami), które nie pasują
 * literalnie do żadnego klucza w STAWKI_KATEGORII, zmapowane na "zabawki".
 * Otwarte na rozbudowę o kolejne aliasy w miarę potrzeb.
 */
const ALIASY_KATEGORII: Record<string, string> = {
  klocki: 'zabawki',
  lalki: 'zabawki',
  pojazdy: 'zabawki',
  'gry planszowe': 'zabawki',
  pluszaki: 'zabawki',
  edukacyjne: 'zabawki',
  sezonowe: 'zabawki',
  'zabawki aktywne': 'zabawki',
  figurki: 'zabawki',
}

/**
 * Stawka prowizji dla danej kategorii i platformy. Kategorie nierozpoznane
 * (spoza tabeli i aliasów) dostają cichy fallback — STAWKI_DOMYSLNE — zamiast błędu.
 */
export function pobierzStawke(kategoria: string, platforma: Platform): number {
  const znormalizowana = usunPolskieZnaki(kategoria.trim())
  const kanoniczna = ALIASY_KATEGORII[znormalizowana] ?? znormalizowana
  const stawki = STAWKI_KATEGORII[kanoniczna]
  return stawki ? stawki[platforma] : STAWKI_DOMYSLNE[platforma]
}
