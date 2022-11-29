"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = void 0;
const prisma_1 = require("../lib/prisma");
async function usersRoutes(fastify) {
    fastify.get('/users/count', async () => {
        const count = await prisma_1.prisma.user.count();
        return { count };
    });
}
exports.usersRoutes = usersRoutes;
//# sourceMappingURL=users.js.map