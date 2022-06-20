import { createConnection, getRepository, getManager } from 'typeorm';
import { format, differenceInCalendarDays, subDays } from 'date-fns';
import { NotificationObject } from '../models/UserNotifications';
import { getVapidKeysForUser, deleteVapidKeyForUser } from '../models/UserProfile';
import { calculateSnoozeDate, calculateNextNotification } from '../utils/dateManipulators';
import { getMessagingObject } from '../utils/firebase';
import MetaNotificationsClass from '../models/MetaNotifications';

class DailyUpdates {
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

export default DailyUpdates;
