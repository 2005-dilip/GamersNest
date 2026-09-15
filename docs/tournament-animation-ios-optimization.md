# Tournament Animation — iOS / macOS / iPhone Optimization Guide

Optimization and cross-device responsiveness guide for the **Tournament Mystery Card**
unlock animation.

- **Component:** `client/src/components/TournamentMysteryCard.tsx`
- **Used in:** `client/src/pages/Home.tsx` (wraps the `#tournaments` section)
- **Tech:** React + Framer Motion (`motion`, `AnimatePresence`) + a raw `<canvas>` confetti effect
- **Reported problem:** On iOS devices (Safari on iPhone/iPad, and Safari on macOS) the
  animation is **not even visible** when the page is opened.

This document explains *why* it breaks on iOS, gives concrete fixes tied to the actual
code, and lists a verification checklist. Nothing here changes behavior on Chrome/Android;
all fixes are additive and safe.

---

## 1. Animation overview (what should happen)

The card runs a 5-phase state machine (`SequenceState`):

1. `locked` — blurred card + overlay, pulsing lock ring, "CLICK TO UNLOCK".
2. `unlocking` — lock morphs to unlock, ring flares (~700ms).
3. `countdown` — 3 → 2 → 1 with a pulsing energy ring and gradient numbers.
4. `celebration` — trophy + "Surprise Unlocked!" + **canvas confetti** (~1400ms).
5. `revealed` — overlay fades out, underlying tournament content un-blurs.

Reduced-motion users skip straight to `revealed`.

---

## 2. Root causes on iOS (why it's invisible)

These are ordered by how likely each is to cause a fully blank/invisible animation on
iPhone/macOS Safari.

### 2.1 Canvas has zero size / no Retina scaling — confetti invisible or 1px

In the celebration effect the canvas is sized like this:

```ts
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
```

Two iOS problems:

- **Measured too early / while hidden.** If the element isn't laid out yet (off-screen,
  `display:none`, still animating in), `offsetWidth/offsetHeight` return `0` on Safari, so
  the canvas is `0×0` and **nothing draws**. Safari is stricter about this timing than Chrome.
- **No devicePixelRatio (DPR) scaling.** iPhone/Mac screens are Retina (DPR 2–3). Setting the
  bitmap to CSS pixels makes confetti blurry and, combined with tiny particles, effectively
  invisible on high-DPI screens.

**Fix:** measure with a fallback, scale by DPR, and re-run when the element gets a real size.

```ts
const dpr = Math.min(window.devicePixelRatio || 1, 3);
const rect = canvas.getBoundingClientRect();
const cssW = rect.width  || canvas.parentElement?.clientWidth  || 320;
const cssH = rect.height || canvas.parentElement?.clientHeight || 320;

canvas.width  = Math.round(cssW * dpr);
canvas.height = Math.round(cssH * dpr);
canvas.style.width  = cssW + "px";
canvas.style.height = cssH + "px";
ctx.scale(dpr, dpr); // draw using CSS px coordinates
```

Then use `cssW`/`cssH` (not `canvas.width`) for particle spawn math:

```ts
x: cssW / 2 + (Math.random() - 0.5) * 40,
y: cssH / 2 + (Math.random() - 0.5) * 40,
```

If sizing still reads `0`, guard against it and retry on the next frame:

```ts
if (cssW === 0 || cssH === 0) {
  animId = requestAnimationFrame(setup); // retry until laid out
  return;
}
```

### 2.2 `backdrop-blur` inside a clipped + isolated container — blank overlay

The overlay uses `backdrop-blur-md`, and the wrapper uses
`rounded-3xl overflow-hidden isolation-auto`. The underlying card is also animated with a
Framer Motion `filter: blur(14px)`.

Safari (iOS + macOS) has long-standing bugs where **`backdrop-filter` renders as a solid or
blank layer** when it is nested inside an element that has `overflow:hidden` + `border-radius`
+ its own compositing/`isolation`, or a stacked `filter`. The result: a gray/black block with
no content, i.e. "the animation isn't visible".

**Fixes (pick based on testing):**

- Add the WebKit prefix wherever backdrop blur is used. Tailwind's `backdrop-blur-md` should
  emit `-webkit-backdrop-filter`, but verify in built CSS; if missing, add manually:
  ```css
  .ios-backdrop { -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
  ```
- Promote the overlay to its own layer so Safari composites it correctly:
  ```css
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: opacity, transform;
  ```
- If it still blanks, **replace `backdrop-blur` with a semi-opaque solid** on iOS
  (`bg-[#080c10]/90`) instead of blurring what's behind it. Backdrop blur is the single most
  fragile effect on Safari.
- Avoid stacking `filter: blur()` (on the card) *and* `backdrop-filter` (on the overlay) in the
  same clipped/isolated subtree. Prefer blurring only one layer.

### 2.3 `bg-clip-text` + `text-transparent` — countdown/title text disappears

The countdown number and celebration heading use:

```tsx
className="... bg-clip-text text-transparent"
```

On iOS Safari, gradient-clipped text **requires** the WebKit-prefixed properties, otherwise the
text is transparent with nothing showing through → invisible number/heading.

**Fix:** ensure both prefixes are present:

```css
.gradient-text {
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
          color: transparent;
}
```

Add a fallback color so text is never fully invisible if clipping fails:

```css
@supports not ((-webkit-background-clip: text) or (background-clip: text)) {
  .gradient-text { -webkit-text-fill-color: initial; color: #c4ff3d; }
}
```

