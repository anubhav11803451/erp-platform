import * as bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@erp/db/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { platformOwnerSignInSchema } from '@erp/shared';
import pg from 'pg';

function requiredEnvironmentValue(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

async function bootstrapPlatformOwner(): Promise<void> {
    const databaseUrl = requiredEnvironmentValue('DATABASE_URL');
    const parsedCredentials = platformOwnerSignInSchema.safeParse({
        email: requiredEnvironmentValue('PLATFORM_OWNER_EMAIL').trim().toLowerCase(),
        password: requiredEnvironmentValue('PLATFORM_OWNER_PASSWORD'),
    });

    if (!parsedCredentials.success) {
        throw new Error('Platform Owner email or password does not meet the sign-in requirements.');
    }

    const pool = new pg.Pool({ connectionString: databaseUrl });
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

    try {
        const passwordHash = await bcrypt.hash(parsedCredentials.data.password, 12);
        await prisma.$transaction(
            async (transaction) => {
                if ((await transaction.account.count()) !== 0) {
                    throw new Error('Bootstrap is only permitted for an empty account table.');
                }

                await transaction.account.create({
                    data: {
                        email: parsedCredentials.data.email,
                        password_hash: passwordHash,
                        identity_kind: 'PLATFORM_OWNER',
                        owner_grant: { create: {} },
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                maxWait: 15_000,
            },
        );

        console.info('Initial Platform Owner created.');
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

if (require.main === module) {
    void bootstrapPlatformOwner().catch((e) => {
        console.error(
            'Platform Owner bootstrap failed. Check the supplied environment and empty-database precondition.',
            e,
        );
        process.exitCode = 1;
    });
}
