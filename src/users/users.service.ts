import {
	BadGatewayException,
	BadRequestException,
	ConflictException,
	HttpException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import axios from 'axios';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
	) {}

	async create(createUserDto: CreateUserDto) {
		try {
			if (!createUserDto.keycloakId && createUserDto.password) {
				const firstName = createUserDto.name.split(' ')[0];
				const lastName = createUserDto.name.split(' ').slice(1).join(' ');

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

				await axios.post(
					`${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
					{
						firstName: firstName,
						lastName: lastName,
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
			} else if (!createUserDto.keycloakId && !createUserDto.password)
				throw new BadRequestException(
					'You must provide a keycloakId or a password to create a user',
				);

			const user = this.usersRepository.create(createUserDto);

			if (
				await this.usersRepository.exists({
					where: { email: createUserDto.email },
				})
			)
				throw new ConflictException('Email already exists');

			return await this.usersRepository.save(user);
		} catch (error) {
			if (error instanceof HttpException) throw error;

			if (error?.status) throw new HttpException(error.message, +error.status);

			Logger.error(error.message, 'UsersService -> create');
			throw new BadGatewayException(error.message);
		}
	}

	async findAll() {
		try {
			return await this.usersRepository.find();
		} catch (error) {
			Logger.error(error.message, 'UsersService -> findAll');
			throw new BadGatewayException(error.message);
		}
	}

	async findOne(id: string) {
		try {
			if (!(await this.usersRepository.exists({ where: { id } })))
				throw new NotFoundException('User not found');

			return await this.usersRepository.find({ where: { id } });
		} catch (error) {
			if (error instanceof HttpException) throw error;

			Logger.error(error.message, 'UsersService -> findOne');
			throw new BadGatewayException(error.message);
		}
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		try {
			if (!(await this.usersRepository.exists({ where: { id } })))
				throw new NotFoundException('User not found');

			const user = this.usersRepository.create(updateUserDto);

			return await this.usersRepository.update(id, user);
		} catch (error) {
			if (error instanceof HttpException) throw error;
			Logger.error(error.message, 'UsersService -> update');
			throw new BadGatewayException(error.message);
		}
	}
}
