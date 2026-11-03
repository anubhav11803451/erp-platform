import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@erp/db/client';
import pg from 'pg';

const DISPOSABLE_DATABASE_ACK = 'I_HAVE_VERIFIED_THIS_IS_A_NEW_DISPOSABLE_DATABASE';
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testDatabaseAcknowledgement = process.env.TEST_DATABASE_DISPOSABLE_ACK;
const TENANT_SCHEMA_PATTERN = /^tenant_test_[0-9a-f]{32}$/;
const TENANT_TABLE_NAME = 'LegalEntity';

interface TenantHarness {
    schema: string;
    sentinelName: string;
    prisma: PrismaClient;
}

describe('Institution tenant schema routing PostgreSQL prototype', () => {
    let controlPool: pg.Pool | undefined;
    let tenantPool: pg.Pool | undefined;
    const tenants: TenantHarness[] = [];
    const createdSchemas: string[] = [];

    beforeAll(async () => {
        const connectionString = requireDisposableDatabaseUrl();
        const schemas = [createTenantSchemaName(), createTenantSchemaName()];

        controlPool = new pg.Pool({ connectionString, max: 1 });
        for (const schema of schemas) {
            await controlPool.query(`CREATE SCHEMA ${quoteTenantSchema(schema)}`);
            createdSchemas.push(schema);
        }

        const publicLegalEntity = await controlPool.query<{ exists: boolean }>(
            `SELECT to_regclass('"public"."LegalEntity"') IS NOT NULL AS exists`,
        );
        if (publicLegalEntity.rows[0]?.exists) {
            throw new Error(
                'Refusing to run the ORM write probe because public.LegalEntity already exists.',
            );
        }

        tenantPool = new pg.Pool({ connectionString, max: 1 });
        for (const schema of schemas) {
            const prisma = new PrismaClient({
                adapter: new PrismaPg(tenantPool, {
                    schema,
                    disposeExternalPool: false,
                }),
            });
            const tenant: TenantHarness = {
                schema,
                sentinelName: `${schema}:sentinel`,
                prisma,
            };
            tenants.push(tenant);

            await prisma.$connect();
            await prisma.$executeRawUnsafe(createTenantTableSql(schema));
            await prisma.legalEntity.create({
                data: { name: tenant.sentinelName, code: null },
            });
        }
    }, 30_000);

    afterAll(async () => {
        let cleanupFailed = false;

        for (const tenant of tenants) {
            try {
                await tenant.prisma.$disconnect();
            } catch {
                cleanupFailed = true;
            }
        }
        try {
            await tenantPool?.end();
        } catch {
            cleanupFailed = true;
        }
        if (controlPool) {
            for (const schema of [...createdSchemas].reverse()) {
                try {
                    await controlPool.query(`DROP SCHEMA ${quoteTenantSchema(schema)} CASCADE`);
                } catch {
                    cleanupFailed = true;
                }
            }
            try {
                await controlPool.end();
            } catch {
                cleanupFailed = true;
            }
        }

        if (cleanupFailed) {
            throw new Error('Tenant-schema prototype cleanup failed.');
        }
    });

    it('routes ORM and raw queries to two schemas with the same table name', async () => {
        expect(tenants).toHaveLength(2);

        for (const tenant of tenants) {
            await expect(
                tenant.prisma.legalEntity.findMany({ select: { name: true } }),
            ).resolves.toEqual([{ name: tenant.sentinelName }]);

            const rawRows = await tenant.prisma.$queryRawUnsafe<Array<{ name: string }>>(
                `SELECT "name" FROM ${quoteTenantSchema(tenant.schema)}."LegalEntity" WHERE "name" = $1`,
                tenant.sentinelName,
            );
            expect(rawRows).toEqual([{ name: tenant.sentinelName }]);
        }

        const firstTenantRows = await tenants[0].prisma.legalEntity.findMany({
            select: { name: true },
        });
        const secondTenantRows = await tenants[1].prisma.legalEntity.findMany({
            select: { name: true },
        });
        expect(firstTenantRows).not.toEqual(secondTenantRows);
    });

    it('keeps concurrent tenant operations isolated on one bounded shared pool', async () => {
        const results = await Promise.all(
            Array.from({ length: 16 }, async (_, index) => {
                const tenant = tenants[index % tenants.length];
                const name = `${tenant.schema}:concurrent:${index}`;
                await tenant.prisma.legalEntity.create({ data: { name, code: null } });

                const record = await tenant.prisma.legalEntity.findFirst({
                    where: { name },
                    select: { name: true },
                });
                return { tenant, record, name };
            }),
        );

        for (const result of results) {
            expect(result.record).toEqual({ name: result.name });
        }
        expect(tenantPool).toBeDefined();
        expect(tenantPool?.options.max).toBe(1);
        expect(tenantPool?.totalCount).toBe(1);
        expect(tenantPool?.idleCount).toBe(1);

        for (const tenant of tenants) {
            const names = await tenant.prisma.legalEntity.findMany({ select: { name: true } });
            expect(names.every(({ name }) => name.startsWith(`${tenant.schema}:`))).toBe(true);
        }
    });

    it('rolls back ORM writes and keeps the selected schema after an error', async () => {
        const tenant = tenants[0];
        const rolledBackName = `${tenant.schema}:rolled-back`;

        await expect(
            tenant.prisma.$transaction(async (transaction) => {
                await transaction.legalEntity.create({
                    data: { name: rolledBackName, code: null },
                });
                throw new Error('force rollback for tenant-schema prototype');
            }),
        ).rejects.toThrow('force rollback for tenant-schema prototype');

        await expect(
            tenant.prisma.legalEntity.findFirst({ where: { name: rolledBackName } }),
        ).resolves.toBeNull();

        await expect(
            tenant.prisma.$queryRawUnsafe(
                `SELECT * FROM ${quoteTenantSchema(tenant.schema)}."__missing_prototype_table__"`,
            ),
        ).rejects.toThrow();
    });
});

