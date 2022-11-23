
import awsServerlessExpress from 'aws-serverless-express';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import {start} from './server';

const server = awsServerlessExpress.createServer(start);

export const handler = (event: APIGatewayProxyEvent, context: Context): any => {
    return awsServerlessExpress.proxy(server, event, context);
};