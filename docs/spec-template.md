# Szablon specyfikacji SDD — CLBox

> **Spec-Driven Development (SDD)**: specyfikacja jest jedynym źródłem prawdy.
> Wypełnij ten szablon **przed** zleceniem implementacji agentowi AI.
> Usuń sekcje nieistotne dla danego zadania. Zachowaj dokument zwięzły i czytelny.

---

## 1. Identyfikacja

| Pole | Wartość |
|------|---------|
| **Tytuł** | _np. "Dodanie eksportu feedbacku do CSV"_ |
| **Typ** | `[ ] nowa funkcja` `[ ] zmiana istniejącej` `[ ] naprawa błędu` `[ ] refactoring` |
| **Obszar** | _np. `feedback`, `assessment`, `skill-roadmap`, `backend`, `frontend`_ |
| **Priorytet** | `[ ] must-have` `[ ] should-have` `[ ] nice-to-have` |
| **Data** | _YYYY-MM-DD_ |

---

## 2. Cel i kontekst

### Problem / motywacja
> Opisz problem, który rozwiązujesz, lub potrzebę, którą zaspokajasz.
> Odpowiedz na pytania: **kto** ma problem, **co** jest problemem, **dlaczego** jest ważny?

_[Uzupełnij]_

### Cel
> Jedno zdanie opisujące, co chcesz osiągnąć po wdrożeniu.

_[Uzupełnij]_

### Użytkownicy / aktorzy
> Kto korzysta z tej funkcji? Jakie role (np. user, chapter leader, admin)?

| Aktor | Rola / opis |
|-------|-------------|
| _np. Chapter leader_ | _Zarządza oceną umiejętności w swoim teamie_ |

---

## 3. Zakres

### W zakresie (in-scope)
- _[Wymień konkretne funkcje/zachowania, które mają zostać dostarczone]_

### Poza zakresem (out-of-scope)
- _[Wymień wyraźnie, czego NIE obejmuje to zadanie, aby uniknąć rozrostu zakresu]_

---

## 4. Kryteria akceptacji

> Konkretne, weryfikowalne warunki uznania zadania za ukończone.
> Format: "Given [kontekst], when [akcja], then [oczekiwany wynik]"

```
AC-1: Given [kontekst], when [akcja], then [wynik]
AC-2: ...
AC-3: ...
```

---

## 5. Wymagania funkcjonalne

> Opisz zachowanie systemu. Co system **musi robić**?

| ID | Wymaganie |
|----|-----------|
| F-1 | _[Wymaganie funkcjonalne]_ |
| F-2 | _[Wymaganie funkcjonalne]_ |

---

## 6. Wymagania niefunkcjonalne

> Wymagania dotyczące jakości, wydajności, bezpieczeństwa, dostępności.

| Kategoria | Wymaganie |
|-----------|-----------|
| Bezpieczeństwo | _np. "Dostęp tylko dla zalogowanych użytkowników, reguły Firestore"_ |
| Wydajność | _np. "Odpowiedź API < 2s dla p95"_ |
| Dostępność | _np. "Komponent musi być dostępny wg WCAG 2.1 AA"_ |
| Kompatybilność | _np. "Chrome, Firefox, Safari — ostatnie 2 wersje"_ |

---

## 7. Architektura i plan techniczny

### Dotknięte obszary kodu

> Które moduły/pliki będą modyfikowane lub tworzone?

| Obszar | Pliki / moduły | Charakter zmiany |
|--------|---------------|------------------|
| Frontend | `apps/web-app/src/app/features/[moduł]/` | nowy / modyfikacja |
| Backend | `apps/backend/src/app/[funkcja]/` | nowa funkcja / modyfikacja |
| Biblioteki | `libs/[nazwa]/` | nowy model / zmiana interfejsu |
| Firestore | `packages/firestore/firestore.rules` | nowe reguły |

### Projekt danych

> Nowe lub zmieniane struktury danych Firestore / modele TypeScript.

```typescript
// Przykład: nowa kolekcja lub typ
interface ExampleModel {
  id: string;
  // ...
}
```

### Zmiany w Firestore

> Nowe kolekcje, dokumenty lub zmiany reguł bezpieczeństwa.

```
/team/{teamId}/[nowa-kolekcja]/{docId}
  - pole1: typ  // opis
  - pole2: typ  // opis
```

Nowe reguły bezpieczeństwa:
```
// opisz kto może czytać/pisać
```

