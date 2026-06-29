# Development Guide

> <sub>_AI disclosure: this document was drafted with assistance from Claude._</sub>

Day-to-day engineering workflow for contributing to PISP v2.0: creating a
working branch, updating dependencies before you start, running integration
tests, and opening a pull request.

## 1. Creating a Working Branch

Read the Mojaloop guide on how to create and name a working branch.

- [Creating a Branch](https://docs.mojaloop.io/community/standards/creating-new-features.html#creating-a-branch)

## 2. Before Working on a Feature

Update dependencies before starting work.

1. Check for available dependency updates:

   ```
   npm run dep:check
   ```

   **Important:** Note any dependency with a **major** version upgrade — it may
   introduce a breaking change requiring code refactoring. See
   [Rejecting an Upgrade](#rejecting-an-upgrade) to skip an upgrade when needed.

2. Update and install dependencies:

   ```
   npm run dep:update && npm i
   ```

### Rejecting an Upgrade

If a dependency cannot be upgraded for a valid reason, add a `.ncurc.yaml` file
to the project root and list the dependency in the reject list with an
explanatory comment:

```yaml
## Add a TODO comment indicating the reason for each rejected dependency upgrade added to this list, and what should be done to resolve it (i.e. handle it through a story, etc).
reject: [
   # TODO: <package name> - <Insert detailed information as to why this dependency should be ignored.>
  "<DEPENDENCY_TO_IGNORE>",
]
```

See the Mojaloop references below for the feature-development and
dependency-management standards.

## 3. Running Integration Tests

Unit tests run with `npm run local:ttk`. To run integration tests against the
endpoints, use `ml-testing-toolkit` (TTK) to mock third-party and DFSP requests:

1. For each endpoint, uncomment this line in `src/domain/<endPointName>.js`:

   ```javascript
   endpoint = 'http://mojaloop-testing-toolkit:4040/tpp' // FOR TESTING PURPOSES WITH TTK
   ```

2. Launch TTK and `tpp-api-svc`:

   ```
   docker compose up --build
   ```

3. Open <http://localhost:9660> in your browser.
4. In the right-hand navigation, select the **Test Runner** tab.
5. In Test Runner, click **Collections Manager**, then **Import Folder**.
6. Navigate to `tpp-api-svc/docker/ml-testing-toolkit/testcases/collections/tpp-api-svc`.
7. You will see all available test endpoints; from there you can send a mock
   request to `tpp-api-svc`.

## 4. Opening a Pull Request

Read the Mojaloop PR guidance before opening a pull request. It covers writing a
good PR description, disclosing AI usage, and more.

- [Mojaloop PR Guidance](https://docs.mojaloop.io/community/contributing/pr-guidance.html)

## References

- [Creating a Branch](https://docs.mojaloop.io/community/standards/creating-new-features.html#creating-a-branch)
- [Working on Your Feature](https://docs.mojaloop.io/community/standards/creating-new-features.html#working-on-your-feature)
- [Dependency Management](https://docs.mojaloop.io/community/standards/guide.html#dependency-management)
- [PR Guidance](https://docs.mojaloop.io/community/contributing/pr-guidance.html)
