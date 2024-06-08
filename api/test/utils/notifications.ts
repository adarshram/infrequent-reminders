import { getRepository, getManager } from 'typeorm';

import 'mocha';
import { createConnection } from 'typeorm';
import { establishDatabaseConnection } from './../../src/utils/dataBase';
import {
	sendNotificationToMobileDevice,
	sendNotificationEmail,
} from './../../src/utils/notification';
import {
	getMessagingObject,
	addToCollection,
	getFireStoreDbObject,
	initializeFireBase,
} from './../../src/utils/firebase';
//npm test test/utils/notifications.ts -- --grep "first test"

describe('notification data handler', () => {
	it('first test', async () => {
		await establishDatabaseConnection();
		await initializeFireBase();
		let notificationSubject = 'Test From node server';
		let vapidKey =
			'e9wXEr5WQW2FmjBCFrbHcE:APA91bG9ZaXGs2rpiU4XDMVwvBbbV6sYNiSUOcDNNYJYZDA3UKchklSbNLBveQ-qF-mLZlQvPtizMqCY0zPWfXnSPkHfWG0TTFSHXjlWmsqlz783FM2UebMnARbXkM3Xy7Cm0BW47geP';
		let { success, errors } = await sendNotificationToMobileDevice(vapidKey, notificationSubject);

		console.log({ success, errors });
	});
});
