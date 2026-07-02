# Repository Guidelines

## Project Structure & Module Organization

This is a Vite React TypeScript customer-facing logistics app. Application code lives in `src/`. Route-level screens are in `src/pages/`, reusable UI and route wrappers are in `src/components/`, API clients are in `src/api/`, shared state is in `src/stores/`, and common types live in `src/types.ts`. Global styling is in `src/styles.css`, with Mantine theme configuration in `src/theme.ts`. Static entry files are `index.html` and `src/main.tsx`. Build output is generated in `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server with hot reload.
- `npm run build`: run TypeScript project builds and create the production bundle.
- `npm run lint`: run Oxlint checks.
- `npm run preview`: serve the built `dist/` output locally for verification.

No test command is currently configured in `package.json`.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow the existing style: two-space indentation, single quotes, no semicolons, and named exports for components such as `Login`, `Layout`, and `ProtectedRoute`. Name React components and page files in PascalCase (`UsersPage.tsx`), hooks and stores in camelCase with descriptive prefixes (`useAuthStore.ts`), and API modules by resource (`users.ts`, `vehicles.tsx`). Prefer shared helpers in `src/api/client.ts` for HTTP behavior instead of duplicating fetch logic.

## Testing Guidelines

There is no committed test framework or coverage threshold yet. When adding tests, place them near the code they cover or under a dedicated `src/__tests__/` directory, and use clear names such as `Login.test.tsx` or `auth.test.ts`. Until a runner is added, validate changes with `npm run lint`, `npm run build`, and focused manual checks in the Vite dev server.

## Commit & Pull Request Guidelines

This checkout does not expose git history, so no project-specific commit convention can be inferred. Use concise, imperative commit messages such as `Add vehicle document modal validation`. Pull requests should include a short summary, testing performed, linked issue or ticket when available, and screenshots for visible UI changes.

## Security & Configuration Tips

API requests use `VITE_API_URL` from Vite environment variables, falling back to same-origin requests when unset. Do not commit secrets or real tokens. Keep authentication changes centralized in `src/stores/useAuthStore.ts` and `src/api/client.ts` so token refresh and logout behavior remain consistent.
