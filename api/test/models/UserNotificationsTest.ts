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
	getNotificationsForUser,
	uncompleteNotification,
	getNotificationInMonthForUser,
	getNotificationsForUserByDate,
} from './../../src/models/UserNotifications';
import MetaNotificationsClass from './../../src/models/MetaNotifications';

import { differenceInCalendarDays, addDays } from 'date-fns';
import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';

import { MetaNotifications } from './../../src/entity/MetaNotifications';
import { UserNotifications } from './../../src/entity/UserNotifications';
import { getRepository, getManager } from 'typeorm';

before(async () => {
	await createConnection();
});

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
		let idsToDelete = notificationListToClear.results.map(async (record) => {
			if (record.id) {
				await deleteNotification(record.id);
			}
		});
	};

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
	xit('notification month for user', async () => {
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

		//clear
		await deleteNotificationsForUser(notificationParameters.user_id);
	});

	xit('notification month for user', async () => {
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
		let notificationByDate = await getNotificationsForUserByDate(
			notificationParameters.user_id,
			new Date('2022-08-02'),
		);
		console.log(notificationByDate);

		//clear
		await deleteNotificationsForUser(notificationParameters.user_id);
	});
	it('join meta notification', async () => {
		let previousDate = addDays(new Date(), -5);
		console.log(previousDate);

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

		/*let results = await getRepository(MetaNotifications)
			.createQueryBuilder('mn')

			.leftJoinAndSelect('mn.user_notifications', 'user_notifications')
			.getMany();
		let results = await getRepository(MetaNotifications).find({
			relations: ['user_notifications'],
			where: { id: 114 },
		});*/

		let results = await getRepository(UserNotifications).findOne({
			relations: ['meta_notifications'],
			where: { id: notification.id },
		});
		expect(results.meta_notifications.done_count).to.be.equal(1);
		expect(results.meta_notifications.user_snoozed).to.be.equal(1);

		//clear
		await deleteNotificationsForUser(notificationParameters.user_id);
	});
});
