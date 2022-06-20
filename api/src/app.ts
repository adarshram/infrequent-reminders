import * as express from 'express';
import * as cors from 'cors';
import { Request, Response } from 'express';
import { attachPrivateRoutes } from './routes';
import { createConnection } from 'typeorm';

const establishDatabaseConnection = async (): Promise<void> => {
	try {
		await createConnection();
	} catch (error) {
		console.log(error);
	}
};
const initializeApp = async (): Promise<void> => {
	await establishDatabaseConnection();
	const app = express();
	app.use(express.json());
	app.use(cors());

	// register routes
	app.get('/', function (req: Request, res: Response) {
		res.send('Hello World1');
	});
	try {
		attachPrivateRoutes(app);
	} catch (e) {
		app.use((error, req, res, next) => {
			console.error(error.stack);
			res.status(500).send('Something Broke!');
		});
	}
	app.use((error, req, res, next) => {
		console.error(error.stack);
		res.status(500).send('Something Broke!');
	});
	const portToRun = process.env.PORT ?? 3050;
	app.listen(portToRun);
};

initializeApp();
