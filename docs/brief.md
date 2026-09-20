# Tłumacz rentowności — brief projektu (Boss Fight)

## Co to jest
Narzędzie, które bierze dane sprzedażowe sprzedawcy e-commerce (Allegro, Empik, Amazon, Erli) i tłumaczy je na prosty język: które produkty tracą pieniądze, które warto podnieść w cenie, które wycofać. Zamiast tabel i wskaźników — konkretna, czytelna rekomendacja.

## Dla kogo
Mali, jednoosobowi sprzedawcy e-commerce bez działu analitycznego, którzy nie znają realnej marży na poziomie pojedynczego produktu — bo dane leżą rozproszone w kilku panelach, a nikt nie ma czasu ich zestawiać i interpretować.

## Etap 1 — MVP (Boss Fight, 2 tygodnie)
**Sposób działania:** użytkownik wgrywa eksport CSV z danymi sprzedażowymi (produkt, platforma, cena zakupu, cena sprzedaży, sztuki sprzedane, wydatki na reklamę, zwroty). Agent liczy realną marżę per produkt (uwzględniając prowizje platform, koszty Ads, zwroty) i generuje czytelny raport w prostym języku.

**Źródło danych na MVP:** przygotowany przykładowy plik CSV (40 produktów, kategoria zabawki, 4 platformy) — pokazuje mechanizm działania bez konieczności integracji z żywymi API.

**Ograniczenie świadomie przyjęte na ten etap:** klient musi sam przygotować i wgrać plik — ręczne eksporty z kilku paneli (BaseLinker + Allegro Ads + inne), sklejone w jeden arkusz.

## Etap 2 — plan rozwoju: automatyzacja zbierania danych (n8n)
**Problem, który to rozwiązuje:** ręczne przygotowanie arkusza co miesiąc (eksport z BaseLinkera + osobny eksport z Allegro Ads + zwroty) to tarcie, przez które klient przestaje wracać do narzędzia po 2-3 miesiącach.

**Rozwiązanie:** workflow w n8n, który automatycznie, cyklicznie (np. raz w miesiącu):
1. Pobiera dane sprzedażowe przez API BaseLinkera (zamawia, agreguje zamówienia ze wszystkich podłączonych platform).
2. Pobiera wydatki na Allegro Ads przez raportowanie/API kampanii.
3. Łączy oba źródła po SKU w jeden zestaw danych.
4. Podaje gotowy zestaw bezpośrednio do agenta analizującego rentowność — bez udziału klienta.
5. Wysyła gotowy raport (np. mailem albo na Slacka/Telegram) — klient nic nie robi, tylko czyta wynik.

**Dlaczego to ważne biznesowo:** to naturalne rozszerzenie oferty "Opieka po wdrożeniu" (250 zł/mc) — różnica między jednorazowym narzędziem a usługą, za którą klient płaci co miesiąc, bo realnie oszczędza mu to pracę, a nie tylko daje raport.

**Status:** nie wchodzi w zakres Boss Fight (2 tygodnie), ale jest częścią roadmapy produktu i wart wspomnienia w prezentacji jako "co dalej".

## Czego użyto z całego szkolenia
- Claude Code — budowa aplikacji od zera z planowaniem, iteracyjnym rozwojem i deployem.
- n8n — projektowana (etap 2) automatyzacja pobierania danych z wielu źródeł.
- Wiedza o realiach e-commerce (Allegro/Empik/Amazon/Erli) — prowizje, specyfika platform, bóle mikro-sprzedawców.
- Podejście "opisz → sprawdź → popraw" z metodologii kursu.
