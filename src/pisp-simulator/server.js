'use strict'

const { Server } = require('@hapi/hapi')
const registerPispSimulatorRoutes = require('../../dist/pisp-simulator').default

async function createPispSimulatorServer (port = 5002) {
  const server = new Server({ port })
  registerPispSimulatorRoutes(server)
  await server.start()
  console.log(`PISP Simulator running on port ${port}`)
  return server
}

module.exports = { createPispSimulatorServer }
