"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolRoutes = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const authenticate_1 = require("../middleware/authenticate");
async function poolRoutes(fastify) {
    fastify.get('/pools/count', async () => {
        const count = await prisma_1.prisma.pool.count();
        return { count };
    });
    fastify.post('/pool', async (request, response) => {
        const createdBet = zod_1.z.object({
            title: zod_1.z.string()
        });
        const { title } = createdBet.parse(request.body);
        const generateId = new short_unique_id_1.default();
        const code = String(generateId()).toUpperCase();
        try {
            await request.jwtVerify();
            await prisma_1.prisma.pool.create({
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
            });
        }
        catch {
            await prisma_1.prisma.pool.create({
                data: {
                    title: title,
                    code: code,
                }
            });
        }
        return response.status(201).send({ code });
    });
    fastify.post('/pool/join', { onRequest: [authenticate_1.authenticate] }, async (request, response) => {
        const joinPool = zod_1.z.object({
            code: zod_1.z.string()
        });
        const { code } = joinPool.parse(request.body);
        const pool = await prisma_1.prisma.pool.findUnique({
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
        });
        if (!pool) {
            return response.status(404).send({
                message: 'Pool not found'
            });
        }
        if (pool.participants.length > 0) {
            return response.status(400).send({
                message: 'You already joined this pool'
            });
        }
        if (!pool.ownerId) {
            await prisma_1.prisma.pool.update({
                where: {
                    id: pool.id
                },
                data: {
                    ownerId: request.user.sub
                }
            });
        }
        await prisma_1.prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: request.user.sub
            }
        });
        return response.status(200).send();
    });
    fastify.get('/pools', { onRequest: [authenticate_1.authenticate] }, async (request) => {
        const pools = await prisma_1.prisma.pool.findMany({
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
        });
        return { pools };
    });
    fastify.get('/pool/:id', { onRequest: [authenticate_1.authenticate] }, async (request) => {
        const poolId = zod_1.z.object({
            id: zod_1.z.string()
        });
        const { id } = poolId.parse(request.params);
        const pool = await prisma_1.prisma.pool.findFirst({
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
            },
            where: {
                id
            }
        });
        return { pool };
    });
}
exports.poolRoutes = poolRoutes;
//# sourceMappingURL=pool.js.map