# Public signup and booking protection

Guest assessment bookings require a six-digit code sent to the submitted email
before a time is reserved. Codes expire after 10 minutes, permit five attempts,
and can confirm only one time slot. Retrying that same booking returns the
existing booking without repeating notification emails or reminders. Selecting
another time after using a code requires a new code. Verified, active student
accounts can book using their profile email. Changing an account email currently
requires an administrator because no self-service email-change verification flow
exists.

Signup, guest-code emails, and public password resets share a per-email limit of
five requests per 24-hour window and a 60-second resend cooldown. Failed attempts
consume allowance too. Signup and guest-code requests share a limit of ten requests
per IP per hour; public password resets also use that bucket. Google authentication
allows 20 attempts per IP per hour. Booking allows 20 requests per IP and ten per
email per hour, with two new reservation attempts per verified email per day.
Time windows begin with the first request. Rejected requests do not extend a
window. Limits return HTTP 429; custom signup/booking routes include Retry-After.

The forms include a hidden spam trap and reject cross-origin browser submissions.
These are basic bot defenses, not a CAPTCHA or a DDoS shield. For high-volume
distributed attacks, add rate controls or managed challenges at the hosting edge.

## Deployment configuration

Use the existing MongoDB connection and a strong `PAYLOAD_SECRET`. Set
`PUBLIC_REQUEST_IP_HEADER` to a header that your **trusted reverse proxy overwrites**
with a single validated client IP. Strip inbound copies at the proxy, and prevent
clients from reaching the origin directly. Do not blindly use a client-controlled
X-Forwarded-For value or an unvalidated forwarding chain. If no trusted single IP
is available, requests share an `unidentified-client` bucket. This fails safely but
can throttle unrelated visitors together, so configure the proxy before launch.

The app uses atomic MongoDB aggregation updates (MongoDB 4.2+) in the private
`public-request-guards` collection, outside Payload REST/GraphQL. The database user
needs collection read/write and createIndex permissions. A TTL index removes
expired counters and code claims; expiry is also checked during requests, so
correctness does not depend on immediate TTL cleanup. The first protected request
creates that index. Requests fail with HTTP 503 if the limiter cannot use storage;
there is no in-memory fallback that would reset limits between server instances.

Stored identities are keyed HMAC hashes; raw IPs, emails, and confirmation codes
are not stored in these guard records. Tokens contain signed hashes of the email
and code and are returned with Cache-Control: no-store. Keep them out of logs.
Rotating PAYLOAD_SECRET invalidates outstanding codes and starts new limit keys.

This change does not execute a migration, send test emails, or create bookings on
deployment. Validate the guest-code flow against a staging email inbox and database
before production use. Public account bootstrap must already be disabled; otherwise
registration outside the protected signup route could bypass its request limits.
