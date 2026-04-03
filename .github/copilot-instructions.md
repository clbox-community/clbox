# CLBox — Kontekst projektu dla agentów AI

Ten plik zawiera trwały kontekst projektu do wykorzystania przez agentów AI w każdej sesji.
Przeczytaj go w całości przed przystąpieniem do jakichkolwiek zadań w tym repozytorium.

---

## Czym jest CLBox?

**CLBox** (Career/Learning Box) to platforma do oceny umiejętności i zarządzania rozwojem zawodowym w zespołach. Kluczowe funkcje:

- **Oceny umiejętności** — użytkownicy wypełniają ankiety/assessmenty oceniające kompetencje techniczne i miękkie
- **Feedback** — zbieranie informacji zwrotnej od współpracowników (peer feedback) przez Slack
- **Roadmapy umiejętności** — ścieżki nauki i progresji kariery dla poszczególnych umiejętności
- **Statystyki zespołu** — analityka poziomu umiejętności, ocen i trendów feedbacku
- **Integracja ze Slack** — bot do powiadomień, kudosów i komend slash
- **Profile publiczne** — użytkownicy mogą udostępniać swój profil umiejętności
- **Zarządzanie rozdziałami/teamami** — grupowanie użytkowników w zespoły z liderami

---

## Stack technologiczny

### Frontend (`apps/web-app/`)
- **React 18** + **TypeScript 5**
- **Redux Toolkit** + **redux-observable** (RxJS) — zarządzanie stanem
- **React Router 6** — routing
- **Material-UI (MUI) 5** + **Emotion** + **Styled Components** — UI
- **Webpack 5** + **Babel** — bundler
- **react-markdown** + **remark-gfm** — renderowanie markdown

### Backend (`apps/backend/`)
- **Firebase Cloud Functions** (Node.js 20, TypeScript)
- **Firebase Firestore** — baza danych NoSQL
- **Firebase Authentication** — uwierzytelnianie
- **Firebase Hosting** — hosting frontendu
- **Google Cloud Pub/Sub** — kolejkowanie zdarzeń
- **Slack API** — integracja bota

### Monorepo
- **Nx 20** — zarządzanie monorepo (build, test, lint)
- **Jest 29** — testy jednostkowe
- **ESLint 8** + **TypeScript ESLint** — linting
- **Prettier** — formatowanie kodu

---

## Struktura repozytorium

```
clbox/
├── apps/
│   ├── web-app/src/app/
│   │   ├── features/          # Moduły funkcjonalne frontendu (33 modułów)
│   │   ├── store/             # Konfiguracja Redux store
│   │   ├── state/             # Stan Redux
│   │   ├── platform/          # Konfiguracja platformy (Firebase itp.)
│   │   └── ui/                # Współdzielone komponenty UI
│   └── backend/src/app/       # Cloud Functions (20+ funkcji)
├── libs/                      # Biblioteki współdzielone
│   ├── assessment-model/      # Modele danych ocen
│   ├── assessment-survey/     # Logika ankiet/ocen
│   ├── skill-roadmap/         # Struktury danych roadmap
│   └── user-profile-model/    # Modele profilu użytkownika
├── packages/
│   └── firestore/             # Reguły bezpieczeństwa Firestore
└── docs/                      # Dokumentacja i szablony
```

### Moduły frontendu (`apps/web-app/src/app/features/`)
`assessment`, `authentication`, `campaign`, `changelog`, `chapter`, `chapter-stats`,
`dashboard`, `features`, `feedback`, `firebase`, `footer`, `inbox`, `layout`,
`message`, `navbar`, `page-not-found`, `profile`, `scroll-to-top`, `sent`,
`skill`, `skill-browser`, `skill-chapter`, `skill-editor`, `skill-roadmap`,
`skill-survey`, `skill-team`, `stats`, `survey`, `surveys`, `team`, `user`

