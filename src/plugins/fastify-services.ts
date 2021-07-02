import ms from 'ms';
import fp from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';

import { PrismaClient } from '.prisma/client';

import { AppService, TokenService, UserService } from '../services';

type Options = {
    prismaClient: PrismaClient;
};

const plugin: FastifyPluginCallback<Options> = (
    fastify,
    { prismaClient },
    next
) => {
    fastify.decorate( 'services', {
        user: new UserService( prismaClient ),
        app: new AppService( prismaClient ),
        token: new TokenService( prismaClient ),
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
