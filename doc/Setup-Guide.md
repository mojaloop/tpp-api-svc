# Setting Up Local Development Tools and Environment

> <sub>_AI disclosure: this document was drafted with assistance from Claude._</sub>

This guide walks you through preparing a local environment for contributing to
Mojaloop PISP v2.0.

## 1. Installing Development Tools

Install the following tools before cloning any repositories:

| Tool | Purpose | Install guide |
| --- | --- | --- |
| Git | Version control | https://git-scm.com/downloads |
| Node.js & npm | Runtime and package manager | https://docs.npmjs.com/downloading-and-installing-node-js-and-npm |
| npx | Run npm package binaries | https://docs.npmjs.com/cli/v11/commands/npx |
| Docker | Containers | https://docs.docker.com/get-started/get-docker/ |
| Docker Compose | Multi-container orchestration | https://docs.docker.com/compose/install/ |

> `npx` ships with npm, so installing Node.js and npm covers it.

## 2. (Recommended) Setting Up Your Local Working Directory

1. Create a parent folder called `Mojaloop` to hold all Mojaloop-related repositories.

2. Inside the `Mojaloop` folder, fork the repositories below following
   Mojaloop's [Git Fork Guideline](https://docs.mojaloop.io/community/standards/creating-new-features.html#fork):

   | Repository | Role |
   | --- | --- |
   | [`tpp-api-svc`](https://github.com/mojaloop/tpp-api-svc) | PISP v2.0 module on the Mojaloop Switch |
   | [`central-services-shared`](https://github.com/mojaloop/central-services-shared) | Mojaloop shared central service |

## References

- [Mojaloop Git Workflow Guideline](https://docs.mojaloop.io/community/standards/creating-new-features.html)
