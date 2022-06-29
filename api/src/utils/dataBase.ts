import { createConnection } from 'typeorm';
import 'dotenv/config';

export const establishDatabaseConnection = async () => {
	if (process.env.DB_HOST == 'localhost') {
		await createConnection({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			entities: ['src/entity/*.ts'],
		});
	}
	if (process.env.DB_HOST != 'localhost') {
		await createConnection({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			entities: ['src/entity/*.ts'],
			ssl: { rejectUnauthorized: false },
			connectTimeoutMS: 10000,
		});
	}
};
