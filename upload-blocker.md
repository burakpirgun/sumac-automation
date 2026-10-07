# Trigger.dev artifact upload blocker

## Reproduction

Trigger.dev CLI 4.7.3, Node24.19, managed cloud environment, mandatory inherited HTTPS proxy and TLS CA trust. Login and development tasks work. Native or standard deploy builds succeed; S3 artifact multipart POST returns HTTP411, XML MissingContentLength.

Even a fresh presigned diagnostic artifact with a one-byte payload, all Trigger.dev-supplied signed fields, a 4,395-byte serialized multipart body, and explicit Content-Length fails. Deployment initialization was intentionally not called in this diagnostic.

## Checked

- Native fetch FormData and explicitly serialized Uint8Array.
- curl HTTP1.1 with exact length, with and without Expect100.
- Python urllib with exact length for harmless unsigned probes.
- File-part length header, official S3 endpoint variants, smaller source archive, gzip level9.
- Echo probes retain length for some small requests and show chunked framing for larger requests; these do not prove S3 upstream headers.
- Development worker successfully calls Anthropic. Three Claude consultations yielded hypotheses, not a verified fix.

## Needed to resolve

Inspect the mandatory proxy's upstream S3 request headers and framing, or run the same minimal presigned diagnostic from a supported independent environment as a controlled comparison. A proxy-side correction may be necessary, but exact responsibility remains unproven without that comparison or upstream capture. No proxy bypass or TLS weakening has been attempted.

## Safety

No credentials or signed form fields are recorded here. No hosted worker has been deployed successfully. No schedules enabled. Website untouched.
