# Nos Ilha — building with this design system

Nos Ilha is a cultural-heritage archive for Brava Island, Cape Verde. The visual
language is **coastal and restrained**: deep ocean blues, volcanic neutrals, one
warm accent. Content is often sparse — a site may have no photograph, no rating,
no date — so **designed empty states are a first-class case, not an afterthought.**

## Wrapping and setup

Wrap every design in `DsPreviewProvider`. It ships in the bundle and supplies the
`QueryClientProvider` and `ToastProvider` that several components read from
context. Without it `BookmarkButton`, `DirectoryCard` and `ListViewCard` throw
"No QueryClient set" and render nothing.

```jsx
const { DsPreviewProvider, PageHeader, Card, AnimatedButton } = window.NosIlha;

<DsPreviewProvider>
  <div className="bg-canvas min-h-screen p-8">
    <PageHeader title="Heritage sites" subtitle="Nossa Senhora do Monte" showAccentBar />
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Card title="Igreja de São João Baptista">
        <p className="text-muted text-sm">Nova Sintra · 1856</p>
        <AnimatedButton variant="primary" size="sm" className="mt-4">View site</AnimatedButton>
      </Card>
    </div>
  </div>
</DsPreviewProvider>
```

`AnimatedButton` — not Catalyst's `Button` — is the primary action of this app.

Dark mode is a `.dark` class on an ancestor; it re-points ~30 semantic tokens.
Use the semantic families below rather than raw palette steps and dark mode works
for free.

## The styling idiom

Tailwind utility classes, from a project preset. Use these families — they are the
design language:

| Family | Real class names |
|---|---|
| Brand color | `ocean-blue`, `ocean-blue-light`, `ocean-blue-deep`, `valley-green`, `bougainvillea-pink`, `sobrado-ochre`, `sunny-yellow` — mostly as `bg-` / `text-` / `border-`, plus `ring-` and `shadow-` on some (see the closed-set note) |
| Neutrals | `mist-50/100/200`, `basalt-500/600/800/900`, `volcanic-gray`, `volcanic-gray-dark` |
| Surfaces | `bg-canvas`, `bg-surface`, `bg-surface-alt`, `bg-background`, `bg-background-secondary`, `bg-background-tertiary`, `bg-card`, `bg-muted`, `bg-brand` |
| Text | `text-body`, `text-muted`, `text-muted-foreground`, `text-foreground`, `text-brand`, `text-primary`, `text-card-foreground` |
| Borders | `border-hairline`, `border-edge`, `border-surface`, `border-surface-alt`, `border-brand`, `border-primary` |
| Status | `text-status-error`, `text-status-success`, `text-status-warning` (also `bg-` / `border-`) |
| Radius | `rounded-badge`, `rounded-button`, `rounded-card`, `rounded-container` (+ `rounded-t-container`, `rounded-t-button`, `rounded-tl-button`, `rounded-b-button`) |
| Shadow | `shadow-subtle`, `shadow-medium`, `shadow-elevated`, `shadow-floating`, `shadow-lift` |
| Type | `font-sans` (Outfit — UI), `font-serif` (Fraunces — display/editorial), `font-mono` |
| Motion | `ease-calm`, `animate-fade-in`, `animate-slide-up`, `animate-pulse-subtle`, `animate-glow`, `animate-fog-flow` |
| Composites | `glass-panel` (translucent blurred panel), `focus-ring` (brand focus treatment) |

Prefer the named radius and shadow scales over `rounded-lg` / `shadow-md`; prefer
`ease-calm` over the default easing. Both carry the brand's character.

`border-subtle` and `border-strong` are **CSS variables only** — there is no
utility class of that name. Use `border-hairline` / `border-edge`.

### The stylesheet is a closed set — this is the biggest gotcha

This CSS was compiled from the classes the app actually uses, so it is **not a
full Tailwind build**. Common utilities (`grid`, `gap-4`, `p-8`, `min-h-screen`,
`sm:grid-cols-2`, `md:grid-cols-3`, `hover:*`, `group-hover:*`) are present, but
an unused combination simply does not exist — `text-ocean-blue-deep`,
`border-ocean-blue-light`, `text-mist-50` and `dark:bg-card` all resolve to
nothing today, even though the neighbouring combinations work.

A class that isn't in the stylesheet fails **silently** — no error, just an
unstyled element. When reaching past the families in the table above, check the
name against `styles.css` first, or stay on a token you can see there. Dark mode
comes from the `.dark` ancestor re-pointing semantic tokens, not from `dark:`
variants.

## Where the truth lives

- `_ds/<folder>/styles.css` and its imports — the full compiled vocabulary and
  every token value. Read it before inventing a class name.
- `components/<group>/<Name>/<Name>.d.ts` — the real props contract.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage notes.
- `guidelines/` — the brand system pack, design system doc, and palette brief.

Component groups: `directory` (site cards, filters), `gallery` (photo/video
grids, timeline), `map` (location cards, controls), `catalyst-ui` (Catalyst
primitives), `general` (everything else).
