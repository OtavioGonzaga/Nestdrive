import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { KeycloakRoles } from '../../src/common/enums/keycloak-roles.enum';
import { User } from './entities/user.entity';
import { UpdateResult } from 'typeorm';

@Controller('users')
@ApiTags('Users')
@Roles({ roles: [KeycloakRoles.ADMIN] })
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({
		summary: 'Create a new user',
		description: 'Provide a password to create or a keycloak',
	})
	create(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.usersService.create(createUserDto);
	}

	@Get()
	findAll(): Promise<User[]> {
		return this.usersService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
		return this.usersService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<UpdateResult> {
		return this.usersService.update(id, updateUserDto);
	}
}
