# Sumac website progress

## Verified 2026-10-07
- Standing owner authorization recorded in docs/authorization.md; requirements and rollback plan recorded.
- Existing source websites, repositories, and Sanity datasets remain untouched.
- Sanity project sumac: dtpobp2h, production dataset public; no content migrated and no Studio deployed yet.
- Vercel project sumac-web: prj_XXjgGSF6TNhja81pbgWm4XZktDK5, existing team team_jYzozCloAqmxCi4rNcPGonJ5. Connector cannot create/read new project but configured runtime credential successfully used supported Vercel API.
- POC snapshot deployment dpl_GdP3mzjMCLiGoALNazpwF5PE2WLi READY, HTTP 200, anonymous, HTML noindex and X-Robots-Tag noindex/nofollow/noarchive verified.
- Local Chromium baseline: widths 320/390/768/1440, home plus three sections. No JS errors, broken loaded images, horizontal page overflow; sections have no vertical page overflow at height 900. Does not establish full accessibility/filtering/wheel/cooking validation or short-screen behavior.
- POC data: 115 recipes, 23 ingredients, 81 province cards. Cooking mode missing; detail links currently open original site; content/images static. These are validation failures to resolve before bulk migration.

## Blockers / next
- Connected GitHub tools lack repository creation; owner asked to initialize private burakpirgun/sumac-web and enable connector access.
- Authoritative DNS is Squarespace; no Squarespace DNS connection available. Full DNS inventory required before applying exact prepared records; public evidence saved in docs/dns-before.json is incomplete.
- Domain DNS has not been changed; real-domain design review and validation remain pending.
- Sanity schema/Studio, responsive editorial image pipeline, cooking mode, complete real-domain validation and bulk migration have not been completed.
