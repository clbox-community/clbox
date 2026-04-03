# CLBox – Style Guide

Niniejszy dokument opisuje konwencje i wzorce stosowane w projekcie CLBox.
Dotyczy zarówno aplikacji frontendowej (`apps/web-app`), jak i backendu (`apps/backend`) oraz bibliotek (`libs/`).

---

## Spis treści

1. [Technologie i narzędzia](#1-technologie-i-narzędzia)
2. [Struktura katalogów](#2-struktura-katalogów)
3. [Nazewnictwo](#3-nazewnictwo)
4. [TypeScript](#4-typescript)
5. [Komponenty React](#5-komponenty-react)
6. [Zarządzanie stanem – Redux Toolkit + Redux-Observable](#6-zarządzanie-stanem--redux-toolkit--redux-observable)
7. [Stylizacja](#7-stylizacja)
8. [Backend – Firebase Cloud Functions](#8-backend--firebase-cloud-functions)
9. [Biblioteki (`libs/`)](#9-biblioteki-libs)
10. [Testy](#10-testy)
11. [Importy](#11-importy)
12. [Formatowanie kodu](#12-formatowanie-kodu)
13. [Komentarze](#13-komentarze)

---

## 1. Technologie i narzędzia

| Warstwa | Technologie |
|---|---|
| Monorepo | Nx 20+ |
| Frontend | React 18, Redux Toolkit 2, Redux-Observable 3, React Router 6 |
| UI | Material-UI (MUI) 5, Styled Components 5 |
| Reaktywność | RxJS 7 |
| Backend | Firebase Cloud Functions v1 (Node.js), Firebase Admin, Google Cloud Pub/Sub |
| Język | TypeScript 5 (strict mode) |
| Testy | Jest 29 |
| Linter | ESLint 8 + `@nx/eslint-plugin` |
| Formatter | Prettier 2 (`singleQuote: true`) |
| Bundler | Webpack 5 (przez Nx) |

---

## 2. Struktura katalogów

### Monorepo (root)

```
apps/
  web-app/          # Aplikacja React
  backend/          # Firebase Cloud Functions
libs/
  assessment-model/
  assessment-survey/
  skill-roadmap/
  user-profile-model/
```

### Frontend – feature slice

Każda funkcja aplikacji to oddzielny katalog w `apps/web-app/src/app/features/`:

```
features/
  <feature-name>/
    components/
      <component-name>/
        <component-name>.tsx
        <sub-component>.tsx
        <component-name>.styled.ts  # lub CSS-in-JS inline
    model/
      <model-name>.ts               # interfejsy / typy
      <enum-name>.ts
    state/
      <feature-name>.reducer.ts
      <feature-name>.epic.ts
      <feature-name>-state.ts
      <feature-name>-state-initial.ts
      <action-group>/
        <action-name>.action.ts
        <action-name>.epic.ts
        <action-name>.reducer.ts
        <action-name>.ts            # payload helper / selector
```

### Backend – feature slice

```
app/
  <feature-name>/
    <feature-name>.handler.ts       # logika obsługi żądania/zdarzenia
    <feature-name>.factory.ts       # opcjonalnie – fabryka z dependency injection
    <feature-name>.cmd.ts           # typy komend / payload
```

---

## 3. Nazewnictwo

| Artefakt | Konwencja | Przykład |
|---|---|---|
| Komponenty React | PascalCase | `CampaignCard`, `AppWrapper` |
| Hooki | camelCase z prefiksem `use` | `useChapterUsers` |
| Akcje Redux | camelCase, czasownik przeszły | `loggedIn`, `sentFetched` |
| Reducery | camelCase z sufiksem `Reducer` | `loggedInReducer` |
| Epics | camelCase z sufiksem `Epic` | `fetchSentEpic` |
| Fabryki (backend) | camelCase z sufiksem `Factory` | `kudosHandlerFactory` |
| Pliki komponentów | PascalCase lub kebab-case | `Campaigns.tsx` / `campaigns.tsx` |
| Pliki utility/handler | kebab-case | `notify-pending-survey.handler.ts` |
| Pliki modeli/typów | kebab-case | `campaign-status.ts` |
| Pliki state | kebab-case z sufiksem `-state` | `authentication-state.ts` |
| Pliki akcji | kebab-case z sufiksem `.action` | `logged-in.action.ts` |
| Stałe stanu initial | camelCase z sufiksem `StateInitial` | `inboxStateInitial` |
| Zmienne / parametry | camelCase | `teamId`, `onArchive` |

---

## 4. TypeScript

- Zawsze używaj **jawnych typów zwracanych** dla funkcji eksportowanych.
- Modele i interfejsy trzymaj w plikach `model/` wewnątrz feature slice.
- Używaj `interface` do opisywania kształtu obiektów danych.
- Używaj `type` dla unii, przecięć i aliasów typów.
- Nigdy nie używaj `any` – preferuj `unknown` lub konkretne typy.
- Używaj `Draft<State>` z `@reduxjs/toolkit` w funkcjach reducerów.
- Stosuj `ReturnType<typeof actionCreator>` do typowania parametru akcji w reducerze.
- Biblioteki (`libs/`) eksportują swoje typy przez `index.ts`, do których dostęp jest przez alias ścieżki zdefiniowany w `tsconfig.base.json`.

```typescript
// ✅ Dobrze
export interface Campaign {
    id: string;
    status: CampaignStatus;
}

// ✅ Dobrze – typ reducera
export const loggedInReducer = (
    state: Draft<AuthenticationState>,
    action: ReturnType<typeof loggedIn>
) => { ... };

// ❌ Źle
const data: any = firestore.get();
```

---

## 5. Komponenty React

### Wzorzec połączenia z Redux (`connect`)

Komponenty korzystające ze stanu Reduksa używają wzorca `connect` z `react-redux`:

```typescript
// 1. Widok przyjmuje ConnectedProps
const MyView = ({ someData, doAction }: ViewProps) => { ... };

// 2. Typ props wyprowadzony z connectora
type ViewProps = ConnectedProps<typeof connector>;

// 3. Connector mapuje state i dispatch
const connector = connect(
    (state: AppState) => ({
        someData: state.feature.data,
    }),
    { doAction: () => myAction() }
);

// 4. Eksport opakowanego komponentu (bez "default")
export const MyComponent = connector(MyView);
```

- Nie używaj `default export` – tylko nazwane eksporty.
- Wewnętrzna nazwa widoku to `<NazwaKomponentu>View`.

### Pobieranie danych w komponentach (bez epics)

Używaj `useEffect` z async IIFE:

```typescript
useEffect(() => {
    (async () => {
        if (teamId && userId) {
            const result = await firestore.collection(...).get();
            setData(result.docs.map(doc => ({ id: doc.id, ...doc.data() } as MyType)));
        }
    })();
}, [teamId, userId]);
```

### Hooki własne (Custom Hooks)

- Plik: `model/use-<nazwa>.ts`
- Eksportuj interfejs danych razem z hookiem w tym samym pliku.
- Zwracaj bezpośrednio dane (nie tuple).

```typescript
export interface ChapterUser { name: string; id: string; }

export function useChapterUsers(team: string, leader: string): ChapterUser[] | undefined {
    const [users, setUsers] = useState<ChapterUser[]>();
    useEffect(() => { /* firebase query */ }, [team, leader]);
    return users;
}
```

### Handler callbacks

Używaj `useCallback` dla funkcji przekazywanych jako props z prawidłową listą zależności:

```typescript
const onArchive = useCallback((campaign: Campaign) => {
    // ...
}, [teamId, campaigns]);
```

---

## 6. Zarządzanie stanem – Redux Toolkit + Redux-Observable

### Struktura pliku stanu

| Plik | Zawartość |
|---|---|
| `<feature>-state.ts` | Interface stanu |
| `<feature>-state-initial.ts` | Wartość początkowa stanu |
| `<feature>.reducer.ts` | `createReducer` z handlersami |
| `<action>.action.ts` | `createAction` |
| `<action>.reducer.ts` | Funkcja handlera stanu |
| `<action>.epic.ts` | Epic RxJS |
| `<feature>.epic.ts` | `combineEpics` z epic'ów feature |

### Reducer

```typescript
export const featureReducer = createReducer<FeatureState>(
    featureStateInitial,
    builder => builder
        .addCase(actionA, actionAReducer)
        .addCase(actionB, actionBReducer)
);
```

### Handler stanu

```typescript
export const actionAReducer = (
    state: Draft<FeatureState>,
    action: ReturnType<typeof actionA>
) => {
    state.items = action.payload.items;
};
```

### Normalizacja danych w stanie

Przechowuj kolekcje znormalizowane przez id:

```typescript
state.messages = {
    byId: items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})
};
```

### Epic

```typescript
export const fetchFeatureEpic: Epic<unknown, unknown, AppState> = (_, state$) =>
    combineLatest([
        state$.pipe(map(s => s.authentication?.email)),
        state$.pipe(map(s => s.team?.current?.id))
    ]).pipe(
        distinct(([user, team]) => `${user}/${team}`),
        switchMap(([user, team]) => {
            if (user && team) {
                return new Observable<firebase.firestore.QuerySnapshot>(subscriber => {
                    firestore.collection(`team/${team}/items`).onSnapshot(subscriber);
                });
            }
            return of<firebase.firestore.QuerySnapshot>();
        }),
        map(snapshot => featureFetched({
            items: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item))
        }))
    );
```

**Zasady epic:**
- Typ epica: `Epic<unknown, unknown, AppState>`.
- Parametry: `(action$, state$)` – pomiń nieużywane (np. `_`).
- Używaj `combineLatest` + `distinct` by unikać duplikatów zapytań.
- Używaj `switchMap` by anulować poprzednie subskrypcje.
- Inicjalizacja Firestore na poziomie modułu: `const firestore = firebaseApp.firestore();`.
- Firestore `onSnapshot` owijaj w `Observable`.

---

## 7. Stylizacja

### Styled Components – layout i kontenery

```typescript
const Layout = styled.div`
    display: flex;
    & > div:nth-child(1) {
        flex-basis: 200px;
        margin-right: 64px;
    }
`;
```

- Styled components tylko dla elementów layoutu i kontenerów.
- Nazwa styled component: PascalCase (np. `Layout`, `View`, `Item`).

### Material-UI – komponenty UI

- Korzystaj z komponentów MUI (`Card`, `Button`, `IconButton`, `MenuItem`, itp.).
- Customizuj przez prop `sx` zamiast inline styles tam, gdzie to możliwe:

```typescript
<MenuItem sx={{ color: 'secondary.main' }}>Archiwizuj</MenuItem>
```

### Tema

Paleta kolorów zdefiniowana w `apps/web-app/src/main.tsx`:
- Primary: `#b31536` (red)
- Secondary: `#999999` (grey)

Nie hardkoduj kolorów bezpośrednio – używaj wartości z palety motywu (`primary.main`, `secondary.main`).

### Zasady ogólne

- Brak globalnych plików CSS – tylko CSS-in-JS.
- Nie mieszaj stylizacji Styled Components i inline styles w tym samym komponencie bez uzasadnienia.

---

## 8. Backend – Firebase Cloud Functions

### Wzorzec fabryki (Dependency Injection)

Każda funkcja backendowa eksportowana jest przez fabrykę przyjmującą zależności:

```typescript
export const myHandlerFactory = (
    functions: import('firebase-functions/v1').FunctionBuilder,
    config: Record<string, any>,
    firebase: typeof import('firebase-admin'),
    pubsub: import('@google-cloud/pubsub').PubSub
) =>
    functions.https.onRequest(async (request, response) => {
        // logika
    });
```

### Weryfikacja żądań Slack

Zawsze weryfikuj podpis Slacka przed przetwarzaniem:

```typescript
if (!checkSlackSignature(config.slack.signingsecret, ...)) {
    response.status(401).send('Invalid slack signing');
    return;
}
```

### Obsługa HTTP

- Sprawdzaj metodę HTTP: `request.method !== 'POST'` → 405.
- Zwracaj odpowiedzi JSON z `response.contentType('json').status(200).send({...})`.
- Loguj ważne kroki: `console.log('...')`.

### Pub/Sub

Publikuj wiadomości jako JSON zserializowany do Buffer:

```typescript
await pubsub.topic(topicName).publish(
    Buffer.from(JSON.stringify(payload))
);
```

---

## 9. Biblioteki (`libs/`)

- Każda biblioteka eksportuje swoje publiczne API przez `src/index.ts`.
- Dostęp z innych pakietów przez alias z `tsconfig.base.json` (np. `import { Profile } from 'user-profile-model'`).
- Biblioteki zawierają **tylko modele/typy i logikę biznesową** – bez kodu UI ani Firebase.
- Nowe typy współdzielone między `web-app` a `backend` → nowa biblioteka w `libs/`.

---

## 10. Testy

- Pliki testów umieszczaj obok testowanego pliku z rozszerzeniem `.spec.ts` lub `.spec.tsx`.
- Używaj `describe` / `it` z `@jest/globals`.
- Opis testu: `'should <oczekiwane zachowanie>'`.
- Testuj czyste funkcje (modele, logikę biznesową) – unikaj testowania szczegółów implementacji.

```typescript
import { describe, expect, it } from '@jest/globals';

describe('assessment result', () => {
    it('should mark skipped questions', () => {
        expect(assessmentResponseAssessResult(...)).toBe(ResponseAssessmentResult.Skipped);
    });
});
```

---

## 11. Importy

Kolejność importów w pliku:

1. Zewnętrzne biblioteki (npm)
2. Biblioteki monorepo (aliasy `@clbox/*` lub nazwa biblioteki)
3. Importy relatywne (od najdalszych do najbliższych)

```typescript
// 1. zewnętrzne
import React, { useCallback, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import Card from '@mui/material/Card';

// 2. biblioteki monorepo
import { Profile } from 'user-profile-model';

// 3. relatywne
import { AppState } from '../../../state/app-state';
import { firebaseApp } from '../../firebase/firebase.app';
import { Campaign } from '../model/campaign';
```

---

## 12. Formatowanie kodu

Konfiguracja Prettier (`.prettierrc`):

```json
{ "singleQuote": true }
```

Konfiguracja EditorConfig (`.editorconfig`):

- Wcięcia: 4 spacje
- Kodowanie: UTF-8
- Maksymalna długość linii: 200 znaków

Uruchom formatter przed commitem:

```bash
npx nx format:write
```

---

## 13. Komentarze

- Komentarze piszemy po polsku lub angielsku – spójnie w ramach pliku.
- Unikaj zbędnych komentarzy opisujących oczywisty kod.
- Komentarze do wyłączenia reguł ESLint: `// eslint-disable-next-line @typescript-eslint/...`.
- TODO zostawiaj z numerem ticket'u: `// TODO(#123): opis`.
