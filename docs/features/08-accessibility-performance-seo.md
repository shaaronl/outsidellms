# 08 — Accessibility, Performance, Resilience, and Public SEO

## Outcome

Make JamQuest fast, navigable, and understandable on real festival devices and for assistive-technology users. Make public event content discoverable by search and social sharing without leaking private application data.

## Delivery rule

This is not a final polish phase. Apply its acceptance criteria to every feature as it is built, then run a whole-product release audit before production.

## User stories

- As a keyboard or screen-reader user, I can complete every core task and understand state changes.
- As a low-vision user in bright light, I can read critical content and identify selection without relying on color.
- As a mobile user on weak service, useful content appears quickly and layout does not jump.
- As a visitor arriving from search or a shared link, I get a useful public event page with correct metadata.
- As a privacy-conscious user, search engines cannot index account, crew, schedule, or proof data.

## Scope

### 1. Semantic interaction and navigation

- Use links for navigation and buttons for actions.
- Never place interactive controls inside another interactive element.
- Set document title, primary heading, landmarks, skip link, and `aria-current="page"`.
- Use native form labels, descriptions, errors, autocomplete, and input modes.
- Provide accessible names for icon controls; emoji/symbols never carry meaning alone.
- Preserve visible focus and logical focus order.
- Minimum on-site target size: 44 × 44 CSS px with sufficient separation.

### 2. Dialogs, sheets, menus, and announcements

Dialogs receive initial focus, trap focus, close with Escape when safe, make the background inert, expose name/description, and restore focus. Destructive/irreversible dialogs do not close accidentally during submission.

Menus and disclosures follow the correct keyboard pattern. The story preview is either a normal expanded region or a true modal—not `aria-modal=false` while claiming dialog behavior.

Announce important async success/failure through a restrained live region. Do not announce every autosave keystroke or timer update.

### 3. Visual access

- Meet WCAG 2.2 AA contrast as a floor, then field-test critical text in bright-light conditions.
- Use text/icon/shape in addition to color for selected, conflict, provenance, and error states.
- Support 200% browser zoom, large mobile text, and reflow without horizontal scrolling for core content.
- Avoid long dense serif passages for on-site operations; use the expressive editorial style primarily in planning/recap contexts.
- Respect reduced motion. Do not flash or use unavoidable motion for status.
- Provide text alternatives for meaningful imagery and empty alt for decoration.

### 4. Performance budgets

Set and enforce budgets for supported mobile devices/connections. Initial targets should be validated against actual hosting, but use these launch goals:

- Public landing/event pages: LCP ≤ 2.5 s at the 75th percentile.
- INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile.
- Critical app shell and Today usable on a representative mid-tier phone under slow 4G.
- Reserve media dimensions, optimize formats, lazy-load below fold, and avoid shipping entire feature domains on first load.
- Keep provider calls and Convex queries bounded, cached where appropriate, and observable.

Do not hide slow data behind indefinite skeletons. Display cached/stale state and retry affordances.

### 5. Mobile and resilience

- Support current target iOS Safari and Android Chrome versions defined in the release matrix.
- Respect safe areas, virtual keyboard, orientation, text scaling, and standalone/installable modes if offered.
- Recover from interrupted navigation, expired auth, provider failure, and offline/online transitions without losing confirmed state.
- Integrate reduced-data and low-battery behavior from [04](04-map-offline-safety.md).

### 6. Public SEO and sharing

Only public landing, discovery, festival, artist/event detail, and intentionally public editorial pages are indexable.

For indexable pages:

- Server-render useful unique content.
- Provide canonical URL, unique title/description, Open Graph/social image, and stable event slug.
- Use appropriate Event structured data only when fields are verified and match visible content.
- Include source/freshness, dates, time zone, venue, and ticket handoff plainly.
- Generate sitemap entries from eligible records and remove cancelled/deleted content appropriately.

Set `noindex` and prevent crawler access/data exposure for Today, Schedule, Crew, Quest submissions, Pulse drafts/private posts, Profile settings, account, export, moderation, and invite-token URLs. Shared schedule links require a separate privacy design and unguessable/revocable sharing capability.

## Not in scope

- Meeting only an automated accessibility score.
- Indexing user-generated or private content for growth.
- Heavy animation/video that compromises event-day utility.
- Supporting an undefined unlimited browser matrix.

## Implementation steps

1. [ ] Define supported browsers/devices, assistive-tech matrix, and measurable performance budgets.
2. [ ] Audit the design tokens for contrast, focus, target size, motion, and responsive typography.
3. [ ] Build shared accessible primitives for navigation, dialogs/sheets, notices, forms, and async state.
4. [ ] Fix semantic nested interactions and heading/landmark structure.
5. [ ] Add automated accessibility checks to component and end-to-end tests.
6. [ ] Profile bundles, images, data waterfalls, hydration, and rerenders; set CI budgets.
7. [ ] Add public metadata, canonical URLs, sitemap, robots rules, and verified structured data.
8. [ ] Ensure every private route and invite URL is non-indexable and authorization-protected.
9. [ ] Run manual keyboard, VoiceOver, TalkBack, zoom, reduced-motion, and bright-light reviews.
10. [ ] Run real-user field tests on slow networks and mid-tier devices; fix launch blockers.

## Acceptance criteria

- All core tasks can be completed keyboard-only and with VoiceOver/TalkBack on the supported matrix.
- Dialog focus and restoration work; no background interaction occurs while modal.
- Selected/conflict/provenance/error states remain understandable without color.
- Core views reflow at 200% zoom and large text without hiding actions/content.
- All critical on-site controls meet the target-size rule.
- Reduced-motion and low-battery modes remove nonessential animation.
- Production real-user performance meets the agreed budgets or launch exception is explicitly approved with an owner/date.
- Public event pages have correct canonical/social metadata; private routes and token URLs are not indexed.
- Structured event data exactly matches visible, verified content.

## Test plan

- Automated axe-equivalent checks plus semantic component tests; automated results do not replace manual checks.
- Keyboard and screen-reader scripts for Browse → Save, Schedule conflict, Today → Essentials, Crew status, and account deletion.
- 200% zoom, large font, landscape, safe-area, and virtual-keyboard tests.
- Lighthouse/lab budgets plus real-user Web Vitals segmented by page and device class.
- Search-engine inspection for canonical, robots/noindex, sitemap, structured data, and accidental private fields.
- Performance test with cold cache, provider latency/failure, slow 4G, offline transition, and stale cache.

## Metrics

Monitor Web Vitals, JavaScript/runtime errors, route/data latency, image failures, offline recoveries, accessibility support issues, organic landing → event-detail → save intent, and share-link success. Never treat search traffic alone as success; measure whether visitors reach useful event content.

## Dependencies and rollout

[00](00-platform-foundations.md) establishes routes and shared components. All other features consume these requirements. Gate merges on automated checks early, run manual audits per release, and monitor real-user data after incremental rollout.
