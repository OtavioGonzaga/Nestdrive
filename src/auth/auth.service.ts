import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import LoginDto from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async login({ email, password }: LoginDto) {
		try {
			const params = new URLSearchParams();
			params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
			params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
			params.append('username', email);
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
			throw new UnauthorizedException('Credenciais inválidas');
		}
	}

	async register({ name, email, password }: RegisterDto) {
		try {
			const firstName = name.split(' ')[0];
			const lastName = name.split(' ').slice(1).join(' ');

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
					firstName: firstName,
					lastName: lastName,
					email: email,
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
				const login = await this.login({ email, password });
				const decodedToken = this.jwtService.decode(login.access_token);
				const keycloakId = decodedToken['sub'];

				this.usersService.create({ name, email, keycloakId });

				return login;
			}

			throw new Error(response.data?.message || 'Erro ao registrar usuário');
		} catch (error) {
			if (error.response && error.response.status === 409)
				throw new ConflictException('Alredy exist a user with the same email');

			Logger.error(
				JSON.stringify(error?.response?.data),
				'AuthService -> register',
			);

			throw new InternalServerErrorException(error.message);
		}
	}
}
