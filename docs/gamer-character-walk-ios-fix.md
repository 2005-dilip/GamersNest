# Gamer Character Walk — iOS / macOS / iPhone Visibility Fix

Fix guide for the scroll-driven **walking gamer character** that works on Android but is
**not showing at all** on iOS (iPhone/iPad Safari) and macOS Safari.

- **Component:** `client/src/components/GamerCharacterWalk.tsx`
- **Used in:** `client/src/pages/Home.tsx`
- **Sprite asset:** `client/public/images/character/gamersnest-gamer-walk.png`
  (2048 × 682, 8 horizontal frames — confirmed present, so this is NOT a missing-asset issue)
- **Tech:** React + CSS sprite-sheet animation driven by scroll progress
- **Reported problem:** Character walks fine on Android, but is **invisible on iOS/macOS Safari**.

Because the sprite loads and works on Android, the asset and the sprite logic are fine. The
invisibility on iOS is caused by iOS-specific CSS/behavior in the component. This guide lists
the causes in priority order with concrete, code-tied fixes.

---

## 1. How the character works (so fixes stay behavior-safe)

- A scroll listener computes `progress` (0 at top → 1 at bottom of page).
- `progress` drives:
  - horizontal position: `left = 2% + progress * 88%`
  - sprite frame: `frameIndex = floor(progress * 120) % 8`, shown via `background-position-x`.
- The character is `position: fixed` near the bottom center, `z-40`.
- A speech-bubble badge appears on hover/tap and on section changes.
- **If `prefers-reduced-motion: reduce` is set, the component returns `null` (renders nothing).**

---

## 2. Root causes on iOS (in priority order)

### 2.1 `prefers-reduced-motion` returns `null` — the #1 reason it's invisible on iPhone

```tsx
if (isReducedMotion) {
  return null;
}
```

**A very large share of iPhones run with "Reduce Motion" ON** (Settings → Accessibility →
Motion), and iOS also enables reduced-motion behavior under **Low Power Mode**. On those
devices this component renders **absolutely nothing** — which exactly matches "not even
showing on iOS" while Android (Reduce Motion usually OFF) shows it fine.

**Fix:** Don't remove the character for reduced-motion users. Instead, show a **static**
character (no walking animation / no scroll-driven movement), so it's still visible.

```tsx
// Instead of returning null, render a static, non-animated character.
// Keep it visible but freeze motion:
const effectiveProgress = isReducedMotion ? 0.5 : progress; // park it mid-screen
// ...and skip the scroll listener / frame cycling when reduced motion is on,
// but STILL render the sprite (frame 0) so it appears.
```

Minimal approach: keep the JSX rendering; just guard the *animation* (scroll updates, frame
changes, toast), not the *render*. Remove the early `return null`.

If product truly wants it hidden for reduced-motion, that's a product decision — but the
symptom described ("not showing on iOS") is most likely this. **Start here.**

### 2.2 `imageRendering: "pixelated"` — unsupported value on Safari

```tsx
style={{ imageRendering: "pixelated", ... }}
```

Safari (iOS + macOS) has **incomplete support** for `image-rendering: pixelated`. Depending on
version it ignores it or applies a different behavior. On its own this usually won't make the
sprite fully invisible, but combined with sprite scaling it can render the frame incorrectly
(e.g. wrong crop showing an empty region).

**Fix:** provide WebKit-friendly fallbacks:

```css
.sprite {
  image-rendering: -webkit-optimize-contrast; /* Safari */
  image-rendering: -webkit-crisp-edges;
  image-rendering: crisp-edges;
  image-rendering: pixelated;                 /* Chrome/Android last so it wins where supported */
}
```

(Apply via a class instead of inline so the cascade order is guaranteed.)

### 2.3 `env(safe-area-inset-bottom)` in a `calc()` arbitrary value + missing `viewport-fit=cover`

```tsx
className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] sm:bottom-6 ..."
```

Two iOS issues:

- **`env()` only returns non-zero when the viewport opts in** via
  `<meta name="viewport" ... viewport-fit=cover>`. If that's missing, `env(...)` is `0` (the
  fallback), which is usually harmless — BUT if the meta is present and the safe-area is large
  (notch / home indicator), the character can be pushed to an unexpected spot.
- **Tailwind arbitrary values with nested `calc()` + `env()`** must compile to valid CSS.
  Verify the built CSS actually contains
  `bottom: calc(64px + env(safe-area-inset-bottom, 0px))`. If Tailwind mangles the spaces, the
  rule is dropped and the element may sit off-screen (below the visible fold on iOS where the
  bottom toolbar overlaps `fixed` elements).

**Fixes:**

