import { UsersService } from '../../../src/users/users.service';
import { updateUserMock, userMock } from './user-repository.mock';

export const UsersServiceMock = {
	provide: UsersService,
	useValue: {
		create: jest.fn().mockResolvedValue(userMock),
		findAll: jest.fn().mockResolvedValue([userMock]),
		findOne: jest.fn().mockResolvedValue(userMock),
		update: jest.fn().mockResolvedValue(updateUserMock),
	},
};

