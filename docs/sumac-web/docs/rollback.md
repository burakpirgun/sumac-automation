# Domain cutover and rollback

The authoritative provider is Squarespace. Keep existing nameservers. Public DNS evidence is in dns-before.json; it is not a complete zone export. Before cutover obtain the complete DNS record inventory from Squarespace, including non-public/subdomain records and verification records.

Do not modify DNS until the Sumac deployment is READY, anonymous access and noindex are verified, and its exact Vercel DNS requirements have been retrieved. Preserve all unrelated records. Change only the web-serving apex and www records needed for this domain, plus any exact ownership challenge.

If HTTPS or page verification fails after propagation, restore the prior four apex A records and www CNAME from the inventory: apex 198.49.23.144, 198.49.23.145, 198.185.159.144, 198.185.159.145; www ext-sq.squarespace.com. Retain original TTLs (observed 14400). Preserve Squarespace site and subscription; no cancellation or deletion is authorized here.

Confirm DNS propagation, TLS certificate, anonymous public response, noindex headers/meta, and expected content on tasteofturkiye.org and www. Vercel project binding alone is not DNS propagation. Designs are reviewed by the owner only on the real domain.
