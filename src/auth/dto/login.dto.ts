import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, Matches } from 'class-validator';

export default class LoginDto {
	@IsString()
	@Matches(/^\S+$/, { message: 'The username cannot have white spaces' })
	@ApiProperty()
	username: string;

	@IsStrongPassword()
	@ApiProperty()
	password: string;
}
