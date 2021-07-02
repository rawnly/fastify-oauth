import AppService from '../services/AppService';
import UserService from '../services/UserService';

import fp from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { PrismaClient } from '.prisma/client';
import ms from 'ms';
import TokenService from '@src/services/TokenService';

type Options = {
    prismaClient: PrismaClient;
};

const plugin: FastifyPluginCallback<Options> = ( fastify, o, next ) => {
    fastify.decorate( 'services', {
        user: new UserService( o.prismaClient ),
        app: new AppService( o.prismaClient ),
        token: new TokenService( o.prismaClient ),
    } );

    fastify.decorate( 'utils', {
        ms,
    } );

    next();
};

export default fp<Options>( plugin, {
    name: 'fastify-services',
} );

declare module 'fastify' {
    interface FastifyInstance {
        services: {
            user: UserService;
            app: AppService;
            token: TokenService;
        };

        utils: {
            ms: typeof ms;
        };
    }
}
