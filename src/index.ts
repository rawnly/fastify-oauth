import fastify from 'fastify';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import fastifyJWT from 'fastify-jwt';
import fastifyMetrics from 'fastify-metrics';
import ms from 'ms';

import {
    AppRouter as AppController,
    AuthRouter as AuthController,
} from './routers';

import { fastifyServices, fastifyAuth } from './plugins';
import { TokenService } from './services';

const server = fastify( {
    logger: pino( {
        level: 'info',
        prettyPrint: {
            colorize: true,
        },
    } ),
} );

server
    .register( fastifyAuth )
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

// Controllers
server
    .register( AppController, { prefix: '/app' } )
    .register( AuthController, { prefix: '/auth' } );

server.listen( process.env.PORT || 3000, ( err ) => {
    if ( err ) server.log.error( err );
    server.log.info( `Listening on port: ${process.env.PORT || 3000}` );
} );

declare module 'fastify-jwt' {
    interface FastifyJWT {
        payload: {
            id: number; // userId
        };
    }
}
