'use strict'
import dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import cors from '@fastify/cors'

import { poolRoutes } from './routes/pool'
import { betsRoutes } from './routes/bets'
import { usersRoutes } from './routes/users'
import { authRoutes } from './routes/auth'
import { gameRoutes } from './routes/game'
import jwt from '@fastify/jwt'


const start = async () => {

  const app = Fastify({
    logger: true
  })
  const PORT = process.env.PORT || 3333

  app.register(jwt, {
    secret: process.env.SECRET_JWT as string
  })
  app.register(betsRoutes)
  app.register(poolRoutes)
  app.register(authRoutes)
  app.register(gameRoutes)
  app.register(usersRoutes)
  app.get('/one', async () => {
    return { hello: 'world' }
  })
  await app.listen({ port: PORT as number, host: '0.0.0.0' });
}

start();
// app.listen({
//     port: PORT as number,
//     host:'0.0.0.0'
//   })



