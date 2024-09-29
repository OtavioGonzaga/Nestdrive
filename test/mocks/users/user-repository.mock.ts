import { KeycloakRoles } from '@common/enums/keycloak-roles.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import type { UpdateResult } from 'typeorm';

export const userMock: User = {
	id: '3a307019-5520-4544-986b-0c96734c4696',
	keycloakId: 'e6cdaf9c-4b20-4435-b7bc-e3c8c1230330',
	email: 'test@example.com',
	username: 'test.user',
	name: 'Test User',
	role: KeycloakRoles.STANDARD,
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const updateUserMock: UpdateResult = {
	generatedMaps: [],
	raw: [],
	affected: 1,
};

export const UserRepositoryMock = {
	provide: getRepositoryToken(User),
	useValue: {
		exists: jest.fn().mockResolvedValue(true),
		create: jest.fn().mockResolvedValue(userMock),
		findOne: jest.fn().mockResolvedValue(userMock),
		update: jest.fn().mockResolvedValue(updateUserMock),
		save: jest.fn().mockResolvedValue(userMock),
		delete: jest.fn(),
		find: jest.fn().mockResolvedValue([userMock]),
	},
};
