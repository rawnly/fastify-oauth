import { PrismaClient, Token, TokenType } from '@prisma/client';

export default class TokenService {
    constructor( private prisma: PrismaClient ) {}

    static getShared(): TokenService {
        return new TokenService( new PrismaClient() );
    }

    async save(
        token: string,
        expiration: number,
        userId: number,
        type: TokenType = TokenType.JWT
    ): Promise<Token> {
        return await this.prisma.token.create( {
            data: {
                userId,
                value: token,
                issuedAt: new Date(),
                expirationDate: new Date( Date.now() + expiration ),
                type,
            },
        } );
    }

    findByValueAndType( value: string, type: TokenType ): Promise<Token> {
        return this.prisma.token.findFirst( {
            rejectOnNotFound: true,
            where: {
                value,
                type,
            },
        } );
    }

    async invalidateJWTsOfUser( userId: number ): Promise<void> {
        await this.prisma.token.updateMany( {
            where: {
                userId,
                type: TokenType.JWT,
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

        if ( tkn === null ) return false;

        return tkn.expirationDate.getTime() < Date.now() && tkn.valid;
    }

    async useRefreshToken( refreshToken: string, userId: number ): Promise<void> {
        const isValidToken = await this.isValid( refreshToken );

        if ( !isValidToken ) {
            throw new Error( 'Not a valid Refresh Token' );
        }

        await this.invalidateJWTsOfUser( userId );
    }

    async delete( token: string ): Promise<Token> {
        return await this.prisma.token.delete( {
            where: {
                value: token,
            },
        } );
    }
}
