import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { KeycloakService } from 'src/keycloak/keycloak.service';

@Module({
	controllers: [AuthController],
	providers: [AuthService, KeycloakService],
	imports: [UsersModule, JwtModule],
})
export class AuthModule {}
