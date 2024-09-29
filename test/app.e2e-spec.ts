import { KeycloakRoles } from '@common/enums/keycloak-roles.enum';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import dataSource from 'typeorm/data-source';
import { userMock } from './mocks/users/user-repository.mock';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test.local' });
describe('AppController (e2e)', () => {
	let app: INestApplication;
	let accessToken: string;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(() => {
		app.close();
	});

	it('/ (GET)', () => {
		return request(app.getHttpServer())
			.get('/')
			.expect(200)
			.expect('Hello World!');
	});

	describe('auth', () => {
		it('should register a new user', async () => {
			const response = await request(app.getHttpServer())
				.post('/auth/register')
				.send({
					username: 'admin.test',
					password: '@Password123',
					email: 'admin@test.com',
					name: userMock.name,
				});

			accessToken = response.body.access_token;

			expect(response.statusCode).toEqual(201);
		});

		it('should login with new user', async () => {
			const response = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					username: 'admin.test',
					password: '@Password123',
				});

			expect(response.statusCode).toEqual(201);
		});
	});

	describe('users', () => {
		it('shold promove test user to admin', async () => {
			const ds = await dataSource.initialize();

			const queryRunner = ds.createQueryRunner();

			const keycloakId = jwtDecode(accessToken).sub;

			await queryRunner.query(
				`UPDATE users SET role = '${KeycloakRoles.ADMIN}' WHERE keycloak_id = '${keycloakId}'`,
			);

			const rows = await queryRunner.query(
				`SELECT * FROM users WHERE keycloak_id = '${keycloakId}'`,
			);

			const adminToken = (
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
				)
			).data.access_token;

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
				(r: { id: string; name: string }) => r.name === KeycloakRoles.ADMIN,
			);

			const promoveKeycloakUserResponse = await axios.post(
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

			accessToken = (
				await request(app.getHttpServer()).post('/auth/login').send({
					username: 'admin.test',
					password: '@Password123',
				})
			).body.access_token;

			expect(rows[0].role).toEqual(KeycloakRoles.ADMIN);
			expect(accessToken).toBeDefined();
			expect(promoveKeycloakUserResponse.status).toEqual(204);

			await dataSource.destroy();
		});

		it('should create a new user', async () => {
			const response = await request(app.getHttpServer())
				.post('/users')
				.send(userMock)
				.set('Authorization', `Bearer ${accessToken}`);

			expect(response.statusCode).toEqual(201);
			expect(response.body.email).toEqual(userMock.email);
			expect(response.body.username).toEqual(userMock.username);
			expect(response.body.role).toEqual(KeycloakRoles.STANDARD);
			expect(response.body.name).toEqual(userMock.name);
			expect(response.body.id).toBeDefined();
			expect(response.body.keycloakId).toBeDefined();
			expect(response.body.createdAt).toBeDefined();
			expect(response.body.updatedAt).toBeDefined();
		});

		it('should read all users', async () => {
			const response = await request(app.getHttpServer())
				.get('/users')
				.set('Authorization', `Bearer ${accessToken}`);

			expect(response.statusCode).toEqual(200);
			expect(Array.isArray(response.body)).toBeTruthy();
			expect(response.body[1].email).toEqual(userMock.email);
			expect(response.body[1].username).toEqual(userMock.username);
			expect(response.body[1].role).toEqual(KeycloakRoles.STANDARD);
			expect(response.body[1].name).toEqual(userMock.name);
			expect(response.body[1].id).toBeDefined();
			expect(response.body[1].keycloakId).toBeDefined();
			expect(response.body[1].createdAt).toBeDefined();
			expect(response.body[1].updatedAt).toBeDefined();
		});
	});
});
