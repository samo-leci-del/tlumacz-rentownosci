# Tłumacz rentowności

Narzędzie webowe dla małych sprzedawców e-commerce (Allegro, Empik, Amazon, Erli), które
zamienia eksport CSV ze sprzedaży w prosty, czytelny raport: które produkty tracą pieniądze,
które warto podnieść w cenie, a które wycofać z oferty.

Zamiast tabel i wskaźników — konkretna rekomendacja z liczbowym uzasadnieniem.

## Jak to działa

1. Wgrywasz plik CSV z danymi sprzedażowymi (kolumny: SKU, Nazwa produktu, Kategoria,
   Platforma, Cena zakupu, Cena sprzedaży, Sprzedane szt., Wydatki Ads, Liczba zwrotów).
2. Narzędzie liczy realną marżę per produkt, uwzględniając prowizję platformy, koszty
   reklamy i straty na zwrotach.
3. Dostajesz raport w prostym języku — co robić z każdym produktem i dlaczego.

**Cała logika działa w przeglądarce.** Plik CSV nigdy nie trafia na żaden serwer — dane
klienta zostają na jego komputerze.

## Uproszczenia MVP

- **Stawki prowizji** — tabela kategoria × platforma dla 8 głównych kategorii e-commerce
  (patrz `src/lib/platformRates.ts`), realistyczne przybliżenia w widełkach z brief'u, nie
  ceniki 1:1 z regulaminów platform. Kategoria spoza tabeli dostaje cichy fallback (dawne
  stałe: Allegro 12%, Empik 9%, Amazon 10%, Erli 8%) zamiast błędu.
- **Koszt zwrotu** liczony jako `cena sprzedaży + cena zakupu` na sztukę (utracony przychód
  + utracony koszt zakupu, zakładając że zwrócony towar nie wraca do sprzedaży).
- Brak integracji z API platform — dane wgrywane są ręcznie jako CSV.

## Rozwój (poza zakresem MVP)

Docelowo: automatyzacja zbierania danych przez n8n (BaseLinker API + Allegro Ads API), żeby
raport generował się cyklicznie bez ręcznego eksportu — patrz `docs/brief.md` (etap 2).

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Przykładowy plik do testów: `sample-data/przykladowe_dane_sprzedazowe_v2.csv`.

## Stack

React + Vite + TypeScript + Tailwind CSS, parsowanie CSV przez `papaparse`. Bez backendu i
bazy danych.
