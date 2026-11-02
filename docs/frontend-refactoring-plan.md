# Frontend Refactoring Plan

## Scope and preservation

Phase 1 has been applied as a structural migration. The original component and declaration bodies were extracted from `src/App.tsx` into the modules below; the `App` function body was preserved byte-for-byte, apart from the new imports. No JSX, styling, route behavior, mock values, or business logic were rewritten.

Line ranges in the source-section table refer to the pre-extraction `src/App.tsx` and are approximate. They document where the code originated, not its current line numbers.

## Current architecture

- `src/main.tsx` imports `src/index.css`, mounts the default-exported `App` in `React.StrictMode`, and is the Vite entry point.
- `src/App.tsx` is now the application composition/orchestration module (811 lines). It imports types, data, translation, hooks, and feature/page components. The app-owned state, access policy, state mutation callbacks, page-to-props wiring, translation observer, and top-level shell remain there.
- Route matching is hand-written: `routePaths` and `routeFromLocation` in `src/app/routing/routes.ts` map paths to a `Route`; `useAppNavigation` owns route state, history/hash listeners, cleanup, and low-level navigation. `App` retains the auth-aware `go` guard. There is no routing package.
- `App` owns authentication/role checks, complaint records and updates, notifications, favorites, selected complaint/category, alerts/toasts, and page selection. `useAppearancePreferences` owns theme/language state and persistence. State and callbacks are passed to pages through props.
- Translation is applied to rendered text and placeholders by `translateInterface`, an effect, and a `MutationObserver` on `#app-root`. `useAppearancePreferences` persists theme/language and updates the document attributes.
- UI styling is coupled to the many class names in `App.tsx` and `src/index.css`. The CSS entry point is imported by `main.tsx`; leave it untouched during this preparation and preserve class names during extraction.
- `src/hooks/useAppNavigation.ts` and `src/hooks/useAppearancePreferences.ts` are the current custom hooks; route navigation is kept under `src/app/routing/`. `src/services/` and `src/app/providers/` contain no runtime modules. Mock interactions remain in `App` and page-local state. No provider, service abstraction, or additional state hook is needed for the audited foundation.

## Extracted module map

The listed components are named exports and retain their original implementations. `src/main.tsx`, `src/index.css`, and `package.json` were not changed.

| Destination | Extracted responsibilities |
|---|---|
| `src/types/index.ts` | All 14 aliases: `Route`, `Language`, `Theme`, `AlertType`, `Role`, `CurrentUser`, `CitizenAccount`, `ComplaintStatus`, `ComplaintTimelineEntry`, `ComplaintRecord`, `WorkspaceNotification`, `AlertState`, `IconName`, `WorkspaceSidebarItem`. No interfaces or enums existed in `App.tsx`. |
| `src/data/mockData.ts` | `mockUser`, `defaultCitizen`, `employeeUser`, `adminUser`, `initialComplaint` |
| `src/data/catalogs.ts` | `categoryData`, `reportData`, `citizenReviews` |
| `src/data/translations.ts` | `englishText` |
| `src/utils/translation.ts` | `originalTextNodes`, `translateInterface` |
| `src/app/routing/routes.ts` | `routePaths`, `routeFromLocation` |
| `src/app/routing/useAppNavigation.ts` | Route state, browser history/hash listeners and cleanup, low-level `navigate` |
| `src/hooks/useAppearancePreferences.ts` | Theme/language state, storage persistence, document attributes |
| `src/components/shared/navigation.ts` | `navItems` |
| `src/components/ui/Icon.tsx`, `Button.tsx`, `Fields.tsx`, `VerificationCode.tsx`, `Card.tsx`, `Alert.tsx`, `StatusBadge.tsx`, `State.tsx`, `index.ts` | `iconPaths`, `Icon`, `Button`, `Input`, `Select`, `TextArea`, `VerificationCode`, `Card`, `Modal`, `SweetAlert`, `StatusBadge`, `EmptyState`, `ProtectedState`; `index.ts` is a barrel |
| `src/components/shared/Header.tsx`, `Footer.tsx`, `Hero.tsx`, `Content.tsx`, `navigation.ts`, `index.ts` | `Header`, `WorkspaceHeader`, `Footer`, `Hero`, `SectionTitle`, `ReportCard`, `navItems`; `index.ts` is a barrel |
| `src/layouts/index.tsx` | `sideItems`, `employeeSidebarItems`, `adminSidebarItems`, `AccountLayout`, `RoleDashboardLayout` |
| `src/features/auth/AuthLayout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPage.tsx`, `index.ts` | `AuthLayout`, `LoginPage`, `RegisterPage`, `ForgotPage`; `index.ts` is a barrel |
| `src/features/complaints/OperationalComplaintDetails.tsx`, `SubmissionPages.tsx`, `TrackingPages.tsx`, `index.ts` | `OperationalComplaintDetails`, `ComplaintSwitcher`, `SubmitPage`, `SubmitSuccessPage`, `TrackPage`, `Timeline`, `SharedComplaintTimeline`, `ReportDetailsPage`; `index.ts` is a barrel |
| `src/features/citizen/index.tsx` | `DashboardPage`, `FavoritesPage` |
| `src/features/employee/index.tsx` | `EmployeeDashboardPage`, `EmployeeComplaintsPage` |
| `src/features/admin/index.tsx` | `AdminDashboardPage`, `AdminManagementPage` |
| `src/pages/HomePage.tsx` | `HomePage` |
| `src/pages/ReportsPage.tsx` | `ReportsPage` |
| `src/pages/OfficePages.tsx`, `InfoPages.tsx`, `AccountPages.tsx`, `index.ts` | `OfficesPage`, `OfficeDetailsPage`, `AssistantPage`, `AboutPage`, `ProfilePage`, `NotificationsPage`, `FAQPage`, `SearchPage`, `EmergencyPage`; `index.ts` is a barrel |

