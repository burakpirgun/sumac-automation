# Sumac hosted deployment handoff

## Objective
Deploy this existing Trigger.dev project to Production and verify both exported tasks with actual completed hosted runs. Do not move on to website work until verified.

Project reference: `proj_vjirfqjbxrwdblvnjyjm` (sumac-automation).

## Steps
1. Run `npm ci` and `npm run check`.
2. Use securely configured Trigger.dev CLI authentication. If unavailable, report the exact login action needed; never request secret values in chat or commit credentials.
3. Run `npm run trigger:deploy`. If the environment supports Docker and native upload fails, the official `--depot-build` path can be tested.
4. Verify Production registration, then run `sumac-health-check` and `sumac-claude-access-check` with `{}` payloads in Production. Record deployment version, run IDs, completed status, and nonsecret outputs in progress.md.
5. The Anthropic key is already configured in Trigger.dev Development and Production as `ANTHROPIC_API_KEY`. Never reveal or log its value.

## Existing evidence
Both tasks passed in Development. Hosted deployment remains unverified. The previous Codex environment failed artifact uploads with S3 HTTP 411 despite explicit Content-Length and small signed requests. Its mandatory proxy also prevented Depot direct TCP builder connectivity. See upload-blocker.md and upload-research.md. These are environment observations, not proof this new environment will fail.

## Authorization and limits
The owner authorizes deployment and test runs without repeated confirmation. Account creation, spending/subscription changes, profile/security/ownership changes, destructive actions, major DNS changes, and enabling website indexing remain owner-controlled. Do not alter existing website projects or repositories. This repository contains background-task connection tests, not a continuous autonomous development agent. Do not claim overnight autonomous work until an actual hosted workflow is implemented and verified.
