import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({
	path: process.env.ENV === 'test' ? '.env.test.local' : '.env',
});

export default new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: +process.env.DB_PORT,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	migrations: [`${__dirname}/migrations/**/*.ts`],
});
