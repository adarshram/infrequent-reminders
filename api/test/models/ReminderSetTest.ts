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
import { deleteNotification, getNotificationById } from './../../src/models/UserNotifications';

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

	xit('deletes notification from set', async () => {
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
			if (typeof firstNotification !== 'boolean') {
				await deleteNotificationFromSet(firstNotification.id);
			}
			if (typeof secondNotification !== 'boolean') {
				await deleteNotificationFromSet(secondNotification.id);
			}
			//start test
			await deleteSet(notificationResult.id);
			let hasNotification = await getSetById(notificationResult.id);
			expect(!hasNotification).to.be.equal(true);
			let linkedReminders = await getLinkedReminders(notificationResult.id);
			expect(linkedReminders.length).to.be.equal(0);
		}
	});
	xit('gets reminder set data and reminders', async () => {
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
			await saveSingleNotificationForSet(singleNotificationParams, index);
			index = 1;
			await saveSingleNotificationForSet(singleNotificationParams, index);

			let notificationSet = await getSetById(notificationResult.id);
			let linkedReminders = await getLinkedReminders(notificationResult.id);

			expect(notificationSet.subject).to.be.equal(validReminderData.subject);
			expect(linkedReminders.length).to.be.equal(2);

			await deleteNotificationSet(notificationResult.id);
		}
	});
	xit('saves reminder set subject and description', async () => {
		let validReminderData = {
			...reminderData,
		};
		const notificationResult = await saveSetFromRequest(validReminderData);
		expect(notificationResult).to.not.be.equal(false);
		if (typeof notificationResult !== 'boolean') {
			expect(notificationResult.id).to.be.a('number');
			expect(notificationResult.user_id).to.be.equal(validReminderData.user_id);
			const deleted = await deleteNotificationSet(notificationResult.id);
			expect(deleted).to.equal(true);
		}
	});
	xit('update reminder set subject and description', async () => {
		let invalidReminderData = {
			...reminderData,
			id: 1231231,
		};

		let notificationResult = await saveSetFromRequest(invalidReminderData);
		expect(notificationResult).to.be.equal(false);
		let validReminderData = {
			...reminderData,
			subject: 'Hello There ' + new Date().getTime(),
		};
		let validNotificationResult = await saveSetFromRequest(validReminderData);
		expect(validNotificationResult).to.not.be.equal(false);
		if (typeof validNotificationResult !== 'boolean') {
			let validUpdatedReminderData = {
				...validReminderData,
				id: validNotificationResult.id,
				subject: 'Hello There ' + new Date().getTime(),
			};
			let validNotificationResultUpdated = await saveSetFromRequest(validUpdatedReminderData);
			expect(validNotificationResultUpdated).to.not.be.equal(false);
			if (typeof validNotificationResultUpdated !== 'boolean') {
				expect(validNotificationResultUpdated.id).to.be.a('number');
				expect(validNotificationResultUpdated.subject).to.be.equal(
					validUpdatedReminderData.subject,
				);
				deleteSet(validNotificationResultUpdated.id);
			}
		}
	});

	xit('save link set and reminders', async () => {
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
			let singleNotificationResult = await saveSingleNotificationForSet(
				singleNotificationParams,
				index,
			);
			if (typeof singleNotificationResult !== 'boolean') {
				let userNotification = await getNotificationById(
					singleNotificationResult.id,
					reminderData.user_id,
				);
				const deleted = await deleteNotificationSet(notificationResult.id);
				userNotification = await getNotificationById(
					singleNotificationResult.id,
					reminderData.user_id,
				);
				expect(typeof userNotification).to.be.equal('undefined');
			}
		}
	});

	xit('get column list', async () => {
		let userId = '83zkNxe3BtSpXsFgxrDgw49ktWj2';
		const responseData = await getSetList(userId);
		expect(responseData.data[0].user_id).to.be.equal(userId);
		expect(responseData.data[0].no_sets).to.be.a('number');
	});
	it('delete everything', async () => {
		const responseData = await getSetList('123');
		responseData.data.map(async (notificationSet) => {
			const deleted = await deleteNotificationSet(notificationSet.id);
		});
	});
});
