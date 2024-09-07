import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';

export default class LoginDto {
	@IsEmail()
	@ApiProperty()
	email: string;

	@IsStrongPassword()
	@ApiProperty()
	password: string;
}
