import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { KeycloakService } from '../keycloak/keycloak.service';

@Module({
	controllers: [UsersController],
	providers: [UsersService, KeycloakService],
	exports: [UsersService],
	imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
