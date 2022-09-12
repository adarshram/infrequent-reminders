import { createConnection, getRepository, getManager } from 'typeorm';

import { runDailyCron } from './dailyUpdates';
import { getMessagingObject } from '../utils/firebase';
import { establishDatabaseConnection } from '../utils/dataBase';

export const runCron = async () => {
	await establishDatabaseConnection();
	await getMessagingObject();
	await runDailyCron();
};
runCron();
