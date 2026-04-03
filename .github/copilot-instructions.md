# Copilot Instructions for CLBox

## Project Overview

CLBox is a **team skill assessment and development platform** for technology teams. It enables:
- Technical skill tracking and roadmap browsing
- Assessment surveys tied to seniority/role tracking
- Feedback collection and aggregation (user and channel level)
- Chapter/team management with permission hierarchies
- Kudos recognition via a Slack bot
- Campaign/survey creation and tracking

License: **AGPL 3.0** (strict copyleft — any distribution must also be open source).

---

## Repository Structure

```
clbox/
├── apps/
│   ├── web-app/          # React 18 SPA (TypeScript, Webpack, Redux, MUI)
│   │   └── src/
│   │       ├── app/      # Feature modules under features/{feature-name}/
│   │       ├── environments/
│   │       └── main.tsx  # App entry point (React root, theme, Redux store)
│   └── backend/          # Firebase Cloud Functions (TypeScript/Node.js 20)
│       └── src/
│           ├── app/      # One directory per Cloud Function handler
│           └── main.ts   # Exports all function handlers
├── libs/                 # Shared TypeScript libraries (domain models, surveys, roadmap data)
│   ├── assessment-model/
│   ├── assessment-survey/
│   ├── skill-roadmap/
│   └── user-profile-model/
├── packages/
│   └── firestore/        # Firestore security rules
├── .github/workflows/    # GitHub Actions CI (build + test on push/PR to main)
├── nx.json               # Nx monorepo config
├── tsconfig.base.json    # Shared TypeScript path aliases (@clbox/*)
├── .eslintrc.json        # ESLint config (Nx module boundaries enforced)
├── .prettierrc           # Prettier: singleQuote: true
├── .editorconfig         # 4-space indent, 200-char line limit, UTF-8
├── firebase.json         # Firebase hosting/functions config
├── DEVELOPMENT.md        # Full local setup guide
└── .env.template         # Required environment variables (NX_PUBLIC_FIREBASE_*)
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript 5 |
| State management | Redux Toolkit + Redux Observable (RxJS epics) |
| UI library | Material-UI (MUI) v5 |
| Styling | Styled-components v5 |
| Routing | React Router DOM v6 |
| Build/bundle | Nx 20 (monorepo) + Webpack 5 |
| Backend runtime | Firebase Cloud Functions (Node.js 20) |
| Database | Firebase Firestore (NoSQL) |
| Auth | Firebase Authentication |
| Messaging | Google Cloud Pub/Sub |
| Testing | Jest 29 + ts-jest |
| Linting | ESLint 8 + TypeScript ESLint |
| Formatting | Prettier 2 |
| Transpiler | Babel 7 / SWC |
| Package manager | npm |

---

## Build, Test & Lint Commands

```bash
# Install dependencies
npm ci

# Start frontend dev server (http://localhost:4200)
npm start
# Or with an env file:
dotenvx run --env-file=.dev.local.env -- nx serve

# Build all projects
npm run build
# Build only the frontend
npm run build:web-app
# Build only the backend functions
npm run build:backend

# Run all tests
npm test

# Run lint (workspace-lint + ESLint)
npm run lint

# Check formatting
npm run format:check
# Auto-format code
npm run format

# Affected-only commands (faster in CI/PR context)
npm run affected:build
npm run affected:test
```

---

## Code Conventions

### File and Directory Naming
- All files use **kebab-case** (e.g., `root-epic.ts`, `logged-in.reducer.ts`)
- React component files also use kebab-case (e.g., `app-wrapper.tsx`)
- Test files use `.spec.ts` suffix and live next to source files

### Frontend Feature Modules
Each feature lives in `apps/web-app/src/app/features/{feature-name}/` and typically contains:
- `components/` — React components
- `state/` — Redux slice: reducer (`*-reducer.ts`), epics (`*-epic.ts`), actions, types
- `models/` — TypeScript interfaces
- `styles/` — Styled-components or theme helpers

### Backend Handlers
Each Cloud Function lives in its own directory under `apps/backend/src/app/{handler-name}/`.  
The handler is created via a factory function:
```typescript
export const handlerNameFactory = (functionBuilder, config, firebase, collectionName) => { ... }
```
All handlers are exported from `apps/backend/src/main.ts`.

### State Management (Frontend)
- Redux Toolkit (`createReducer`, `createAction`) for reducers and actions
- Redux Observable RxJS epics handle all async/side-effect logic (Firebase calls, HTTP)
- Each feature has its own epic and reducer; they are combined in `root-epic.ts` / `root-reducer.ts`

### TypeScript
- Strict TypeScript with no implicit any
- Path aliases are defined in `tsconfig.base.json` — use `@clbox/assessment-survey` etc. instead of relative paths
- All libraries export from their `index.ts` barrel

### Styling
- Prefer **styled-components** over inline styles or CSS modules
- Use MUI theme tokens when possible
- Theme: primary color `#b31536` (burgundy), secondary `#999999`

