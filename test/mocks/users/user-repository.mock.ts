import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../src/users/entities/user.entity';
import { KeycloakRoles } from '../../../src/common/enums/keycloak-roles.enum';

export const userMock: User = {
	id: '3a307019-5520-4544-986b-0c96734c4696',
	keycloakId: '3a307019-5520-4544-986b-0c96734c4696',
	email: 'test@example.com',
	username: 'test',
	name: 'Test User',
	role: KeycloakRoles.STANDARD,
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const UserRepositoryMock = {
	provide: getRepositoryToken(User),
	useValue: {
		exists: jest.fn().mockResolvedValue(true),
		create: jest.fn().mockResolvedValue(userMock),
		findOne: jest.fn().mockResolvedValue(userMock),
		update: jest.fn().mockResolvedValue({
			generatedMaps: [],
			raw: [],
			affected: 1,
		}),
		save: jest.fn().mockResolvedValue(userMock),
		delete: jest.fn(),
		find: jest.fn().mockResolvedValue([userMock]),
	},
};

