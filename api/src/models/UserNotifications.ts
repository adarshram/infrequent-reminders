import { getRepository, getManager } from 'typeorm';
import {
	format,
	differenceInDays,
	addWeeks,
	addMonths,
	addDays,
	subDays,
	compareAsc,
	isBefore,
	endOfMonth,
	startOfMonth,
} from 'date-fns';
import { calculateSnoozeDate, calculateNextNotification } from '../utils/dateManipulators';

import { UserNotifications } from '../entity/UserNotifications';
import { NotificationSetLink } from '../entity/NotificationSetLink';
import { MetaNotifications } from '../entity/MetaNotifications';

import MetaNotificationsClass from '../models/MetaNotifications';
import { whereByColumns, getById } from '../models/GenericModel';

interface ReturnResults {
	total: number;
	results: Array<NotificationObject>;
}

interface NotificationParameters {
	id?: number | boolean;
	user_id: string;
	subject: string;
	description: string;
	frequency_type: string;
	frequency: number;
	notification_date: Date;
	is_active?: boolean;
}
export interface NotificationObject extends UserNotifications {
	isPending?: boolean;
}

export interface NotificationObjectOld {
	id: number;
	user_id: string;
	subject: string;
	description: string;
	frequency_type: string;
	frequency: number;
	notification_date: Date;
	isPending?: boolean;
	is_active: boolean;
	created_at: Date;
	updated_at: Date;
	meta: MetaNotifications;
}

interface NotificationMonthResults {
	notifications: number;
	notification_date: Date;
}

export const getNotificationInMonthForUser = async (
	user_id: string,
	dateString: string,
): Promise<NotificationMonthResults[]> => {
	let startDate = startOfMonth(new Date(dateString));

	let endDate = endOfMonth(new Date(dateString));
	let notifications = await getManager()
		.createQueryBuilder(UserNotifications, 'up')
		.where('up.user_id = :user_id', { user_id: user_id })
		.andWhere('up.notification_date >= :startDate', { startDate: startDate })
		.andWhere('up.notification_date <= :endDate', { endDate: endDate })
		.andWhere('up.is_active = :is_active', { is_active: 1 })
		.groupBy('up.notification_date')
		.select('count(up.*) as notifications,up.notification_date')
		.getRawMany();
	return notifications;
};
export const getNotificationsForUserByDate = async (
	user_id: String,
	notification_date?: Date,
): Promise<ReturnResults> => {
	const userNotificationsRepository = await getRepository(UserNotifications);
	let baseQuery = await userNotificationsRepository
		.createQueryBuilder('up')
		.select('count(up.*)', 'total')
		.where('up.user_id = :user_id', { user_id: user_id })
		.andWhere('up.is_active = :is_active', { is_active: 1 });
	if (notification_date) {
		baseQuery = baseQuery.andWhere('up.notification_date = :notification_date', {
			notification_date: notification_date,
		});
	}
	let { total } = await baseQuery.select('count(up.*)', 'total').getRawOne();
	let notifications = [];
	if (total > 0) {
		let baseListQuery = await getManager()
			.createQueryBuilder(UserNotifications, 'up')
			.leftJoinAndMapOne('up.meta', MetaNotifications, 'meta', 'meta.notification_id = up.id')
			.where('up.user_id = :user_id', { user_id: user_id })
			.andWhere('up.is_active = :is_active', { is_active: 1 });
		if (notification_date) {
			baseListQuery = baseListQuery.andWhere('up.notification_date = :notification_date', {
				notification_date: notification_date,
			});
		}
		notifications = await baseListQuery.getMany();
	}
	let today = new Date();
	let controllerFormattedNotifications = notifications.map(function (notification) {
		notification.is_pending = isBefore(notification.notification_date, today);
		notification.snooze_count = 0;
		notification.done_count = 0;
		if (notification.meta) {
			let meta = notification.meta;
			notification.snooze_count = meta.cron_snoozed + meta.user_snoozed;
			notification.done_count = meta.done_count;
		}
		return notification;
	});

	return {
		total: total,
		results: controllerFormattedNotifications,
	};
};

