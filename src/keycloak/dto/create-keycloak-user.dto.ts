import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KeycloakRoles } from '../../common/enums/keycloak-roles.enum';
import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	IsStrongPassword,
	IsUUID,
	Matches,
	MinLength,
} from 'class-validator';

export class CreateKeycloakUserDto {
	@IsUUID()
	@IsOptional()
	@ApiPropertyOptional()
	keycloakId?: string;

	@IsStrongPassword()
	@IsOptional()
	@ApiPropertyOptional()
	password?: string;

	@ApiPropertyOptional()
	@IsEnum(KeycloakRoles)
	@IsOptional()
	role?: KeycloakRoles;

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
}
