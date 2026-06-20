# PISP Simulator (#4191)

A lightweight Hapi server that simulates a **PISP** for the PISP v2.0 (Third Party) API. It is the mirror of the DFSP simulator (#4190): there the simulator is the DFSP, here it is the PISP. It lets the DFSP side of a flow run end to end without a real PISP, by accepting the inbound calls a PISP would receive and acknowledging them.

## What it does

The simulator only hosts a route when the PISP is the party **receiving** the call. The spec's "Used by:" line names whoever **sends** a call, so if "Used by:" is the DFSP or the Switch, the PISP is on the receiving end and the route is hosted here. If "Used by:" is the PISP, the PISP is the sender and there is nothing to host.

The PISP receives in two cases:
1. A request the DFSP (or Switch) makes to the PISP.
2. A PUT callback that answers a request the PISP previously sent out.

Handlers validate the incoming request against a Joi schema and acknowledge it. They do not yet fire the asynchronous PUT callbacks the PISP would originate; callback simulation runs through the existing ml-testing-toolkit test cases, and outbound callback firing is a later phase.

Source of truth for direction and payloads is the PISP v2.0 spec doc. The repo `openapi.yaml` is only a sanity check. Where the two disagree, the build follows the spec and the difference is flagged for review (see [Flagged items](#flagged-items)).

## Status code convention

- **202 Accepted** for requests and status queries the PISP receives (POST, GET, and the consent-request PATCH). The PISP has received the request and will process it asynchronously.
- **200 OK** for callbacks the PISP receives (PUT `.../{ID}`, PUT `.../{ID}/error`, and the services and parties PUTs). These answer something already in flight.

## Endpoints

22 routes, all PISP-inbound.

| Method | Path | Code | Notes |
|---|---|---|---|
| PUT | `/services/{ServiceType}` | 200 | Switch returns the service-discovery result |
| PUT | `/services/{ServiceType}/error` | 200 | Switch returns a service-discovery error |
| PUT | `/tppAccountsRequest/{ID}` | 200 | DFSP returns the account-request result |
| PUT | `/tppAccountsRequest/{ID}/error` | 200 | DFSP returns an account-request error |
| PUT | `/tppAccounts/{ID}` | 200 | DFSP returns the account list |
| PUT | `/tppAccounts/{ID}/error` | 200 | DFSP returns an accounts error |
| PUT | `/tppConsentRequests/{ID}` | 200 | DFSP returns the consent-request result |
| PATCH | `/tppConsentRequests/{ID}` | 202 | DFSP patches the consent request on the PISP |
| PUT | `/tppConsentRequests/{ID}/error` | 200 | DFSP returns a consent-request error |
| POST | `/tppConsents` | 202 | DFSP creates the consent on the PISP |
| GET | `/tppConsents/{ID}` | 202 | DFSP queries consent status on the PISP |
| POST | `/tppAuthorizations` | 202 | DFSP asks the PISP to authorize a transfer |
| GET | `/tppAuthorizations/{ID}` | 202 | DFSP queries authorization status on the PISP |
| PUT | `/tppAuthorizations/{ID}/error` | 200 | DFSP tells the PISP the signed challenge was invalid |
| GET | `/parties/{Type}/{ID}/{SubId?}` | 202 | DFSP looks up a customer the PISP acts for |
| PUT | `/parties/{Type}/{ID}/{SubId?}` | 200 | party-lookup result returned to the PISP |
| GET | `/tppTransfers/{ID}` | 202 | transfer status query |
| POST | `/tppTransfers` | 202 | the PISP's own trigger to start a transfer |
| PUT | `/tppTransfers/{ID}` | 200 | DFSP returns the transfer completion |
| PUT | `/tppTransfers/{ID}/error` | 200 | DFSP returns a transfer error |
| PUT | `/tppTransactionRequests/{ID}` | 200 | DFSP returns the transaction-request challenge |
| PUT | `/tppTransactionRequests/{ID}/error` | 200 | DFSP returns a transaction-request error |

There is also a `GET /health` route that returns `200 {"status":"OK"}`. It is an infrastructure endpoint for liveness checks, not one of the spec's TPP endpoints.

Routes that are deliberately **not** hosted (the calls the PISP sends rather than receives) are omitted by design, following the receive-only rule above.

## Layout

```
src/pisp-simulator/
  index.ts        registerPispSimulator(server): registers all routes on a Hapi server
  routes.ts       the route definitions, each wired to a handler and its Joi schemas
  server.js       createPispSimulatorServer(port): standalone Hapi server (default 5002)
  handlers/       one file per resource; validate and acknowledge
  schemas/        Joi header / param / payload schemas per endpoint
```

## Build and run

The simulator is written in TypeScript and compiled to `dist/` before it runs.

```sh
npm run build:pisp     # tsc, compiles src/pisp-simulator -> dist/pisp-simulator
```

It is started automatically alongside the host service. `src/server.js` `initialize()` calls `createPispSimulatorServer(5002)` after the main API boots, so:

```sh
npm run build:pisp
npm run start          # boots the host API and the PISP simulator on port 5002
```

`server.js` requires the compiled output in `dist/`, so `build:pisp` has to run first.

## Tests

Unit tests import the routes directly, so no build step is needed to run them.

```sh
npm run test:unit                       # full suite
npx jest test/unit/pisp-simulator       # simulator only (10 files, 45 tests)
```

Each endpoint has a happy-path test and one validation-failure test.

## Flagged items

Points carried into PR review.

- **PATCH `/tppConsents/{ID}`** and **PUT `/tppConsents/{ID}/error`.** The spec labels these "Used by: PISP" (the PISP sends them, so they are not hosted here). The repo `openapi.yaml` points them the opposite way (DFSP sending to the PISP) with different payloads. They are classified per the spec and left unhosted. If the repo direction is the intended one, both flip to PISP-inbound and the count becomes 24.
- **`/parties` (GET and PUT).** Standard FSPIOP rather than a TPP resource, hosted here because by direction both are PISP-inbound when the PISP did the lookup. Worth confirming with the team whether payee discovery is in scope for #4191, since the DFSP-simulator side (#4190) left `/parties` out entirely.
- **tppTransfers direction.** §3.8 contradicts itself in the spec (the intro reads PISP-initiated, the per-endpoint labels read DFSP-initiated). Resolved as PISP-initiated: POST `/tppTransfers` runs PISP -> Switch -> DFSP, and the PUT callback runs DFSP -> Switch -> PISP. All four tppTransfers routes are hosted on that basis.
