# Dark Mode Hardcoded Color Review

This document details the findings from a review of hardcoded color values in the frontend components, with recommendations for replacing them with semantic CSS variables defined in `globals.css`.

## Review Findings

### `frontend/src/app/layout.tsx`

**Current:**
```typescript
"min-h-screen bg-off-white dark:bg-volcanic-gray-dark font-sans antialiased",
```

**Proposed Change:**
```typescript
"min-h-screen bg-off-white font-sans antialiased",
```

**Explanation:**
The `bg-off-white` class is already configured in `globals.css` to handle both light and dark modes using CSS variables. The `dark:bg-volcanic-gray-dark` is a redundant hardcoded Tailwind class that overrides the intended CSS variable behavior. Removing it allows the `bg-off-white` variable to correctly apply the dark mode background color defined in the `@dark` block in `globals.css`.

### `frontend/src/components/catalyst-ui/alert.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L31: className="fixed inset-0 flex w-screen justify-center overflow-y-auto bg-zinc-950/15 px-2 py-2 transition duration-100 focus:outline-0 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in sm:px-6 sm:py-8 lg:px-8 lg:py-16 dark:bg-zinc-950/50"
L41: 'row-start-2 w-full rounded-2xl bg-white p-8 shadow-lg ring-1 ring-zinc-950/10 sm:rounded-2xl sm:p-6 dark:bg-zinc-900 dark:ring-white/10 forced-colors:outline',
L62: 'text-center text-base/6 font-semibold text-balance text-zinc-950 sm:text-left sm:text-sm/6 sm:text-wrap dark:text-white'
```

**Proposed Changes:**
1.  **Line 31:**
    *   **Current:** `dark:bg-zinc-950/50`
    *   **Proposed:** `dark:bg-background-primary/50`
    *   **Explanation:** Replace the hardcoded `zinc-950` with a semantic CSS variable for background color, assuming `background-primary` is the desired dark mode background for overlays.

2.  **Line 41:**
    *   **Current:** `dark:bg-zinc-900 dark:ring-white/10`
    *   **Proposed:** `dark:bg-background-secondary dark:ring-border-primary/10`
    *   **Explanation:** Replace hardcoded `zinc-900` and `white` with semantic CSS variables for background and border colors, assuming `background-secondary` and `border-primary` are the desired dark mode colors for the alert panel.

3.  **Line 62:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace hardcoded `white` with a semantic CSS variable for primary text color.

### `frontend/src/components/catalyst-ui/badge.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L8: red: 'bg-red-500/15 text-red-700 group-data-hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:group-data-hover:bg-red-500/20',
L10: 'bg-orange-500/15 text-orange-700 group-data-hover:bg-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400 dark:group-data-hover:bg-orange-500/20',
L12: 'bg-amber-400/20 text-amber-700 group-data-hover:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:group-data-hover:bg-amber-400/15',
L14: 'bg-yellow-400/20 text-yellow-700 group-data-hover:bg-yellow-400/30 dark:bg-yellow-400/10 dark:text-yellow-300 dark:group-data-hover:bg-yellow-400/15',
L15: lime: 'bg-lime-400/20 text-lime-700 group-data-hover:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15',
L17: 'bg-green-500/15 text-green-700 group-data-hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:group-data-hover:bg-green-500/20',
L19: 'bg-emerald-500/15 text-emerald-700 group-data-hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:group-data-hover:bg-emerald-500/20',
L20: teal: 'bg-teal-500/15 text-teal-700 group-data-hover:bg-teal-500/25 dark:bg-teal-500/10 dark:text-teal-300 dark:group-data-hover:bg-teal-500/20',
L21: cyan: 'bg-cyan-400/20 text-cyan-700 group-data-hover:bg-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 dark:group-data-hover:bg-cyan-400/15',
L22: sky: 'bg-sky-500/15 text-sky-700 group-data-hover:bg-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:group-data-hover:bg-sky-500/20',
L23: blue: 'bg-blue-500/15 text-blue-700 group-data-hover:bg-blue-500/25 dark:text-blue-400 dark:group-data-hover:bg-blue-500/25',
L25: 'bg-indigo-500/15 text-indigo-700 group-data-hover:bg-indigo-500/25 dark:text-indigo-400 dark:group-data-hover:bg-indigo-500/20',
L27: 'bg-violet-500/15 text-violet-700 group-data-hover:bg-violet-500/25 dark:text-violet-400 dark:group-data-hover:bg-violet-500/20',
L29: 'bg-purple-500/15 text-purple-700 group-data-hover:bg-purple-500/25 dark:text-purple-400 dark:group-data-hover:bg-purple-500/20',
L31: 'bg-fuchsia-400/15 text-fuchsia-700 group-data-hover:bg-fuchsia-400/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-400 dark:group-data-hover:bg-fuchsia-400/20',
L32: pink: 'bg-pink-400/15 text-pink-700 group-data-hover:bg-pink-400/25 dark:bg-pink-400/10 dark:text-pink-400 dark:group-data-hover:bg-pink-400/20',
L33: rose: 'bg-rose-400/15 text-rose-700 group-data-hover:bg-rose-400/25 dark:bg-rose-400/10 dark:text-rose-400 dark:group-data-hover:bg-rose-400/20',
L34: zinc: 'bg-zinc-600/10 text-zinc-700 group-data-hover:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:group-data-hover:bg-white/10',
```

**Proposed Changes (specific to `zinc` badge):**
*   **Line 34 (zinc badge):**
    *   **Current:** `dark:bg-white/5 dark:text-zinc-400 dark:group-data-hover:bg-white/10`
    *   **Proposed:** `dark:bg-background-primary/5 dark:text-text-secondary dark:group-data-hover:bg-background-primary/10`
    *   **Explanation:** `dark:bg-white/5` is replaced with `dark:bg-background-primary/5` to use the primary background color for dark mode. `dark:text-zinc-400` is replaced with `dark:text-text-secondary` as `zinc-400` often represents a secondary text color. `dark:group-data-hover:bg-white/10` is replaced with `dark:group-data-hover:bg-background-primary/10`.

**Note:** For other color-specific badges (red, orange, etc.), a more comprehensive solution would involve defining new semantic CSS variables for these specific accent colors and their shades within `@theme` in `globals.css`.

### `frontend/src/components/catalyst-ui/button.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L47: 'dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:data-active:bg-white/5 dark:data-hover:bg-white/5',
L55: 'dark:text-white dark:data-active:bg-white/10 dark:data-hover:bg-white/10',
L62: 'dark:text-white dark:[--btn-bg:var(--color-zinc-600)] dark:[--btn-hover-overlay:var(--color-white)]/5',
L67: 'dark:text-white dark:[--btn-hover-overlay:var(--color-white)]/5 dark:[--btn-bg:var(--color-zinc-800)]',
L72: 'dark:text-zinc-950 dark:[--btn-bg:white] dark:[--btn-hover-overlay:var(--color-zinc-950)]/5',
```

**Proposed Changes:**
*   **Line 47:**
    *   **Current:** `dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:data-active:bg-white/5 dark:data-hover:bg-white/5`
    *   **Proposed:** `dark:border-border-primary/15 dark:text-text-primary dark:[--btn-bg:transparent] dark:data-active:bg-background-primary/5 dark:data-hover:bg-background-primary/5`
    *   **Explanation:** `white` is replaced with `text-primary` for text and `background-primary` for background/hover states, and `border-primary` for borders.

*   **Line 55:**
    *   **Current:** `dark:text-white dark:data-active:bg-white/10 dark:data-hover:bg-white/10`
    *   **Proposed:** `dark:text-text-primary dark:data-active:bg-background-primary/10 dark:data-hover:bg-background-primary/10`
    *   **Explanation:** `white` is replaced with `text-primary` and `background-primary`.

*   **Line 62:**
    *   **Current:** `dark:text-white dark:[--btn-bg:var(--color-zinc-600)] dark:[--btn-hover-overlay:var(--color-white)]/5`
    *   **Proposed:** `dark:text-text-primary dark:[--btn-bg:var(--color-volcanic-gray)] dark:[--btn-hover-overlay:var(--color-text-primary)]/5`
    *   **Explanation:** `white` is replaced with `text-primary`. `zinc-600` can be mapped to `--color-volcanic-gray`.

*   **Line 67:**
    *   **Current:** `dark:text-white dark:[--btn-hover-overlay:var(--color-white)]/5 dark:[--btn-bg:var(--color-zinc-800)]`
    *   **Proposed:** `dark:text-text-primary dark:[--btn-hover-overlay:var(--color-text-primary)]/5 dark:[--btn-bg:var(--color-volcanic-gray-dark)]`
    *   **Explanation:** `white` is replaced with `text-primary`. `zinc-800` can be mapped to `--color-volcanic-gray-dark`.

*   **Line 72:**
    *   **Current:** `dark:text-zinc-950 dark:[--btn-bg:white] dark:[--btn-hover-overlay:var(--color-zinc-950)]/5`
    *   **Proposed:** `dark:text-text-primary dark:[--btn-bg:var(--color-background-primary)] dark:[--btn-hover-overlay:var(--color-text-primary)]/5`
    *   **Explanation:** `zinc-950` is replaced with `text-primary`. `white` for background is replaced with `background-primary`.

### `frontend/src/components/catalyst-ui/checkbox.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L56: 'dark:bg-white/5 dark:group-data-checked:bg-(--checkbox-checked-bg)',
```

**Proposed Changes:**
*   **Line 56:**
    *   **Current:** `dark:bg-white/5`
    *   **Proposed:** `dark:bg-background-primary/5`
    *   **Explanation:** Replace `white/5` with `background-primary/5` to use the semantic primary background color.

### `frontend/src/components/catalyst-ui/combobox.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L71: 'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
L75: 'bg-transparent dark:bg-white/5',
L111: 'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
L150: 'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
L182: 'flex flex-1 overflow-hidden text-zinc-500 group-data-focus/option:text-white before:w-2 before:min-w-0 before:shrink dark:text-zinc-400'
```

**Proposed Changes:**
*   **Line 71:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 75:**
    *   **Current:** `dark:bg-white/5`
    *   **Proposed:** `dark:bg-background-primary/5`
    *   **Explanation:** Replace `white/5` with `background-primary/5` for the background.

*   **Line 111:**
    *   **Current:** `dark:bg-zinc-800/75`
    *   **Proposed:** `dark:bg-background-secondary/75`
    *   **Explanation:** `zinc-800` is a dark gray, which can be mapped to `background-secondary`.

*   **Line 150:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 182:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

### `frontend/src/components/catalyst-ui/description-list.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L21: 'col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3 dark:border-white/5 dark:text-zinc-400 sm:dark:border-white/5'
L33: 'pt-1 pb-3 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3 sm:nth-2:border-none dark:text-white dark:sm:border-white/5'
```

**Proposed Changes:**
*   **Line 21:**
    *   **Current:** `dark:border-white/5 dark:text-zinc-400 sm:dark:border-white/5`
    *   **Proposed:** `dark:border-border-primary/5 dark:text-text-secondary sm:dark:border-border-primary/5`
    *   **Explanation:** `white` for borders is replaced with `border-primary`, and `zinc-400` for text is replaced with `text-secondary`.

*   **Line 33:**
    *   **Current:** `dark:text-white dark:sm:border-white/5`
    *   **Proposed:** `dark:text-text-primary dark:sm:border-border-primary/5`
    *   **Explanation:** `white` for text is replaced with `text-primary`, and `white` for borders is replaced with `border-primary`.

### `frontend/src/components/catalyst-ui/dialog.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L31: className="fixed inset-0 flex w-screen justify-center overflow-y-auto bg-zinc-950/25 px-2 py-2 transition duration-100 focus:outline-0 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in sm:px-6 sm:py-8 lg:px-8 lg:py-16 dark:bg-zinc-950/50"
L41: 'row-start-2 w-full min-w-0 rounded-t-3xl bg-white p-(--gutter) shadow-lg ring-1 ring-zinc-950/10 [--gutter:--spacing(8)] sm:mb-auto sm:rounded-2xl dark:bg-zinc-900 dark:ring-white/10 forced-colors:outline',
L60: className={clsx(className, 'text-lg/6 font-semibold text-balance text-zinc-950 sm:text-base/6 dark:text-white')}
```

**Proposed Changes:**
*   **Line 31:**
    *   **Current:** `dark:bg-zinc-950/50`
    *   **Proposed:** `dark:bg-background-primary/50`
    *   **Explanation:** Replace `zinc-950` with `background-primary` for the overlay background.

*   **Line 41:**
    *   **Current:** `dark:bg-zinc-900 dark:ring-white/10`
    *   **Proposed:** `dark:bg-background-secondary dark:ring-border-primary/10`
    *   **Explanation:** `zinc-900` is a dark background, so `background-secondary` is a good fit. `white` for the ring is replaced with `border-primary`.

*   **Line 60:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

### `frontend/src/components/catalyst-ui/dropdown.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L41: 'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
L65: 'text-left text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
L117: 'col-span-full grid grid-cols-[1fr_auto] gap-x-12 px-3.5 pt-2 pb-1 text-sm/5 font-medium text-zinc-500 sm:px-3 sm:text-xs/5 dark:text-zinc-400'
L132: 'col-span-full mx-3.5 my-1 h-px border-0 bg-zinc-950/5 sm:mx-3 dark:bg-white/10 forced-colors:bg-[CanvasText]'
L157: 'col-span-2 col-start-2 row-start-2 text-sm/5 text-zinc-500 group-data-focus:text-white sm:text-xs/5 dark:text-zinc-400 forced-colors:group-data-focus:text-[HighlightText]'
```

**Proposed Changes:**
*   **Line 41:**
    *   **Current:** `dark:bg-zinc-800/75`
    *   **Proposed:** `dark:bg-background-secondary/75`
    *   **Explanation:** `zinc-800` is a dark background, so `background-secondary` is a good fit.

*   **Line 65:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 117:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

*   **Line 132:**
    *   **Current:** `dark:bg-white/10`
    *   **Proposed:** `dark:bg-border-primary/10`
    *   **Explanation:** `white/10` is used for a border-like element, so `border-primary` is appropriate.

*   **Line 157:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

### `frontend/src/components/catalyst-ui/fieldset.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L27: 'text-base/6 font-semibold text-zinc-950 data-disabled:opacity-50 sm:text-sm/6 dark:text-white'
L61: 'text-base/6 text-zinc-950 select-none data-disabled:opacity-50 sm:text-sm/6 dark:text-white'
L75: className={clsx(className, 'text-base/6 text-zinc-500 data-disabled:opacity-50 sm:text-sm/6 dark:text-zinc-400')}
L88: className={clsx(className, 'text-base/6 text-red-600 data-disabled:opacity-50 sm:text-sm/6 dark:text-red-500')}
```

**Proposed Changes:**
*   **Line 27:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 61:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 75:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

*   **Line 88:**
    *   **Current:** `dark:text-red-500`
    *   **Proposed:** `dark:text-accent-error`
    *   **Explanation:** `red-500` is an error color, so `accent-error` is the semantic equivalent.

### `frontend/src/components/catalyst-ui/heading.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L13: className={clsx(className, 'text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white')}
L24: className={clsx(className, 'text-base/7 font-semibold text-zinc-950 sm:text-sm/6 dark:text-white')}
```

**Proposed Changes:**
*   **Line 13:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 24:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

### `frontend/src/components/catalyst-ui/input.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L77: 'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
L81: 'bg-transparent dark:bg-white/5',
```

**Proposed Changes:**
*   **Line 77:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 81:**
    *   **Current:** `dark:bg-white/5`
    *   **Proposed:** `dark:bg-background-primary/5`
    *   **Explanation:** Replace `white/5` with `background-primary/5` for the background.

### `frontend/src/components/catalyst-ui/listbox.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L55: 'text-left text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
L59: 'bg-transparent dark:bg-white/5',
L91: 'bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75',
L136: 'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
L171: 'flex flex-1 overflow-hidden text-zinc-500 group-data-focus/option:text-white before:w-2 before:min-w-0 before:shrink dark:text-zinc-400'
```

**Proposed Changes:**
*   **Line 55:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 59:**
    *   **Current:** `dark:bg-white/5`
    *   **Proposed:** `dark:bg-background-primary/5`
    *   **Explanation:** Replace `white/5` with `background-primary/5` for the background.

*   **Line 91:**
    *   **Current:** `dark:bg-zinc-800/75`
    *   **Proposed:** `dark:bg-background-secondary/75`
    *   **Explanation:** `zinc-800` is a dark gray, which can be mapped to `background-secondary`.

*   **Line 136:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 171:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

### `frontend/src/components/catalyst-ui/navbar.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L15: return <div aria-hidden="true" {...props} className={clsx(className, 'h-6 w-px bg-zinc-950/10 dark:bg-white/10')} />
L58: 'dark:text-white dark:*:data-[slot=icon]:fill-zinc-400',
L68: className="absolute inset-x-2 -bottom-2.5 h-0.5 rounded-full bg-zinc-950 dark:bg-white"
```

**Proposed Changes:**
*   **Line 15:**
    *   **Current:** `dark:bg-white/10`
    *   **Proposed:** `dark:bg-border-primary/10`
    *   **Explanation:** `white/10` is used for a separator, so `border-primary` is appropriate.

*   **Line 58:**
    *   **Current:** `dark:text-white dark:*:data-[slot=icon]:fill-zinc-400`
    *   **Proposed:** `dark:text-text-primary dark:*:data-[slot=icon]:fill-text-secondary`
    *   **Explanation:** `white` for text is replaced with `text-primary`, and `zinc-400` for icon fill is replaced with `text-secondary`.

*   **Line 68:**
    *   **Current:** `dark:bg-white`
    *   **Proposed:** `dark:bg-border-primary`
    *   **Explanation:** `white` is used for a bottom indicator, so `border-primary` is appropriate.

### `frontend/src/components/catalyst-ui/pagination.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L93: className={clsx(className, 'w-9 text-center text-sm/6 font-semibold text-zinc-950 select-none dark:text-white')}
```

**Proposed Changes:**
*   **Line 93:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

### `frontend/src/components/catalyst-ui/radio.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L58: 'dark:bg-white/5 dark:group-data-checked:bg-(--radio-checked-bg)',
```

**Proposed Changes:**
*   **Line 58:**
    *   **Current:** `dark:bg-white/5`
    *   **Proposed:** `dark:bg-background-primary/5`
    *   **Explanation:** Replace `white/5` with `background-primary/5` for the background.

### `frontend/src/components/catalyst-ui/select.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L40: 'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white dark:*:text-white',
L44: 'bg-transparent dark:bg-white/5 dark:*:bg-zinc-800',
```

**Proposed Changes:**
*   **Line 40:**
    *   **Current:** `dark:text-white dark:*:text-white`
    *   **Proposed:** `dark:text-text-primary dark:*:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 44:**
    *   **Current:** `dark:bg-white/5 dark:*:bg-zinc-800`
    *   **Proposed:** `dark:bg-background-primary/5 dark:*:bg-background-secondary`
    *   **Explanation:** Replace `white/5` with `background-primary/5` and `zinc-800` with `background-secondary`.

