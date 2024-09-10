import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsString,
	IsStrongPassword,
	Matches,
	MinLength,
} from 'class-validator';

export class RegisterDto {
	@IsString()
	@Matches(/^\S+$/, { message: 'The username cannot have white spaces' })
	@ApiProperty()
	username: string;

	@ApiProperty()
	@IsString()
	@MinLength(3)
	@Matches(/^[A-Za-z]+(?: [A-Za-z]+)+$/, {
		message: 'Enter your full name',
	})
	name: string;

	@ApiProperty()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsStrongPassword()
	password: string;
}