The extraction moved 67 top-level functions/constants, plus all 14 type aliases. The `App` component body was compared against the repository's original version; it is unchanged.

## Actual sections and proposed destinations

| Original section / exact names | Approximate original lines | Current destination |
|---|---:|---|
| `Route`, `Language`, `Theme`, `AlertType`, `Role`, `CurrentUser`, `CitizenAccount`, `ComplaintStatus`, `ComplaintTimelineEntry`, `ComplaintRecord`, `WorkspaceNotification`, `AlertState`, `IconName`, `WorkspaceSidebarItem` (all are `type` aliases; no `interface` or `enum` declarations were found) | 3-59, 463, 2131-2138 | `src/types/index.ts` (one initial, dependency-free extraction) |
| `mockUser`, `defaultCitizen`, `employeeUser`, `adminUser`, `initialComplaint` | 62-109 | `src/data/mockData.ts` |
| `englishText` | 110-428 | `src/data/translations.ts` |
| `originalTextNodes`, `translateInterface` | 430-462 | `src/utils/translation.ts` |
| `iconPaths`, `Icon` | 465-595 | `src/components/ui/Icon.tsx` |
| `Button`, `Input`, `Select`, `TextArea`, `VerificationCode`, `Card`, `Modal`, `SweetAlert`, `StatusBadge`, `EmptyState`, `ProtectedState` | 596-631; 632-705; 706-734; 735-762; 763-827; 828-858; 859-891; 892-945; 946-958; 5199-5219; 5220-5246 | Focused modules under `src/components/ui/` (related input controls and card/modal are grouped; keep `SweetAlert` and alert callback behavior intact) |
| `navItems`, `routePaths`, `routeFromLocation` | 959-967; 968-1012; 1013-1027 | `src/components/shared/navigation.ts` for `navItems`; `src/app/routing/routes.ts` for path configuration and matching |
| `Header`, `WorkspaceHeader`, `Footer`, `Hero` | 1028-1198; 1199-1275; 1276-1336; 1337-1384 | `src/components/shared/` |
| `categoryData`, `reportData`, `citizenReviews` | 1385-1395; 1396-1422; 1423-1445 | `src/data/catalogs.ts` |
| `HomePage` | 1446-1674 | `src/pages/HomePage.tsx` |
| `SectionTitle`, `ReportCard` | 1675-1694; 1695-1738 | `src/components/shared/` |
| `AuthLayout`, `LoginPage`, `RegisterPage`, `ForgotPage` | 1739-1746; 1747-1871; 1872-1987; 1988-2121 | Focused files under `src/features/auth/` |
| `sideItems`, `employeeSidebarItems`, `adminSidebarItems` | 2122-2130; 2139-2193; 2194-2211 | `src/layouts/index.tsx` |
| `AccountLayout`, `RoleDashboardLayout` | 2212-2331; 2507-2532 | `src/layouts/index.tsx` |
| `DashboardPage`, `FavoritesPage` | 2332-2506; 4924-5011 | `src/features/citizen/index.tsx` |
| `EmployeeDashboardPage`, `EmployeeComplaintsPage` | 2533-2651; 2652-2724 | `src/features/employee/index.tsx` |
| `OperationalComplaintDetails` (supports both `mode: "employee" | "admin"`) | 2725-3063 | `src/features/complaints/OperationalComplaintDetails.tsx` (shared by employee and admin screens) |
| `AdminDashboardPage`, `AdminManagementPage` | 3064-3257; 3258-3554 | `src/features/admin/index.tsx` |
| `ReportsPage` | 3555-3654 | `src/pages/ReportsPage.tsx` |
| `ComplaintSwitcher`, `SubmitPage`, `SubmitSuccessPage`, `TrackPage`, `Timeline`, `SharedComplaintTimeline`, `ReportDetailsPage` | 3655-3683; 3684-3963; 3964-4007; 4008-4133; 4134-4161; 4162-4183; 4184-4305 | `src/features/complaints/SubmissionPages.tsx` and `TrackingPages.tsx` |
| `OfficesPage`, `OfficeDetailsPage`, `AssistantPage`, `AboutPage`, `FAQPage`, `SearchPage`, `EmergencyPage` | 4306-4469; 4470-4536; 4537-4644; 4645-4686; 5012-5072; 5073-5162; 5163-5198 | `src/pages/OfficePages.tsx` and `InfoPages.tsx` |
| `ProfilePage`, `NotificationsPage` (both accept role-specific props and are reused across roles) | 4687-4864; 4865-4923 | `src/pages/AccountPages.tsx`; one shared implementation avoids role-specific duplication |
| `App` state, effects, handlers, access checks, page switch, and shell composition | 5247-6062 | Keep in `src/App.tsx` as the gradual migration coordinator. An optional later state extraction could use `src/app/providers/`, but requires a separate design/review before introducing a provider. |

