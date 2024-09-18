import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { KeycloakRoles } from 'src/common/enums/keycloak-roles.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class KeycloakService {
	/**
	 * Generate admin token
	 * @returns {string} admin token
	 */
	private async generateAdminToken(): Promise<string> {
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

		return tokenResponse.data.access_token;
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
		createUserDto: CreateUserDto,
	): Promise<string> {
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

		return await axios.post(
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
					Authorization: `Bearer ${adminToken}`,
					'Content-Type': 'application/json',
				},
			},
		);
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
			`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIENT_ID}/roles`,
			{
				headers: {
					Authorization: `Bearer ${adminToken}`,
					'Content-Type': 'application/json',
				},
			},
		);

		const roleData: { id: string; name: string } = rolesResponse.data.find(
			(r) => r.name === role,
		);

		return await axios.post(
			`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakId}/role-mappings/clients/${process.env.KEYCLOAK_CLIENT_ID}`,
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
}
