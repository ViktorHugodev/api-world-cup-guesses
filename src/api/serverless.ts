'use strict'
import { start } from '../server'
// Read the .env file.
import * as dotenv from 'dotenv'
dotenv.config()

// Require the framework
import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
})

// Register your application as a normal plugin.
app.register(start)

export default async (req: FastifyRequest, res: FastifyInstance) => {
  await app.ready()
  app.server.emit('request', req, res)
}
