"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seed() {
    const user = await prisma.user.create({
        data: {
            email: 'john.doe@test.com',
            name: 'John Doe',
            avatarUrl: 'https://github.com/viktorhugodev.png'
        }
    });
    const pool = await prisma.pool.create({
        data: {
            title: 'Bolão 01',
            code: 'BOL123',
            ownerId: user.id,
            participants: {
                create: {
                    userId: user.id
                }
            }
        }
    });
    await prisma.game.create({
        data: {
            date: '2022-11-24T16:00:00.910Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'RS'
        }
    });
    await prisma.game.create({
        data: {
            date: '2022-11-28T13:00:39.910Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'CH',
            bets: {
                create: {
                    firstTeamGoals: 3,
                    secondTeamGoals: 0,
                    participant: {
                        connect: {
                            userId_poolId: {
                                userId: user.id,
                                poolId: pool.id
                            }
                        }
                    }
                }
            }
        }
    });
}
seed();
//# sourceMappingURL=seed.js.map