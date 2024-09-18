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

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
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
			const tokenResponse = await axios.post(
				`${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
				new URLSearchParams({
					grant_type: 'client_credentials',
					client_id: process.env.KEYCLOAK_CLIENT_ID,
					client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			const adminToken = tokenResponse.data.access_token;

			const response = await axios.post(
				`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
				{
					attributes: { name },
					username,
					email,
					enabled: true,
					emailVerified: true,
					credentials: [
						{
							type: 'password',
							value: password,
							temporary: false,
						},
					],
				},
				{
					headers: {
						Authorization: `Bearer ${adminToken}`,
						'Content-Type': 'application/json',
					},
				},
			);

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
}
