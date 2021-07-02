import { FastifyPluginCallback, FastifyRequest } from 'fastify';

type LoginPayload = {
    email: string;
    password: string;
};

type SignupPayload = {
    firstName: string;
    lastName: string;
    password: string;
    email: string;
};

const Router: FastifyPluginCallback = ( fastify, _, next ) => {
    fastify.post(
        '/sign-in',
        async ( req: FastifyRequest<{ Body: LoginPayload }>, reply ) => {
            const user = await fastify.services.user.login(
                req.body.email,
                req.body.password
            );

            if ( !user ) {
                return reply.status( 401 )
                    .send( {
                        message: 'Invalid Credentials',
                        status: 401,
                    } );
            }

            const token = await reply.jwtSign( {
                id: user.id,
            } );

            await fastify.services.token.invalidateTokensOfUser( user.id );

            await fastify.services.token.save(
                token,
                fastify.utils.ms( '5min' ),
                user.id
            );

            return {
                token,
                expires_in: fastify.utils.ms( '5min' ),
            };
        }
    );

    fastify.post(
        '/sign-up',
        async ( req: FastifyRequest<{ Body: SignupPayload }>, res ) => {
            const user = await fastify.services.user.save( req.body );

            const token = await res.jwtSign( { id: user.id } );

            await fastify.services.token.save(
                token,
                fastify.utils.ms( '5min' ),
                user.id
            );

            return {
                token,
                expires_in: fastify.utils.ms( '5min' ),
            };
        }
    );

    next();
};

export default Router;
