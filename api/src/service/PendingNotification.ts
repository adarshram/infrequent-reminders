import { createConnection, getRepository, getManager } from 'typeorm';

import { getMessagingObject } from '../utils/firebase';
import { establishDatabaseConnection } from '../utils/dataBase';
import {
	getUsersWithPendingNotifications,
	getPendingNotifications,
	snoozeNotificationObject,
} from '../models/UserNotifications';
import { UserNotifications } from '../entity/UserNotifications';
import {
	saveVapidKeyForUser,
	deleteVapidKeyForUser,
	getUsersWithNotificationPreference,
	getVapidKeysForUser,
	getUserProfileWithId,
	getNotificationPreferenceForUser,
} from '../models/UserProfile';
import { sendNotificationMessageToVapidKey, sendNotificationEmail } from '../utils/notification';

export class PendingNotification {
	getUsersWithNotification = async () => {
		let userResults = await getUsersWithPendingNotifications();
		return userResults;
	};
	getPendingNotifications = async (user_id: string) => {
		return getPendingNotifications(user_id);
	};
	send = async (notifications: UserNotifications[], user_id: string): Promise<boolean> => {
		let vapidKeyData = await getVapidKeysForUser(user_id);
		let sentNotification = false;
		if (vapidKeyData) {
			sentNotification = await this.handleVapidKeyNotificationForUser(
				notifications,
				user_id,
				vapidKeyData,
			);
		}

		if (!sentNotification) {
			sentNotification = await this.handleEmailNotificationForUser(notifications, user_id);
		}
		if (sentNotification) {
			let snoozedResults = await Promise.all(
				notifications.map(async (singleNotification) => {
					let cron = true;
					return await snoozeNotificationObject(singleNotification, cron);
				}),
			);
		}
		return sentNotification;
	};

	handleVapidKeyNotificationForUser = async (
		pending: UserNotifications[],
		user_id: string,
		vapidKeyData,
	): Promise<boolean> => {
		if (pending.length === 0) {
			return true;
		}
		let notificationSubject = `You have ${pending.length} Reminders overdue`;
		if (pending.length == 1) {
			notificationSubject = `Your Reminder ${pending[0].subject} is overdue`;
		}
		let successFulKeys = await Promise.all(
			vapidKeyData.vapidKeys
				.map(async (vapidKey) => {
					let { success, errors } = await sendNotificationMessageToVapidKey(
						vapidKey,
						notificationSubject,
					);
					if (success) {
						return true;
					}
					if (!success) {
						if (typeof errors !== 'boolean' && errors.unregistered && errors.unregistered != '') {
							let res = await deleteVapidKeyForUser(user_id, vapidKey);
						}
					}
					return false;
				})
				.filter((v) => v),
		);
		if (successFulKeys.length > 0) {
			return true;
		}

		return false;
	};

	handleEmailNotificationForUser = async (
		pending: UserNotifications[],
		user_id: string,
	): Promise<boolean> => {
		let sendEmail = '';
		let notificationPreference = await getNotificationPreferenceForUser(user_id);
		if (!notificationPreference) {
			return false;
		}
		sendEmail =
			notificationPreference && notificationPreference.email && notificationPreference.email != ''
				? notificationPreference.email
				: '';

		if (sendEmail === '') {
			let userProfile = await getUserProfileWithId(user_id);
			if (!userProfile || !userProfile.email) {
				return false;
			}
			sendEmail = userProfile.email;
		}

		let notificationSubject = `You have ${pending.length} Reminders overdue`;
		if (pending.length == 1) {
			notificationSubject = `Your Reminder ${pending[0].subject} is overdue`;
		}
		let { success, errors } = await sendNotificationEmail(sendEmail, notificationSubject);
		return success;
	};
}