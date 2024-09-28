import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersServiceMock } from '../../test/mocks/users/users-service.mock';
import { JwtServiceMock } from '../../test/mocks/jwt/jwt-service.mock';
import {
	KeycloakServiceMock,
	tokenResponseMock,
} from '../../test/mocks/keycloak/keycloak-service.mock';
import LoginDto from './dto/login.dto';
import { userMock } from '../../test/mocks/users/user-repository.mock';
import { TokenResponseDto } from '../keycloak/dto/token-response.dto';

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
});
