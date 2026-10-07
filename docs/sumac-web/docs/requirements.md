# Sumac validation requirements

Validate on tasteofturkiye.org before bulk migration or new content. Public access without login; indexing stays disabled through HTML robots meta and X-Robots-Tag headers. Crawlers may fetch pages to observe noindex.

- Preserve the POC's shallow header, existing hero, Find your taste, Explore Türkiye, and Know what goes in.
- Three section views share card styling and fit the available screen; no clipped information. Accommodate zoom and accessibility where scrolling is necessary.
- Horizontal wheel scrolling applies only to section pages; home retains vertical scrolling. Touch swipe, drag, arrow controls, keyboard navigation, and visible focus work.
- Recipe-type icons, region icons, and original ingredient categories filter accurately; empty states and counts reflect sample data.
- Full image treatment works on desktop, tablet, and phones. Sanity image crop/hotspot and responsive transformations govern editorial images in the completed build.
- Sanity owns editorial content, translations, categories, and images; reusable validated templates support adding items without changing code.
- Published plus active items are visible. Draft/inactive content stays out of public queries; noindex is independent of content activity.
- Cooking mode must use verified recipe instructions, show steps and ingredients clearly, support useful timers and screen wake lock where available, and remain usable without an account. Do not fabricate instructions from card descriptions.
- Reader accounts are optional if introduced; never gate recipes.
- English/Turkish language selection, search, accessible dialogs and navigation, and all detail links work.
- Bulk migration and adding content wait until validation failures are resolved. The existing POC snapshot may be used for validation.

Initial gaps: static snapshots, external detail links, no cooking mode, no live Sanity connection. These are not represented as completed requirements.

- All displayed editorial content—including navigation labels, headings, quotes, descriptions, captions, translations, and alt text—must be stored in Sanity. Image originals must be Sanity assets with crop/hotspot metadata. No headings, city names, quotes, captions, promotional text, or watermarks may be baked into editorial pictures. Templates render editable text separately over or beside clean images. Audit images before publication; do not treat OCR alone as proof.
