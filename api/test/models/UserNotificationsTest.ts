import {
	saveSetFromRequest,
	deleteNotificationSet,
	saveSingleNotificationForSet,
	saveNotificationLink,
	deleteSetLinkByColumn,
	deleteSetLinkByPK,
	deleteSet,
	getSetById,
	getLinkedReminders,
	deleteNotificationFromSet,
	getSetList,
} from './../../src/models/ReminderSet';
import {
	deleteNotification,
	getNotificationById,
	getNextNotificationFromSet,
	isNotificationInSet,
	createNotificationsForUser,
	completeNotification,
	snoozeNotification,
	snoozeNotificationObject,
	getNotificationsForUser,
	uncompleteNotification,
	getNotificationInMonthForUser,
	getNotificationsForUserByDate,
	getPendingNotifications,
	getUsersWithPendingNotifications,
} from './../../src/models/UserNotifications';
import MetaNotificationsClass from './../../src/models/MetaNotifications';

import { differenceInCalendarDays, addDays, getUnixTime } from 'date-fns';
import { expect } from 'chai';
import 'mocha';
import { establishDatabaseConnection } from './../../src/utils/dataBase';
import { calculateNextNotification } from './../../src/utils/dateManipulators';
import { getTime, format } from 'date-fns';

import { MetaNotifications } from './../../src/entity/MetaNotifications';
import { UserNotifications } from './../../src/entity/UserNotifications';
import { getRepository, getManager } from 'typeorm';

before(async () => {
	await establishDatabaseConnection();
});

//npm test test\models\UserNotificationsTest.ts -- --grep "snoozes notifications depending on cron count"
//npm test test/models/UserNotificationsTest.ts -- --grep "join meta notification"

