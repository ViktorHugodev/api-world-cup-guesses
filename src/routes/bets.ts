import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/authenticate'

export async function betsRoutes(fastify: FastifyInstance) {
  fastify.get('/bets/count', async () => {
    const count = await prisma.bets.count()
    return { count }
  })

  fastify.post('/pools/:poolId/games/:gameId', { onRequest: [authenticate] }, async (request, response) => {
    const createBetParams = z.object({
      poolId: z.string(),
      gameId: z.string(),
    })
    const { gameId, poolId } = createBetParams.parse(request.params)

    const createBetBody = z.object({
      firstTeamGoals: z.number(),
      secondTeamGoals: z.number()
    })

    const { firstTeamGoals, secondTeamGoals } = createBetBody.parse(request.body)

    const participant = await prisma.participant.findUnique({
      where: {
        userId_poolId: {
          poolId,
          userId: request.user.sub
        }
      }
    })
    if (!participant) {
      return response.status(400).send({
        message: 'Youre not allowed to create a bet inside this pool'
      })
    }
    const bet = await prisma.bets.findUnique({
      where: {
        participantId_gameId: {
          participantId: participant.id,
          gameId
        }
      }
    })

    if (bet) {
      return response.status(400).send({
        message: 'You re already sent a bet to this game in this pool.'
      })
    }

    const game = await prisma.game.findUnique({
      where:{
        id: gameId
      }
    })

    if(!game) {
      return response.status(400).send({
        message: 'Game not found'
      })    
    }

    if(game.date < new Date()){
      return response.status(400).send({
        message: 'You cannot send a bet after the game'
      })
    }
    
    await prisma.bets.create({
      data:{
        firstTeamGoals,
        secondTeamGoals,
        gameId,
        participantId: participant.id


      }
    })

    return response.status(201).send()
  })
}