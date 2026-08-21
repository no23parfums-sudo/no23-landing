# NO.23 Perfume Master Template — V1 APPROVED

**Status:** freeze. Golden page: Bleu de Chanel Eau de Parfum, **split layout**.

Canonical URL:

`/perfume/bleu-de-chanel-eau-de-parfum?chapter=split`

Do not casually restyle locked sections. A second perfume should inherit this system through **data and assets**, not bespoke CSS or motion forks.

---

## Freeze (current)

| Item | Locked value |
| --- | --- |
| Layout | Split (`?chapter=split`) |
| Firma motion | Scroll-linked assembly by default (~50vh / 450px at 1440×900). No pin, no extra runway. |
| Timed Firma | Dev fallback only: `?firmaMotion=timed`. Also used for `prefers-reduced-motion`. |
| Lenis | `lerp: 0.16` in `shared/lib/lenis/config.ts` — do not retune from other files |
| Firma rest | Image grid + copy alignment locked (copy x 58, bottle/eyebrow y 72, title y 114, water y 609 at 1440) |
| Hero | Locked |
| Architecture | Locked |
| Performance content / panel size | Locked. Top hairline and bottom panel edge share `--perf-sheet-edge`. |
| Performance → Línea Bleu | Locked |
| Línea Bleu | Locked |
| Reviews / Bibliothèque / actions | Locked |
| Typography, assets, copy, section order | Locked |

Future fichas: new slug + presentation record + media. Do not add perfume-named CSS overrides.

---

## Historical note

The remainder of this file documents an **earlier chapter-rail architecture** (Hero Firma film, Smoke as Performance opening, Overview assemble). It is **not** the current split page. Keep it as research context only.

---


Internal freeze document. Golden candidate: **Bleu de Chanel Eau de Parfum**.

Visual baseline: [`docs/qa/master-v1/`](qa/master-v1/).

Do not casually regress locked V1 principles. A second perfume should be created primarily by changing data and assets, not by forking structure.

---

## Philosophy

The perfume page combines cinematic discovery with useful library behavior.

First visit may be experiential. Revisit must remain efficient and informational.

Native scroll remains authority. Video is never scroll-scrubbed. Performance values are qualitative editorial interpretations, not laboratory measurements.

Library first. Commerce is conditional. Collection and Wishlist require authentication before any persist.

---

## Chapter architecture

Fixed narrative order. Content changes per fragrance; structure does not.

| Rail | Chapter | Purpose | DOM / render |
| --- | --- | --- | --- |
| 01 | Apertura | Hero identity, concentration, Firma film | `.perfume-hero` |
| 02 | Firma | Hero dark-atmosphere signature reveal (`revealInHero`) | Hero, not a second document masthead |
| 03 | Notas | Signature Notes plates (Salida / Corazón / Fondo) | `.fragrance-notes` via `OlfactiveIdentity` |
| 04 | Arquitectura | Still-life map, stages, composition | `.olfactory-architecture` |
| — | Smoke | Performance opening, not a chapter | Inside `.performance-section` |
| 05 | Performance | Discovery 01–06 → Overview assemble → settled Overview | `.performance-section` |
| 06 | La línea | Optional chronological family | `.lineage-section` (null if empty) |
| — | Tu NO.23 | Collection / Wishlist / conditional Shop | `.perfume-actions` |
| — | Footer | Site footer | `.library-footer` |

Actual document order in `PerfumeDocument`:

1. OlfactiveIdentity (Signature Notes)
2. OlfactoryArchitecture
3. Legacy Architecture→Smoke bridge — **off** (`LEGACY_ARCH_SMOKE_BRIDGE = false`)
4. Moodboard — **null** when empty
5. PerformanceSection (Smoke + discovery + Overview)
6. LineageSection — **null** when empty
7. AffinitiesSection — **null** when empty
8. PerfumeActions

Hero lives above the document. Moodboard and Affinities are not rendered on Bleu.

---

## Required perfume data

Minimum fields for a new perfume page:

- `heroName`, `heroTitleLines`, `brandName`
- `atmosphere`
- Active variant: `concentration`, `year`, `perfumer`, `editorialSrc`, `descriptor` / `editorialSummary`
- `signatureNotes` (3: top / heart / base) + `notesChapter`
- `architecture.stages` + `stillLifeSrc` (omit still-life to skip the interactive map)
- `performance` readings: longevity, projection, sillage, versatility, seasons, occasions
- Page route / slug

Recommended:

