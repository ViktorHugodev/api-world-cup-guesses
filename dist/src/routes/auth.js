"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
async function authRoutes(fastify) {
    fastify.get('/me', {
        onRequest: [authenticate_1.authenticate]
    }, async (request) => {
        return { user: request.user };
    });
    fastify.post('/users', async (request) => {
        try {
            const createUserBody = zod_1.z.object({
                access_token: zod_1.z.string()
            });
            const { access_token } = createUserBody.parse(request.body);
            const userResponse = await (0, axios_1.default)('https://www.googleapis.com/oauth2/v2/userinfo', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            const userInfoSchema = zod_1.z.object({
                id: zod_1.z.string(),
                name: zod_1.z.string(),
                email: zod_1.z.string().email(),
                picture: zod_1.z.string().url()
            });
            const userInfo = userInfoSchema.parse(userResponse.data);
            let user = await prisma_1.prisma.user.findUnique({
                where: {
                    email: userInfo.email
                }
            });
            if (!user) {
                user = await prisma_1.prisma.user.create({
                    data: {
                        email: userInfo.email,
                        googleId: userInfo.id,
                        name: userInfo.name,
                        avatarUrl: userInfo.picture,
                    }
                });
            }
            const token = fastify.jwt.sign({
                name: user.name,
                avatarUrl: user.avatarUrl,
                email: user.email
            }, {
                sub: user.id,
                expiresIn: '7 days'
            });
            return { token };
        }
        catch (error) {
            console.log('ERROR =>', error);
        }
    });
    fastify.post('/refresh', async (request) => {
        return { message: 'refresh' };
    });
}
exports.authRoutes = authRoutes;
//# sourceMappingURL=auth.js.map