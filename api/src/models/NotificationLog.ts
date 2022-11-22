import { getRepository, getManager, MoreThanOrEqual } from 'typeorm';

import { UserNotifications } from '../entity/UserNotifications';
import { NotificationLog } from '../entity/NotificationLog';

export const getNotificationLogForUser = async (
	user_id: string,
): Promise<[NotificationLog[], number]> => {
	let userNotificationLog = await getRepository(NotificationLog).findAndCount({
		relations: ['user_notifications'],
		where: { user_id: user_id },
		take: 10,
		skip: 0,
	});
	//: Promise<[NotificationLog[], number]>
	return userNotificationLog;
};

export const deleteNotificationLog = async (
	userNotificationLog: NotificationLog,
): Promise<boolean> => {
	if (userNotificationLog) {
		let deleted = await getRepository(NotificationLog).remove(userNotificationLog);
		return true;
	}
	return false;
};
export const createRecordFromNotification = async (
	linkedNotification: UserNotifications,
	sendType: string,
): Promise<NotificationLog> => {
	let notificationLog = new NotificationLog();
	notificationLog.user_notifications = linkedNotification;
	notificationLog.user_id = linkedNotification.user_id;
	notificationLog.created_at = new Date();
	notificationLog.updated_at = new Date();
	notificationLog.send_type = sendType;

	await getRepository(NotificationLog).save(notificationLog);

	return notificationLog;
};
