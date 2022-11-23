import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/authenticate'

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/pools/:id/games',
    { onRequest: [authenticate] },
    async request => {
      const getPoolParams = z.object({
        id: z.string(),
      })
      const { id } = getPoolParams.parse(request.params)

      const games = await prisma.game.findMany({
        orderBy: {
          date: 'desc',
        },
        include: {
          bets: {
            where: {
              participant: {
                userId: request.user.sub,
                poolId: id,
              },
            },
          },
        },
      })
      return {
        games: games.map(game => {
          return {
            ...game,
            bet: game.bets.length > 0 ? game.bets[0] : null,
            bets: undefined,
          }
        }),
      }
    }
  )

  fastify.post('/games/create', async request => {
    const createdNewGame = z.object({
      firstTeamCountryCode: z.string(),
      secondTeamCountryCode: z.string(),
      date: z.string(),
    })
    const { firstTeamCountryCode, secondTeamCountryCode, date } =      createdNewGame.parse(request.body)
    const res = await prisma.game.create({
      data: {
        date,
        firstTeamCountryCode,
        secondTeamCountryCode,
      },
    })
    return {res}
  })
}
