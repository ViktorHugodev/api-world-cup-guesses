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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
function authRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/me', {
            onRequest: [authenticate_1.authenticate]
        }, (request) => __awaiter(this, void 0, void 0, function* () {
            return { user: request.user };
        }));
        fastify.get('/', () => __awaiter(this, void 0, void 0, function* () {
            return { message: 'Hello world' };
        }));
        fastify.post('/users', (request) => __awaiter(this, void 0, void 0, function* () {
            try {
                const createUserBody = zod_1.z.object({
                    access_token: zod_1.z.string()
                });
                const { access_token } = createUserBody.parse(request.body);
                const userResponse = yield (0, axios_1.default)('https://www.googleapis.com/oauth2/v2/userinfo', {
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
                let user = yield prisma_1.prisma.user.findUnique({
                    where: {
                        email: userInfo.email
                    }
                });
                if (!user) {
                    user = yield prisma_1.prisma.user.create({
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
        }));
        fastify.post('/refresh', (request) => __awaiter(this, void 0, void 0, function* () {
            return { message: 'refresh' };
        }));
    });
}
exports.authRoutes = authRoutes;