describe('save new reminder set', () => {
	let reminderData = {
		user_id: '123123123',
		subject: 'Test Me subject',
		description: 'Test Me description',
		reminders: [
			{
				unique_id: new Date().getTime(),
				subject: 'Enter Sub1ject',
				description: 'Short Desc1ription',
				notification_date: new Date(),
				days_after: 2,
			},
			{
				unique_id: new Date().getTime(),
				subject: 'Enter Sub2ject',
				description: 'Short Des2cription',
				notification_date: new Date(),
				days_after: 2,
			},
		],
	};
	const deleteNotificationsForUser = async (user_id: String) => {
		let notificationListToClear = await getNotificationsForUser(user_id);
		let idsToDelete = await Promise.all(
			notificationListToClear.results.map(async (record) => {
				if (record.id) {
					await deleteNotification(record.id);
				}
			}),
		);
	};
	it('test distinct users with pending notifications', async () => {
		let previousDate = addDays(new Date(), -10);
		let notificationParameters = {
			user_id: '12345',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};

		let notifications = [];
		let createdNotification = await createNotificationsForUser(notificationParameters);
		notifications.push(createdNotification);

		createdNotification = await createNotificationsForUser({
			...notificationParameters,
			notification_date: addDays(new Date(), -5),
		});
		notifications.push(createdNotification);

		createdNotification = await createNotificationsForUser({
			...notificationParameters,
			notification_date: addDays(new Date(), -20),
		});
		notifications.push(createdNotification);

		let pendingNotifications = await getUsersWithPendingNotifications();
		expect(pendingNotifications.length > 0).to.be.equal(true);

		//cleanup
		await deleteNotificationsForUser(notificationParameters.user_id);
	}).timeout(10000);

	xit('deletes all dummy notifications', async () => {});

	xit('marks notification as done', async () => {
		let validReminderData = {
			...reminderData,
		};
		const notificationResult = await saveSetFromRequest(validReminderData);
		if (typeof notificationResult !== 'boolean') {
			let singleNotificationParams = {
				...reminderData.reminders[0],
				set_id: notificationResult.id,
				user_id: reminderData.user_id,
			};

			let index = 0;
			let firstNotification = await saveSingleNotificationForSet(singleNotificationParams, index);
			index = 1;
			let secondNotification = await saveSingleNotificationForSet(singleNotificationParams, index);

			if (typeof firstNotification !== 'boolean' && typeof secondNotification !== 'boolean') {
				let results = await completeNotification(firstNotification.id, firstNotification.user_id);

				let updatedNotification = await getNotificationById(
					firstNotification.id,
					firstNotification.user_id,
				);
				expect(updatedNotification.is_active).to.be.equal(false);

				updatedNotification = await getNotificationById(
					secondNotification.id,
					secondNotification.user_id,
				);
				expect(updatedNotification.is_active).to.be.equal(true);
			}

			if (typeof notificationResult !== 'boolean') {
				await deleteNotificationSet(notificationResult.id);
			}
		}
	});

	xit('marks single notification as done', async () => {
		let previousDate = addDays(new Date(), 5);

		let notificationParameters = {
			user_id: '123',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};

		let notification = await createNotificationsForUser(notificationParameters);
		expect(notification.subject).to.be.equal(notificationParameters.subject);

		await completeNotification(notification.id, notification.user_id);
		let updatedNotification = await getNotificationById(notification.id, notification.user_id);
		let difference = differenceInCalendarDays(
			updatedNotification.notification_date,
			notification.notification_date,
		);

		expect(difference).to.be.equal(7);

		let metaObject = new MetaNotificationsClass();
		let metaObjectData = await metaObject.getDataByNotificationId(notification.id);

		expect(metaObjectData.done_count > 0).to.be.equal(true);

		//cleanup
		if (notification.id) {
			await metaObject.deleteByNotificationId(notification.id);
			await deleteNotification(notification.id);
		}
	});

	it('test complete notification', async () => {
		let nextDate = addDays(new Date(), 5);

		let notificationParameters = {
			user_id: '123',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: nextDate,
			is_active: true,
		};

		let createdNotification = await createNotificationsForUser(notificationParameters);
		await completeNotification(createdNotification.id, createdNotification.user_id);
		let updatedNotification = await getNotificationById(
			createdNotification.id,
			createdNotification.user_id,
		);
		let nextNotificationResult = calculateNextNotification(
			new Date(),
			createdNotification.frequency,
			createdNotification.frequency_type,
		);
		let expectedDate = format(nextNotificationResult.date, 'yyyy-MM-dd');
		let completedDate = format(updatedNotification.notification_date, 'yyyy-MM-dd');
		expect(completedDate).to.be.equal(expectedDate);
		await deleteNotification(createdNotification.id);
	});
	xit('get_notification with done count', async () => {
		let previousDate = addDays(new Date(), 5);

		let notificationParameters = {
			user_id: '123',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};
		//delete all
		let notificationListToClear = await getNotificationsForUser(notificationParameters.user_id);
		let idsToDelete = notificationListToClear.results.map(async (record) => {
			if (record.id) {
				await deleteNotification(record.id);
			}
		});

		let ids = [];
		let notification = await createNotificationsForUser(notificationParameters);
		ids.push(notification.id);

		notificationParameters = {
			...notificationParameters,
			subject: `${notificationParameters.subject} next`,
		};
		notification = await createNotificationsForUser(notificationParameters);
		ids.push(notification.id);

		let newNotificationParameters = {
			...notificationParameters,
			subject: `${notificationParameters.subject} next`,
			complete: true,
		};
		notification = await createNotificationsForUser(newNotificationParameters);
		await completeNotification(notification.id, notification.user_id);
		ids.push(notification.id);

		let notificationList = await getNotificationsForUser(notificationParameters.user_id);

		expect(notificationList['results'][2]['done_count']).to.be.equal(1);
		expect(notificationList['results'][2]['complete']).to.be.equal(true);

		//cleanup
		await ids.map(async (id) => {
			await deleteNotification(id);
		});
	});
	const createNotificationSetForUser = async (user_id: string) => {
		let validReminderData = {
			user_id: user_id,
			...reminderData,
		};
		const notificationResult = await saveSetFromRequest(validReminderData);
		if (typeof notificationResult !== 'boolean') {
			let today = format(new Date(), 'yyyy-MM-dd');
			let singleNotificationParams = {
				...reminderData.reminders[0],
				notification_date: new Date(today),
				set_id: notificationResult.id,
				user_id: user_id,
			};

			let index = 0;
			let firstNotification = await saveSingleNotificationForSet(singleNotificationParams, index);

			index++;
			let secondNotification = await saveSingleNotificationForSet(singleNotificationParams, index);

			return notificationResult;
		}
	};

	it('notification month for user', async () => {
		//getNotificationInMonthForUser
		let notificationParameters = {
			user_id: '123',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: new Date('2022-08-02'),
			is_active: true,
		};
		await deleteNotificationsForUser(notificationParameters.user_id);

		await createNotificationsForUser(notificationParameters);
		await createNotificationsForUser(notificationParameters);
		await createNotificationsForUser({
			...notificationParameters,
			notification_date: addDays(new Date('2022-08-02'), 5),
			description: 'gfdgfdgfdg',
		});

		//test
		let notificationsByMonth = await getNotificationInMonthForUser(
			notificationParameters.user_id,
			'2022-08',
		);
		expect(notificationsByMonth[0]['notifications']).to.be.equal('2');
		expect(notificationsByMonth[1]['notifications']).to.be.equal('1');

		let notificationByDate = await getNotificationsForUserByDate(
			notificationParameters.user_id,
			new Date('2022-08-02'),
		);
		expect(notificationByDate.total * 1).to.be.equal(2);
		expect(notificationByDate.results[0].subject).to.be.equal(notificationParameters.subject);

		//test notification set
		let notificationSet = await createNotificationSetForUser(notificationParameters.user_id);

		let today = format(new Date(), 'yyyy-MM-dd');

		notificationByDate = await getNotificationsForUserByDate(
			notificationParameters.user_id,
			new Date(today),
		);
		//the link should have data as we just created one
		expect(notificationByDate.results[0].set_link.set_id * 1).to.be.equal(notificationSet.id);
		if (typeof notificationSet !== 'boolean') {
			await deleteNotificationSet(notificationSet.id);
		}

		//clear
		await deleteNotificationsForUser(notificationParameters.user_id);
	});

	it('snoozes notifications depending on cron count', async () => {});
	it('snoozes notifications depending on cron count', async () => {
		let previousDate = addDays(new Date(), -5);

		let notificationParameters = {
			user_id: '123',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'm',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};
		const saveNotificationWithCount = async (notificationParameters, cronCount) => {
			await deleteNotificationsForUser(notificationParameters.user_id);
			let notification = await createNotificationsForUser(notificationParameters);
			let userNotifications = await getPendingNotifications(notificationParameters.user_id);
			let userCurrentNotification = userNotifications[0];
			userCurrentNotification.meta_notifications.cron_snoozed = cronCount;

			const userNotificationsRepository = await getRepository(UserNotifications);
			const result = await userNotificationsRepository.save(userCurrentNotification);
			userNotifications = await getPendingNotifications(notificationParameters.user_id);
			return userNotifications[0];
		};

		let createdNotification = await saveNotificationWithCount(notificationParameters, 5);
		let snoozeResult = await snoozeNotificationObject(createdNotification, true);
		//we shoud snooze around half a month as we have set 5
		if (typeof snoozeResult !== 'boolean') {
			expect(snoozeResult.days >= 14 && snoozeResult.days <= 18).to.equal(true);
		}
		//intentionally error out if the result is boolean
		if (typeof snoozeResult === 'boolean') {
			expect(false).to.equal(true);
		}
		let updatedNotification = await getNotificationById(
			createdNotification.id,
			createdNotification.user_id,
		);

		expect(updatedNotification.meta_notifications.cron_snoozed).to.equal(6);

		createdNotification = await saveNotificationWithCount(notificationParameters, 8);
		await snoozeNotificationObject(createdNotification, true);
		updatedNotification = await getNotificationById(
			createdNotification.id,
			createdNotification.user_id,
		);

		//should be 0 as we its over 8 earlier and it should have reset to 0
		expect(updatedNotification.meta_notifications.cron_snoozed).to.equal(0);

		await deleteNotificationsForUser(notificationParameters.user_id);
	});

	it('join meta notification', async () => {
		let previousDate = addDays(new Date(), -5);

		let notificationParameters = {
			user_id: '123',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};

		await deleteNotificationsForUser(notificationParameters.user_id);

		let notification = await createNotificationsForUser(notificationParameters);
		expect(notification.subject).to.be.equal(notificationParameters.subject);
		await snoozeNotification(notification.id, notification.user_id);
		await completeNotification(notification.id, notification.user_id);

		let results = await getRepository(UserNotifications).findOne({
			relations: ['meta_notifications'],
			where: { id: notification.id },
		});
		expect(results.meta_notifications.done_count).to.be.equal(1);
		expect(results.meta_notifications.user_snoozed).to.be.equal(1);

		//clear
		await deleteNotificationsForUser(notificationParameters.user_id);
	});

	it('get pending notifications', async () => {
		let previousDate = addDays(new Date(), -365);
		let notificationParameters = {
			user_id: '12345',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};
		//too old
		await createNotificationsForUser(notificationParameters);
		//future
		await createNotificationsForUser({
			...notificationParameters,
			notification_date: addDays(new Date(), 1),
		});
		//is pending
		await createNotificationsForUser({
			...notificationParameters,
			notification_date: addDays(new Date(), -5),
		});

		let pendingNotifications = await getPendingNotifications(notificationParameters.user_id);
		expect(pendingNotifications.length).to.be.equal(1);

		await deleteNotificationsForUser(notificationParameters.user_id);
	}).timeout(10000);
	it('snooze notification', async () => {
		let previousDate = addDays(new Date(), -10);
		let notificationParameters = {
			user_id: '12345',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: previousDate,
			is_active: true,
		};

		let notifications = [];
		let createdNotification = await createNotificationsForUser(notificationParameters);
		notifications.push(createdNotification);

		createdNotification = await createNotificationsForUser({
			...notificationParameters,
			notification_date: addDays(new Date(), -5),
		});
		notifications.push(createdNotification);

		createdNotification = await createNotificationsForUser({
			...notificationParameters,
			notification_date: addDays(new Date(), -20),
		});
		notifications.push(createdNotification);

		let pendingNotifications = await getPendingNotifications(notificationParameters.user_id);

		let results = await Promise.all(
			pendingNotifications.map(async (currentNotification) => {
				await snoozeNotification(currentNotification.id, currentNotification.user_id);
				return await getNotificationById(currentNotification.id, currentNotification.user_id);
			}),
		);

		//expect all snoozed dates to be the same as its from the date we snoozed not from the past
		expect(getUnixTime(results[0].notification_date)).to.equal(
			getUnixTime(results[1].notification_date),
		);
		expect(getUnixTime(results[1].notification_date)).to.equal(
			getUnixTime(results[2].notification_date),
		);

		await deleteNotificationsForUser(notificationParameters.user_id);
	}).timeout(10000);
});
