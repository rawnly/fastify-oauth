import { App, PrismaClient, User } from '@prisma/client';
import * as uuid from 'uuid';

export default class AppService {
    constructor( private prisma: PrismaClient ) {}

    async findById( id: number ): Promise<App> {
        const app = await this.prisma.app.findUnique( {
            rejectOnNotFound: true,
            where: {
                id,
            },
        } );

        return app;
    }

    async generateSecret(
        appId: App['id'],
        userId: User['id']
    ): Promise<Pick<App, 'client_secret'>> {
        let app = await this.findById( appId );

        if ( app.userId !== userId ) {
            throw new Error( 'Cannot find app with ID ' + appId );
        }

        app = await this.prisma.app.update( {
            where: {
                id: app.id,
            },
            data: {
                client_secret: uuid.v4(),
            },
        } );

        return {
            client_secret: app.client_secret,
        };
    }

    async save(
        name: App['name'],
        redirect_uri: App['redirect_uri'],
        userId: User['id']
    ): Promise<App> {
        const client_id = uuid.v4();
        const client_secret = uuid.v4();

        return await this.prisma.app.create( {
            data: {
                name,
                redirect_uri,
                userId,
                client_id,
                client_secret,
            },
        } );
    }
}
