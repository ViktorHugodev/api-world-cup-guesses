'use strict';
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fastify_1 = __importDefault(require("fastify"));
const pool_1 = require("./routes/pool");
const bets_1 = require("./routes/bets");
const users_1 = require("./routes/users");
const auth_1 = require("./routes/auth");
const game_1 = require("./routes/game");
const jwt_1 = __importDefault(require("@fastify/jwt"));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, fastify_1.default)({
        logger: true
    });
    const PORT = process.env.PORT || 3333;
    app.register(jwt_1.default, {
        secret: process.env.SECRET_JWT
    });
    app.register(bets_1.betsRoutes);
    app.register(pool_1.poolRoutes);
    app.register(auth_1.authRoutes);
    app.register(game_1.gameRoutes);
    app.register(users_1.usersRoutes);
    app.get('/one', () => __awaiter(void 0, void 0, void 0, function* () {
        return { hello: 'world' };
    }));
    yield app.listen({ port: PORT });
});
start();