- `catalogRef`, `olfactiveFamily`, `origin`
- `brandLogoSrc`
- `architecture.sectionBackgroundSrc`, `composition`
- `commerce` only when shop-available

---

## Required assets

| Slot | Role | Critical |
| --- | --- | --- |
| Hero editorial plate | Opening still | Yes |
| Optional Firma film | Replaces static Firma media when present | No |
| Signature note photographs (3) | Notes chapter | Yes when notes render |
| Architecture still-life | Interactive map | Yes when map renders |
| Architecture atmosphere plate | Section 3 ground | Recommended |
| Optional Smoke film | Performance opening | No — section still works without it |
| Lineage bottle plates | One per entry | Only if lineage exists |
| Optional perfumer portrait | Current lineage entry only | No |

---

## Optional modules

| Module | Hide rule | Current Bleu |
| --- | --- | --- |
| Lineage | `LineageSection` returns `null` if no entries | Present |
| Perfumer portrait | Omit `perfumerPortraitSrc` — no empty frame | Present on current EDP only |
| Moodboard | `null` if no plates | Absent |
| Affinities | `null` if no items | Absent |
| Commerce | Shop CTA only when `commerce.available === true` | Available, no `productUrl` |
| Firma film | Omit `firmaFilmSrc` on the variant | EDP only |
| Smoke film | Omit `architecture.cinematic` | Present |
| Architecture map | Omit `stillLifeSrc` | Present |

Known V1 gap: chapter rail / `HERO_CHAPTERS` always lists **06 La línea**. A perfume without lineage still shows that rail number. Do not silently invent a replacement chapter.

---

## Performance methodology

Performance values are **qualitative editorial interpretations**.

- Positions and weights are normalized 0–1 for rendering only.
- Never shown as laboratory percentages.
- `researchBasis` is internal editorial research, not a user-facing source attribution.
- Labels (Prolongada, Moderada, Contenido, etc.) are editorial readings.

Do not present these as objective measurements.

---

## Interaction rules

### Discovery vs revisit

- First visit: Smoke opening → metrics 01–06 → Overview assemble → settle.
- After settle: Overview only. Smoke is hidden (`display: none`). No accidental replay.
- Reverse scroll **before** settle: unassembles toward 06.
- Reverse scroll **after** settle: Overview remains; no Smoke replay.

### Scroll

- Native scroll is authority.
- No internal nested scrolling in chapters.
- Do not retune 06 → Overview assemble unless a regression is visible.
- Current assemble: `OVERVIEW_SHARE = 0.035`; geometry collapse deferred until `--perf-overview >= 0.92`.

### Video

- Smoke and Firma films play naturally (`loop`).
- **Never** assign `currentTime` from scroll.
- Smoke continues behind discovery with fading visual authority (approx. 01 ~0.64 → 03 ~0.34 → 06 ~0.14).
- Settled Overview hides Smoke.

### Reduced motion

Runtimes (`performanceRuntime`, architecture, lineage, actions, AuthGate, Editorial NO.23) honor `prefers-reduced-motion`. Discovery cinema compresses; information remains available.

---

## Commerce rule

Library first. Commerce conditional.

- `available !== true` → no Shop treatment.
- `available === true` and no `productUrl` → visible status (`role="status"`), **not** a fake link.
- `productUrl` present → same component becomes a semantic link.

Bleu EDP: `{ available: true, label: "AVAILABLE IN NO.23 SHOP" }` — no URL.

---

## Collection rule

Collection and Wishlist require authentication / persistence.

- Unauthenticated: open `No23AuthGate`. Labels stay “Agregar…”. Do **not** pretend the item was saved. `aria-pressed` stays unset.
- Authenticated: call `onAddToCollection` / `onAddToWishlist` hooks. Persistence is an API boundary, not fake local state.
- Auth copy (locked): title **Guardá tus fragancias en NO.23**; body explains account for collection, wishlist, and return.

---

## Scalability rules

No perfume should require rewriting the template.

Perfume-specific identity comes from:

1. Data (`presentation.ts` record)
2. Assets
3. Editorial content
4. Controlled presentation tokens (atmosphere, map anchors, cinematic src)

Not from structural forks or Bleu-named components.

A second perfume is: new slug + presentation record + media folder + route.

---

## Locked V1 principles

Do not casually regress:

