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
import { Repository, UpdateResult } from 'typeorm';
import { KeycloakService } from '../keycloak/keycloak.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
		private readonly keycloakService: KeycloakService,
	) {}

	public async create(createUserDto: CreateUserDto): Promise<User> {
		try {
			if (!createUserDto.keycloakId && createUserDto.password) {
				await this.keycloakService.createKeycloakUser(createUserDto);

				createUserDto.keycloakId = await this.keycloakService.getKeycloakId(
					createUserDto.username,
				);
			} else if (!createUserDto.keycloakId && !createUserDto.password)
				throw new BadRequestException(
					'You must provide a keycloakId or a password to create a user',
				);

			const user = this.usersRepository.create(createUserDto);

			if (
				await this.usersRepository.exists({
					where: [
						{ email: createUserDto.email },
						{ username: createUserDto.username },
					],
				})
			)
				throw new ConflictException('Email or username already in use');

			return await this.usersRepository.save(user);
		} catch (error) {
			if (error instanceof HttpException) throw error;

			if (error?.status) throw new HttpException(error.message, +error.status);

			Logger.error(error.message, 'UsersService -> create');
			throw new BadGatewayException(error.message);
		}
	}

	public async findAll(): Promise<User[]> {
		try {
			return await this.usersRepository.find();
		} catch (error) {
			Logger.error(error.message, 'UsersService -> findAll');
			throw new BadGatewayException(error.message);
		}
	}

	public async findOne(id: string): Promise<User> {
		try {
			if (!(await this.usersRepository.exists({ where: { id } })))
				throw new NotFoundException('User not found');

			return await this.usersRepository.findOne({ where: { id } });
		} catch (error) {
			if (error instanceof HttpException) throw error;

			Logger.error(error.message, 'UsersService -> findOne');
			throw new BadGatewayException(error.message);
		}
	}

	public async update(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<UpdateResult> {
		try {
			if (!(await this.usersRepository.exists({ where: { id } })))
				throw new NotFoundException('User not found');

			if (updateUserDto.role) {
				const { keycloakId } = await this.usersRepository.findOne({
					where: { id },
					select: { keycloakId: true },
				});

				await this.keycloakService.assingnUserRole(
					keycloakId,
					updateUserDto.role,
				);
			}

			const user = this.usersRepository.create(updateUserDto);

			return await this.usersRepository.update(id, user);
		} catch (error) {
			if (error instanceof HttpException) throw error;
			Logger.error(error.message, 'UsersService -> update');
			throw new BadGatewayException(error.message);
		}
	}
}
