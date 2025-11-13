<!-- Layout: Listing Details Page -->

Design a web analytics page for Etsy sellers showcasing listing performance with screenshot-optimized layout for social media sharing.

- Desktop displays 50/50 split: listing product image (left half) alongside revenue metrics card (right half), with listing title prominently displayed above and small branding logo in corner
- Mobile displays vertical stack: listing image (full width top), listing title, revenue metrics card (middle), branding logo (bottom)
- Revenue metrics card displays four key numbers in large bold typography with visual indicators: Lifetime Revenue (primary emphasis with trend arrow), Monthly Revenue in Prime (second emphasis), 30-Day Revenue (third emphasis), Monthly Sales Count (supporting metric)
- Each metric row includes emoji or cute icon for visual interest and social appeal (💰, 🔥, 📈)
- Metrics use badge-like containers with subtle shadows, rounded corners, and green highlighting for positive performance
- Listing title intelligently truncates with ellipsis if exceeds available width
- Entire screenshot zone (image, title, metrics, logo) fits in single viewport without scrolling on both desktop and mobile

**Visual Style**
Clean "proof story" aesthetic optimized for influencer sharing with white/light background, Ocean Blue (#005A8D) accents, Valley Green (#3E7D5A) positive highlights, large bold revenue numbers with emojis and visual indicators, Merriweather headings with Lato body text, modern sans-serif numerals.

**Responsive & Layout**
Desktop: 50/50 horizontal split with balanced visual weight between image and metrics. Mobile: full-width stacked vertical flow. All elements sized for visual balance (metrics not tiny compared to image). Screenshot-friendly composition capturing complete "proof story" in one screen.

---

<!-- Component: Listing Details Card -->

Design an information card displaying secondary listing details with price, shop information, listing age, favorites count, and conditional achievement badges.

- Horizontal card layout with three sections: left (price large, listing age, favorites), center (shop name as clickable link, shop sales count, shop reviews count), right (badge display area)
- Price displayed prominently in large typography with currency formatting (e.g., "$24.99")
- Shop name styled as interactive link with blue underline on hover
- Supporting metrics (age, favorites, sales, reviews) in smaller secondary typography
- Conditional badges display when criteria met: "Bella Gold" badge (gold/yellow color scheme with icon + label) for high-profit listings, "Bella Boost" badge (Valley Green color scheme with icon + label) for beginner-friendly opportunities
- Badges use icon + text design with contrasting colors and prominent placement
- Each metric includes hover tooltip explaining its meaning and calculation basis

**Visual Style**
Clean card design with subtle borders or shadows, Ocean Blue (#005A8D) for clickable links, gold/yellow for Bella Gold badge, Valley Green (#3E7D5A) for Bella Boost badge, typography hierarchy with price largest and supporting info smaller, Merriweather headings with Lato body text.

**Responsive & Interactions**
Desktop: horizontal three-section layout. Mobile: stacked vertical sections. Shop name click navigates to shop details. Hover states on all clickable elements with smooth transitions. Tooltips fade in on hover with 200ms delay.

---

<!-- Component: Keyword Bubbles -->

Design an interactive keyword analysis section displaying up to 13 color-coded tag bubbles with click-to-copy functionality and save-to-list capability.

- Horizontal wrapping bubble layout sorted left-to-right by search volume (highest first)
- Each bubble is rounded pill shape containing keyword text and small heart icon on right side
- Color-coded backgrounds indicate adoption rate: green bubbles (Valley Green #3E7D5A) for 7-10 of top 10 listings using keyword, yellow bubbles (Sunny Yellow #F7B801) for 4-6 listings, red bubbles (subtle red) for 1-3 listings
- White text for contrast on all bubble colors
- Click bubble body copies keyword text to clipboard and displays "Copied to clipboard" tooltip with fade animation
- Click heart icon opens small save-to-list popup modal positioned near clicked element
- Save-to-list popup displays scrollable existing lists (if more than 5), "Create New List" button at bottom, list name input field (appears on create), and Cancel/Save buttons

**Visual Style**
Rounded pill-shaped bubbles with color-coded backgrounds (Valley Green, Sunny Yellow, subtle red), white text, small outline heart icon, subtle hover state with slight scale (1.05x) and deeper color saturation, smooth 200-300ms transitions, Lato typography.

**Interactions**
Bubble body click copies text to clipboard with tooltip feedback. Heart icon click opens save popup modal. Hover applies subtle scale animation and pointer cursor. Tooltip fades in/out on copy action. Popup modal includes list management UI with input validation.

---

<!-- Component: Analytics Visualizations -->

Design data visualization components showing historical performance graph and seasonal calendar for listing insights.

- Monthly sales graph displays 12-month line/area chart with smooth interpolation, labeled X-axis (months), dual Y-axis (sales count and revenue), interactive data points, Ocean Blue (#005A8D) primary line color
- Hover data points shows tooltip with month name, sales count, and revenue amount, with highlighted data point (larger circle)
- Seasonal calendar displays month-based grid (12 months) with color-coded cells indicating performance intensity in heatmap style
- "Best Month To List" highlighted with prominent badge or indicator overlay
- "When Product Starts Selling" month marked with visual indicator
- Loading skeleton displays with subtle pulse animation while data fetches

**Visual Style**
Clean modern chart design with subtle light gray grid lines, clear readable labels in Lato typography, Ocean Blue (#005A8D) for primary data visualization, green highlights for positive performance indicators, heatmap uses graduated color scale from light to dark, responsive scaling.

**Responsive & Interactions**
Desktop: graphs display side-by-side or stacked with generous spacing. Mobile: vertical stack with full-width charts. Hover data points reveals tooltip with 200ms fade-in. Click calendar month highlights cell (visual feedback only, no navigation). Smooth animations on all interactions.

---

<!-- Component: Related Listings Grid -->

Design two related content discovery sections: "Top 10 Listings for [Keyword]" horizontal row and "You May Also Want to Sell" grid displaying similar listing opportunities.

- "Top 10 Listings" displays horizontal scrollable row (desktop) or grid (mobile) with 10 listing cards
- "You May Also Want to Sell" displays 4 columns × 3 rows grid (12 listing cards total)
- Each card includes: listing image (16:9 ratio top), title (2-line truncation with ellipsis), price (prominent typography), monthly sales count, monthly revenue estimate, heart icon (top-right corner overlay)
- Card hover triggers smooth image scale animation (1.05x) with slight delay (100ms) and title becomes larger/bolder for enhanced readability
- Heart icon displays as outline (empty) when not saved, filled when saved to any list
- Click card opens listing details in new browser tab
- Click heart icon opens save-to-list popup (consistent with keyword bubbles component)

**Visual Style**
Cards with subtle border or shadow, white background, image fills top portion with object-fit cover, Ocean Blue (#005A8D) for prices and interactive elements, Merriweather for titles with Lato for supporting text, heart icon in Bougainvillea Pink (#D90368) when filled.

**Responsive & Interactions**
Desktop: "Top 10" as horizontal scrollable row, "Related" as 4-column grid. Tablet: 2 columns. Mobile: single column stack. Smooth 200-300ms scale transitions on hover. Click card opens new tab. Click heart opens save popup. All animations use ease-in-out timing.
