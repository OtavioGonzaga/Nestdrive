import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { KeycloakServiceMock } from 'test/mocks/keycloak/keycloak-service.mock';
import {
	updateUserMock,
	userMock,
	UserRepositoryMock,
} from 'test/mocks/users/user-repository.mock';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UserService', () => {
	let usersService: UsersService;
	let userRepository: Repository<User>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UsersService, UserRepositoryMock, KeycloakServiceMock],
		}).compile();

		usersService = module.get<UsersService>(UsersService);
		userRepository = module.get<Repository<User>>(getRepositoryToken(User));
	});

	it('it should validate define', () => {
		expect(usersService).toBeDefined();
		expect(userRepository).toBeDefined();
	});

	describe('Read', () => {
		it('should find all users', async () => {
			const result = await usersService.findAll();

			expect(result).toBeDefined();
			expect(result.length).toBeGreaterThan(0);
			expect(result[0].id).toBeDefined();
			expect(result[0].keycloakId).toBeDefined();
			expect(result[0].username).toBe(userMock.username);
			expect(result[0].name).toBe(userMock.name);
			expect(result[0].email).toBe(userMock.email);
			expect(result[0].role).toBe(userMock.role);
			expect(result[0].createdAt).toBeDefined();
			expect(result[0].updatedAt).toBeDefined();
		});

		it('should find a single user', async () => {
			const result = await usersService.findOne(userMock.id);

			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect(result.keycloakId).toBeDefined();
			expect(result.username).toBe(userMock.username);
			expect(result.name).toBe(userMock.name);
			expect(result.email).toBe(userMock.email);
			expect(result.role).toBe(userMock.role);
			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeDefined();
		});
	});

	describe('Create', () => {
		it('it should create a new user', async () => {
			jest.spyOn(userRepository, 'exists').mockResolvedValueOnce(false);

			const result = await usersService.create({
				email: userMock.email,
				username: userMock.username,
				name: userMock.name,
				password: 'password',
				role: userMock.role,
			});

			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect(result.keycloakId).toBeDefined();
			expect(result.username).toBe(userMock.username);
			expect(result.name).toBe(userMock.name);
			expect(result.email).toBe(userMock.email);
			expect(result.role).toBe(userMock.role);
		});
	});

	describe('Update', () => {
		it('it should update an user', async () => {
			const result = await usersService.update(userMock.id, {
				name: userMock.name,
				role: userMock.role,
			});

			expect(result).toEqual(updateUserMock);
		});
	});
});
