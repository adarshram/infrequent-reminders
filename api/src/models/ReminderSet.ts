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
} from 'date-fns';
import { calculateSnoozeDate, calculateNextNotification } from '../utils/dateManipulators';
import { NotificationSet } from '../entity/NotificationSet';
import {
	getById,
	deleteById,
	whereByColumnWithCount,
	ResponseColumn,
} from '../models/GenericModel';
import { NotificationSetLink } from '../entity/NotificationSetLink';
import { UserNotifications } from '../entity/UserNotifications';
import { MetaNotifications } from '../entity/MetaNotifications';

import { deleteNotification } from '../models/UserNotifications';

import {
	createNotificationsForUser,
	NotificationObject,
	getNotificationById,
} from '../models/UserNotifications';

interface SaveSetParameters {
	id?: number | boolean;
	subject: string;
	description: string;
	reminders?: Array<object>;
	user_id: string;
}

export const saveSetFromRequest = async (
	reminderData: SaveSetParameters,
): Promise<NotificationSet | boolean> => {
	let notificationSet = new NotificationSet();
	if (reminderData.id && typeof reminderData.id === 'number') {
		notificationSet = await getById(NotificationSet, reminderData.id);
		if (!notificationSet) {
			console.log('returning false');
			return false;
		}
	}
	notificationSet.subject = reminderData.subject ?? '';
	notificationSet.user_id = reminderData.user_id ?? '12312312';
	notificationSet.description = reminderData.description ?? 'No Description';
	notificationSet.created_at = new Date();
	notificationSet.updated_at = new Date();

	const notificationSetRepository = await getRepository(NotificationSet);
	const result = await notificationSetRepository.save(notificationSet);
	return result;
};

export const deleteNotificationSet = async (id: number): Promise<boolean> => {
	let notifications = await getLinkedReminders(id);
	if (notifications) {
		notifications.map(async (notification) => {
			let success = await deleteNotificationFromSet(notification.id);
		});
	}
	const notificationSetRepository = await getRepository(NotificationSet);
	let deleted = await notificationSetRepository
		.createQueryBuilder()
		.delete()
		.from(NotificationSet)
		.where('id = :id', { id: id })
		.execute();

	if (deleted.affected) {
		return true;
	}
	return false;
};

interface SaveSingleSetParameters {
	id?: number | boolean;
	subject: string;
	user_id: string;
	description: string;
	notification_date: Date;
	days_after: number;
	unique_id?: number;
	set_id: number;
	complete?: boolean;
}

export const saveSingleNotificationForSet = async (
	singleSetData: SaveSingleSetParameters,
	index: number,
): Promise<NotificationObject> => {
	let createParameters = {
		id: singleSetData.id ? singleSetData.id : false,
		subject: singleSetData.subject,
		description: singleSetData.description,
		notification_date: singleSetData.notification_date,
		user_id: singleSetData.user_id,
		is_active: index === 0 ? true : false,
		frequency_type: 'm',
		frequency: 12,
	};
	const notificationResult = await createNotificationsForUser(createParameters);
	if (typeof notificationResult !== 'boolean') {
		let { days_after, set_id, complete } = singleSetData;
		await saveNotificationLink({
			days_after: days_after,
			set_id: set_id,
			order: index + 1,
			user_notification_id: notificationResult.id,
			complete: complete ? true : false,
		});
	}

	return notificationResult;
};
interface NotificationLinkParameters {
	days_after: number;
	set_id: number;
	order: number;
	complete?: boolean;
	user_notification_id: number;
}

export const saveNotificationLink = async (
	singleSetData: NotificationLinkParameters,
): Promise<NotificationSetLink> => {
	let { days_after, set_id, order, user_notification_id, complete } = singleSetData;
	let hasRemoved = await deleteSetLinkByPK(set_id, user_notification_id);

	let notificationSetLink = new NotificationSetLink();
	notificationSetLink.user_notification_id = user_notification_id;
	notificationSetLink.set_id = set_id;
	notificationSetLink.order = order;
	notificationSetLink.complete = complete ? complete : false;
	notificationSetLink.days_after = days_after;
	notificationSetLink.created_at = new Date();
	notificationSetLink.updated_at = new Date();
	const notificationSetLinkRepository = await getRepository(NotificationSetLink);
	const result = await notificationSetLinkRepository.save(notificationSetLink);
	return result;
};

