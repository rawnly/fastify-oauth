import { PrismaClient, Token } from '@prisma/client';

export default class TokenService {
    constructor( private prisma: PrismaClient ) {}

    static getShared(): TokenService {
        return new TokenService( new PrismaClient() );
    }

    async save(
        token: string,
        expiration: number,
        userId: number
    ): Promise<Token> {
        return await this.prisma.token.create( {
            data: {
                userId,
                value: token,
                issuedAt: new Date(),
                expirationDate: new Date( Date.now() + expiration ),
            },
        } );
    }

    async invalidateTokensOfUser( userId: number ): Promise<void> {
        await this.prisma.token.updateMany( {
            where: {
                userId,
            },
            data: {
                valid: false,
            },
        } );
    }

    async isValid( token: string ): Promise<boolean> {
        const tkn = await this.prisma.token.findFirst( {
            where: {
                value: token,
            },
        } );

        return tkn !== null ? tkn.valid : false;
    }

    async delete( token: string ): Promise<Token> {
        return await this.prisma.token.delete( {
            where: {
                value: token,
            },
        } );
    }
}
