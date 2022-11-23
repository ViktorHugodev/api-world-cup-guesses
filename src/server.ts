import Fastify from 'fastify'
import cors from '@fastify/cors'

import { poolRoutes } from './routes/pool'
import { betsRoutes } from './routes/bets'
import { usersRoutes } from './routes/users'
import { authRoutes } from './routes/auth'
import { gameRoutes } from './routes/game'
import jwt from '@fastify/jwt'

export async function start() {

  const fastify = Fastify({
    logger: true
  })

  await fastify.register(cors, {
    origin: true
  })
  await fastify.register(jwt, {
    secret: process.env.SECRET_JWT as string
  })
  await fastify.register(betsRoutes)
  await fastify.register(poolRoutes)
  await fastify.register(authRoutes)
  await fastify.register(gameRoutes)
  await fastify.register(usersRoutes)

  await fastify.listen({
    port: 3333,
    host: '0.0.0.0',
  })

  return fastify
}
start()