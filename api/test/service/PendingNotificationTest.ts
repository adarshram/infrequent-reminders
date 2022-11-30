import { getRepository, getManager } from 'typeorm';

import {
	getMessagingObject,
	addToCollection,
	getFireStoreDbObject,
	initializeFireBase,
} from './../../src/utils/firebase';
import { calculateSnoozeDate, calculateNextNotification } from './../../src/utils/dateManipulators';
import {
	deleteNotification,
	getNotificationById,
	getNextNotificationFromSet,
	isNotificationInSet,
	createNotificationsForUser,
	completeNotification,
	snoozeNotification,
	getNotificationsForUser,
	uncompleteNotification,
	getNotificationInMonthForUser,
	getNotificationsForUserByDate,
} from './../../src/models/UserNotifications';
import {
	createRecordFromNotification,
	deleteNotificationLog,
	getNotificationLogForUser,
	getNotificationsByDate,
} from './../../src/models/NotificationLog';
import { differenceInCalendarDays, addDays, getTime, format } from 'date-fns';
import { expect } from 'chai';
import { stub } from 'sinon';

import 'mocha';
import { createConnection } from 'typeorm';
import { establishDatabaseConnection } from './../../src/utils/dataBase';
import { PendingNotification } from './../../src/service/PendingNotification';

//npm test test\service\PendingNotificationTest.ts -- --grep "sends notification for specific user yMwuesozlicC6FSSGCaYmhK1Y6r1"

before(async () => {});

describe('notification data handler', () => {
	it('gets users with notification', async () => {
		await establishDatabaseConnection();
		await initializeFireBase();
		let pendingNotification = new PendingNotification();
		let users = await pendingNotification.getUsersWithNotification();
		expect(users.length > 0).to.equal(true);
	});

	it('process pending notification per user', async () => {
		await establishDatabaseConnection();
		await initializeFireBase();
		let pendingNotification = new PendingNotification();
		stub(pendingNotification, 'getUsersWithNotification').resolves([
			'83zkNxe3BtSpXsFgxrDgw49ktWj2',
		]);

		let users = await pendingNotification.getUsersWithNotification();
		await Promise.all(
			users.map(async (user_id) => {
				let userPendingNotifications = await pendingNotification.getPendingNotifications(user_id);
				pendingNotification.send(userPendingNotifications, user_id);
			}),
		);
	});

	it('sends notification for specific user yMwuesozlicC6FSSGCaYmhK1Y6r1', async () => {
		await establishDatabaseConnection();
		await initializeFireBase();
		let validUserId = 'yMwuesozlicC6FSSGCaYmhK1Y6r1';

		let pendingNotification = new PendingNotification();
		stub(pendingNotification, 'getUsersWithNotification').resolves([validUserId]);

		let users = await pendingNotification.getUsersWithNotification();
		await Promise.all(
			users.map(async (user_id) => {
				let userPendingNotifications = await pendingNotification.getPendingNotifications(user_id);
				if (userPendingNotifications && userPendingNotifications.length) {
					pendingNotification.send(userPendingNotifications, user_id);
				}
			}),
		);
	}).timeout(10000);

	it('sends notification per device', async () => {
		await establishDatabaseConnection();
		await initializeFireBase();
		let validUserId = '83zkNxe3BtSpXsFgxrDgw49ktWj2';
		let previousDate = addDays(new Date(), -5);
		let notificationParameters = {
			user_id: validUserId,
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};

		let notification = await createNotificationsForUser(notificationParameters);

		let pendingNotification = new PendingNotification();
		stub(pendingNotification, 'getUsersWithNotification').resolves([validUserId]);

		let users = await pendingNotification.getUsersWithNotification();
		await Promise.all(
			users.map(async (user_id) => {
				let userPendingNotifications = await pendingNotification.getPendingNotifications(user_id);
				pendingNotification.send(userPendingNotifications, user_id);
			}),
		);
		let [expectedNotificationLog, expectedCount] = await getNotificationLogForUser(
			notificationParameters.user_id,
		);
		expect(expectedCount).to.equal(1);
		let dateString = format(new Date(), 'yyyy-MM-dd');
		let notificationLog = await getNotificationsByDate(dateString);
		await Promise.all(
			notificationLog.map(async (current) => {
				deleteNotificationLog(current);
				return true;
			}),
		);

		await deleteNotification(notification.id);
	}).timeout(10000);

	it('sends notification to user and snooze it accordingly', async () => {
		await establishDatabaseConnection();
		await initializeFireBase();
		let previousDate = addDays(new Date(), -5);
		let notificationParameters = {
			user_id: '12345',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};

		let notification = await createNotificationsForUser(notificationParameters);
		let pendingNotification = new PendingNotification();
		let userPendingNotifications = await pendingNotification.getPendingNotifications(
			notificationParameters.user_id,
		);
		stub(pendingNotification, 'handleEmailNotificationForUser').resolves(true);
		await pendingNotification.send(userPendingNotifications, notificationParameters.user_id);

		let updatedNotification = await getNotificationById(notification.id, notification.user_id);

		const snoozeDate = calculateSnoozeDate(
			new Date(),
			notificationParameters.frequency,
			notificationParameters.frequency_type,
		);
		expect(updatedNotification.meta_notifications.cron_snoozed).to.equal(1);

		await deleteNotificationsForUser(notificationParameters.user_id);
	}).timeout(10000);
});

const deleteNotificationsForUser = async (user_id: String) => {
	let notificationListToClear = await getNotificationsForUser(user_id);
	let idsToDelete = notificationListToClear.results.map(async (record) => {
		if (record.id) {
			await deleteNotification(record.id);
		}
	});
};
