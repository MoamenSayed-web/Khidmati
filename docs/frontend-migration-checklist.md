# Frontend Migration Checklist

Phase 1 extractions are marked complete below. Aggregate build and browser smoke checks were run after extraction; the results and remaining validation gaps are recorded in the final section. Per-extraction checkpoints were not run immediately after each step. The T01 foundation audit is recorded at the end; its formal acceptance status is blocked because no authoritative T01 criteria were present in the repository.

## Before the first extraction

- [ ] Confirm the starting branch/worktree and create a baseline commit before code migration.
- [ ] Run the existing production build and record its result. Do not install packages if it cannot run.
- [ ] Record a route and behavior baseline: public pages, authentication, citizen pages, employee pages, admin pages, browser back/forward, and Arabic/English plus light/dark settings.

## Ordered extraction tasks

1. **Types**
   - [x] Move the type aliases (`Route`, `Language`, `Theme`, `AlertType`, `Role`, `CurrentUser`, `CitizenAccount`, `ComplaintStatus`, `ComplaintTimelineEntry`, `ComplaintRecord`, `WorkspaceNotification`, `AlertState`, `IconName`, `WorkspaceSidebarItem`) to `src/types/index.ts`.
   - [x] Update `App.tsx` to import the types without changing their definitions or consumers.
   - [ ] **Build validation:** run the existing production build; resolve only errors caused by this extraction.
   - [ ] **Regression checkpoint:** confirm route unions, status values, and all page prop types compile unchanged (blocked: compiler/dependencies unavailable).
   - [ ] Commit this extraction separately after validation.

2. **Routing helpers and navigation data**
   - [x] Move `routePaths` and `routeFromLocation` to `src/app/routing/routes.ts`; move `navItems` to `src/components/shared/navigation.ts`.
   - [x] Keep `navigate`, `go`, `canAccess`, `authenticatedRoutes`, and the `renderPage` switch in `App.tsx`.
   - [ ] **Build validation:** run the existing production build.
   - [ ] **Regression checkpoint:** direct route URLs, unknown path fallback, legacy hash route, pushState, back/forward, and citizen/employee/admin access gates (not run).
   - [ ] Commit separately after validation.

3. **Mock data, catalogs, and translation**
   - [x] Move `mockUser`, `defaultCitizen`, `employeeUser`, `adminUser`, and `initialComplaint` to `src/data/mockData.ts`.
   - [x] Move `categoryData`, `reportData`, and `citizenReviews` to `src/data/catalogs.ts`.
   - [x] Move `englishText` to `src/data/translations.ts`; move `originalTextNodes` and `translateInterface` to `src/utils/translation.ts`.
   - [ ] **Build validation after each file/group:** run the existing production build before continuing.
   - [ ] **Regression checkpoint:** initial dashboards/data, report and category filters, translation of text/placeholders, language persistence, and observer updates (not run).
   - [ ] Commit each cohesive extraction separately after validation.

4. **UI primitives**
   - [x] Extract `Icon` and `iconPaths` to `src/components/ui/Icon.tsx`.
   - [x] Extract `Button`, `Input`, `Select`, `TextArea`, and `VerificationCode` to focused modules under `src/components/ui/`.
   - [x] Extract `Card`, `Modal`, `SweetAlert`, and `StatusBadge` to focused modules under `src/components/ui/`.
   - [x] Extract `EmptyState` and `ProtectedState` to `src/components/ui/State.tsx`.
   - [ ] **Build validation after each component batch:** run the existing production build.
   - [ ] **Regression checkpoint:** input validation and password visibility, verification-code controls, modal/alert callbacks, disabled/loading buttons, and preserved class names (not run).
   - [ ] Commit each validated batch separately.

5. **Shared presentation components and layouts**
   - [x] Extract `Header`, `WorkspaceHeader`, `Footer`, and `Hero` to focused modules under `src/components/shared/`.
   - [x] Extract `SectionTitle` and `ReportCard` to `src/components/shared/Content.tsx`.
   - [x] Move `sideItems`, `employeeSidebarItems`, and `adminSidebarItems` with `AccountLayout` and `RoleDashboardLayout` to `src/layouts/index.tsx`.
   - [ ] **Build validation after each batch:** run the existing production build.
   - [ ] **Regression checkpoint:** public/workspace navigation, mobile menu and drawer, logout behavior, active sidebar routes, and shared layout styling (not run).
   - [ ] Commit each validated batch separately.

