import { IsJWT, IsNumber, IsString, IsUUID } from 'class-validator';

export class TokenResponseDto {
	@IsJWT()
	access_token: string;

	@IsNumber()
	expires_in: number;

	@IsNumber()
	refresh_expires_in: number;

	@IsJWT()
	refresh_token: string;

	@IsString()
	token_type: string;

	@IsNumber()
	'not-before-policy': number;

	@IsUUID()
	session_state: string;

	@IsString()
	scope: string;
}