function requireDisposableDatabaseUrl(): string {
    if (!testDatabaseUrl) {
        throw new Error('Set TEST_DATABASE_URL to a dedicated disposable PostgreSQL database.');
    }
    if (testDatabaseAcknowledgement !== DISPOSABLE_DATABASE_ACK) {
        throw new Error(
            `Set TEST_DATABASE_DISPOSABLE_ACK=${DISPOSABLE_DATABASE_ACK} only after verifying the target.`,
        );
    }

    let parsedUrl: URL;
    let databaseName: string;
    try {
        parsedUrl = new URL(testDatabaseUrl);
        databaseName = decodeURIComponent(parsedUrl.pathname.slice(1));
    } catch {
        throw new Error('Integration tests require a valid PostgreSQL test URL.');
    }

    if (parsedUrl.protocol !== 'postgresql:' || !/(test|disposable)/i.test(databaseName)) {
        throw new Error(
            'Integration tests require a PostgreSQL database with a test/disposable name.',
        );
    }
    return testDatabaseUrl;
}

function createTenantSchemaName(): string {
    const schema = `tenant_test_${randomUUID().replaceAll('-', '')}`;
    if (!TENANT_SCHEMA_PATTERN.test(schema)) {
        throw new Error('Generated an invalid tenant test schema name.');
    }
    return schema;
}

function quoteTenantSchema(schema: string): string {
    if (!TENANT_SCHEMA_PATTERN.test(schema)) {
        throw new Error('Refusing to use a schema name outside the UUID test-schema pattern.');
    }
    return `"${schema}"`;
}

function createTenantTableSql(schema: string): string {
    return `
        CREATE TABLE ${quoteTenantSchema(schema)}."${TENANT_TABLE_NAME}" (
            "id" TEXT PRIMARY KEY,
            "name" TEXT NOT NULL,
            "code" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `;
}
