import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { TokenResponseDto } from './dto/token-response.dto';
import { KeycloakRoles } from '@common/enums/keycloak-roles.enum';
import LoginDto from 'src/auth/dto/login.dto';
import { CreateKeycloakUserDto } from './dto/create-keycloak-user.dto';
import { UserResponse } from './dto/user-response.dto';

@Injectable()
export class KeycloakService {
	/**
	 * Generate admin token
	 * @returns {string} admin token
	 */
	private async generateAdminToken(): Promise<string> {
		const tokenResponse: AxiosResponse<TokenResponseDto, unknown> =
			await axios.post(
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

		return tokenResponse.data.access_token;
	}

	public async login({
		username,
		password,
	}: LoginDto): Promise<TokenResponseDto> {
		const params = new URLSearchParams();
		params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
		params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
		params.append('username', username);
		params.append('password', password);
		params.append('grant_type', 'password');

		const loginResponse: AxiosResponse<TokenResponseDto, unknown> =
			await axios.post(
				`${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
				params,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

		return loginResponse.data;
	}

	public async getKeycloakId(username: string): Promise<string> {
		return (
			await axios.get(
				`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
				{
					params: {
						username: username,
					},
					headers: {
						Authorization: `Bearer ${await this.generateAdminToken()}`,
						'Content-Type': 'application/json',
					},
				},
			)
		).data[0].id;
	}

	public async createKeycloakUser(
		createUserDto: CreateKeycloakUserDto,
	): Promise<AxiosResponse<string, unknown>> {
		const response = await axios.post(
			`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
			{
				attributes: { name: createUserDto.name },
				username: createUserDto.username,
				email: createUserDto.email,
				enabled: true,
				emailVerified: true,
				credentials: [
					{
						type: 'password',
						value: createUserDto.password,
						temporary: false,
					},
				],
			},
			{
				headers: {
					Authorization: `Bearer ${await this.generateAdminToken()}`,
					'Content-Type': 'application/json',
				},
			},
		);

		const keycloakId = await this.getKeycloakId(createUserDto.username);

		await this.assingnUserRole(
			keycloakId,
			createUserDto.role ?? KeycloakRoles.STANDARD,
		);

		return response;
	}

	/**
	 * Assign a role to a user in keycloak
	 * @param {string} keycloakId
	 * @param {KeycloakRoles} role
	 */
	public async assingnUserRole(
		keycloakId: string,
		role: KeycloakRoles,
	): Promise<void> {
		const adminToken = await this.generateAdminToken();

		const rolesResponse = await axios.get(
			`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIEND_UUID}/roles`,
			{
				headers: {
					Authorization: `Bearer ${adminToken}`,
					'Content-Type': 'application/json',
				},
			},
		);

		const roleData: { id: string; name: string } = rolesResponse.data.find(
			(r: { id: string; name: string }) => r.name === role,
		);

		return await axios.post(
			`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakId}/role-mappings/clients/${process.env.KEYCLOAK_CLIEND_UUID}`,
			[
				{
					id: roleData.id,
					name: roleData.name,
				},
			],
			{
				headers: {
					Authorization: `Bearer ${adminToken}`,
					'Content-Type': 'application/json',
				},
			},
		);
	}

	public async forgotPassword(email: string): Promise<void> {
		const adminToken: string = await this.generateAdminToken();

		const userResponse: AxiosResponse<UserResponse[], unknown> =
			await axios.get(
				`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${email}`,
				{
					headers: {
						Authorization: `Bearer ${adminToken}`,
					},
				},
			);

		const user = userResponse.data[0];

		console.log(userResponse.data);

		if (!user) throw new NotFoundException('User not found');

		await axios.put(
			`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${user.id}/execute-actions-email`,
			['UPDATE_PASSWORD'],
			{
				headers: {
					Authorization: `Bearer ${adminToken}`,
					'Content-Type': 'application/json',
				},
			},
		);
	}
}
