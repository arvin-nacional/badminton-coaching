# Administrator setup

Public email/Google signup always creates students. Account order and missing roles
do not grant staff permissions. `/api/users/first-register` is disabled, and login
never promotes a user. Only administrators can assign roles or edit other users'
accounts; coaches can still invite students and manage coaching records.

## Create the first administrator

Run `pnpm bootstrap:admin` from a trusted terminal in the project directory, with
`DATABASE_URL` and `PAYLOAD_SECRET` configured for the intended database. Supply
these variables through your terminal environment or your deployment's secret manager:

- `BOOTSTRAP_ADMIN_EMAIL`: a separate email address that has never signed up.
- `BOOTSTRAP_ADMIN_NAME`: the administrator's name (1–120 characters).
- `BOOTSTRAP_ADMIN_PASSWORD`: a unique password of 16–128 characters.

The command validates inputs before connecting, skips application startup
migrations/content synchronization, and creates one active account with the
explicit `admin` role. It does not send email or print credentials. It refuses to
run if an administrator already exists or the supplied email belongs to any
existing account. Run it once, then remove the three variables from the process
environment/secret manager. Do not commit credentials or pass passwords as command
arguments. Coordinate setup through a single operator; this is an operator command,
not an automatically run startup task.

Sign in at `/admin` afterward. Use that administrator to manage staff accounts.

## Existing installations

Explicit `admin` and `coach` roles continue working. Legacy users without roles no
longer receive staff privileges. An existing administrator must assign their roles
after reviewing their identities. If there is no explicit administrator, use the
setup command with a new, separate email, then review legacy accounts in `/admin`.
The command never promotes or overwrites an existing student account.

This code change does not revoke roles previously assigned by the old bootstrap
logic. Review existing administrators before deployment and remove any unintended
grants using a trusted administrator account. No automatic database migration is
performed by this change.

If setup fails, check that all inputs are present and valid, that database
configuration is correct, that no administrator already exists, and that the email
is unused. The command intentionally omits raw database errors because they can
contain submitted credentials.