export const getNotificationsForUser = async (user_id: String): Promise<ReturnResults> => {
	const userNotificationsRepository = await getRepository(UserNotifications);

	let { total } = await userNotificationsRepository
		.createQueryBuilder('up')
		.select('count(up.*)', 'total')
		.where('up.user_id = :user_id', { user_id: user_id })
		.andWhere('up.is_active = :is_active', { is_active: 1 })
		.getRawOne();
	let notifications = [];
	if (total > 0) {
		notifications = await getManager()
			.createQueryBuilder(UserNotifications, 'up')
			.leftJoinAndMapOne('up.meta', MetaNotifications, 'meta', 'meta.notification_id = up.id')
			.where('up.user_id = :user_id', { user_id: user_id })
			.andWhere('up.is_active = :is_active', { is_active: 1 })
			.getMany();
	}
	let today = new Date();
	let controllerFormattedNotifications = notifications.map(function (notification) {
		notification.is_pending = isBefore(notification.notification_date, today);
		notification.snooze_count = 0;
		notification.done_count = 0;
		if (notification.meta) {
			let meta = notification.meta;
			notification.snooze_count = meta.cron_snoozed + meta.user_snoozed;
			notification.done_count = meta.done_count;
		}
		return notification;
	});

	return {
		total: total,
		results: controllerFormattedNotifications,
	};
};

export const getNotificationById = async (
	id: number,
	user_id: String,
): Promise<NotificationObject> => {
	let notifications = await getRepository(UserNotifications).findOne({
		relations: ['meta_notifications'],
		where: { id: id, user_id: user_id },
	});

	if (!notifications.meta_notifications) {
		let meta_notifications = new MetaNotifications();
		meta_notifications.user_id = user_id as string;
		meta_notifications.cron_snoozed = 0;
		meta_notifications.user_snoozed = 0;
		meta_notifications.done_count = 0;
		meta_notifications.updated_at = new Date();
		notifications.meta_notifications = meta_notifications;
		await getRepository(UserNotifications).save(notifications);
		notifications = await getRepository(UserNotifications).findOne({
			relations: ['meta_notifications'],
			where: { id: id, user_id: user_id },
		});
	}

	if (notifications) {
		let isPending = differenceInDays(new Date(), new Date(notifications.notification_date)) > 0;
		let returnNotifications = {
			...notifications,
			isPending: isPending,
		};
		return returnNotifications;
	}
	return notifications;
};

const getEmptyMetaNotification = (user_id: string) => {
	let meta_notifications = new MetaNotifications();
	meta_notifications.user_id = user_id;
	meta_notifications.cron_snoozed = 0;
	meta_notifications.user_snoozed = 0;
	meta_notifications.done_count = 0;
	meta_notifications.updated_at = new Date();
	return meta_notifications;
};

export const createNotificationsForUser = async (
	parameters: NotificationParameters,
): Promise<NotificationObject> => {
	const {
		id,
		user_id,
		subject,
		description,
		frequency_type,
		frequency,
		notification_date,
		is_active,
	} = parameters;

	let userNotification = new UserNotifications();
	if (typeof id == 'number') {
		userNotification = await getNotificationById(id, user_id);
	}

	userNotification.user_id = user_id;
	userNotification.subject = subject;
	userNotification.description = description;
	userNotification.frequency_type = frequency_type;
	userNotification.frequency = frequency;
	userNotification.notification_date = notification_date;
	userNotification.meta_notifications = getEmptyMetaNotification(user_id);
	userNotification.is_active = is_active ? true : false;

	if (!userNotification.id) {
		userNotification.created_at = new Date();
	}
	userNotification.updated_at = new Date();

	const userNotificationsRepository = await getRepository(UserNotifications);
	const result = await userNotificationsRepository.save(userNotification);

	return result;
};

export const deleteNotification = async (id: number): Promise<boolean> => {
	const userNotificationsRepository = await getRepository(UserNotifications);
	let deleted = await userNotificationsRepository
		.createQueryBuilder()
		.delete()
		.from(UserNotifications)
		.where('id = :id', { id: id })
		.execute();

	if (deleted.affected) {
		let metaObject = new MetaNotificationsClass();
		await metaObject.deleteByNotificationId(id);

		return true;
	}
	return false;
};
interface RepositoryObject {
	createQueryBuilder: Function;
}
interface QueryObject {
	getMany: Function;
	getRawOne: Function;
	getOne: Function;
	select: Function;
}