### State and routing details inside `App`

The state initialized at lines 5248-5290 covers `route`, `toastText`, `favorites`, `selectedCategory`, `complaintId`, `selectedComplaintId`, `complaints`, `employeeNotifications`, `citizenNotifications`, `isLoggedIn`, `currentUser`, `role`, `citizenAccount`, `alert`, `theme`, and `language`.

The effects at approximately lines 5292-5326 synchronize browser navigation, theme, language, and translation. The main state/routing callbacks are `navigate` (5328), `showLoginRequired` (5351), `authenticatedRoutes` (5364), `roleDashboard` (5395), `canAccess` (5402), `go` (5421), `toast` (5443), `openWorkspaceComplaint` (5448), `handleNewComplaint` (5458), `updateComplaintStatus` (5484), `cancelCitizenComplaint` (5532), `provideCitizenClarification` (5556), `handleLogin` (5591), `handleRegister` (5599), `handleLogout` (5613), `toggleFavorite` (5631), `footerRoutes` (5655), `selectedComplaint` / `citizenComplaints` (5671-5673), `openCitizenComplaint` (5678), and `renderPage` (5683).

`renderPage` contains the route-to-page switch (approximately 5696-6000). It passes state and event callbacks into each page; it should remain the owner of these boundaries during the first page extractions. Route-path generation/matching and access policy are separate concerns: moving the path helpers must not silently change the login/role gates or browser history behavior.

### Page-local helpers and configuration

These are nested inside components rather than standalone modules. Keep them with their owning component during extraction; moving them independently would split stateful behavior from the page that owns it.

