'use strict'

const { Server } = require('@hapi/hapi')
const registerDfspSimulatorRoutes = require('.').default

async function createDfspSimulatorServer (port = 5001) {
  const server = new Server({ port })
  registerDfspSimulatorRoutes(server)
  await server.start()
  console.log(`DFSP Simulator running on port ${port}`)
  return server
}

module.exports = { createDfspSimulatorServer }