### 2.4 `prefers-reduced-motion` + iOS Low Power / Auto-Play settings

`handleStartUnlock` sends reduced-motion users straight to `revealed` (good). But note:

- Many iPhones run with **Reduce Motion ON** or **Low Power Mode**, so users legitimately
  skip the animation — this can be mistaken for "broken". Confirm the *revealed* content is
  correct in that path.
- `matchMedia("(prefers-reduced-motion: reduce)")` is fine on modern iOS, but the reveal path
  must still render the card. Verify the un-blurred content shows.

### 2.5 `requestAnimationFrame` cleanup vs. Safari throttling

`requestAnimationFrame` pauses in background tabs and can be throttled in Low Power Mode on
iOS. The confetti only lasts ~1.4s so this is minor, but if a user backgrounds the app mid-
animation, ensure state still advances to `revealed` (the `setTimeout` in the celebration
effect already handles this — keep it).

---

## 3. Responsive sizing for iPhone / iPad / Mac

### 3.1 Viewport units

Use small/large/dynamic viewport units for full-height sections to avoid the iOS Safari
address-bar jump (already used elsewhere as `100svh`). For any fixed-height animation area:

```css
min-height: 100svh;            /* small viewport height, iOS-safe */
min-height: 100dvh;            /* dynamic fallback */
```

### 3.2 Safe-area insets (notch / Dynamic Island / home indicator)

If the card or overlay ever goes edge-to-edge, respect safe areas:

```css
padding-left:  env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
padding-bottom: env(safe-area-inset-bottom);
```

And ensure the meta viewport enables it (check `client/index.html`):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### 3.3 Touch targets & tap behavior

- The overlay is the click target (`onClick={handleStartUnlock}`). On iOS, ensure it is a real
  tappable region and add `cursor: pointer` (present) and `touch-action: manipulation` to remove
  the 300ms tap delay:
  ```css
  .mystery-overlay { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
  ```
- The "Replay Unlock" button is `top-4 right-4` — keep it clear of the safe-area/notch on
  landscape iPhone.

### 3.4 Fluid type & element scale

The component already uses responsive classes (`text-7xl sm:text-8xl`, etc.). For very small
iPhones (SE / 375px), verify the countdown ring (`h-36 w-36`) and lock ring (`h-20 w-20`) don't
overflow the card padding. Prefer `clamp()` if adjusting:

```css
font-size: clamp(3rem, 12vw, 6rem);
```

---

## 4. Concrete change list (safe, additive)

Apply in `TournamentMysteryCard.tsx` / associated CSS:

1. **Canvas:** add DPR scaling + `getBoundingClientRect` fallback + zero-size retry
   (Section 2.1). Highest priority — most likely fixes "invisible on iOS".
2. **Backdrop blur:** verify/add `-webkit-backdrop-filter`; if still blank on Safari, swap to a
   solid semi-opaque background on iOS (Section 2.2).
3. **Gradient text:** confirm `-webkit-background-clip: text` + `-webkit-text-fill-color`, add
   `@supports` fallback color (Section 2.3).
4. **Layer promotion:** add `transform: translateZ(0)` / `will-change` to the overlay so Safari
   composites the animation instead of dropping it.
5. **Viewport/meta:** confirm `viewport-fit=cover` and use `svh/dvh` where full-height.
6. **Don't stack** `filter: blur()` and `backdrop-filter` in the same clipped subtree.

---

## 5. iOS / macOS verification checklist

Test on **real hardware or Xcode Simulator** — desktop Chrome DevTools "device mode" does NOT
reproduce Safari's `backdrop-filter`/`bg-clip-text`/canvas bugs.

- [ ] iPhone Safari (latest iOS) — animation visible on first load
- [ ] iPhone Safari with **Reduce Motion ON** — reveals card content, no broken frame
- [ ] iPhone Safari with **Low Power Mode ON** — confetti runs or degrades gracefully
- [ ] iPhone SE / small viewport (375px) — no overflow, rings fit
- [ ] iPhone Pro (notch / Dynamic Island) landscape — replay button not clipped
- [ ] iPad Safari — canvas scales, confetti sharp (Retina)
- [ ] macOS Safari — countdown numbers visible (gradient text), overlay not blank
- [ ] Confetti particles are crisp (DPR scaled), not blurry/tiny
- [ ] Tap-to-unlock responds immediately (no 300ms delay)
- [ ] After reveal, tournament content is fully un-blurred and interactive
- [ ] Replay button re-triggers the full sequence

---

## 6. Debugging tips specific to Safari

- **Blank overlay?** Temporarily remove `backdrop-blur-md` and set a solid background. If it
  appears, the backdrop filter is the culprit (Section 2.2).
- **Invisible numbers/heading?** Temporarily remove `text-transparent`. If text appears, it's the
  `bg-clip-text` prefix issue (Section 2.3).
- **No confetti?** `console.log(cssW, cssH, dpr)` inside the canvas effect. If width/height are
  `0`, it's the sizing/timing issue (Section 2.1).
- Use **Safari → Develop → [device] → Web Inspector** to inspect the live iOS page; enable the
  Develop menu in Safari settings and Web Inspector on the iPhone (Settings → Safari → Advanced).

---

## 7. Notes

- All fixes are progressive enhancements: they add WebKit prefixes, DPR scaling, and fallbacks.
  They do not alter the animation on browsers that already work.
- The most impactful single fix is **Section 2.1 (canvas DPR + size fallback)** followed by
  **Section 2.2 (backdrop-filter on Safari)**. Start there.
