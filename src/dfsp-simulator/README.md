# DFSP Simulator (#4190)

A lightweight Hapi server that simulates a **Payer DFSP** for the PISP v2.0 (Third Party) API. It lets the PISP side of a flow run end to end without a real DFSP, by accepting the inbound calls a DFSP would receive and acknowledging them.

## What it does

The simulator only hosts a route when the DFSP is the party **receiving** the call. The spec's "Used by:" line names whoever **sends** a call, so if "Used by:" is the PISP or FIDO, the DFSP is on the receiving end and the route is hosted here. If "Used by:" is the DFSP, the DFSP is the sender and there is nothing to host.

The DFSP receives in two cases:
1. A request the PISP or FIDO makes to the DFSP.
2. A PUT callback that answers a request the DFSP previously sent out.

Handlers validate the incoming request against a Joi schema and acknowledge it. They do not yet fire the asynchronous PUT callbacks the DFSP would originate; callback simulation runs through the existing ml-testing-toolkit test cases, and outbound callback firing is a later phase.

Source of truth for direction and payloads is the PISP v2.0 spec doc. The repo `openapi.yaml` is only a sanity check. Where the two disagree, the build follows the spec and the difference is flagged for review (see [Flagged items](#flagged-items)).

## Status code convention

- **202 Accepted** for initiating requests and status queries (POST and GET, and the consent-request PATCH). The DFSP has received the request and will process it asynchronously.
- **200 OK** for callbacks the DFSP receives (PUT `.../{ID}`, PUT `.../{ID}/error`, and PATCH `/tppConsents/{ID}`). These answer something already in flight.

## Endpoints

16 routes, all DFSP-inbound.

| Method | Path | Code | Notes |
|---|---|---|---|
| POST | `/tppAccountsRequest` | 202 | PISP asks the DFSP for the customer's accounts |
| GET | `/tppAccounts/{ID}/{SignedChallenge}` | 202 | PISP retrieves accounts with a signed challenge |
| POST | `/tppConsentRequests` | 202 | PISP starts a consent request |
| GET | `/tppConsentRequests/{ID}` | 202 | PISP queries consent-request status |
| PATCH | `/tppConsentRequests/{ID}` | 202 | PISP sends the authentication token |
| PATCH | `/tppConsents/{ID}` | 200 | PISP notifies the DFSP a credential was registered (see flagged) |
| PUT | `/tppConsents/{ID}` | 200 | PISP returns the signed consent |
| PUT | `/tppConsents/{ID}/error` | 200 | PISP returns a consent error (see flagged) |
| PUT | `/tppConsents` | 200 | Bare callback from diagram step [46] (see flagged) |
| PUT | `/tppAuthorizations/{ID}` | 200 | PISP returns the authorization result |
| PUT | `/tppAuthorizations/{ID}/error` | 200 | PISP returns an authorization error |
| PUT | `/tppVerifications/{ID}` | 200 | FIDO returns the verification result |
| PUT | `/tppVerifications/{ID}/error` | 200 | FIDO returns a verification error |
| POST | `/tppTransactionRequests` | 202 | PISP starts a transaction request |
| GET | `/tppTransactionRequests/{ID}` | 202 | PISP queries transaction-request status |
| POST | `/tppTransfers` | 202 | PISP asks the DFSP to execute the transfer |

There is also a `GET /health` route that returns `200 {"status":"OK"}`. It is an infrastructure endpoint for liveness checks, not one of the spec's TPP endpoints.

Routes that are deliberately **not** hosted (the calls the DFSP sends rather than receives) are omitted by design, following the receive-only rule above.

## Layout

```
src/dfsp-simulator/
  index.ts        registerDfspSimulator(server): registers all routes on a Hapi server
  routes.ts       the 16 route definitions, each wired to a handler and its Joi schemas
  server.js       createDfspSimulatorServer(port): standalone Hapi server (default 5001)
  handlers/       one file per resource; validate and acknowledge
  schemas/        Joi header / param / payload schemas per endpoint
```

## Build and run

The simulator is written in TypeScript and compiled to `dist/` before it runs.

```sh
npm run build:dfsp     # tsc, compiles src/dfsp-simulator -> dist/dfsp-simulator
```

It is started automatically alongside the host service. `src/server.js` `initialize()` calls `createDfspSimulatorServer(5001)` after the main API boots, so:

```sh
npm run build:dfsp
npm run start          # boots the host API and the DFSP simulator on port 5001
```

`server.js` requires the compiled output in `dist/`, so `build:dfsp` has to run first.

## Tests

Unit tests import the routes directly, so no build step is needed to run them.

```sh
npm run test:unit                       # full suite
npx jest test/unit/dfsp-simulator       # simulator only (17 files, 33 tests)
```

Each endpoint has a happy-path test and one validation-failure test.

## Flagged items

Three points carried into PR review.

- **PUT `/tppConsents` (bare, no ID).** Not defined in the spec or the repo `openapi.yaml`; both stop at the `/{ID}` forms plus `POST /tppConsents`. It appears only at diagram step [46]. Built on request, reusing the `PUT /tppConsents/{ID}` payload as the closest defined shape and returning 200. This is the only endpoint whose payload is an assumption rather than a spec fact.
- **PATCH `/tppConsents/{ID}`** and **PUT `/tppConsents/{ID}/error`.** The repo `openapi.yaml` points these the opposite way (DFSP sending to the PISP) with different payloads. Both are built per the spec ("Used by: PISP", DFSP receives). If the repo direction is the intended one, these change.
