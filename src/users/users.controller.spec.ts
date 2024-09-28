import { Test, TestingModule } from '@nestjs/testing';
import {
	updateUserMock,
	userMock,
	UserRepositoryMock,
} from '../../test/mocks/users/user-repository.mock';
import { UsersServiceMock } from '../../test/mocks/users/users-service.mock';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { KeycloakRoles } from '../common/enums/keycloak-roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
	let controller: UsersController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [UsersServiceMock, UserRepositoryMock],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('Create', () => {
		it('should call create method of usersService', async () => {
			const createUserDto: CreateUserDto = {
				name: userMock.name,
				username: userMock.username,
				email: userMock.email,
				password: 'password',
				role: userMock.role,
			};

			const result = await controller.create(createUserDto);

			expect(result).toEqual(userMock);
		});
	});

	describe('Read', () => {
		it('should call findAll method of usersService', async () => {
			const result = await controller.findAll();

			expect(result).toEqual([userMock]);
		});

		it('should call findOne method of usersService', async () => {
			const id = userMock.id;

			const result = await controller.findOne(id);

			expect(result).toEqual(userMock);
		});
	});

	describe('Update', () => {
		it('should call update method of usersService', async () => {
			const id = userMock.id;
			const updateUserDto: UpdateUserDto = {
				name: userMock.name,
				role: userMock.role,
			};

			const result = await controller.update(id, updateUserDto);

			expect(result).toEqual(updateUserMock);
		});
	});
});