1. Confirm `client/index.html` has:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
   ```
2. Move the positioning into a real CSS class to avoid arbitrary-value parsing risk:
   ```css
   .gamer-walk-dock {
     position: fixed;
     bottom: calc(16px + env(safe-area-inset-bottom, 0px));
     left: 50%;
     transform: translateX(-50%);
     z-index: 40;
   }
   @media (min-width: 640px) { .gamer-walk-dock { bottom: 24px; } }
   ```
3. Verify the character isn't rendered *under* the iOS Safari bottom toolbar. `fixed` elements
   at `bottom: 0` are frequently overlapped by Safari's toolbar; the safe-area inset is what
   lifts it clear — so this must resolve correctly.

### 2.4 iOS Safari scroll metrics (`scrollHeight`, `innerHeight`) shift with the toolbar

```tsx
const totalScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
const fullPageProgress = currentScrollY / totalScrollableHeight;
```

On iOS Safari, `window.innerHeight` changes as the address bar shows/hides, and `scrollHeight`
can momentarily differ. If `totalScrollableHeight` computes as `0` or negative early on,
`progress` can be `NaN`/`0`, parking the character at `left: 2%` — technically visible, but if
combined with 2.1/2.3 it may look "gone."

**Fix:** clamp defensively (partly already done) and prefer `visualViewport` when available:

```tsx
const vpH = window.visualViewport?.height ?? window.innerHeight;
const total = Math.max(1, document.documentElement.scrollHeight - vpH);
const p = Math.min(1, Math.max(0, currentScrollY / total));
```

Also listen to `window.visualViewport` `resize`/`scroll` on iOS so position updates when the
toolbar toggles.

### 2.5 `background-size: 800% 100%` sprite scaling on Retina

The sprite uses `backgroundSize: "800% 100%"` to show 1 of 8 frames. On Retina iOS this is
generally fine, but if the container height is `0` (see 2.3) the sprite has no box to paint
into and is invisible. Ensure the character's wrapper has a real, non-zero height on iOS
(`h-16 sm:h-20 md:h-24` should hold, but verify after fixing positioning).

---

## 3. Concrete change list (safe, additive)

Apply in `GamerCharacterWalk.tsx` + `index.css`:

1. **Remove the `return null` for reduced motion** — render a static (non-walking) character
   instead, so it's visible on iPhones with Reduce Motion / Low Power Mode. **(Highest impact.)**
2. **Sprite image-rendering fallbacks** — add `-webkit-optimize-contrast` / `crisp-edges`
   before `pixelated` via a CSS class.
3. **Positioning** — move the `fixed` + `env(safe-area-inset-bottom)` styles into a CSS class;
   confirm `viewport-fit=cover` in `index.html`.
4. **Scroll math** — use `visualViewport.height` when available and clamp
   `totalScrollableHeight` to `>= 1`; subscribe to `visualViewport` resize on iOS.
5. **Verify container height** is non-zero on iOS after the positioning fix.

---

## 4. iOS / macOS verification checklist

Test on **real hardware or Xcode Simulator** (desktop Chrome device mode won't reproduce these):

- [ ] iPhone Safari, **Reduce Motion OFF** — character visible and walks on scroll
- [ ] iPhone Safari, **Reduce Motion ON** — character still **visible** (static, not gone)
- [ ] iPhone Safari, **Low Power Mode ON** — still visible
- [ ] iPhone with notch / Dynamic Island — character sits above the home indicator, not under
      the Safari bottom toolbar
- [ ] iPhone SE (small) — character not clipped, badge doesn't run off-screen
- [ ] iPad Safari — sprite crisp on Retina, correct single frame (no double/partial frame)
- [ ] macOS Safari — character visible, walks on scroll
- [ ] Scroll top→bottom — character travels left→right, frames cycle, badge changes per section
- [ ] Tap character — quote toast appears; at bottom of page, tapping scrolls to booking
- [ ] No `NaN`/jump when the address bar shows/hides while scrolling

---

## 5. Safari debugging tips

- **Nothing rendered at all?** Check `isReducedMotion` first: in Safari console,
  `window.matchMedia("(prefers-reduced-motion: reduce)").matches`. If `true`, that's why the
  old code returned `null` (Section 2.1).
- **Character off-screen?** Inspect the element's computed `bottom` — if the `calc()`/`env()`
  didn't apply, it's the arbitrary-value/meta issue (Section 2.3).
- **Wrong/blank sprite frame?** Log `bgPositionX` and confirm the container has non-zero
  width/height; check `image-rendering` fallback (Sections 2.2 / 2.5).
- Use **Safari → Develop → [device] → Web Inspector** on a connected iPhone (enable Web
  Inspector under iOS Settings → Safari → Advanced).

---

## 6. Notes

- All fixes are additive/progressive: WebKit fallbacks, `visualViewport` usage, and rendering a
  static character instead of nothing. They don't change Android behavior.
- **The single most likely fix is Section 2.1** — replacing `return null` for reduced-motion so
  iPhones with Reduce Motion (very common) still show the character. Do that first, retest on a
  real iPhone, then apply 2.2–2.4 as needed.
