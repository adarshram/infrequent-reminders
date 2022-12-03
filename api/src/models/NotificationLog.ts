import { getRepository, getManager, MoreThanOrEqual, Raw, LessThanOrEqual, Between } from 'typeorm';

import { UserNotifications } from '../entity/UserNotifications';
import { NotificationLog } from '../entity/NotificationLog';
import { format, addDays } from 'date-fns';

export const getNotificationLogForUser = async (
	user_id: string,
	offset?: number,
	limit?: number,
): Promise<[NotificationLog[], number]> => {
	let userNotificationLog = await getRepository(NotificationLog).findAndCount({
		relations: ['user_notifications'],
		where: { user_id: user_id },
		order: {
			created_at: 'DESC',
		},
		take: limit ?? 10,
		skip: offset ?? 0,
	});

	return userNotificationLog;
};

export const getNotificationsByDate = async (
	date: Date,
	userId?: string,
): Promise<NotificationLog[]> => {
	type WhereConstraintInterface = { created_at: any; user_id?: string };

	let whereConstraints: WhereConstraintInterface = {
		created_at: MoreThanOrEqual(date),
	};
	if (userId) {
		whereConstraints = {
			...whereConstraints,
			user_id: userId,
		};
	}

	let userNotificationLog = await getRepository(NotificationLog).find({
		where: whereConstraints,
		order: {
			created_at: 'DESC',
		},
	});
	return userNotificationLog;
};
export const getNotificationsForToday = async (userId: string): Promise<UserNotifications[]> => {
	//: Promise<UserNotifications[]>
	let today = new Date();
	let nextDay = addDays(today, 1);
	let whereConstraints = {
		created_at: Between(today, nextDay),
		user_id: userId,
	};
	let userNotificationLog = await getRepository(NotificationLog).find({
		relations: ['user_notifications'],
		where: whereConstraints,
		order: {
			created_at: 'DESC',
		},
	});

	let userNotifications = userNotificationLog.map((currentNotificationLog) => {
		return currentNotificationLog.user_notifications;
	});

	return userNotifications;
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
