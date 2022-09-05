import { createConnection } from 'typeorm';
import 'dotenv/config';

export const establishDatabaseConnection = async () => {
	if (process.env.DB_HOST == 'localhost') {
		await createConnection({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			entities: ['src/entity/*.ts'],
			ssl: false,
			connectTimeoutMS: 0,
		});
	}
	if (process.env.DB_HOST == 'host.docker.internal') {
		await createConnection({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			entities: ['src/entity/*.ts'],
			ssl: false,
			connectTimeoutMS: 0,
		});
	}
	if (process.env.DB_HOST != 'localhost' && process.env.DB_HOST != 'host.docker.internal') {
		await createConnection({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			entities: ['src/entity/*.ts'],
			ssl: { rejectUnauthorized: false },
			connectTimeoutMS: 10000,
		});
	}
};
