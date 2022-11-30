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
app
  .get('/one', function (req, reply) {
    reply
      .send({ hello: 'world' })
  })
const start = async () => {
  try {
      await app.listen({ port: PORT as number });
  } catch (err) {
      app.log.error(err);
      process.exit(1);
  }
}

start();
// app.listen({
//     port: PORT as number,
//     host:'0.0.0.0'
//   })



