"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const pool_1 = require("./routes/pool");
const bets_1 = require("./routes/bets");
const users_1 = require("./routes/users");
const auth_1 = require("./routes/auth");
const game_1 = require("./routes/game");
const jwt_1 = __importDefault(require("@fastify/jwt"));
async function start() {
    const fastify = (0, fastify_1.default)({
        logger: true
    });
    await fastify.register(cors_1.default, {
        origin: true
    });
    await fastify.register(jwt_1.default, {
        secret: 'VINICAO'
    });
    await fastify.register(bets_1.betsRoutes);
    await fastify.register(pool_1.poolRoutes);
    await fastify.register(auth_1.authRoutes);
    await fastify.register(game_1.gameRoutes);
    await fastify.register(users_1.usersRoutes);
    await fastify.listen({
        port: 3333,
        host: '0.0.0.0'
    });
    return fastify;
}
exports.start = start;
start();
//# sourceMappingURL=server.js.map