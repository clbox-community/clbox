# CLBox – AI Agent Instructions

This file provides context and coding instructions for AI coding assistants (GitHub Copilot, Cursor, etc.) working on the CLBox repository.

## Project Overview

CLBox is an **Nx monorepo** with:
- `apps/web-app` – React 18 frontend (Redux Toolkit + Redux-Observable, Material-UI, Styled Components)
- `apps/backend` – Firebase Cloud Functions v1 (Node.js, Pub/Sub, Firestore)
- `libs/` – shared TypeScript models/types (`assessment-model`, `user-profile-model`, `assessment-survey`, `skill-roadmap`)

Full style guide: [`STYLEGUIDE.md`](../STYLEGUIDE.md)

---

## Key Rules

### TypeScript
- All code is **TypeScript** – never emit plain `.js` files in `src/`.
- Never use `any` – use `unknown` or a specific type instead.
- Use `interface` for object shapes, `type` for unions/aliases.
- Always provide explicit return types for exported functions.

### React Components
- **No default exports** – use named exports everywhere.
- Connect components to Redux via `react-redux` `connect()` HOC, not `useSelector`/`useDispatch`.
- Internal view component name: `<ComponentName>View`.
- Props type: `type ViewProps = ConnectedProps<typeof connector>`.
- Data fetching inside components: use `useEffect` with an async IIFE.
- Callbacks passed as props: wrap with `useCallback` and provide correct dependency arrays.

```typescript
// Correct component pattern
const MyView = ({ data, doAction }: ViewProps) => { ... };
type ViewProps = ConnectedProps<typeof connector>;
const connector = connect(
    (state: AppState) => ({ data: state.feature.data }),
    { doAction: () => myAction() }
);
export const MyComponent = connector(MyView);
```

### Redux State
- State files live in `features/<name>/state/`.
- Use `createReducer` (builder pattern) from `@reduxjs/toolkit`.
- Each action has its own `.action.ts`, `.reducer.ts`, and optionally `.epic.ts`.
- Reducer functions receive `Draft<StateType>` and `ReturnType<typeof actionCreator>`.
- Store collections normalized as `{ byId: { [id]: entity } }`.

### Redux-Observable Epics
- Epic type: `Epic<unknown, unknown, AppState>`.
- Combine state slices with `combineLatest`, deduplicate with `distinct`.
- Use `switchMap` to cancel outdated Firestore subscriptions.
- Wrap Firestore `onSnapshot` in `new Observable(subscriber => ...)`.
- Initialize Firestore at module level: `const firestore = firebaseApp.firestore();`.

```typescript
export const myEpic: Epic<unknown, unknown, AppState> = (_, state$) =>
    combineLatest([
        state$.pipe(map(s => s.authentication?.email)),
        state$.pipe(map(s => s.team?.current?.id))
    ]).pipe(
        distinct(([user, team]) => `${user}/${team}`),
        switchMap(([user, team]) => {
            if (user && team) {
                return new Observable<firebase.firestore.QuerySnapshot>(sub => {
                    firestore.collection(`team/${team}/items`).onSnapshot(sub);
                });
            }
            return of<firebase.firestore.QuerySnapshot>();
        }),
        map(snapshot => itemsFetched({
            items: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item))
        }))
    );
```

### Styling
- **Styled Components** for layout containers (PascalCase names: `Layout`, `View`, `Item`).
- **Material-UI** for UI widgets; customize via `sx` prop, not inline styles.
- No global CSS files – CSS-in-JS only.
- Theme colors: primary `#b31536`, secondary `#999999` – reference via `primary.main`, `secondary.main`.

### Backend (Firebase Functions)
- Export handlers as factory functions (dependency injection pattern):
  ```typescript
  export const myHandlerFactory = (
      functions: import('firebase-functions/v1').FunctionBuilder,
      config: Record<string, any>,
      firebase: typeof import('firebase-admin')
  ) => functions.https.onRequest(async (req, res) => { ... });
  ```
- Always verify Slack signature before processing Slack requests.
- Publish Pub/Sub messages as `Buffer.from(JSON.stringify(payload))`.
- Use `console.log` for important operation steps (Firebase logging).

### Libraries (`libs/`)
- Import shared types via path alias: `import { Profile } from 'user-profile-model'`.
- Libraries contain only models/types and pure business logic – no UI, no Firebase calls.

### File & Directory Naming
- React component files: PascalCase or kebab-case (`Campaigns.tsx` / `campaigns.tsx`).
- Handler/utility files: kebab-case with descriptive suffix (`.handler.ts`, `.factory.ts`, `.action.ts`, `.reducer.ts`, `.epic.ts`).
- Model/type files: kebab-case (e.g., `campaign-status.ts`).

### Import Order
1. External npm packages
2. Monorepo library aliases (`@clbox/*`, `assessment-model`, etc.)
3. Relative imports (furthest to closest)

### Testing
- Test files co-located with source: `<file>.spec.ts` / `<file>.spec.tsx`.
- Use `describe` / `it` from `@jest/globals`.
- Test description format: `'should <expected behavior>'`.
- Focus tests on pure functions and business logic.

### Formatting
- Prettier: `singleQuote: true`, 4-space indentation.
- Max line length: 200 characters.
- Run `npx nx format:write` before committing.

---

## Commands

```bash
# Serve frontend locally
npm start

# Build (production)
npm run build

# Run tests
npx nx test

# Lint
npx nx lint

# Format
npx nx format:write

# Run affected tests only (CI optimization)
npx nx affected:test
```

---

## Do Not

- Do not add `default` exports to any file.
- Do not use `useSelector` / `useDispatch` hooks – use `connect()` HOC.
- Do not add global CSS files.
- Do not access `libs/` directly by relative path – always use the path alias.
- Do not use `any` type.
- Do not modify unrelated tests or configurations when fixing a bug.
- Do not introduce new npm dependencies without checking for security advisories.
