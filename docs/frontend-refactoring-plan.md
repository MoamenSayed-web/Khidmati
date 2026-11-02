# Frontend Refactoring Plan

## Scope and preservation

Phase 1 has been applied as a structural migration. The original component and declaration bodies were extracted from `src/App.tsx` into the modules below; the `App` function body was preserved byte-for-byte, apart from the new imports. No JSX, styling, route behavior, mock values, or business logic were rewritten.

Line ranges in the source-section table refer to the pre-extraction `src/App.tsx` and are approximate. They document where the code originated, not its current line numbers.

## Current architecture

- `src/main.tsx` imports `src/index.css`, mounts the default-exported `App` in `React.StrictMode`, and is the Vite entry point.
- `src/App.tsx` is now the application composition/orchestration module (860 lines). It imports types, data, route matching, translation, and feature/page components. The app-owned state, access policy, state mutation callbacks, page-to-props wiring, and top-level shell remain there.
- Route matching is hand-written: `routePaths` and `routeFromLocation` map paths to a `Route`; `App` pushes history entries and listens for `popstate` and `hashchange`. There is no routing package.
- `App` owns authentication/role checks, complaint records and updates, notifications, favorites, selected complaint/category, alerts/toasts, theme, language, and page selection. It passes state and callback props to pages.
- Translation is applied to rendered text and placeholders by `translateInterface`, an effect, and a `MutationObserver` on `#app-root`. Theme and language are persisted in `localStorage`.
- UI styling is coupled to the many class names in `App.tsx` and `src/index.css`. The CSS entry point is imported by `main.tsx`; leave it untouched during this preparation and preserve class names during extraction.
- The project has no service or custom-hook implementation. Mock interactions remain in `App` and page-local state. No provider, service abstraction, or custom hook was introduced because this phase did not require one.

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

1. Run the existing production build and address only migration-caused failures. Dependencies are currently absent (`node_modules` is not present), so build/type-check validation could not be run in this phase.
2. Manually smoke-test the route/auth matrix and visual/RTL/translation behavior listed in the checklist.
3. If checks pass, continue with narrow refinements such as splitting the remaining grouped feature modules (`features/admin/index.tsx`, `features/citizen/index.tsx`, `features/employee/index.tsx`) into per-page files. Keep imports acyclic and validate each move.
4. Consider extracting app state only after reviewing a concrete boundary; a provider is not currently necessary.

## Safe migration and validation checkpoints

- The original implementations and imports were checked mechanically: all 67 moved declarations and 14 type declarations match their original source bodies; the `App` function body matches the original.
- A static check scanned all local TypeScript imports and exports and found no unresolved local paths/names and no circular imports.
- A build/type-check and browser regression run remain outstanding. There is no test script, and `node_modules` is absent. Do not install dependencies as part of this plan.
- For any follow-up extraction: make one cohesive move, update only required imports/exports, then run `npm run build` (or the project’s existing equivalent) before starting the next move.
- Compare the moved component’s markup, props, route target, callbacks, class names, and text against the source before removing its old declaration. Avoid temporary duplicate implementations.
- After route helper extraction, test direct URL matching, unknown-route fallback, legacy `#/route` behavior, browser back/forward, and role/login guards.
- After UI/layout extraction, compare desktop/mobile behavior, menu/drawer interactions, alerts, theme, and Arabic/English rendering.
- After page extraction, exercise forms and page-specific state: registration/login/logout; report submission and notifications; complaint status/clarification; favorites; profile; search/filter; and office navigation.
- After each build checkpoint, run targeted manual regression checks for the affected surface. Before considering a feature group complete, smoke-test all routes it owns and the cross-role complaint details/notification flows.
- Keep `src/index.css`, `package.json`, styling, route behavior, and application logic unchanged unless a separately reviewed migration task explicitly authorizes a behavior change.
