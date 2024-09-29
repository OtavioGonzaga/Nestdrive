import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtServiceMock } from 'test/mocks/jwt/jwt-service.mock';
import { KeycloakServiceMock } from 'test/mocks/keycloak/keycloak-service.mock';
import { userMock } from 'test/mocks/users/user-repository.mock';
import { UsersServiceMock } from 'test/mocks/users/users-service.mock';

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				JwtServiceMock,
				KeycloakServiceMock,
				UsersServiceMock,
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('Login', () => {
		it('should return a token when valid credentials are provided', async () => {
			const result = await service.login({
				username: userMock.username,
				password: 'password',
			});

			expect(result.access_token).toBeTruthy();
			expect(result.refresh_token).toBeTruthy();
			expect(result.expires_in).toBeGreaterThan(0);
			expect(result.refresh_expires_in).toBeGreaterThan(0);
			expect(result.token_type).toBe('Bearer');
			expect(result.scope).toBe('profile email');
			expect(result.session_state).toBeTruthy();
			expect(result['not-before-policy']).toBeGreaterThanOrEqual(0);
		});
	});

	describe('Register', () => {
		it('should return a token when valid user data is provided', async () => {
			const result = await service.register({
				username: userMock.username,
				password: 'password',
				email: userMock.email,
				name: userMock.name,
			});

			expect(result.access_token).toBeTruthy();
			expect(result.refresh_token).toBeTruthy();
			expect(result.expires_in).toBeGreaterThan(0);
			expect(result.refresh_expires_in).toBeGreaterThan(0);
			expect(result.token_type).toBe('Bearer');
			expect(result.scope).toBe('profile email');
			expect(result.session_state).toBeTruthy();
			expect(result['not-before-policy']).toBeGreaterThanOrEqual(0);
		});
	});
});
