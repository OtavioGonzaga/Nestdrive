import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	AuthGuard,
	KeycloakConnectModule,
	ResourceGuard,
	RoleGuard,
} from 'nest-keycloak-connect';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { KeycloakService } from './keycloak/keycloak.service';
import { UsersModule } from './users/users.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MailerModule.forRoot({
			transport: {
				host: process.env.MAIL_SMTP_HOST,
				port: +process.env.MAIL_PORT,
				secure: process.env.MAIL_SSL_ENABLED === 'true',
				auth: {
					user: process.env.MAIL_ADDRESS,
					pass: process.env.MAIL_PASSWORD,
				},
			},
			defaults: {
				from: `"No Reply" <${process.env.MAIL_ADDRESS}>`,
			},
			template: {
				dir: __dirname + '/templates/pages',
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
			options: {
				partials: {
					dir: __dirname + '/templates/partials',
					options: {
						strict: true,
					},
				},
			},
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			entities: ['dist/**/*.entity.js'],
		}),
		KeycloakConnectModule.register({
			authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
			realm: process.env.KEYCLOAK_REALM,
			clientId: process.env.KEYCLOAK_CLIENT_ID,
			secret: process.env.KEYCLOAK_CLIENT_SECRET,
			useNestLogger: false,
		}),
		UsersModule,
		AuthModule,
		FilesModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ResourceGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RoleGuard,
		},
		KeycloakService,
	],
})
export class AppModule {}
