import { createConnection, getRepository, getManager } from 'typeorm';

import { runDailyCron } from './dailyUpdates';
import { getMessagingObject } from '../utils/firebase';
export const runCron = async () => {
	await createConnection();
	await getMessagingObject();
	await runDailyCron();
};
runCron();