### Funkcje backendowe (`apps/backend/src/app/`)
`aggregate-skill-roadmap-stats`, `awake`, `create-user`, `expire-user-accounts`,
`export-tech-skills`, `feedback-stats`, `get-chapter-stats`, `kudos`,
`notification-after-leader-change`, `notification-after-survey-created`,
`notify-after-channel-feedback`, `notify-after-user-feedback`, `notify-pending-survey`,
`public-profile`, `slack`, `store-channel-feedback`, `store-user-feedback`,
`update-campaign-after-survey`, `update-filter-stats`, `user-assessments-create`,
`user-assessments-finish`, `user-feedback-stats`

---

## Model danych Firestore

Kolekcje Firestore (na podstawie reguł bezpieczeństwa):

```
/user/{userEmail}                                        # Profil użytkownika
/team/{teamId}                                           # Konfiguracja zespołu
/team/{teamId}/user/{userEmail}                          # Dane użytkownika w teamie
/team/{teamId}/user/{userEmail}/inbox/{doc}              # Skrzynka odbiorcza
/team/{teamId}/user/{userEmail}/user-assessment-pending/ # Oczekujące oceny
/team/{teamId}/user/{userEmail}/user-assessment-sent/    # Wysłane oceny
/team/{teamId}/user/{userEmail}/skill-roadmap-result/    # Wyniki roadmap
/team/{teamId}/profile-public/{userEmail}                # Profil publiczny
/team/{teamId}/assessment/{assessmentId}                 # Oceny/assessmenty
/team/{teamId}/assessment-archive/{assessmentId}         # Archiwum ocen
/team/{teamId}/channel/{channelId}                       # Kanały Slack
/team/{teamId}/campaign/{campaignId}                     # Kampanie ocen
```

**Kluczowe relacje:**
- `team` to słownikowy identyfikator = nazwa workspace Slack
- `userEmail` jest kluczem dokumentu użytkownika
- `chapterLeader` = email lidera w dokumencie `team/{teamId}/user/{userEmail}`
- `leader` (boolean) — flaga lidera zespołu

---

## Konwencje i wzorce kodu

### Frontend
- **Wzorzec modułów**: każdy moduł w `features/` ma własny katalog z komponentami, reducerami, epics
- **Redux Observable**: efekty uboczne przez epics (RxJS), nie przez thunki
- **Ścieżki importu**: aliasy TypeScript z `tsconfig.base.json`
- **Komponenty**: funkcyjne z hookami React, bez klas
- **Typy**: pełna typizacja TypeScript, bez `any` gdzie możliwe

### Backend
- **Cloud Functions**: każda funkcja w osobnym katalogu, eksportowana przez `index.ts`
- **Firestore**: dostęp przez Firebase Admin SDK
- **Obsługa błędów**: async/await z try/catch, logowanie przez `console.error`

### Testy
- Framework: **Jest**
- Uruchamianie: `nx test <project>` lub `npm test`
- Lokalizacja: pliki `*.spec.ts` obok testowanego kodu

### Linting i formatowanie
- Linting: `npm run lint` (ESLint)
- Formatowanie: Prettier (`.prettierrc`)
- Budowanie: `npm run build` (Nx)

---

## Ważne pliki konfiguracyjne

| Plik | Cel |
|------|-----|
| `nx.json` | Konfiguracja Nx monorepo |
| `tsconfig.base.json` | Ścieżki importu TypeScript |
| `firebase.json` | Konfiguracja deploymentu Firebase |
| `packages/firestore/firestore.rules` | Reguły bezpieczeństwa Firestore |
| `.env.template` / `.local.env` | Zmienne środowiskowe |
| `DEVELOPMENT.md` | Instrukcja konfiguracji środowiska developerskiego |

---

## Konfiguracja środowiska

Wymagane zmienne środowiskowe (patrz `.env.template`):
- Konfiguracja Firebase webapp (apiKey, authDomain, projectId, itp.)
- `SLACK_SIGNING_SECRET` — weryfikacja requestów Slack
- `SLACK_BOT_TOKEN` — token OAuth bota Slack
- `WEBAPP_URL` — URL frontendu (dla linków w powiadomieniach)
- `SKILL_TREE_EXPORT_KEY` — klucz szyfrowania eksportu skill tree

---

## Szablon specyfikacji (SDD)

Dla nowych funkcji i zadań używaj szablonu z `docs/spec-template.md`.
Wypełnij szablon **przed** zleceniem implementacji agentowi AI.
