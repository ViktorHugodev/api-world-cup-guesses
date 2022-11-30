"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betsRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
async function betsRoutes(fastify) {
    fastify.get('/bets/count', async () => {
        const count = await prisma_1.prisma.bets.count();
        return { count };
    });
    fastify.post('/pools/:poolId/games/:gameId', { onRequest: [authenticate_1.authenticate] }, async (request, response) => {
        const createBetParams = zod_1.z.object({
            poolId: zod_1.z.string(),
            gameId: zod_1.z.string(),
        });
        const { gameId, poolId } = createBetParams.parse(request.params);
        const createBetBody = zod_1.z.object({
            firstTeamGoals: zod_1.z.number(),
            secondTeamGoals: zod_1.z.number()
        });
        const { firstTeamGoals, secondTeamGoals } = createBetBody.parse(request.body);
        const participant = await prisma_1.prisma.participant.findUnique({
            where: {
                userId_poolId: {
                    poolId,
                    userId: request.user.sub
                }
            }
        });
        if (!participant) {
            return response.status(400).send({
                message: 'Youre not allowed to create a bet inside this pool'
            });
        }
        const bet = await prisma_1.prisma.bets.findUnique({
            where: {
                participantId_gameId: {
                    participantId: participant.id,
                    gameId
                }
            }
        });
        if (bet) {
            return response.status(400).send({
                message: 'You re already sent a bet to this game in this pool.'
            });
        }
        const game = await prisma_1.prisma.game.findUnique({
            where: {
                id: gameId
            }
        });
        if (!game) {
            return response.status(400).send({
                message: 'Game not found'
            });
        }
        if (game.date < new Date()) {
            return response.status(400).send({
                message: 'You cannot send a bet after the game'
            });
        }
        await prisma_1.prisma.bets.create({
            data: {
                firstTeamGoals,
                secondTeamGoals,
                gameId,
                participantId: participant.id
            }
        });
        return response.status(201).send();
    });
}
exports.betsRoutes = betsRoutes;
