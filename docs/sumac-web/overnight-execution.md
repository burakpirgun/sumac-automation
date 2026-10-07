# Hosted Sumac overnight batch

Configured 2026-10-07. Uses existing GitHub Actions schedule minute17 each hour and Trigger.dev production, no local runner or sleeping desktop required. One job per invocation, serial concurrency; next scheduled invocation resumes checkpoints. GitHub scheduling is best effort.

Five bounded CMS/cooking utilities: canonical unrounded linear scaling, absolute timer remaining, resume identity compatibility, exact CMS locale selection without fallback, ordered unique CMS reference keys. Each has fixed acceptance cases, separate source audit, strict TypeScript check and credential/network-free Docker execution. At most three attempts then diagnosis/block, terminal jobs skipped. Existing serving result and intentional retry diagnostic remain unchanged.

Results are stored on sumac/jobs/<id>-<digest> branches and pull requests when repository policy allows. Results never automatically merge or deploy. This is useful prerequisite code generation, NOT a full autonomous frontend editor or completed CMS migration. No images/editorial content is embedded. Source websites/datasets remain untouched; noindex preserved. No new accounts or spending limits.

Operations: inspect Actions Sumac development worker and branch .sumac/results/<id>.json. Passed means fixed cases succeeded, not website integration or editorial correctness. After all five terminal outcomes the worker idles without model calls. To stop the batch, disable the workflow in GitHub Actions; do not requeue rejected diagnostics.
