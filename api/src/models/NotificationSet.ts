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
import { NotificationSetLink } from '../entity/NotificationSetLink';

export const createNotificationSet = async (
	description: string,
	subject: string,
): Promise<NotificationSet | boolean> => {
	const matchedRecords = await matchNotificationSet({
		subject: subject,
	});
	const hasSubjectAlready = matchedRecords.length > 0;
	if (hasSubjectAlready) {
		return false;
	}
	let notificationSet = new NotificationSet();
	notificationSet.subject = subject;
	notificationSet.description = description;
	notificationSet.created_at = new Date();
	notificationSet.updated_at = new Date();
	const notificationSetRepo = await getRepository(NotificationSet);
	const result = await notificationSetRepo.save(notificationSet);
	return result;
};

export const getNotificationSetById = async (id: number): Promise<NotificationSet> => {
	const notificationSetRepo = await getRepository(NotificationSet);
	const notificationSet = await notificationSetRepo
		.createQueryBuilder('up')
		.where('up.id = :id', { id: id })
		.getOne();

	return notificationSet;
};

export const matchNotificationSet = async (searchParameters: {
	subject?: string;
	description?: string;
}): Promise<NotificationSet[]> => {
	const notificationSetBuilder = await getRepository(NotificationSet).createQueryBuilder(
		'notification_set',
	);
	notificationSetBuilder.where('notification_set.id >:id', { id: 0 });

	if (searchParameters.subject) {
		notificationSetBuilder.andWhere('notification_set.subject = :subject', {
			subject: searchParameters.subject,
		});
	}

	if (searchParameters.description) {
		notificationSetBuilder.andWhere('notification_set.description = :description', {
			description: searchParameters.description,
		});
	}
	const results = await notificationSetBuilder.getMany();

	return results;
};

export const deleteNotificationSetById = async (id: number): Promise<boolean> => {
	const notificationSet = await getNotificationSetById(id);
	if (!notificationSet) {
		return false;
	}

	let deleted = await getRepository(NotificationSet).remove(notificationSet);
	if (!deleted.id) {
		return true;
	}
	return false;
};
export const linkNotificationToSet = async (
	notification_id: number,
	set_id: number,
	order?: number,
): Promise<NotificationSetLink> => {
	let notificationSetLink = new NotificationSetLink();
	notificationSetLink.user_notification_id = notification_id;
	notificationSetLink.set_id = set_id;
	notificationSetLink.order = order ? order : 0;
	notificationSetLink.created_at = new Date();
	notificationSetLink.updated_at = new Date();
	const notificationSetLinkRepo = await getRepository(NotificationSetLink);
	const result = await notificationSetLinkRepo.save(notificationSetLink);
	return result;
};

export const deleteNotificationFromSet = async (notification_id: number): Promise<boolean> => {
	const notificationSetLink = await getRepository(NotificationSetLink)
		.createQueryBuilder('up')
		.where('up.user_notification_id = :id', { id: notification_id })
		.getOne();
	if (notificationSetLink) {
		let deleted = await getRepository(NotificationSetLink).remove(notificationSetLink);
		if (!deleted.user_notification_id) {
			return true;
		}
	}
	return false;
};