### Prettier / ESLint
- Single quotes (`singleQuote: true`)
- 4-space indentation, 200-char line limit
- Nx module boundary enforcement via ESLint — cross-project imports must respect declared boundaries

---

## Key Architectural Patterns

1. **Nx Monorepo** — `nx.json` controls caching, project graph, and target defaults. The default project is `web-app`. Use `nx affected` commands in CI to avoid rebuilding unchanged code.

2. **Firebase-First** — Auth, Firestore, Hosting, and Cloud Functions are all Firebase. No custom server. Functions run in `europe-west3`.

3. **Event-Driven Backend** — Most Cloud Functions are Firestore triggers (`onWrite`, `onUpdate`, `onDelete`) or scheduled Pub/Sub cron jobs. HTTP functions exist only for Slack slash commands.

4. **Factory / DI Pattern (Backend)** — Handlers are testable factory functions that receive `functionBuilder`, config, and Firestore references as parameters.

5. **Feature-Based Frontend** — Features are self-contained modules coupled only via the Redux store and React Router routes. This enables parallel development.

6. **SPA with Firebase Hosting** — All routes rewrite to `index.html`. No server-side rendering. Static assets are cached for 1 year; HTML is `no-cache`.

---

## Environment Configuration

1. Copy `.env.template` to `.local.env` (or `.dev.local.env`) and fill in the Firebase Web SDK config values.
2. All browser-visible variables must be prefixed `NX_PUBLIC_` (Webpack DefinePlugin picks these up).
3. Backend (Cloud Functions) runtime config is set via:
   ```bash
   firebase functions:config:set slack.signingsecret="..." slack.bottoken="..."
   firebase functions:config:get > .runtimeconfig.json  # for local emulation
   ```

---

## Local Development Setup (Summary)

Full details are in `DEVELOPMENT.md`. Key steps:

1. `npm ci`
2. `firebase login` and create/connect a Firebase project
3. Create `.local.env` from `.env.template` with your Firebase Web SDK config
4. Deploy Firestore security rules: `firebase deploy --only firestore`
5. Seed minimal Firestore data (see DEVELOPMENT.md §"Configure initial database layout")
6. `npm start` — frontend at `http://localhost:4200`
7. For Cloud Functions, run the Firebase emulator: `firebase emulators:start --only functions,firestore`

---

## CI/CD

- **GitHub Actions** (`.github/workflows/node.js.yml`): triggers on push/PR to `main`
  - Steps: checkout → Node.js 22 setup → `npm ci` → `npm run build` → `npm test`
- **Deployment** is manual via Firebase CLI (`firebase deploy`)
- No automated deploy step in CI

---

## Known Constraints

- `nx.json` sets `parallel: 1` — Nx targets run sequentially (intentional for this project)
- Test coverage is limited; only a handful of spec files exist — do not remove existing tests
- No E2E testing framework is configured
- Blaze (pay-as-you-go) Firebase plan is required to deploy Cloud Functions

---

## Common Errors & Workarounds

- **Missing `.local.env`**: The dev server will fail to start with Firebase config errors. Copy `.env.template` and fill in all `NX_PUBLIC_FIREBASE_*` values.
- **`firebase functions:config:get` returns empty**: No runtime config has been set yet. Set at least dummy values or the emulator will warn about missing config.
- **Nx cache stale after dependency changes**: Run `nx reset` to clear the local Nx cache, then rebuild.
- **TypeScript path alias errors**: Ensure the library is listed in `tsconfig.base.json` under `paths` and that the library has been built (`nx build <lib>`).
- **ESLint module boundary violations**: Check `tags` in each project's `project.json` and the `depConstraints` in `.eslintrc.json` — imports must respect the declared constraints.
