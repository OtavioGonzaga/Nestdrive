import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
	@IsUUID()
	keycloakId: string;

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
}
