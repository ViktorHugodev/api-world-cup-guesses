import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import ShortUniqueId from 'short-unique-id'
import { authenticate } from '../middleware/authenticate'

export async function poolRoutes(fastify: FastifyInstance) {
  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()
    return { count }
  })

  fastify.post('/pool', async (request: FastifyRequest, response:FastifyReply ) => {
    const createdBet = z.object({
      title: z.string()
    })
    const { title } = createdBet.parse(request.body)
    const generateId = new ShortUniqueId()
    const code = String(generateId()).toUpperCase()

    try {
      await request.jwtVerify()
      await prisma.pool.create({
        data: {
          title: title,
          code: code,
          ownerId: request.user.sub,
          participants: {
            create: {
              userId: request.user.sub
            }
          }
        }
      })
    } catch {
      await prisma.pool.create({
        data: {
          title: title,
          code: code,
        }
      })
    }

    return response.status(201).send({ code })
  })

  fastify.post('/pool/join', { onRequest: [authenticate] }, async (request: FastifyRequest, response:FastifyReply ) => {
    const joinPool = z.object({
      code: z.string()
    })
    const { code } = joinPool.parse(request.body)

    const pool = await prisma.pool.findUnique({
      where: {
        code
      },
      include: {
        participants: {
          where: {
            userId: request.user.sub
          }
        }
      }
    })

    if (!pool) {
      return response.status(404).send({
        message: 'Pool not found'
      })
    }

    if (pool.participants.length > 0) {
      return response.status(400).send({
        message: 'You already joined this pool'
      })
    }

    if (!pool.ownerId) {
      await prisma.pool.update({
        where: {
          id: pool.id
        },
        data: {
          ownerId: request.user.sub
        }
      })
    }

    await prisma.participant.create({
      data: {
        poolId: pool.id,
        userId: request.user.sub
      }
    })
    return response.status(200).send()
  })

  fastify.get('/pools', { onRequest: [authenticate] }, async (request: FastifyRequest ) => {
    const pools = await prisma.pool.findMany({
      where: {
        participants: {
          some: {
            userId: request.user.sub
          }
        }
      },
      include: {
        _count: {
          select: {
            participants: true
          }
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    return { pools }
  })

  fastify.get('/pool/:id', { onRequest: [authenticate] }, async (request: FastifyRequest) => {
    const poolId = z.object({
      id: z.string()
    })
    const { id } = poolId.parse(request.params)
    const pool = await prisma.pool.findFirst({
      include: {
        _count: {
          select: {
            participants: true,
          
          }
        },
        participants: {

          select: {
            bets:true,
            id: true,
            user: {
              select: {
                name:true,
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      },
      where: {
        id
      }
    })

    return { pool}
  })
}