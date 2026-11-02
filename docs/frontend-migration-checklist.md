# Frontend Migration Checklist

Phase 1 extractions are marked complete below. Aggregate build and browser smoke checks were run after extraction; the results and remaining validation gaps are recorded in the final section. Per-extraction checkpoints were not run immediately after each step.

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

8. **Optional state extraction — decision required**
   - [x] Review the state boundaries in `App`; a provider is not needed for this extraction phase, so `src/app/providers/` remains empty.
   - [ ] If approved, document the provider contract first and migrate one state domain at a time; do not change state semantics or introduce new service abstractions.
   - [ ] **Build validation after each state domain:** run the existing production build.
   - [ ] **Regression checkpoint:** authentication/access, complaint updates, notifications, favorites, alert/toast callbacks, theme/language persistence, and browser navigation.
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

## Git commit recommendations

- Create a clean baseline commit before starting application-code extraction.
- Keep this preparation/documentation commit separate from later code migration commits.
- Use one commit per small, validated extraction (types; route helpers; data; UI batch; layout; individual page/group; wiring).
- Run the build and the relevant regression checkpoint before committing each step.
- Do not combine refactoring with formatting churn, dependency updates, CSS redesign, or behavior changes.
- Keep uncompleted checklist items open; record failures and their scope rather than fixing unrelated baseline issues.
- No commit was created for this phase.
