import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsOptional,
	IsString,
	IsStrongPassword,
	IsUUID,
	Matches,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@IsUUID()
	@IsOptional()
	@ApiPropertyOptional()
	keycloakId?: string;

	@IsStrongPassword()
	@IsOptional()
	@ApiPropertyOptional()
	password?: string;

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