| Exact local name | Current approximate lines | Owner / proposed destination |
|---|---:|---|
| `updateDigit` | 773 | `VerificationCode` in `src/components/ui/` |
| `run` | 902 | `SweetAlert` in `src/components/ui/` |
| `submit` | 1762; 1894; 3761; 4573 | `LoginPage`; `RegisterPage`; `SubmitPage`; `AssistantPage`, respectively |
| `set` | 1888 | `RegisterPage` |
| `employeeActions` | 2744 | `OperationalComplaintDetails` |
| `renderContent` | 3310 | `AdminManagementPage` |
| `toggleRecording` | 3723 | `SubmitPage` |
| `searchReport` | 4027 | `TrackPage` |
| `send` | 4554 | `AssistantPage` |
| `howItWorksSteps`, `management`, `pageMeta`, `employeePageConfig` | 1462; 3077; 3275; 5740 | Keep with their owning page or `App` route switch; these are page/route-local configuration, not separate current modules. |

## Dependencies and intended import direction

The dependency direction after extraction is:

1. `src/types/index.ts` is leaf-level and supplies `Route`, domain records, role/preferences, alert, and icon/sidebar types.
2. `src/data/mockData.ts` and `src/data/catalogs.ts` depend on types only. `src/data/translations.ts` is a string dictionary and does not depend on UI.
3. `src/utils/translation.ts` depends on `Language` and `englishText`; `App` calls it from its observer effect. Do not make the dictionary import the utility.
4. `src/app/routing/routes.ts` depends on `Route`; `App` uses `routePaths`/`routeFromLocation`, while shared navigation consumes the route type. Keep presentation navigation data out of the routing module.
5. `components/ui` imports only React hooks/types and domain types. It does not import pages, layouts, `App`, or route configuration.
6. Shared components and layouts consume UI primitives, leaf types, and the existing data/configuration required for their markup.
7. Page/feature components consume props and callbacks from `App`, plus shared UI/layout/data modules. They do not import `App` or other feature pages to reach state.
8. `App` imports the route helpers and all page/layout/shell components, retaining the state owner and passing the same callbacks and values. `main.tsx` continues to import `App` and `index.css`.
9. A static local-import/export scan found no missing local imports/exports or cycles. `src/services/`, `src/hooks/`, and `src/app/providers/` have no new implementation; keep them empty until a concrete extraction warrants code there.

## Circular-dependency risks

- Keep `Route` in the leaf type module rather than defining it in `routes.ts` and importing it back into UI/layouts. This avoids a `routes -> UI -> routes` loop.
- Keep `IconName`/sidebar item types independent from UI implementations; do not make `Icon.tsx` import a layout that itself renders `Icon`.
- Keep translation data independent from DOM translation logic. The utility may import the dictionary; the dictionary must not import the utility or components.
- The shared `OperationalComplaintDetails`, `ProfilePage`, and `NotificationsPage` cross role boundaries. Put reusable implementations in a shared location and pass role/mode/handlers, instead of employee/admin pages importing each other.
- Keep feature pages from importing the `App` composition module. Pass callbacks and records down; avoid moving callbacks into pages if doing so would reverse the dependency direction.
- Avoid barrel files that re-export through both `features/` and `components/` during initial extraction; direct imports make cycles easier to see.

## Completed phase and recommended next work

Completed: types; mock/static data; translation helper and route matching; UI primitives; shared components; layouts; auth, citizen, complaint, employee, admin, and public page components; and `App` imports/page wiring. No state provider or custom hook was added.

Recommended next steps:

1. Phase 1 production build passed and targeted browser smoke tests passed on 2026-11-02. The exhaustive route/interaction checklist remains open.
2. `pnpm exec tsc --noEmit` is still blocked by syntax errors and duplicate translation keys already present in the original monolith; see the migration checklist for locations and evidence. Do not mix those baseline issues into a state migration.
3. This document now proposes Phase 2 state/orchestration boundaries. Do not implement them until the proposal is reviewed.
4. Splitting grouped feature modules remains optional and independent of Phase 2; do not combine it with state ownership changes.

## Safe migration and validation checkpoints