6. **Pages and feature components**
   - [x] Extract `HomePage`, `ReportsPage`, `OfficesPage`, `OfficeDetailsPage`, `AssistantPage`, `AboutPage`, `FAQPage`, `SearchPage`, and `EmergencyPage` to focused modules under `src/pages/`.
   - [x] Extract `AuthLayout`, `LoginPage`, `RegisterPage`, and `ForgotPage` to focused modules under `src/features/auth/`.
   - [x] Extract `DashboardPage` and `FavoritesPage` to `src/features/citizen/`.
   - [x] Extract `ComplaintSwitcher`, `SubmitPage`, `SubmitSuccessPage`, `TrackPage`, `Timeline`, `SharedComplaintTimeline`, and `ReportDetailsPage` to focused complaint workflow modules.
   - [x] Extract `OperationalComplaintDetails` to `src/features/complaints/` for both employee and admin use.
   - [x] Extract `EmployeeDashboardPage` and `EmployeeComplaintsPage` to `src/features/employee/`.
   - [x] Extract `AdminDashboardPage` and `AdminManagementPage` to `src/features/admin/`.
   - [x] Extract shared `ProfilePage` and `NotificationsPage` to `src/pages/`; do not fork role-specific copies.
   - [ ] **Build validation after each page or small related group:** run the existing production build before proceeding.
   - [ ] **Regression checkpoint:** exercise each extracted page’s form, filters, state callbacks, role props, navigation targets, and CSS classes (not run).
   - [ ] Commit each validated page/group separately.

7. **App wiring**
   - [x] Update `renderPage` to import extracted pages one route/group at a time; preserve props, callback ownership, route guards, and fallback behavior.
   - [x] Keep `App.tsx` as the composition root; do not combine this step with a routing-library or UI redesign.
   - [ ] **Build validation after each route group:** run the existing production build.
   - [ ] **Regression checkpoint:** smoke-test the full route set and public/citizen/employee/admin transitions, including complaint details opened from notifications (not run).
   - [ ] Commit route groups separately after validation.

8. **Phase 2 state and orchestration**
   - [x] Inventory all 16 `App` state values, derived values, effects, and shared callbacks.
   - [x] Identify state that stays local to extracted page/layout/component owners.
   - [x] Document the proposed ownership boundaries and dependency direction in the Phase 2 plan.
   - [x] Recommend a bounded first extraction: route state, browser listeners, and low-level `navigate` into `src/app/routing/useAppNavigation.ts`; keep auth-aware `go` and route composition in `App`.
   - [x] Document navigation, auth, complaint/notification, preference/translation, timer, and Strict Mode risks and their regression gates.
   - [x] Review gate: the Phase 2 boundaries and navigation extraction were approved before implementation.
   - [x] Move only route state, browser history/hash listeners and cleanup, and low-level `navigate` to `src/app/routing/useAppNavigation.ts`; return `{ route, navigate }`.
   - [x] Update `App.tsx` to consume the hook; leave `go`, access policy, page rendering, auth, complaint workflow, and other state in `App`.
   - [x] Build validation: `pnpm run build` passed on 2026-11-02.
   - [ ] TypeScript validation: `pnpm exec tsc --noEmit` remains blocked by pre-existing baseline syntax errors in `Icon.tsx` and `LoginPage.tsx`; no pass is claimed.
   - [x] Browser navigation checks: initial route, internal navigation, Back/Forward, direct-route refresh, legacy hash route, and unauthenticated access guard.
   - [x] Verify no duplicate history listeners: one `popstate`/`hashchange` subscription pair and matching cleanup in the hook; none remain in `App`.
   - [x] Move only theme/language state initialization, persistence, and document attributes into `src/hooks/useAppearancePreferences.ts`; return `{ theme, setTheme, language, setLanguage }`.
   - [x] Keep the translation observer/synchronization effect in `App.tsx` with its existing dependencies.
   - [x] Build validation: `pnpm run build` passed on 2026-11-02.
   - [ ] TypeScript validation: `pnpm exec tsc --noEmit` remains blocked by pre-existing baseline syntax errors in `Icon.tsx` and `LoginPage.tsx`; no pass is claimed.
   - [x] Browser checks: default light/Arabic state, theme switching and persistence after refresh, English/LTR and Arabic/RTL switching and persistence after refresh, and translation on route changes.
   - [x] Verify single preference side-effect owner: localStorage and document theme/language/direction writes occur only in `useAppearancePreferences`; translation DOM observation remains in `App`.
   - [ ] Implement auth session or complaint workflow only in separate reviewed follow-up steps; this extraction does not approve those changes.
   - [ ] Commit each validated state-domain migration separately.