### Kontrakt API / integracje

> Nowe endpointy Cloud Functions, zmiany w istniejących, integracje Slack.

```
Funkcja: [nazwa-funkcji]
Trigger: HTTP / Firestore trigger / PubSub
Wejście: { ... }
Wyjście: { ... }
Błędy: [lista możliwych błędów]
```

### Zmiany UI

> Nowe lub zmieniane ekrany, komponenty, przepływy użytkownika.

_[Opis lub link do makiety]_

---

## 8. Zadania implementacyjne

> Atomowe jednostki pracy. Każde zadanie powinno być niezależne i weryfikowalne.
> Priorytetyzacja: MoSCoW (Must / Should / Could / Won't).

```
[ ] TASK-1 [must]: [Opis zadania]
    Zależności: brak
    Kryteria: [Co sprawdzić po wykonaniu]

[ ] TASK-2 [must]: [Opis zadania]
    Zależności: TASK-1
    Kryteria: [Co sprawdzić po wykonaniu]

[ ] TASK-3 [should]: [Opis zadania]
    Zależności: TASK-1, TASK-2
    Kryteria: [Co sprawdzić po wykonaniu]

[ ] TASK-4 [could]: [Opis zadania — opcjonalne ulepszenie]
```

---

## 9. Testy

### Testy jednostkowe

> Co powinno być pokryte testami jednostkowymi?

- _[Np. "Reducer dla feedbacku — wszystkie akcje"]_
- _[Np. "Funkcja transformująca model oceny"]_

### Testy integracyjne / E2E

> Kluczowe przepływy do przetestowania manualnie lub automatycznie.

- _[Np. "Pełny przepływ: stworzenie oceny → powiadomienie Slack → wyświetlenie w UI"]_

### Przypadki brzegowe

- _[Np. "Co gdy użytkownik nie ma przypisanego chapter leadera?"]_
- _[Np. "Co gdy Slack API zwróci błąd?"]_

---

## 10. Instrukcje dla agenta AI

> Specyficzne wskazówki, ograniczenia lub konwencje, które agent powinien przestrzegać.

### Wymagane konwencje
- Używaj wzorca Redux Observable (epics) dla efektów ubocznych, nie thunków
- Komponenty React: wyłącznie funkcyjne z hookami
- Pełna typizacja TypeScript — bez `any`
- Obserwuj istniejące konwencje nazewnictwa w module `[nazwa modułu]`

### Środowisko
- Node.js 20 dla Cloud Functions
- Firebase Admin SDK do operacji na Firestore w backendzie
- Firestore SDK (web) w frontendzie

### Zakazy / ograniczenia
- _[Np. "Nie zmieniaj istniejącego modelu danych bez oddzielnego zadania migracji"]_
- _[Np. "Nie dodawaj nowych bibliotek bez uzgodnienia"]_

### Weryfikacja
Po implementacji agent powinien:
1. Uruchomić `npm run lint` i poprawić wszystkie błędy
2. Uruchomić `npm test` i upewnić się, że wszystkie testy przechodzą
3. Zbudować projekt: `npm run build`
4. Sprawdzić reguły Firestore jeśli były zmieniane: `firebase deploy --only firestore`

---

## 11. Ryzyka i założenia

| Ryzyko / Założenie | Prawdopodobieństwo | Mitygacja |
|--------------------|--------------------|-----------|
| _[np. "Zmiana modelu Firestore wymaga migracji danych"]_ | Średnie | _[np. "Napisać skrypt migracji przed deploymentem"]_ |

---

## 12. Odniesienia

> Linki do powiązanych zadań, dokumentacji, PR-ów, dyskusji.

- Issue: _[link]_
- Powiązane PR: _[link]_
- Dokumentacja zewnętrzna: _[link]_

---

## Status

| Faza | Status | Data | Uwagi |
|------|--------|------|-------|
| Specyfikacja | `[ ] szkic` `[ ] gotowa` `[ ] zatwierdzona` | | |
| Planowanie | `[ ] nie started` `[ ] w toku` `[ ] gotowe` | | |
| Implementacja | `[ ] nie started` `[ ] w toku` `[ ] gotowe` | | |
| Review | `[ ] nie started` `[ ] w toku` `[ ] zatwierdzone` | | |
| Deploy | `[ ] nie started` `[ ] w toku` `[ ] wdrożone` | | |
