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

type RefreshToken_Payload = {
    refreshToken: string;
};

const Router: FastifyPluginCallback = ( fastify, _, next ) => {
    fastify.post(
        '/sign-in',
        async ( req: FastifyRequest<{ Body: LoginPayload }>, res ) => {
            const user = await fastify.services.user.login(
                req.body.email,
                req.body.password
            );

            if ( !user ) {
                return res.status( 401 )
                    .send( {
                        message: 'Invalid Credentials',
                        status: 401,
                    } );
            }

            await fastify.services.token.invalidateJWTsOfUser( user.id );

            return await res.generateJwt( user.id, true );
        }
    );

    fastify.post(
        '/sign-up',
        async ( req: FastifyRequest<{ Body: SignupPayload }>, res ) => {
            const user = await fastify.services.user.save( req.body );

            return await res.generateJwt( user.id, true );
        }
    );

    fastify.post(
        '/refresh-token',
        async ( req: FastifyRequest<{ Body: RefreshToken_Payload }>, res ) => {
            req.authorized();

            const { refreshToken } = req.body;
            const { id: userId } = req.user;

            await fastify.services.token.useRefreshToken( refreshToken, userId );

            return await res.generateJwt( userId, false );
        }
    );

    next();
};

export default Router;
