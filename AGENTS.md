# Sumac standing instructions

Owner rule recorded 2026-10-07: everything must be done in the cloud.

- Perform development, builds, tests, browser verification, automation, content/asset processing, storage and deployment on hosted cloud services only.
- Do not use the owner's computer, desktop background jobs, local filesystem/workspaces, local shell execution, local containers, local cron, or local model runners as execution resources.
- Use hosted connectors and cloud APIs to inspect and change repository files. Durable task boards, checkpoints, progress and results belong in cloud repositories/services, not local-only files.
- Workers and scheduled tasks must follow this rule. If a required cloud capability is unavailable, record the blocker and report it; do not silently fall back to local execution.
- All pictures and public/editorial content, including UI labels, translations, alt text and metadata, belong in Sanity. Code contains structure, styling, behavior, schemas and queries only; no bundled pictures, static editorial catalogs or public content fallbacks.
- Preserve existing authorization boundaries: older websites/source datasets stay read-only, indexing remains disabled, credentials never appear in code/logs/chat, and generated overnight results require review before integration.