## Validation and regression gates

- [x] `pnpm run build` succeeds after the final extraction (Vite production build passed on 2026-11-02).
- [ ] Test all landing, login, register, forgot password, citizen dashboard/profile/notifications/favorites, complaint submit/success/track/details, service search/filter, offices/details, assistant, FAQ, and emergency page variants.
- [ ] Test all employee dashboard/list filters/details/status transitions and admin dashboard/management/detail routes.
- [x] Smoke-test login for citizen, employee, and admin; employee/admin dashboards; unauthenticated access to an admin route; logout confirmation and completion; citizen complaint details and empty-form validation. No browser page errors occurred on these flows.
- [ ] Test notification open/mark-all, complaint clarification/update flows, mobile navigation, and language/theme persistence across reloads.
- [x] Test browser back/forward between login and the employee dashboard, English/Arabic translation and direction switching, dark-theme toggle, and a 390px-wide home page with no horizontal overflow.
- [x] Confirm `src/index.css`, `package.json`, and `pnpm-lock.yaml` are unchanged. Existing UI/CSS and component bodies were not rewritten.
- [x] Review for duplicate implementations, accidental deletions, and changed component names: moved bodies and the `App` body were compared to `HEAD`; no implementation body changed.
- [x] Check local import paths, named exports, and cycles with a static scan: no issues found.
- [ ] TypeScript validation: `pnpm exec tsc --noEmit` is blocked by pre-existing syntax errors carried unchanged from the original `App.tsx` into `Icon.tsx` and `LoginPage.tsx`. Temporarily correcting only those separators exposed three duplicate translation keys, also copied unchanged from the original. No other TypeScript diagnostics remained after fixing extraction import issues. These baseline issues were not changed.
- [x] Production build and targeted browser smoke tests completed; they do not replace the exhaustive route and interaction coverage still listed above.

### Validation run — 2026-11-02

- Environment: `.mise.toml` specifies pnpm 10.34.3. After approval, dependencies were installed with `pnpm install --frozen-lockfile`; `package.json` and `pnpm-lock.yaml` were not changed.
- TypeScript: the normal check reports syntax errors at `src/components/ui/Icon.tsx:116` and `src/features/auth/LoginPage.tsx:43`. The corresponding original declarations in `App.tsx` already had the same malformed type-property separators. With those two separators temporarily corrected for diagnostics and then restored, TypeScript reported only duplicate keys in `src/data/translations.ts` (lines 116, 121, and 204); the dictionary body matches the original. No refactoring-related type diagnostics remained after the import fixes.
- Build: `pnpm run build` passed.
- Browser: the Vite app rendered the landing page; login worked for all three roles; employee/admin dashboards and citizen dashboard/complaint details rendered; unauthenticated admin access was blocked; logout confirmation/completion, browser back/forward, empty complaint validation, Arabic/English text and direction switching, dark-theme toggle, and a 390px viewport smoke check passed. No page errors were observed in the exercised flows.
- Refactoring fixes: added the missing `HomePage` and `AccountLayout` imports, imported `ComplaintSwitcher` into the tracking module, and added missing `useState` imports in `Header`, `ReportsPage`, and the citizen dashboard module.
- Limitations: no exhaustive manual pass over every route, workflow, mobile-navigation state, or persisted settings was performed; no visual comparison against a design baseline was available.

## Phase 2 analysis checklist

- [x] Read the complete current `src/App.tsx`, current refactoring plan/checklist, and `src/main.tsx` Strict Mode entry.
- [x] Inspect extracted types, route helpers, layouts, shared/UI components, page modules, feature modules, and their import/export/state ownership boundaries.
- [x] Inventory navigation/auth/session, complaint/notification, favorites/category, feedback, and appearance/translation ownership.
- [x] Separate app-wide state from page-local state; do not propose lifting local form/menu/filter state.
- [x] Record callback dependencies and a dependency-safe extraction sequence.
- [x] Record regression requirements and the known pre-existing TypeScript baseline failures.
- [x] Confirm the starting worktree was clean and the modularization was committed (`966a560`) before documentation edits.
- [x] Make documentation-only changes for the initial Phase 2 analysis; do not install dependencies or commit/push.
- [x] Navigation hook extraction implemented after explicit review approval; no other Phase 2 state extraction was started.
- [x] Preserve the other pre-existing documentation/worktree changes; no commit or push.
- [ ] Review and approve each additional Phase 2 state extraction separately.

