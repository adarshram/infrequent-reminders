import * as express from 'express';
import * as cors from 'cors';
import { Request, Response } from 'express';
import { attachPrivateRoutes } from './routes';
import 'dotenv/config';
import { establishDatabaseConnection } from './utils/dataBase';

const initializeApp = async (): Promise<void> => {
	await establishDatabaseConnection();
	let app = express();
	app.use(express.json());
	app.use(cors());

	// register routes
	app.get('/', function (req: Request, res: Response) {
		res.send('Hello World!');
	});
	try {
		attachPrivateRoutes(app);
	} catch (e) {
		app.use((error, req, res, next) => {
			console.error(error.stack);
			res.status(500).send('Something Broke!');
		});
	}

	const portToRun = process.env.PORT ?? 3050;
	app.listen(portToRun);
};

initializeApp();
