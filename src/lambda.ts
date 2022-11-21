import awsLambdaFastify from '@fastify/aws-lambda'
import { app } from './app'
// or
export async function lambda() {
  const fastify = await app()
  fastify.listen({
    port: 3333,
    host: '0.0.0.0',
  })
  const proxy = awsLambdaFastify(fastify)

  return proxy
}