interface ColumnValue {
	column: string;
	value: string | number | boolean;
}
export const deleteSetLinkByColumn = async (columnObject: ColumnValue): Promise<boolean> => {
	let deleted = await getRepository(NotificationSetLink)
		.createQueryBuilder()
		.delete()
		.from(NotificationSetLink)
		.where(`${columnObject.column} = :value`, { value: columnObject.value })
		.execute();

	if (deleted.affected) {
		return true;
	}
	return false;
};
export const deleteSetLinkByPK = async (
	set_id: number,
	user_notification_id: number,
): Promise<boolean> => {
	let deleted = await getRepository(NotificationSetLink)
		.createQueryBuilder()
		.delete()
		.from(NotificationSetLink)
		.where(`set_id = :set_id`, { set_id: set_id })
		.andWhere(`user_notification_id = :user_notification_id`, {
			user_notification_id: user_notification_id,
		})
		.execute();
	if (deleted.affected) {
		return true;
	}
	return false;
};

export const deleteSet = async (id: number): Promise<boolean> => {
	return await deleteById(NotificationSet, id);
};

export const deleteNotificationFromSet = async (user_notification_id: number): Promise<boolean> => {
	let linkedRow = await getRepository(NotificationSetLink)
		.createQueryBuilder()
		.where(`user_notification_id = :user_notification_id`, {
			user_notification_id: user_notification_id,
		})
		.getOne();

	if (linkedRow) {
		let deletedNotificationLink = await deleteSetLinkByColumn({
			column: 'user_notification_id',
			value: user_notification_id,
		});
		let deletedNotification = await deleteById(UserNotifications, user_notification_id);
		return deletedNotification;
	}
	return true;
};

export const getSetById = async (id: number): Promise<NotificationSet> => {
	let notificationSet = await getById(NotificationSet, id);
	return notificationSet;
};

interface LinkedUserNotifications extends UserNotifications {
	days_after?: number;
}

export const getLinkedReminders = async (set_id: number): Promise<LinkedUserNotifications[]> => {
	let notifications = await getManager()
		.createQueryBuilder(UserNotifications, 'up')
		//.innerJoin(NotificationSetLink, 'nst', 'nst.user_notification_id = up.id')
		.innerJoinAndMapOne('up.link', NotificationSetLink, 'nst', 'nst.user_notification_id = up.id')
		.leftJoinAndMapOne('up.meta', MetaNotifications, 'meta', 'meta.notification_id = up.id')
		.where(`set_id = :value`, { value: set_id })
		.orderBy('nst.order', 'ASC')
		.getMany();
	let mergedNotificationData = notifications.map((notification) => {
		let mergedNotification = notification as LinkedUserNotifications;
		if (notification.link) {
			mergedNotification.days_after = notification.link.days_after;
		}
		return mergedNotification;
	});

	return mergedNotificationData;
};
interface NotificationSetWithCount extends NotificationSet {
	no_sets?: number;
}

export const getSetList = async (user_id: string): Promise<ResponseColumn> => {
	let notificationSets = await whereByColumnWithCount(NotificationSet, [
		{
			column: 'user_id',
			value: user_id,
		},
	]);
	if (notificationSets.data.length) {
		let ids = notificationSets.data.map((set) => {
			return set.id;
		});
		let countResults = await getSetCounts(ids);
		let notificationSetWithCounts = notificationSets.data.map((set) => {
			let no_sets = 1;
			if (countResults[set.id]) {
				no_sets = countResults[set.id];
			}
			return {
				...set,
				no_sets: no_sets,
			};
		});

		return {
			data: notificationSetWithCounts,
			total: notificationSets.total,
		};
	}
	return notificationSets;
};

export const getSetCounts = async (ids: number[]): Promise<any> => {
	let results = await getRepository(NotificationSetLink)
		.createQueryBuilder('sl')
		.select('set_id')
		.addSelect('count(sl.set_id)', 'count')
		.where('sl.set_id IN(:...ids)', { ids: ids })
		.groupBy('sl.set_id')
		.getRawMany();
	let flatResults = {};

	results.forEach((row) => {
		flatResults[parseInt(row.set_id)] = parseInt(row.count);
	});
	return flatResults;
};
