import { createConnection, getRepository, getManager } from 'typeorm';
import { format, differenceInCalendarDays, subDays } from 'date-fns';
import { NotificationObject } from '../models/UserNotifications';
import {
	saveVapidKeyForUser,
	deleteVapidKeyForUser,
	getUsersWithNotificationPreference,
	getVapidKeysForUser,
} from '../models/UserProfile';
import { calculateSnoozeDate, calculateNextNotification } from '../utils/dateManipulators';
import { getMessagingObject } from '../utils/firebase';
import MetaNotificationsClass from '../models/MetaNotifications';
import { getPendingNotifications } from '../models/UserNotifications';

export const runDailyCron = async () => {
	let users = await getUsersWithNotificationPreference();
	let sendLog = [];
	let notificationSendLog = await Promise.all(
		users.map(async (user) => {
			let notificationSent = await handleDayNotificationsForUser(user);

			return {
				user_id: user.user_id,
				notification_sent: notificationSent,
			};
		}),
	);
	console.log(notificationSendLog);
	return notificationSendLog;
};

const handleDayNotificationsForUser = async (user) => {
	let vapidKeyData = await getVapidKeysForUser(user.user_id);
	let pending = await getPendingNotifications(user.user_id);
	let notificationSubject = `You have ${pending.length} Reminders overdue`;
	if (pending.length == 1) {
		notificationSubject = `Your Reminder ${pending[0].subject} is overdue`;
	}
	if (vapidKeyData) {
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
							let res = await deleteVapidKeyForUser(user.user_id, vapidKey);
						}
					}
					return false;
				})
				.filter((v) => v),
		);
		if (successFulKeys.length > 0) {
			return true;
		}
	}
	return false;
};
export const sendNotificationMessageToVapidKey = async (vapidKey, notificationMessage) => {
	let messsagingObject = await getMessagingObject();

	const message = {
		data: {
			notificationMessage: 'Hello',
		},
		notification: {
			title: 'You have a Notification',
			body: notificationMessage,
		},
		webpush: {
			fcm_options: {
				link: `http://localhost:3006/pending`,
			},
		},
		token: vapidKey,
	};
	let success = false;
	let errors = { unregistered: '', code: '' };
	try {
		let sendResults = await messsagingObject.send(message);
		success = true;
		return { success, errors };
	} catch (err) {
		const isTokenUnregistered =
			err.errorInfo && err.errorInfo.code === 'messaging/registration-token-not-registered';
		if (isTokenUnregistered) {
			errors.unregistered = 'Unregistered Token';
		}
		success = false;
		errors.code = err.errorInfo && err.errorInfo.code ? err.errorInfo.code : 'Unknown error';
	}
	return { success, errors };
};
export const sendNotificationToVapidKey = async (vapidKey, notification) => {
	let messsagingObject = await getMessagingObject();
	let { id, user_id, subject, notification_date } = notification;
	let notificationMessage = `Your ${subject} is due today`;
	const message = {
		data: {
			notificationMessage: 'Hello',
		},
		notification: {
			title: 'You have a Notification',
			body: notificationMessage,
		},
		webpush: {
			fcm_options: {
				link: `http://localhost:3006/create/${id}`,
			},
		},
		token: vapidKey,
	};
	try {
		let sendResults = await messsagingObject.send(message);
		return true;
	} catch (err) {
		const isTokenUnregistered =
			err.errorInfo && err.errorInfo.code === 'messaging/registration-token-not-registered';
		if (isTokenUnregistered) {
			let res = await deleteVapidKeyForUser(user_id, vapidKey);
			if (res) {
				console.log(`Deleted Vapid Key ${vapidKey}`);
				return true;
			}
		}
		console.log(err);
		return false;
	}
};

/*export class DailyUpdates {
	run = async () => {
		await createConnection();
		let notificationObject = NotificationObject();
		let pendingNotifications = await notificationObject.pendingNotifications();

		if (pendingNotifications.total > 0) {
			pendingNotifications.data.map(async (notification) => {
				await this.sendNotificationToUser(notification);
				let snoozeResults = await this.updateSnoozeLog(notification);
				let snoozedNotification = this.getSnoozedNotification(notification);
				await notificationObject.saveNotification(snoozedNotification);
			});
		}
	};

	updateSnoozeLog = async (notification) => {
		let metaObject = new MetaNotificationsClass();
		metaObject.setUserId(notification.user_id);
		let results = await metaObject.updateCronSnooze(notification.id);
		return results;
	};

	sendNotificationToUser = async (notification) => {
		let { user_id } = notification;
		let vapidKeyData = await getVapidKeysForUser(user_id);
		if (!vapidKeyData) {
			return false;
		}
		if (!vapidKeyData.vapidKeys.length) {
			return false;
		}

		vapidKeyData.vapidKeys.map(async (vapidKey) => {
			await this.sendNotificationToVapidKey(vapidKey, notification);
		});
	};

	sendNotificationToVapidKey = async (vapidKey, notification) => {
		let messsagingObject = await getMessagingObject();
		let { id, user_id, subject, notification_date } = notification;
		let notificationMessage = `Your ${subject} is due today`;
		const message = {
			data: {
				notificationMessage: 'Hello',
			},
			notification: {
				title: 'You have a Notification',
				body: notificationMessage,
			},
			webpush: {
				fcm_options: {
					link: `http://localhost:3006/create/${id}`,
				},
			},
			token: vapidKey,
		};
		try {
			let sendResults = await messsagingObject.send(message);
			return true;
		} catch (err) {
			const isTokenUnregistered =
				err.errorInfo && err.errorInfo.code === 'messaging/registration-token-not-registered';
			if (isTokenUnregistered) {
				let res = await deleteVapidKeyForUser(user_id, vapidKey);
				if (res) {
					console.log(`Deleted Vapid Key ${vapidKey}`);
					return true;
				}
			}
			console.log(err);
			return false;
		}
	};

	getSnoozedNotification = (notification) => {
		let { frequency_type, frequency, notification_date } = notification;
		let snoozeDateResult = calculateSnoozeDate(notification_date, frequency, frequency_type);
		notification.notification_date = snoozeDateResult.date;
		return notification;
	};
}
*/
