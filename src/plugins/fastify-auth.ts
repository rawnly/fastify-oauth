import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import ms from 'ms';
import fp from 'fastify-plugin';
import * as uuid from 'uuid';
import { TokenType } from '.prisma/client';

const authorized = async function ( this: FastifyRequest ) {
    return await this.jwtVerify( {
        issuer: 'my-issuer',
        clockTolerance: ms( '3m' ),
    } );
};

const plugin: FastifyPluginCallback = ( fastify, options, next ) => {
    fastify.decorateRequest( 'authorized', authorized );

    fastify.decorateReply( 'generateJwt', async function <
        T extends boolean = boolean
    >( this: FastifyReply, userId: number, withRefreshToken: T ) {
        const token = await this.jwtSign( { id: userId } );
        const expires_in = fastify.utils.ms( '5min' );

        await fastify.services.token.save( token, expires_in, userId );

        if ( withRefreshToken ) {
            const refreshToken = await fastify.services.token.save(
                uuid.v4(),
                fastify.utils.ms( '7d' ),
                userId,
                TokenType.REFRESH_TOKEN
            );

            return {
                token,
                expires_in,
                refreshToken: refreshToken.value,
            };
        }

        return {
            token,
            expires_in,
        };
    } );

    next();
};

export default fp( plugin, {
    name: 'fastify-auth',
} );

declare module 'fastify' {
    interface FastifyRequest {
        authorized: typeof authorized;
    }

    interface FastifyReply {
        generateJwt<T extends boolean = boolean>(
            this: FastifyReply,
            userId: number,
            withRefresh: T
        ): Promise<
            IsTrue<
                T,
                {
                    token: string;
                    expires_in: number;
                    refreshToken: string;
                },
                {
                    token: string;
                    expires_in: number;
                }
            >
        >;
    }
}

type IsTrue<T extends boolean, A, B> = T extends true ? A : B;
