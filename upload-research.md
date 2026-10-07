# S3 upload investigation: research findings

Research date: October 6, 2026 (America/Chicago).

Exa searches: six queries, five requested results each, across Trigger.dev implementation, S3/proxy failure reports, and Envoy framing behavior. Primary sources were fetched separately. Similarity results were checked for relevance; AWS checksum/ACL and true multipart-upload API failures were excluded as fixes for our presigned HTML-form POST.

## Strongest matching mechanism

Envoy's external-processing maintainers document removal of Content-Length in STREAMED and BUFFERED_PARTIAL modes, including reports where no body mutation occurs. Re-adding the client header is insufficient if a later filter removes it. This matches our symptoms, but we have not verified the managed proxy's filter configuration.

- https://github.com/envoyproxy/envoy/issues/38291
- https://github.com/envoyproxy/envoy/issues/28515
- https://github.com/envoyproxy/envoy/issues/39035

## Documented infrastructure remedies

Envoy's buffer filter waits for a complete body and populates Content-Length if absent. Filter order matters: a later streaming external processor may remove it again. The managed proxy operator must inspect the chain, ensure buffered processing with appropriate header handling for this route, and verify final upstream length and payload consistency. We cannot apply those changes through the supported environment settings available here.

- https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/buffer_filter
- https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_proc_filter

There is a proposed retain_content_length_header change, but a proposed PR is not evidence it is shipped in this environment; do not assume availability.

- https://github.com/envoyproxy/envoy/pull/39067

## Trigger.dev implementation checked

The deployment implementation creates a presigned POST artifact and uploads FormData directly to S3. It initializes deployment only after upload succeeds. The inspected implementation does not provide evidence of a general client-side proxy fix or an alternate inline archive API.

- https://github.com/triggerdotdev/trigger.dev/blob/e64b1011/packages/cli-v3/src/commands/deploy.ts
- https://github.com/triggerdotdev/trigger.dev/blob/e64b1011/apps/webapp/app/routes/api.v1.artifacts.ts

## Our verified evidence

- Login, local build, development task dispatch, and Claude API calls work.
- Signed one-byte artifact with all supplied fields: 4,395-byte multipart body, explicit length, HTTP411 MissingContentLength.
- Unsigned tiny probes and multiple official S3 endpoints also return411.
- Serialized Uint8Array, curl HTTP1.1, Python urllib, Expect100, file-part length, source reduction, and stronger compression did not fix it.
- Echo-server headers vary with body size but do not prove what S3 receives. Our previous archive-size inference was insufficient.

## Resolution boundary

No verified client-side solution was found in this research. The next decisive check is the proxy's actual upstream request framing, or the same presigned form tested from a supported independent execution environment. Root cause remains a strong infrastructure hypothesis until verified. A successful hosted deployment and Production run remain required before claiming unattended operation.

No proxy bypass, TLS weakening, support message, or new service setup was performed.