### Navigation hook validation — 2026-11-02

- Production build: passed.
- TypeScript: not passed; the check still reports pre-existing syntax errors in `src/components/ui/Icon.tsx:116` and `src/features/auth/LoginPage.tsx:43`.
- Browser: initial `/`, internal `/services`, Back, Forward, refresh on `/services`, legacy `/#/login`, and unauthenticated `/admin/dashboard` guard were verified. A rapid Back/Forward exercise during an active View Transition once emitted `Transition was aborted because of invalid state`; the normal-motion retry passed when transitions settled, and the reduced-motion run passed without page errors. Existing View Transition semantics were preserved.
- Listener review: `useAppNavigation` contains the sole `popstate`/`hashchange` registration and matching cleanup; no duplicate listener was found.

### Appearance preferences hook validation — 2026-11-02

- Production build: passed.
- TypeScript: not passed; the check reports the same pre-existing syntax errors in `src/components/ui/Icon.tsx:116` and `src/features/auth/LoginPage.tsx:43`.
- Browser: default state was light/Arabic/RTL; theme switching set `data-theme` and persisted after refresh; language switching updated rendered translations, `lang`, and `dir` to English/LTR and persisted after refresh; switching back restored Arabic/RTL. Route changes retained English translation through the `MutationObserver`. No page errors occurred in the reduced-motion route-observer check.
- Side effects: static inspection confirms only the new hook reads/writes appearance storage and document attributes; `App` still owns one translation observer.

## Git commit recommendations

- Create a clean baseline commit before starting application-code extraction.
- Keep this preparation/documentation commit separate from later code migration commits.
- Use one commit per small, validated extraction (types; route helpers; data; UI batch; layout; individual page/group; wiring).
- Run the build and the relevant regression checkpoint before committing each step.
- Do not combine refactoring with formatting churn, dependency updates, CSS redesign, or behavior changes.
- Keep uncompleted checklist items open; record failures and their scope rather than fixing unrelated baseline issues.
- No commit or push is part of the Phase 2 analysis task.

## T01 — Project Foundation audit (2026-11-02)

**Formal T01 acceptance: BLOCKED.** The repository contains no T01 specification or authoritative acceptance-criteria list. The following requested audit checks were completed; they should not be treated as a substitute for the missing criteria.

- [x] Confirm the expected `src/` folder structure, including `app/providers`, `app/routing`, `components/ui`, `components/shared`, all five feature folders, and the root-level data/hooks/layouts/pages/services/types/utils folders. `services` and `app/providers` contain no runtime modules; no speculative implementation was added.
- [x] Audit route definitions and composition: all 42 `Route` members map to exactly one path; 41 explicit switch cases leave `home` to the default fallback; no route is missing from composition.
- [x] Audit static imports/exports across 45 TypeScript files and 98 local import edges: all local paths resolve and no cycle was found.
- [x] Exercise all 42 mapped paths under citizen, employee, and admin sessions. Permitted routes rendered and cross-role routes showed the existing access-denied state; no page errors occurred.
- [x] Verify direct-load behavior for a report detail route, protected employee/admin routes, unknown-path fallback to home, trailing slash normalization, and legacy `/#/login`.
- [x] `pnpm run build` passed.
- [ ] `pnpm exec tsc --noEmit` — **BLOCKED by pre-existing baseline errors** in `src/components/ui/Icon.tsx:116` and `src/features/auth/LoginPage.tsx:43`. No unrelated baseline fix was made.
- [x] `git diff --check` passed.
- [x] Confirm no changes to `package.json`, `pnpm-lock.yaml`, `src/main.tsx`, or `src/index.css`; no dependency installation, commit, or push was performed for this audit.
- [ ] Obtain and review the authoritative T01 acceptance criteria before declaring T01 accepted.

Route coverage above validates route selection and role gating only. It does not claim exhaustive page-interaction, responsive, or visual-regression coverage.
