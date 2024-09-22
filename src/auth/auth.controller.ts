import {
	Body,
	Controller,
	NotImplementedException,
	Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'nest-keycloak-connect';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@Public()
	@ApiOperation({ summary: 'User login endpoint' })
	@ApiResponse({
		status: 201,
		description: 'Response the request with a access token',
		example: {
			access_token: 'access_token',
			expires_in: 300,
			refresh_expires_in: 1800,
			refresh_token: 'refresh_token',
			token_type: 'Bearer',
			'not-before-policy': 0,
			session_state: '7db02e59-3cec-4c9c-a6cf-05b41f828b1d',
			scope: 'profile email',
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid payload',
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid credentials',
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiBody({ type: LoginDto })
	login(@Body() credentials: LoginDto) {
		return this.authService.login(credentials);
	}

	@Post('register')
	@Public()
	@ApiOperation({
		summary: 'Register a user and return his credentials',
	})
	@ApiResponse({
		status: 201,
		description: 'User created, respose with access_token',
		example: {
			access_token: 'access_token',
			expires_in: 300,
			refresh_expires_in: 1800,
			refresh_token: 'refresh_token',
			token_type: 'Bearer',
			'not-before-policy': 0,
			session_state: '7db02e59-3cec-4c9c-a6cf-05b41f828b1d',
			scope: 'profile email',
		},
	})
	async register(@Body() credentials: RegisterDto) {
		try {
			return this.authService.register(credentials);
		} catch (error) {
			console.log(error);
		}
	}

	@Post('logout')
	@ApiOperation({
		summary: 'Ends the user session',
	})
	@ApiResponse({ status: 401, description: 'Not authorized' })
	@ApiResponse({
		status: 501,
		description: 'Not implemented (work in progress)',
	})
	async logout() {
		throw new NotImplementedException();
	}

	@Post('forgot-password')
	@Public()
	async forgotPassword(@Body('email') email: string) {
		await this.authService.forgotPassword(email);
		return { message: 'Verify your e-mail' };
	}
}