- The original implementations and imports were checked mechanically: all 67 moved declarations and 14 type declarations match their original source bodies; the `App` function body matches the original.
- A static check scanned all local TypeScript imports and exports and found no unresolved local paths/names and no circular imports.
- The production build and targeted browser regression run completed; exhaustive route/interaction coverage and a clean TypeScript check remain outstanding.
- For any follow-up extraction: make one cohesive move, update only required imports/exports, then run `npm run build` (or the project’s existing equivalent) before starting the next move.
- Compare the moved component’s markup, props, route target, callbacks, class names, and text against the source before removing its old declaration. Avoid temporary duplicate implementations.
- After route helper extraction, test direct URL matching, unknown-route fallback, legacy `#/route` behavior, browser back/forward, and role/login guards.
- After UI/layout extraction, compare desktop/mobile behavior, menu/drawer interactions, alerts, theme, and Arabic/English rendering.
- After page extraction, exercise forms and page-specific state: registration/login/logout; report submission and notifications; complaint status/clarification; favorites; profile; search/filter; and office navigation.
- After each build checkpoint, run targeted manual regression checks for the affected surface. Before considering a feature group complete, smoke-test all routes it owns and the cross-role complaint details/notification flows.
- Keep `src/index.css`, `package.json`, styling, route behavior, and application logic unchanged unless a separately reviewed migration task explicitly authorizes a behavior change.

## Phase 2 proposal: application state and orchestration

**Status:** Navigation and appearance-preference extractions have been implemented as separate reviewed steps. The remaining items below are proposals only; no auth or complaint state has been moved. Shared state is owned by `App` and the two focused hooks; extracted pages and layouts own only their local interaction state and receive shared records/actions through props. There is no need for Context, Redux, Zustand, a provider, or a service layer.

### State inventory and proposed ownership

The app and its two extracted hooks currently own 16 application-level `useState` values:

| State | Current initialization | Current consumers / coupling | Proposed owner |
|---|---|---|---|
| `route` | `routeFromLocation` | `navigate`, `go`, access checks, route render switch, headers, footer, translation observer | `useAppNavigation` owns route state and browser synchronization; `App` keeps route authorization and page composition. **Extracted.** |
| `theme` | `localStorage["khadmaty-theme"]`, otherwise `"light"` | Header controls, root class, `document.documentElement.dataset.theme` | `useAppearancePreferences` owns the value, persistence, and document effect; `App` consumes the value/setter. **Extracted.** |
| `language` | `localStorage["khadmaty-language"]`, otherwise `"ar"` | Header controls, root `dir`, document `lang`/`dir`, translated rendered text, `SweetAlert` | `useAppearancePreferences` owns the value, persistence, and document effect; `App` retains the translation observer because it is also keyed to route, alert, and authentication changes. **Extracted.** |
| `isLoggedIn`, `currentUser`, `role` | `false`, `null`, `null` | Route guards, dashboard selection, shell selection, notification choice, role-aware page props; updated by login/register/logout/profile | Candidate `useAuthSession` after its navigation, alert, toast, and logout/favorites contracts are agreed. Keep guard policy and page composition in `App`. |
| `citizenAccount` | `defaultCitizen` | Login validation/display and registration/profile updates | Candidate `useAuthSession`, together with the session fields, because this account is the citizen login source. |
| `complaints` | `[initialComplaint]` | Citizen, employee, and admin pages; tracking, details, status updates, cancellation, clarification, and new submissions | Candidate `useComplaintWorkflow` under `src/app/state/`; do not let the hook import pages or `App`. |
| `employeeNotifications`, `citizenNotifications` | One unread item each, seeded from `initialComplaint` | Role-specific notification views; new submission, status updates, citizen clarification, and mark-all actions | Same complaint/workflow state module, as these notifications are derived from complaint lifecycle actions and currently coordinated together. |
| `selectedComplaintId` | `initialComplaint.id` | Workspace/citizen detail navigation, selected record lookup, notification actions | Same workflow owner; expose a selection action. `App` combines selection with route navigation. Preserve the current fallback to `complaints[0]` when the selected ID is absent. |
| `complaintId` | `"KH-2026-00126"` | `SubmitSuccessPage` | Same workflow owner only if submission remains the sole writer and success page remains the consumer; otherwise keep this small page-flow value in `App`. Confirm this before extraction. |
| `favorites` | `new Set()` | Reports, offices, citizen dashboard/favorites, login/role guard, logout reset | Keep in `App` initially: it is shared across separate page features and is reset as part of logout. A dedicated hook is not justified until the reset/auth contract is explicit. |
| `selectedCategory` | `""` | Assistant selects a category; submission page consumes it | Keep in `App`: this is intentionally shared between separate feature/page routes. |
| `alert` | `null` | Login/register/forms/profile/access guards/logout, `SweetAlert`, and route callbacks | Keep in `App` initially: alert actions can navigate or mutate auth and must stay connected to application orchestration. |
| `toastText` | `""` | Shared feedback from authentication, complaint lifecycle, favorites, and pages | Keep in `App` initially. Timer behavior and feature callback fan-out make extraction dependent on stable domain-hook interfaces. |

