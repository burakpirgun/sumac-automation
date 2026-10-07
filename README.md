# Sumac automation

Background tasks and a bounded development worker for the Sumac project.

The worker picks up trusted jobs from `.sumac/jobs/`, requests a TypeScript utility and source audit from Claude, executes fixed acceptance cases in an isolated container, and saves verified code and a report on a separate branch. It checks for work hourly and after queue changes or successful deployments. Generated results are not automatically merged.

- [Development worker and limits](DEVELOPMENT.md)
- [Progress and verified runs](progress.md)
- [Trigger.dev deployment setup](DEPLOYMENT.md)

The initial serving-scale job passed 12 acceptance cases. This repository does not modify existing websites. Credentials belong in service/repository secrets, never source files.
