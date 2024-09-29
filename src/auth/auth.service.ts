import {
	BadGatewayException,
	HttpException,
	Injectable,
	Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import LoginDto from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { KeycloakService } from 'src/keycloak/keycloak.service';
import { KeycloakRoles } from '@common/enums/keycloak-roles.enum';
import { TokenResponseDto } from 'src/keycloak/dto/token-response.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly keycloakService: KeycloakService,
	) {}

	async login(loginDto: LoginDto): Promise<TokenResponseDto> {
		try {
			return this.keycloakService.login(loginDto);
		} catch (error) {
			if (error?.status)
				throw new HttpException(
					error?.response?.data?.error_description || error?.message,
					+error.status,
				);

			Logger.error(error.message, 'AuthService -> login');
			throw new BadGatewayException(error.message);
		}
	}

	async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
		try {
			const response = await this.keycloakService.createKeycloakUser({
				...registerDto,
				role: KeycloakRoles.STANDARD,
			});

			if (response.status === 201) {
				const login = await this.login(registerDto);
				const decodedToken = this.jwtService.decode(login.access_token);
				const keycloakId = decodedToken['sub'];

				await this.usersService.create({
					...registerDto,
					role: KeycloakRoles.STANDARD,
					keycloakId,
				});

				return login;
			}

			throw new Error(response.data);
		} catch (error) {
			if (error?.status)
				throw new HttpException(
					error?.response?.data?.errorMessage || error.message,
					+error.status,
				);

			Logger.error(error.message, 'AuthService -> register');

			throw new BadGatewayException(error.message);
		}
	}

	async forgotPassword(email: string): Promise<void> {
		try {
			await this.keycloakService.forgotPassword(email);
		} catch (error) {
			if (error instanceof HttpException) throw error;

			if (error.status) throw new HttpException(error.message, +error.status);

			Logger.error(error.message, 'AuthService -> forgotPassword');

			throw new BadGatewayException(error.message);
		}
	}
}
