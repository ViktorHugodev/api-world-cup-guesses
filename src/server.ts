import { app } from './app'

export async function start() {
  const fastify = await app()
  await fastify.listen({
    port: 3333,
    host: '0.0.0.0',
  })
}
