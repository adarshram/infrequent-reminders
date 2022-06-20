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
} from './../../src/models/UserNotifications';

import { differenceInCalendarDays } from 'date-fns';
import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';

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

	xit('deletes all dummy notifications', async () => {});
	it('marks notification as done', async () => {
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
				console.log(results);
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
		let notificationParameters = {
			user_id: '123',
			subject: '12312312',
			description: 'scdsacsac',
			frequency_type: 'w',
			frequency: 1,
			notification_date: new Date(),
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

		//cleanup
		if (notification.id) {
			await deleteNotification(notification.id);
		}
	});
});
