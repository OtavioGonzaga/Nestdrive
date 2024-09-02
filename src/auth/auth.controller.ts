import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { Public } from 'nest-keycloak-connect';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@Public()
	async login(@Body() credentials: LoginDto) {
		return this.authService.login(credentials);
	}

	@Post('register')
	@Public()
	async register(@Body() credentials: RegisterDto) {
		try {
			return this.authService.register(credentials);
		} catch (error) {
			console.log(error);
		}
	}

	@Post('logout')
	async logout() {
		// Implement logout logic
	}
}