const generatePendingNotificationQuery = (
	userNotificationsRepository: RepositoryObject,
	user_id: string,
): QueryObject => {
	let today = new Date();
	let beforeHalfYear = subDays(today, 180);
	let notificationsQuery = userNotificationsRepository
		.createQueryBuilder('up')
		.where('up.notification_date >= :startDate', { startDate: beforeHalfYear })
		.andWhere('up.notification_date <= :endDate', { endDate: today })
		.andWhere('up.user_id = :user_id', { user_id: user_id })
		.andWhere('up.is_active = :is_active', { is_active: 1 });
	return notificationsQuery;
};

export const getPendingNotifications = async (user_id: string): Promise<NotificationObject[]> => {
	const userNotificationsRepository = await getRepository(UserNotifications);
	const query = generatePendingNotificationQuery(userNotificationsRepository, user_id);
	const notifications = await query.getMany();

	return notifications;
};

export const getPendingNotificationCount = async (user_id: string): Promise<number | boolean> => {
	const userNotificationsRepository = await getRepository(UserNotifications);
	const query = generatePendingNotificationQuery(userNotificationsRepository, user_id);

	const { total } = await query.select('count(up.*)', 'total').getRawOne();
	const results = parseInt(total);

	if (results) {
		return results;
	}
	return false;
};
interface DateReturn {
	date: Date;
	days: number;
}
export const snoozeNotification = async (
	id: number,
	user_id: string,
): Promise<DateReturn | boolean> => {
	let notification = await getNotificationById(id, user_id);
	let { frequency_type, frequency, notification_date } = notification;
	//notification date should be before today to snooze as you dont snooze in the future
	if (compareAsc(new Date(), notification_date) === -1) {
		return false;
	}
	let snoozeDateResult = calculateSnoozeDate(notification_date, frequency, frequency_type);
	notification.notification_date = snoozeDateResult.date;
	notification.meta_notifications.user_snoozed = notification.meta_notifications.user_snoozed + 1;
	const userNotificationsRepository = await getRepository(UserNotifications);
	const result = await userNotificationsRepository.save(notification);
	return snoozeDateResult;
};

export const completeNotification = async (id: number, user_id: string): Promise<DateReturn> => {
	const isSetNotification = await isNotificationInSet(id);
	if (isSetNotification) {
		let results = await completeLinkedSetIfPresent(id);
		return results;
	}
	return await completeSingleNotification(id, user_id);
};

export const uncompleteNotification = async (
	id: number,
	user_id: string,
): Promise<UserNotifications> => {
	let notification = await getNotificationById(id, user_id);
	notification.updated_at = new Date();
	const userNotificationsRepository = await getRepository(UserNotifications);
	await userNotificationsRepository.save(notification);
	return notification;
};

export const completeSingleNotification = async (
	id: number,
	user_id: string,
): Promise<DateReturn> => {
	let notification = await getNotificationById(id, user_id);
	let { frequency_type, frequency, notification_date } = notification;

	//Set the notification_date as current date if its in the past else use the future notification date
	if (compareAsc(new Date(), notification_date) >= 0) {
		notification_date = new Date();
	}

	let nextNotificationResult = calculateNextNotification(
		notification_date,
		frequency,
		frequency_type,
	);
	notification.notification_date = nextNotificationResult.date;
	notification.meta_notifications.done_count = notification.meta_notifications.done_count + 1;
	const userNotificationsRepository = await getRepository(UserNotifications);
	const result = await userNotificationsRepository.save(notification);
	return nextNotificationResult;
};

interface SelectResults {
	total: number;
	data: Array<any>;
}

