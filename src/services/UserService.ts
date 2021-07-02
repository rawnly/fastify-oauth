import { PrismaClient, User } from '@prisma/client';
import bc from 'bcrypt';

type Entity = {
    id: number;
    deleted?: boolean;
};

interface Service<T extends Entity> {
    findById( id: T['id'] ): Promise<T>;
}

export default class UserService implements Service<User> {
    constructor( private prisma: PrismaClient ) {}

    async findById( id: number ): Promise<User> {
        const user = await this.prisma.user.findUnique( {
            rejectOnNotFound: true,
            where: {
                id,
            },
        } );

        return user;
    }

    async login( email: string, password: string ): Promise<User | null> {
        const user = await this.findByEmail( email );

        if ( bc.compareSync( password, user.password ) ) {
            return user;
        }

        return null;
    }

    async findByEmail( email: User['email'] ): Promise<User> {
        const user = await this.prisma.user.findFirst( {
            rejectOnNotFound: true,
            where: {
                email,
            },
        } );

        return user;
    }

    async save( {
        firstName,
        lastName,
        email,
        password,
    }: Pick<
        User,
        'email' | 'firstName' | 'lastName' | 'password'
    > ): Promise<User> {
        return this.prisma.user.create( {
            data: {
                firstName,
                lastName,
                email,
                password: bc.hashSync( password, 10 ),
            },
        } );
    }
}
