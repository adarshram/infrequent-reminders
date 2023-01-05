import { createConnection, getRepository, getManager } from 'typeorm';

import { getMessagingObject } from '../utils/firebase';
import { establishDatabaseConnection } from '../utils/dataBase';
import {
	getUsersWithPendingNotifications,
	getPendingNotifications,
	snoozeNotificationObject,
} from '../models/UserNotifications';
import { createRecordFromNotification } from '../models/NotificationLog';
import { UserNotifications } from '../entity/UserNotifications';
import {
	saveVapidKeyForUser,
	getUsersWithNotificationPreference,
	getVapidKeysForUser,
	getUserProfileWithId,
	getNotificationPreferenceForUser,
} from '../models/UserProfile';
import * as userVapidKeys from '../models/UserVapidKeys';

import { sendNotificationMessageToVapidKey, sendNotificationEmail } from '../utils/notification';
import { getCredentialsByKey } from '../models/SystemCredentials';

export class PendingNotification {
	getUsersWithNotification = async () => {
		let userResults = await getUsersWithPendingNotifications();
		return userResults;
	};

	getPendingNotifications = async (user_id: string) => {
		return getPendingNotifications(user_id);
	};

	send = async (notifications: UserNotifications[], user_id: string): Promise<boolean> => {
		let userKeys = await userVapidKeys.getKeysForUser(user_id);

		let sentNotification = false;
		if (userKeys && notifications.length > 0) {
			let notificationDevices = userKeys[0].devices.filter(
				(currentDevice) => !currentDevice.isEmail,
			);
			let emailDevices = userKeys[0].devices.filter(
				(currentDevice) => currentDevice.isEmail === true,
			);

			let deviceNotification = await this.handleVapidKeyNotificationForUser(
				notifications,
				user_id,
				notificationDevices,
			);
			await this.updateLogWithSendType(
				notifications,
				deviceNotification ? 'Device Notification' : 'Device Notification Failed',
			);
			let emailNotification = await this.sendEmailNotifications(
				notifications,
				user_id,
				emailDevices,
			);
			await this.updateLogWithSendType(
				notifications,
				emailNotification ? 'Email Notification' : 'Email Notification Failed',
			);
			sentNotification = deviceNotification || emailNotification;
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

	updateLogWithSendType = async (notificationArray: UserNotifications[], sendType: string) => {
		let createdArray = await Promise.all(
			notificationArray.map(async (currentNotification) => {
				let created = await createRecordFromNotification(currentNotification, sendType);
				return created;
			}),
		);

		return createdArray;
	};

	handleVapidKeyNotificationForUser = async (
		pending: UserNotifications[],
		user_id: string,
		notificationDevices: Array<any>,
	): Promise<boolean> => {
		if (pending.length === 0) {
			return true;
		}
		let notificationSubject = `You have ${pending.length} Reminders overdue`;
		if (pending.length == 1) {
			notificationSubject = `Your Reminder ${pending[0].subject} is overdue`;
		}

		let successFulKeys = await Promise.all(
			notificationDevices
				.map(async (device) => {
					if (device.enabled) {
						let { success, errors } = await sendNotificationMessageToVapidKey(
							device.vapidKey,
							notificationSubject,
						);
						if (success) {
							return true;
						}
						if (!success) {
							if (typeof errors !== 'boolean' && errors.unregistered && errors.unregistered != '') {
								let res = await userVapidKeys.deleteDeviceForUser(user_id, device.vapidKey);
							}
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
	sendEmailNotifications = async (
		pending: UserNotifications[],
		user_id: string,
		emailDevices: Array<any>,
	) => {
		let emailSucessfulKeys = await Promise.all(
			emailDevices
				.map(async (device) => {
					if (device.enabled && device.email) {
						let success = await this.handleEmailNotificationForUser(pending, user_id, device.email);

						if (success) {
							return true;
						}
					}
					return false;
				})
				.filter((v) => v),
		);
		if (emailSucessfulKeys.length > 0) {
			return true;
		}

		return false;
	};
	handleEmailNotificationForUser = async (
		pending: UserNotifications[],
		user_id: string,
		emailAddress?: string,
	): Promise<boolean> => {
		let sendEmail = emailAddress;
		if (!emailAddress) {
			let userProfile = await getUserProfileWithId(user_id);
			if (!userProfile) {
				return false;
			}
			sendEmail =
				userProfile && userProfile.email && userProfile.email != '' ? userProfile.email : '';
		}
		if (sendEmail === '') {
			return false;
		}
		let notificationSubject = `You have ${pending.length} Reminders overdue`;
		if (pending.length == 1) {
			notificationSubject = `Your Reminder ${pending[0].subject} is overdue`;
		}
		let upcomingUrl = await this.getUpcomingUrl();
		let notificationMessage = `Click <a href="${upcomingUrl}">here</a> to see your reminders`;

		let { success, errors } = await sendNotificationEmail(
			sendEmail,
			notificationSubject,
			notificationMessage,
		);
		return success;
	};

	getUpcomingUrl = async (): Promise<string> => {
		const baseUrlData = await getCredentialsByKey('base_url');
		const baseUrl = baseUrlData ? baseUrlData.settings_value : 'http://localhost:3006/';
		return `${baseUrl}upcoming`;
	};
}