export const NotificationObjectChanged = () => {
	const pendingNotificationsQuery = async () => {
		let today = new Date();
		let lastWeek = subDays(today, 70);
		let repository = await getRepository(UserNotifications);
		let notificationsQuery = repository
			.createQueryBuilder('up')
			.where('up.notification_date >= :startDate', { startDate: lastWeek })
			.andWhere('up.notification_date <= :endDate', { endDate: today });
		return notificationsQuery;
	};

	const pendingNotifications = async (): Promise<SelectResults> => {
		let query = await pendingNotificationsQuery();
		let results = await query.getMany();
		query.select('count(up.*)', 'total');
		let { total } = await query.getRawOne();

		return {
			total: parseInt(total),
			data: results,
		};
	};

	const saveNotification = async (notification) => {
		let repository = await getRepository(UserNotifications);
		const result = await repository.save(notification);
		return result;
	};

	return {
		pendingNotifications: pendingNotifications,
		saveNotification: saveNotification,
	};
};

export const completeLinkedSetIfPresent = async (id: number): Promise<DateReturn> => {
	let isAllowed = await isNotificationInSet(id);
	if (!isAllowed) {
		return undefined;
	}
	const userNotificationsRepository = await getRepository(UserNotifications);

	let mainNotification = await getById(UserNotifications, id);
	if (mainNotification && mainNotification instanceof UserNotifications) {
		mainNotification.is_active = false;
		mainNotification.updated_at = new Date();
		if (mainNotification.meta_notifications) {
			mainNotification.meta_notifications.done_count =
				mainNotification.meta_notifications.done_count + 1;
		}
		await userNotificationsRepository.save(mainNotification);

		let linkedNotification = await getLinkedNotificationByNotificationId(mainNotification.id);
		linkedNotification.complete = true;
		linkedNotification.updated_at = new Date();
		const notificationSetLinkRepository = await getRepository(NotificationSetLink);
		await notificationSetLinkRepository.save(linkedNotification);
	}
	let nextNotificationInSet = await getNextNotificationFromSet(id);
	if (!nextNotificationInSet) {
		return {
			date: new Date(),
			days: 0,
		};
	}
	let nextNotification = await getById(
		UserNotifications,
		nextNotificationInSet.user_notification_id,
	);
	if (!nextNotification || !(nextNotification instanceof UserNotifications)) {
		return undefined;
	}
	nextNotification.notification_date = nextNotificationInSet.nextDate;
	nextNotification.is_active = true;
	nextNotification.updated_at = new Date();

	await userNotificationsRepository.save(nextNotification);
	let days = differenceInDays(nextNotification.notification_date, new Date());
	return {
		date: nextNotification.notification_date,
		days: days,
	};
};

interface NextNotificationInSet {
	user_notification_id?: number;
	set_id?: number;
	nextDate?: Date;
}

export const getNextNotificationFromSet = async (id: number): Promise<any> => {
	let mainNotification = await getById(UserNotifications, id);

	if (!mainNotification || !(mainNotification instanceof UserNotifications)) {
		return undefined as NextNotificationInSet;
	}
	let result = await getLinkedNotificationByNotificationId(mainNotification.id);
	if (result) {
		let order = result.order;

		let nextResult = await getRepository(NotificationSetLink)
			.createQueryBuilder('sl')
			.where('sl.set_id = :set_id', { set_id: result.set_id })
			.andWhere('sl.order > :order', { order: order })
			.getOne();

		if (!nextResult) {
			return undefined as NextNotificationInSet;
		}

		let today = new Date();
		let isBeforeDate = isBefore(mainNotification.notification_date, today);
		let fromNotificationDate = mainNotification.notification_date;
		if (isBeforeDate) {
			fromNotificationDate = today;
		}
		let nextDate = addDays(fromNotificationDate, nextResult.days_after);
		return {
			user_notification_id: nextResult.user_notification_id,
			set_id: nextResult.set_id,
			nextDate: nextDate,
		};
	}
	return undefined as NextNotificationInSet;
};

const getLinkedNotificationByNotificationId = async (id: number): Promise<NotificationSetLink> => {
	let result = await getRepository(NotificationSetLink)
		.createQueryBuilder('sl')
		.where('sl.user_notification_id = :user_notification_id', {
			user_notification_id: id,
		})
		.getOne();
	return result;
};

export const isNotificationInSet = async (id: number): Promise<boolean> => {
	let mainNotification = await getById(UserNotifications, id);
	if (!mainNotification || !(mainNotification instanceof UserNotifications)) {
		return false;
	}
	let result = await getLinkedNotificationByNotificationId(mainNotification.id);
	if (result) {
		return true;
	}
	return false;
};
