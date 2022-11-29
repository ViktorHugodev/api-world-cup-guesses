import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'

interface IQueryString {
    name: string;
}

interface IParams {
    name: string;
}

interface CustomRouteGenericParam {
    Params: IParams
}

interface CustomRouteGenericQuery {
    Querystring: IQueryString
}

export default async function (instance: FastifyInstance, opts: FastifyServerOptions, done) {


    instance.get('/', async (req: FastifyRequest, res: FastifyReply) => {
        return {message: 'hello'}
     
    })

    done()
}