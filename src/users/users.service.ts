import {
	BadGatewayException,
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

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly usersRepository: Repository<User>,
	) {}

	async create(createUserDto: CreateUserDto) {
		try {
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
