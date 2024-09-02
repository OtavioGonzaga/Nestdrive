import { IsEmail, IsStrongPassword } from 'class-validator';

export default class LoginDto {
	@IsEmail()
	email: string;

	@IsStrongPassword()
	password: string;
}