- Native scroll as authority
- Smoke as Performance opening, not a chapter
- Natural video playback (no scroll-scrub)
- Visual authority moving from Smoke → Performance data
- Deferred 06 → Overview geometry collapse
- Settled revisit = Overview only
- Ivory release after Performance
- La Línea as the family chapter (not duplicated History + Collection)
- Jacques Polge metadata / portrait on the **current** lineage entry only
- Tu NO.23 actions + Auth Gate (no fake persist)
- Shop as status until a real URL exists
- Chapter rail 01–06 as the Bleu master index
- Current typography and spacing system
- Architecture and Signature Notes art direction

---

## Data / template classification

| Layer | Examples |
| --- | --- |
| **A. GLOBAL TEMPLATE** | `PerfumeDocument` order, Hero, chapter rail, Performance component + rails + Overview, Editorial NO.23, actions, AuthGate, footer |
| **B. PERFUME DATA** | Name, house, concentration, year, perfumer, notes, map anchors, performance readings, lineage entries, assets, commerce flags |
| **C. OPTIONAL MODULE** | Lineage, moodboard, affinities, shop, firma film, smoke film, perfumer portrait |
| **D. BLEU-SPECIFIC CUSTOMIZATION** | Map coordinates, cinematic srcs, atmosphere `nocturne`, 4-bottle lineage copy, Architecture still-life composition. No Bleu-named JSX. |
| **E. TECHNICAL RUNTIME** | `performanceRuntime`, `performanceMatter`, architecture handoff, GSAP ScrollTriggers, smoke playback sync |

Bleu-specific assumptions to watch (do not refactor in freeze):

- Type comments say `firmaFilmSrc` / `cinematic` are “EDP-only” — convention, not a component fork
- `HERO_CHAPTERS` hardcodes “La línea” as 06
- Architecture annotation positions are perfume-data (can overflow narrow viewports)
- `notesChapter.index` is `"02"` while the rail treats Notes as 03 (Firma reveal occupies 02)
- `PRESENTATIONS` currently contains only Bleu EDP

---

## Language

Spanish is the editorial body language.

Intentional English / brand terms: Performance, Sillage, Editorial NO.23, AVAILABLE IN NO.23 SHOP, Wishlist, Overview eyebrow.

Do not rewrite locked copy for style.

---

## NEW PERFUME IMPLEMENTATION CHECKLIST

### DATA

- [ ] name
- [ ] house
- [ ] concentration
- [ ] year
- [ ] perfumer
- [ ] description / editorial summary
- [ ] catalog ref
- [ ] olfactive family
- [ ] origin
- [ ] signature notes (3) + secondary notes
- [ ] architecture stages + map anchors (if map)
- [ ] performance (longevity, projection, sillage, versatility, seasons, occasions)
- [ ] seasonality
- [ ] occasion
- [ ] versatility
- [ ] variants / concentrations (1 or more)
- [ ] atmosphere id

### ASSETS

- [ ] hero editorial plate
- [ ] signature note media (3)
- [ ] architecture still-life
- [ ] architecture atmosphere plate
- [ ] optional Firma video
- [ ] optional Smoke video
- [ ] lineage bottles (if lineage)
- [ ] optional perfumer portrait
- [ ] brand logo

### OPTIONAL

- [ ] lineage
- [ ] affinities
- [ ] moodboard
- [ ] commerce `available`
- [ ] shop URL (only when real)
- [ ] historical / special module (omit if none — do not leave a blank chapter)

### SINGLE-CONCENTRATION / SPARSE PAGE

- [ ] one variant does not render empty sibling bottles
- [ ] no lineage → section hidden (rail 06 still listed — known V1 gap)
- [ ] no portrait → no empty frame
- [ ] no shop → no Shop row
- [ ] no affinities / moodboard → no blank sections
- [ ] no smoke film → Performance still opens without a broken video

### QA

- [ ] desktop 1440×900
- [ ] laptop 1280×800
- [ ] mobile 390×844
- [ ] optional 1920×1080
- [ ] slow editorial scroll
- [ ] normal scroll
- [ ] fast scroll
- [ ] Architecture → Performance handoff
- [ ] Smoke natural playback (not scrubbed)
- [ ] 01–06 discovery
- [ ] 06 → Overview assemble
- [ ] settled Overview
- [ ] reverse before settle
- [ ] reverse after settle / revisit
- [ ] reduced motion
- [ ] AuthGate: Escape, backdrop, focus; no fake persist
- [ ] Collection / Wishlist unauthenticated
- [ ] Shop status vs link
- [ ] no console errors
- [ ] no horizontal overflow (except known Architecture label overflow on narrow mobile)
- [ ] accents, punctuation, concentration naming

### COMPARE

- [ ] against `docs/qa/master-v1/` golden screenshots for structure, not perfume identity