### State and callback behavior in `App`

- **Navigation:** an effect listens for `popstate` and `hashchange`. `navigate` handles same-route scroll, `pushState`, scroll reset, View Transitions when supported, and reduced-motion preference. `go` adds login/role access guards and produces alert actions; do not merge `go` into the low-level navigation hook.
- **Access policy and composition:** `authenticatedRoutes`, `roleDashboard`, `canAccess`, `go`, `footerRoutes`, `renderPage`, route-specific employee filters, selected-record derivation, and the shell/footer selection remain in `App` for the first state phase. These express app-wide policy and composition, not isolated feature state.
- **Authentication actions:** `handleLogin` sets session state, navigates to the role dashboard, and schedules a success toast. `handleRegister` updates the citizen account, clears session state, and sets a success alert. `handleLogout` opens a confirmation alert; its primary callback clears session and favorites, navigates home, then schedules a toast. The alert must remain open/cancelable with the same callback semantics.
- **Complaint actions:** `handleNewComplaint` sets the success-page ID and selected ID, prepends the complaint and unread notices for both audiences. `updateComplaintStatus` appends a timeline item with an Arabic-localized time, prepends a citizen notification, and toasts. `cancelCitizenComplaint` updates status/timeline and toasts. `provideCitizenClarification` updates status/timeline, notifies employees using the current user's name, and toasts. `openWorkspaceComplaint` and `openCitizenComplaint` select an ID and navigate to different detail routes. Notification mark-all handlers update the role-appropriate list.
- **Favorites:** `toggleFavorite` enforces login and citizen-role rules, immutably toggles the `Set`, and toasts. Logout clears it, so it is coupled to authentication even though pages render it.
- **Preferences and translation:** theme/language initialize from and write to `localStorage`; effects synchronize document attributes. A separate `MutationObserver` calls `translateInterface` and currently re-runs for language, route, alert, login, current user, and role. Do not narrow that dependency list without testing content replacement and translated alerts.
- **Derived values and configuration:** `selectedComplaint`, `citizenComplaints`, `authenticatedRoutes`, `footerRoutes`, and the employee route title/text/status table are derived/configuration, not state. They can stay in `App` until state hooks have stable contracts.

### Local state that should remain with extracted UI

Do not lift or centralize state that belongs to a single mounted component: header menus (`open`, `userMenuOpen`), sidebar drawer, auth form fields/loading/validation/forgot-password step, profile/password modal fields, citizen dashboard tab, report/office/search filters, assistant/FAQ input state, tracking form state, complaint clarification input, and submission form/recording/upload state. These are currently inside the extracted components and should remain there unless a concrete cross-page requirement appears.

### Proposed modules and dependency direction

| Module | Responsibility and boundary |
|---|---|
| `src/app/routing/useAppNavigation.ts` | **Implemented in Phase 2 step 1.** Owns `route` initialization, `popstate`/`hashchange` subscription/cleanup, and the existing low-level `navigate` behavior using `routePaths` and `routeFromLocation`. Returns `{ route, navigate }`; does **not** own the authenticated `go` guard. |
| `src/hooks/useAppearancePreferences.ts` | **Implemented in Phase 2 step 2.** Owns theme/language state and lazy initialization, setters, local-storage persistence, and root document theme/language/direction attributes. Returns `{ theme, setTheme, language, setLanguage }`. DOM text translation/observer wiring remains in `App`. |
| `src/app/state/useAuthSession.ts` | Candidate owner for login state, current user, role, citizen account, and the login/register/logout state transitions after explicit callback inputs for navigate, alert, toast, and clearing favorites are designed. It must not import pages/components or own route rendering. |
| `src/app/state/useComplaintWorkflow.ts` | Candidate owner for complaint records, per-role notifications, selected complaint ID, success-page complaint ID, and the coordinated complaint lifecycle/notification actions. Inject current-user data and feedback/navigation callbacks rather than importing auth or `App`. |
| `src/app/state/` | Create only when an approved state module is ready; no barrel, reducer, context, provider, or generic store is proposed by this analysis. |