### `frontend/src/components/catalyst-ui/sidebar-layout.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L34: <div className="flex h-full flex-col rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
L55: <div className="relative isolate flex min-h-svh w-full bg-white max-lg:flex-col lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950">
```

**Proposed Changes:**
*   **Line 34:**
    *   **Current:** `dark:bg-zinc-900 dark:ring-white/10`
    *   **Proposed:** `dark:bg-background-secondary dark:ring-border-primary/10`
    *   **Explanation:** `zinc-900` is a dark background, so `background-secondary` is a good fit. `white` for the ring is replaced with `border-primary`.

*   **Line 55:**
    *   **Current:** `dark:bg-zinc-900 dark:lg:bg-zinc-950`
    *   **Proposed:** `dark:bg-background-secondary dark:lg:bg-background-primary`
    *   **Explanation:** `zinc-900` is a dark background, so `background-secondary` is a good fit. `zinc-950` is an even darker background, so `background-primary` is appropriate for the primary background.

### `frontend/src/components/catalyst-ui/sidebar.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L70: <h3 {...props} className={clsx(className, 'mb-1 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400')} />
L102: 'dark:text-white dark:*:data-[slot=icon]:fill-zinc-400',
L113: className="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-zinc-950 dark:bg-white"
```

**Proposed Changes:**
*   **Line 70:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

*   **Line 102:**
    *   **Current:** `dark:text-white dark:*:data-[slot=icon]:fill-zinc-400`
    *   **Proposed:** `dark:text-text-primary dark:*:data-[slot=icon]:fill-text-secondary`
    *   **Explanation:** `white` for text is replaced with `text-primary`, and `zinc-400` for icon fill is replaced with `text-secondary`.

*   **Line 113:**
    *   **Current:** `dark:bg-white`
    *   **Proposed:** `dark:bg-border-primary`
    *   **Explanation:** `white` is used for a separator, so `border-primary` is appropriate.

### `frontend/src/components/catalyst-ui/stacked-layout.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L34: <div className="flex h-full flex-col rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
L55: <div className="relative isolate flex min-h-svh w-full flex-col bg-white lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950">
```

**Proposed Changes:**
*   **Line 34:**
    *   **Current:** `dark:bg-zinc-900 dark:ring-white/10`
    *   **Proposed:** `dark:bg-background-secondary dark:ring-border-primary/10`
    *   **Explanation:** `zinc-900` is a dark background, so `background-secondary` is a good fit. `white` for the ring is replaced with `border-primary`.

*   **Line 55:**
    *   **Current:** `dark:bg-zinc-900 dark:lg:bg-zinc-950`
    *   **Proposed:** `dark:bg-background-secondary dark:lg:bg-background-primary`
    *   **Explanation:** `zinc-900` is a dark background, so `background-secondary` is a good fit. `zinc-950` is an even darker background, so `background-primary` is appropriate for the primary background.

### `frontend/src/components/catalyst-ui/switch.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L160: 'bg-zinc-200 ring-1 ring-black/5 ring-inset dark:bg-white/5 dark:ring-white/15',
```

**Proposed Changes:**
*   **Line 160:**
    *   **Current:** `dark:bg-white/5 dark:ring-white/15`
    *   **Proposed:** `dark:bg-background-primary/5 dark:ring-border-primary/15`
    *   **Explanation:** Replace `white/5` with `background-primary/5` and `white/15` with `border-primary/15`.

### `frontend/src/components/catalyst-ui/table.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L29: <table className="min-w-full text-left text-sm/6 text-zinc-950 dark:text-white">{children}</table>
L38: return <thead {...props} className={clsx(className, 'text-zinc-500 dark:text-zinc-400')} />
```

**Proposed Changes:**
*   **Line 29:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 38:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

### `frontend/src/components/catalyst-ui/text.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L9: className={clsx(className, 'text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400')}
L20: 'text-zinc-950 underline decoration-zinc-950/50 data-hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:data-hover:decoration-white'
L27: return <strong {...props} className={clsx(className, 'font-medium text-zinc-950 dark:text-white')} />
L36: 'rounded-sm border border-zinc-950/10 bg-zinc-950/2.5 px-0.5 text-sm font-medium text-zinc-950 sm:text-[0.8125rem] dark:border-white/20 dark:bg-white/5 dark:text-white'
```

**Proposed Changes:**
*   **Line 9:**
    *   **Current:** `dark:text-zinc-400`
    *   **Proposed:** `dark:text-text-secondary`
    *   **Explanation:** `zinc-400` is a lighter gray, suitable for `text-secondary`.

*   **Line 20:**
    *   **Current:** `dark:text-white dark:decoration-white/50 dark:data-hover:decoration-white`
    *   **Proposed:** `dark:text-text-primary dark:decoration-text-primary/50 dark:data-hover:decoration-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for text and decoration.

*   **Line 27:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 36:**
    *   **Current:** `dark:border-white/20 dark:bg-white/5 dark:text-white`
    *   **Proposed:** `dark:border-border-primary/20 dark:bg-background-primary/5 dark:text-text-primary`
    *   **Explanation:** Replace `white` for border with `border-primary`, `white/5` for background with `background-primary/5`, and `white` for text with `text-primary`.

### `frontend/src/components/catalyst-ui/textarea.tsx`

**Lines with hardcoded dark mode colors:**
```typescript
L37: 'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
L41: 'bg-transparent dark:bg-white/5',
```

**Proposed Changes:**
*   **Line 37:**
    *   **Current:** `dark:text-white`
    *   **Proposed:** `dark:text-text-primary`
    *   **Explanation:** Replace `white` with `text-primary` for the main text color.

*   **Line 41:**
    *   **Current:** `dark:bg-white/5`
    *   **Proposed:** `dark:bg-background-primary/5`
    *   **Explanation:** Replace `white/5` with `background-primary/5` for the background.
