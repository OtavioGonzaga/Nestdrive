import { UsersService } from '../../../src/users/users.service';
import { userMock } from './user-repository.mock';

export const UsersServiceMock = {
	provide: UsersService,
	useValue: {
		create: jest.fn().mockResolvedValue(userMock),
	},
};

