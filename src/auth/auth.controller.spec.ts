import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtServiceMock } from 'test/mocks/jwt/jwt-service.mock';
import {
	KeycloakServiceMock,
	tokenResponseMock,
} from 'test/mocks/keycloak/keycloak-service.mock';
import { userMock } from 'test/mocks/users/user-repository.mock';
import { UsersServiceMock } from 'test/mocks/users/users-service.mock';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type LoginDto from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				AuthService,
				UsersServiceMock,
				JwtServiceMock,
				KeycloakServiceMock,
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('Login', () => {
		it('should call AuthService.login', async () => {
			const loginDto: LoginDto = {
				username: userMock.email,
				password: 'password',
			};

			const result = await controller.login(loginDto);

			expect(result).toEqual(tokenResponseMock);
		});
	});

	describe('Register', () => {
		it('should call AuthService.register', async () => {
			const registerDto: RegisterDto = {
				username: userMock.username,
				password: 'password',
				email: userMock.email,
				name: userMock.name,
			};

			const result = await controller.register(registerDto);

			expect(result).toEqual(tokenResponseMock);
		});
	});
});
