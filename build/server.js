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
exports.server = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const pool_1 = require("./routes/pool");
const bets_1 = require("./routes/bets");
const users_1 = require("./routes/users");
const auth_1 = require("./routes/auth");
const game_1 = require("./routes/game");
const jwt_1 = __importDefault(require("@fastify/jwt"));
function server() {
    return __awaiter(this, void 0, void 0, function* () {
        const PORT = process.env.PORT || 3333;
        const fastify = (0, fastify_1.default)({
            logger: true
        });
        yield fastify.register(cors_1.default, {
            origin: true
        });
        yield fastify.register(jwt_1.default, {
            secret: process.env.SECRET_JWT
        });
        yield fastify.register(bets_1.betsRoutes);
        yield fastify.register(pool_1.poolRoutes);
        yield fastify.register(auth_1.authRoutes);
        yield fastify.register(game_1.gameRoutes);
        yield fastify.register(users_1.usersRoutes);
        yield fastify.listen({
            port: PORT,
            host: '0.0.0.0'
        });
        return fastify;
    });
}
exports.server = server;
server();
