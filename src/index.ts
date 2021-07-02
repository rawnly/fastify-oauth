import fastify from 'fastify';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import fastifyJWT from 'fastify-jwt';
import fastifyMetrics from 'fastify-metrics';
import fastifyServices from './plugins/fastify-services';
import ms from 'ms';
import TokenService from './services/TokenService';

import AppRouter from './routers/app-router';
import AuthRouter from './routers/auth-router';

const server = fastify( {
    logger: pino( {
        level: 'info',
        prettyPrint: {
            colorize: true,
        },
    } ),
} );

server
    .register( fastifyMetrics, {
        endpoint: '/metrics',
    } )
    .register( fastifyServices, {
        prismaClient: new PrismaClient(),
    } )
    .register( fastifyJWT, {
        secret: 'my-secret-key',
        sign: {
            expiresIn: ms( '5min' ),
            issuer: 'oauth.server',
        },
        trusted: async ( req ) => {
            const tokenString = req.headers['authorization']?.substr( 7 );

            req.log.warn( 'TokenString', tokenString );

            if ( !tokenString ) return false;

            return TokenService.getShared()
                .isValid( tokenString );
        },
    } );

server
    .register( AppRouter, { prefix: '/app' } )
    .register( AuthRouter, { prefix: '/auth' } );

server.listen( process.env.PORT || 3000, ( err ) => {
    if ( err ) server.log.error( err );
    server.log.info( `Listening on port: ${process.env.PORT || 3000}` );
} );

declare module 'fastify-jwt' {
    interface FastifyJWT {
        payload: { id: number };
    }
}