Dependency direction:

```text
main.tsx
  -> App (application policy, guards, derived data, page/shell composition)
       -> useAppNavigation -> app/routing/routes -> types
       -> useAppearancePreferences -> types + browser storage/document APIs
       -> useAuthSession -> types + injected navigation/alert/toast/reset callbacks
       -> useComplaintWorkflow -> types + mock initial data + injected user/feedback
       -> extracted pages/layouts/components (props only; no imports from App/state)
```

Keep hooks below `App` in the dependency graph. Hooks must not import page components; pages must not import `App` or app-state modules. App is the composition point that wires navigation, auth, complaint actions, and page props. This direction avoids circular imports and avoids a provider requirement.

### Dependency-safe extraction order

1. **`useAppNavigation` (completed).** Route state, the location-event effect, and `navigate` were moved unchanged into `src/app/routing/useAppNavigation.ts`. `App` consumes `{ route, navigate }`; `go`, `authenticatedRoutes`, role checks, route rendering, and page props remain in `App`. This boundary is narrow and independently verified.
2. **Appearance preferences (completed).** Theme/language state initialization and their local-storage/document-attribute effects were moved into `useAppearancePreferences`; the translation observer remains in `App` with its original refresh dependencies. Default values and storage keys are preserved.
3. **Pure access-policy helper, only if it improves clarity.** Consider moving `authenticatedRoutes` and a pure `canAccess(route, isLoggedIn, role)`/dashboard-target helper to routing policy code. Keep the alerting `go` wrapper in `App`; do not move the policy and auth state in one step.
4. **Auth session state/actions.** Define the hook contract first and inject callbacks. Move the four session/account state values and their associated transition logic together only if logout confirmation, favorites reset, navigation, alerts, and toast ordering can remain unchanged. Otherwise extract state alone only if the resulting setter interface is still simpler than current `App`.
5. **Complaint workflow state/actions.** Move complaint records, both notification lists, selection/success IDs, and their coordinated callbacks as one domain. Keep route choice in `App`; it can call workflow selection then navigate. Avoid splitting complaint updates from their notification side effects.
6. **Re-evaluate remaining `App` coordination.** Keep favorites and selected category in `App` unless a clear ownership contract is found. Keep alert/toast state, translation observer, access guards, derived view data, route switch, and shell composition until their callback dependencies are demonstrably simpler elsewhere. Do not add providers.

Each remaining numbered extraction requires its own review and implementation step. Completion of navigation and appearance extractions does not authorize authentication, complaint state, or any other extraction.

### Phase 2 risks and validation

