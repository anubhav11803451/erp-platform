import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { User, UserRole } from '@erp/db/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersService } from '../domains/users/users.service';
import { PrismaService } from '../core/prisma.service';
import { UtilsService } from '../utils/utils.service';

describe('AuthService credential validation', () => {
    let authService: AuthService;
    let usersService: Pick<jest.Mocked<UsersService>, 'findByEmail'>;
    let user: User;
    let module: TestingModule;

    beforeAll(async () => {
        user = {
            id: 'user-1',
            email: 'staff@example.com',
            first_name: 'Staff',
            last_name: 'Member',
            password: await bcrypt.hash('correct-password', 4),
            role: UserRole.STAFF,
            created_at: new Date(),
            updated_at: new Date(),
        };
    });
    beforeEach(async () => {
        usersService = { findByEmail: jest.fn().mockResolvedValue(user) };

        module = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: {} },
                { provide: PrismaService, useValue: {} },
                { provide: ConfigService, useValue: { get: jest.fn() } },
                UtilsService,
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    afterEach(async () => {
        await module.close();
    });

    it('rejects an incorrect password', async () => {
        const getUserResponse = jest.spyOn(module.get(UtilsService), 'getUserResponse');

        await expect(authService.validateUser(user.email, 'incorrect-password')).resolves.toBeNull();
        expect(getUserResponse).not.toHaveBeenCalled();
    });

    it('returns the user response when the password matches', async () => {
        const result = await authService.validateUser(user.email, 'correct-password');

        expect(result).toEqual(
            expect.objectContaining({
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            }),
        );
        expect(result).not.toHaveProperty('password');
    });

    it('does not issue tokens or cookies when the password is incorrect', async () => {
        const authServiceMock = {
            validateUser: jest.fn().mockResolvedValue(null),
            login: jest.fn(),
        };
        const strategyModule = await Test.createTestingModule({
            imports: [PassportModule.register({ defaultStrategy: 'local' })],
            controllers: [AuthController],
            providers: [
                LocalStrategy,
                LocalAuthGuard,
                { provide: ConfigService, useValue: { get: jest.fn() } },
                {
                    provide: AuthService,
                    useValue: authServiceMock,
                },
            ],
        }).compile();
        const app: INestApplication = strategyModule.createNestApplication();
        await app.init();

        try {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: user.email, password: 'incorrect-password' });

            expect(response.status).toBe(401);
            expect(authServiceMock.login).not.toHaveBeenCalled();
            expect(response.headers['set-cookie']).toBeUndefined();
        } finally {
            await app.close();
        }
    });
});
