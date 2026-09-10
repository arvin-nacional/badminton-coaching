# Isolated tests

`pnpm test` (or `pnpm test:int`) runs only Node-based unit, mocked route, and
server-rendering tests. It does not load `.env`, needs no database, clears known
integration credentials, and rejects Payload database connections. Browser DOM
tests can opt into their own environment when added; the default does not need jsdom.

## Database and browser tests

Prerequisites: a running local Docker engine with Linux containers, the
`mongo:8.0` image (`docker pull mongo:8.0`), and Node 22.12+ to satisfy the installed
Vite toolchain as well as Next.js. E2E also needs Chromium
installed using `pnpm exec playwright install chromium`.

```sh
pnpm test:db
pnpm test:e2e
pnpm test:all
```

The runner generates `TEST_DATABASE_URL` for you. Do not set it to an existing
database or add it to Vercel. Direct database-Vitest/Playwright invocation without
the disposable environment aborts; there is no fallback to `DATABASE_URL`.

Each command creates its own loopback-only Mongo container with in-memory data
mounts, a random run ID, a unique database, and a random password. The application
receives a database-scoped read/write user, never the container root account.
The runner writes a marker containing that run's ID and token. Before Payload
opens its model connection, a read-only probe verifies the marker and database
name. A name containing “test” is not sufficient. Remote/SRV URIs, normal Mongo
port 27017, alternate authentication databases, and additional URI options are
rejected. Cleanup removes only the exact container with the matching run label;
it never drops a database on an existing server.

The Docker endpoint is pinned to the local engine, ignoring remote Docker contexts
and DOCKER_HOST. On Windows use Docker Desktop's local engine; on Linux/macOS the
runner uses `/var/run/docker.sock`. Nonstandard local socket setups need an
explicit, reviewed runner change.

Tests use a no-delivery email adapter. S3 is not enabled, Media already disables
local file storage, automatic jobs do not run, and production startup content-sync
and index-removal routines are skipped. No production content is imported.
This is environment isolation, not a network sandbox for arbitrary new test code.

E2E starts its own server at `http://127.0.0.1:3107`, never reuses a running server,
and keeps compiled output in `.next-test`. If that port is occupied, the run fails.
Fixture users have a run-specific `example.invalid` email; setup never deletes an
existing user. Cleanup revalidates the database and deletes only the ID it created.
The public smoke test uses the sign-in page instead of depending on production
homepage content.

Playwright uses its own TypeScript loader. Payload fixture setup and cleanup run
in separate `tsx` processes to avoid chained-loader and Next.js import-resolution
errors on Windows. Admin setup allows two minutes for fixture startup and the
first development compilation; individual browser checks keep their normal timeout.
Fixture startup statically imports Payload and its configuration after a
test-environment guard dependency. The database suite exercises three fresh-process seed/cleanup cycles
to check for intermittent loader failures. Failed subprocesses report their exit
code; after configuration loads, failures also report the last fixture operation.

The disposable Mongo is standalone, so transaction behavior is not covered by
this suite. Add a separately isolated replica-set suite before testing transaction
semantics. Hard termination/power loss may leave the disposable container running;
the printed `badminton-tests-<runID>` name identifies it for manual review/removal.
Never use a broad Docker prune command as test cleanup.
