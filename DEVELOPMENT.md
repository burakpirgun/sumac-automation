# Sumac development worker

The worker handles one trusted queued job per invocation. Jobs are committed JSON files in `.sumac/jobs/`; they define one pure exported TypeScript function and fixed acceptance cases. The initial scope is self-contained utilities, not arbitrary repository changes or website publication.

## Flow
A successful main Production deployment, a committed queue change, manual dispatch, or an hourly GitHub schedule starts the worker. It creates a stable result branch based on the job contents, checkpoints state there, requests a source proposal and separate source audit from the hosted `sumac-development-job`, type-checks the source, and executes fixed acceptance cases in Docker. Generated code receives no credentials, network, writable repository, or Docker socket. Container limits: 256 MB, one CPU, 64 processes, 30 seconds. It saves a verified source file and report on its branch and tries to open a pull request. If repository policy prevents Actions-created PRs, the branch/report remain available. Results are never automatically merged.

## Durable recovery and limits
Concurrency is one. Trigger calls have stable seven-day idempotency keys. Checkpoints preserve task run IDs, so interruption resumes the same attempt. A failed proposal/test receives diagnostic feedback and one repair attempt; exhausted jobs become blocked instead of looping. At most two generation attempts (four model calls) occur per job. Passed/blocked jobs are skipped without Claude calls. Changed job contents create a distinct job revision and branch. GitHub schedule delivery is best effort, not a guaranteed deadline.

A cancelled run resumes on the next invocation. After correcting an exhausted job, commit a revised manifest to create a new revision. For infrastructure problems, inspect the checkpoint and run logs before retrying; never claim success based only on model review. Job reports distinguish actual fixed tests from source auditing. Existing websites are not modified.

## Results
Check the Sumac development worker Actions run, its result artifact, and `sumac/jobs/<id>-<digest>` branch. `.sumac/results/<id>.json` records status, attempts, model run ID, source audit, test count, workflow URL, and optional PR URL. A passed result means the fixed cases succeeded, not that all possible inputs are correct. Model source review uses separate calls to the same provider, not an independent human audit.

## Owner controls
Standing authorization covers this worker and routine implementation/deployment/testing. Purchases, credit top-ups, subscriptions, increased spending limits, new accounts, profile/security/ownership changes, destructive actions, major DNS changes, and enabling indexing remain owner-controlled. No extra messaging integrations have been connected. Status is saved in GitHub; external notifications require a designated channel.