- **History semantics:** preserve initial direct-route resolution, trailing slashes, unknown-route fallback, legacy `#/route`, `pushState`, `popstate`, `hashchange`, same-route scroll, View Transition support, and reduced-motion handling. Navigation smoke-tested initial `/`, internal `/services`, Back/Forward, refresh on `/services`, legacy `#/login`, and blocked unauthenticated `/admin/dashboard`. A rapid history action during an active View Transition once produced the browser's `Transition was aborted because of invalid state`; the normal-motion test passed when transitions were allowed to settle, and reduced-motion navigation passed without page errors. The hook preserves the existing View Transition behavior; no change was made to transition policy.
- **Auth timing/order:** preserve current in-memory session initialization (`logged out` on refresh), role dashboard selection, delayed login/register timing, profile account update, wrong-role guards, logout cancel/confirm behavior, and clearing favorites only after confirmation.
- **Cross-domain callbacks:** complaint submission must update IDs, records, and both notification streams; status change and clarification must update the correct audience and timeline; citizen cancellation must remain citizen-only; detail opening must retain role-specific routes.
- **Stale closures and identity:** when hook callbacks capture `currentUser`, `role`, selected IDs, or a freshly created `toast`/`navigate` function, verify they use current values. Do not add memoization or alter callback identity unless needed and separately tested.
- **DOM effects:** preserve the MutationObserver's root, options, refresh triggers, disconnect cleanup, translation behavior for newly mounted alerts/pages, `html` direction/language, theme dataset, and localStorage fallback.
- **Set and timer semantics:** preserve immutable favorites updates, toast clearing after 2200ms, delayed auth toast scheduling, and avoid silently changing timeout cleanup behavior.
- **Strict Mode/lifecycle:** `main.tsx` renders `App` inside `React.StrictMode`; hooks must clean up event listeners and observers correctly when effects mount/cleanup in development.
- **Baseline TypeScript failures:** establish a before/after diagnostic baseline. The current known errors are pre-existing malformed type-property separators in the original `Icon`/`LoginPage` declarations and duplicate dictionary keys carried from the original translation object; do not attribute or fix them as part of state extraction. The production build and selected browser smoke tests passed on 2026-11-02.
- **Navigation extraction validation (2026-11-02):** production build passed. `pnpm exec tsc --noEmit` still reports the previously documented baseline syntax errors in `Icon.tsx` and `LoginPage.tsx`; no TypeScript pass is claimed. Browser checks confirmed initial path, internal navigation, Back/Forward, direct-route refresh, legacy hash navigation, and unauthenticated access blocking. Static inspection confirmed one `popstate` and one `hashchange` registration, each paired with cleanup in the hook, and no competing registrations in `App`.
- **Appearance preference extraction validation (2026-11-02):** production build passed. TypeScript remains blocked by the same baseline syntax errors in `Icon.tsx` and `LoginPage.tsx`. Browser checks confirmed default light/Arabic state, dark-mode switching and persistence after refresh, English/LTR and Arabic/RTL switching and persistence after refresh, and translated home/services content after route changes. No page errors occurred in the reduced-motion observer check. Static inspection confirmed theme/language storage and document-attribute writes exist only in `useAppearancePreferences`; `App` retains its existing `MutationObserver` and route/auth/alert dependencies.
- **Per-extraction gates:** run the existing production build and compare TypeScript diagnostics after each move; test the affected route/role interactions and browser history. Before accepting later Phase 2 state extractions, repeat login/register/logout for all roles; route guards; complaint submit, status, cancel, clarification, notification mark/open; favorite reset; language/theme storage and document attributes; translation updates; direct URLs/back/forward; RTL/mobile layouts; and verify no `App` imports from leaf modules.

## T01 — Project Foundation audit

The repository does not contain a T01 specification or authoritative acceptance-criteria list (the only project instruction file is `AGENTS.md`, and the existing docs contain no T01 definition). Therefore the formal T01 result is **BLOCKED pending the accepted criteria**. The requested foundation audit itself completed with these results:

- The expected source folders exist, including `app/providers`, `app/routing`, both component groups, all five feature groups, and the shared root-level folders. The `services` and `app/providers` folders currently have no runtime modules; no speculative provider or service was added.
- The route union and `routePaths` contain 42 matching routes. The `App` switch has 41 explicit cases; `home` is the intentional default fallback. No route is unmapped.
- Static import/export audit covered 45 TypeScript files and 98 local import edges: all local paths resolve, and no import cycle was found.
- Browser smoke check traversed all 42 mapped route paths as citizen, employee, and admin roles. Each role could render its permitted routes; cross-role protected routes showed the existing access-denied state. Direct load/refresh checks covered report details, role-protected routes, trailing slash handling, unknown-path fallback to home, and legacy `/#/login`. No page errors were observed during these checks. This is route/access verification, not exhaustive interaction or visual regression coverage.
- `pnpm run build` passed. `pnpm exec tsc --noEmit` remains blocked by documented baseline diagnostics in `src/components/ui/Icon.tsx` and `src/features/auth/LoginPage.tsx`; these were not changed.
- `git diff --check` passed. No application source, package manifest/lockfile, entry point, or CSS was changed for this audit.
