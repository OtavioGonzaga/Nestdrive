import {
	BadGatewayException,
	HttpException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';
import LoginDto from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { KeycloakService } from 'src/keycloak/keycloak.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly keycloakService: KeycloakService,
		private readonly mailerService: MailerService,
	) {}

	async login({ username, password }: LoginDto) {
		try {
			const params = new URLSearchParams();
			params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
			params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
			params.append('username', username);
			params.append('password', password);
			params.append('grant_type', 'password');

			const response = await axios.post(
				`${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
				params,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			return response.data;
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

	async register({ username, name, email, password }: RegisterDto) {
		try {
			const response = await this.keycloakService.createKeycloakUser({
				email,
				username,
				password,
				name,
			});

			if (response.status === 201) {
				const login = await this.login({ username, password });
				const decodedToken = this.jwtService.decode(login.access_token);
				const keycloakId = decodedToken['sub'];

				await this.usersService.create({ username, name, email, keycloakId });

				return login;
			}

			throw new Error(response.data?.message || 'Erro ao registrar usuário');
		} catch (error) {
			if (error?.status)
				throw new HttpException(
					error?.response?.data?.errorMessage || error.message,
					+error.status,
				);

			Logger.error(error.message, 'AuthService -> register');

			throw new InternalServerErrorException(error.message);
		}
	}

	async forgotPassword(email: string): Promise<void> {
		try {
			return await this.keycloakService.forgotPassword(email);
		} catch (error) {
			if (error instanceof HttpException) throw error;

			if (error.status) throw new HttpException(error.message, +error.status);

			Logger.error(error.message, 'AuthService -> forgotPassword');

			throw new InternalServerErrorException(error.message);
		}
	}
}
