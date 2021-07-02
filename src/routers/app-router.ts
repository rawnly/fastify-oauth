import { FastifyPluginCallback, FastifyRequest } from 'fastify';

type AppCreation_Payload = {
    name: string;
    redirect_uri: string;
};

const Router: FastifyPluginCallback = ( fastify, _, next ) => {
    fastify.post(
        '/create',
        async ( req: FastifyRequest<{ Body: AppCreation_Payload }>, res ) => {
            await req.jwtVerify( {
                clockTolerance: fastify.utils.ms( '3m' ),
            } );

            const app = await fastify.services.app.save(
                req.body.name,
                req.body.redirect_uri,
                req.user.id
            );

            return {
                client_id: app.client_id,
                client_secret: app.client_secret,
                name: app.name,
                redirect_uri: app.redirect_uri,
            };
        }
    );

    fastify.post(
        '/:id/generate-secret',
        async ( req: FastifyRequest<{ Params: { id: string } }> ) => {
            await req.jwtVerify( {
                clockTolerance: fastify.utils.ms( '3m' ),
            } );

            return await fastify.services.app.generateSecret(
                parseInt( req.params.id ),
                req.user.id
            );
        }
    );

    next();
};

export default Router;
