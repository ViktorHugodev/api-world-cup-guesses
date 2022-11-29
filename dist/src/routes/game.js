"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
async function gameRoutes(fastify) {
    fastify.get('/pools/:id/games', { onRequest: [authenticate_1.authenticate] }, async (request) => {
        const getPoolParams = zod_1.z.object({
            id: zod_1.z.string(),
        });
        const { id } = getPoolParams.parse(request.params);
        const games = await prisma_1.prisma.game.findMany({
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
        });
        return {
            games: games.map(game => {
                return {
                    ...game,
                    bet: game.bets.length > 0 ? game.bets[0] : null,
                    bets: undefined,
                };
            }),
        };
    });
    fastify.post('/games/create', async (request) => {
        const createdNewGame = zod_1.z.object({
            firstTeamCountryCode: zod_1.z.string(),
            secondTeamCountryCode: zod_1.z.string(),
            date: zod_1.z.string(),
        });
        const { firstTeamCountryCode, secondTeamCountryCode, date } = createdNewGame.parse(request.body);
        const res = await prisma_1.prisma.game.create({
            data: {
                date,
                firstTeamCountryCode,
                secondTeamCountryCode,
            },
        });
        return { res };
    });
}
exports.gameRoutes = gameRoutes;
//# sourceMappingURL=game.js.map