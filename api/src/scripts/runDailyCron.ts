import { createConnection, getRepository, getManager } from 'typeorm';

import { PendingNotification } from '../service/PendingNotification';
import { getMessagingObject } from '../utils/firebase';
import { establishDatabaseConnection } from '../utils/dataBase';

export const runCron = async () => {
	await establishDatabaseConnection();
	await getMessagingObject();
	await runDailyCron();
};

const runDailyCron = async () => {
	let pendingNotification = new PendingNotification();
	let users = await pendingNotification.getUsersWithNotification();
	const dailyCronResults = await Promise.all(
		users.map(async (user_id) => {
			let userPendingNotifications = await pendingNotification.getPendingNotifications(user_id);
			let results = await pendingNotification.send(userPendingNotifications, user_id);
			return results;
		}),
	);
	console.log(dailyCronResults);
};
runCron();
