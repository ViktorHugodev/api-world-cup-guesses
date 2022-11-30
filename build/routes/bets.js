"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.betsRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
function betsRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/bets/count', () => __awaiter(this, void 0, void 0, function* () {
            const count = yield prisma_1.prisma.bets.count();
            return { count };
        }));
        fastify.post('/pools/:poolId/games/:gameId', { onRequest: [authenticate_1.authenticate] }, (request, response) => __awaiter(this, void 0, void 0, function* () {
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
            const participant = yield prisma_1.prisma.participant.findUnique({
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
            const bet = yield prisma_1.prisma.bets.findUnique({
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
            const game = yield prisma_1.prisma.game.findUnique({
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
            yield prisma_1.prisma.bets.create({
                data: {
                    firstTeamGoals,
                    secondTeamGoals,
                    gameId,
                    participantId: participant.id
                }
            });
            return response.status(201).send();
        }));
    });
}
exports.betsRoutes = betsRoutes;
