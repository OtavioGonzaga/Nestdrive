import { UsersService } from '../../../src/users/users.service';

export const UsersServiceMock = {
	provide: UsersService,
	useValue: {},
};

