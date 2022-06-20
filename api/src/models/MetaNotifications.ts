import { createConnection, getRepository, getManager } from 'typeorm';
import {
	format,
	differenceInCalendarDays,
	addWeeks,
	addMonths,
	addDays,
	subDays,
	compareAsc,
} from 'date-fns';
import { calculateSnoozeDate, calculateNextNotification } from '../utils/dateManipulators';

import { MetaNotifications } from '../entity/MetaNotifications';

interface MetaNotificationParameters {
	id?: number | boolean;
	user_id: string;
	notification_id: number;
	cron_snoozed?: number;
	user_snoozed?: number;
}

interface MetaNotificationsObject {
	id?: number | boolean;
	user_id: string;
	notification_id: number;
	cron_snoozed?: number;
	user_snoozed?: number;
	updated_at: Date;
}

class MetaNotificationsClass {
	connection: boolean | any;
	queryObject: boolean | any;
	user_id: string;
	getRepository = async () => {
		let repository = await getRepository(MetaNotifications);
		return repository;
	};

	setUserId = (user_id: string) => {
		this.user_id = user_id;
	};

	getSnoozeAndCompletedCount = async (notification_id): Promise<Object> => {
		let query = await this.getByNotificationId(notification_id);
		let metaNotifications = await query.getOne();
		let snoozedCount = 0;
		let doneCount = 0;
		if (metaNotifications) {
			snoozedCount = metaNotifications.cron_snoozed + metaNotifications.user_snoozed;
		}
		return { snoozedCount, doneCount };
	};
	updateCronSnooze = async (notification_id): Promise<MetaNotificationsObject | boolean> => {
		let query = await this.getByNotificationId(notification_id);
		let results = await query.getOne();
		let metaNotifications = this.getDefaultRow();
		if (results) {
			metaNotifications = results;
		}
		metaNotifications.notification_id = notification_id;
		metaNotifications.cron_snoozed = metaNotifications.cron_snoozed + 1;
		metaNotifications.updated_at = new Date();
		this.saveNotification(metaNotifications);
		return metaNotifications;
	};

	updateUserSnooze = async (notification_id): Promise<MetaNotificationsObject | boolean> => {
		let query = await this.getByNotificationId(notification_id);
		let results = await query.getOne();
		let metaNotifications = this.getDefaultRow();
		if (results) {
			metaNotifications = results;
		}
		metaNotifications.notification_id = notification_id;
		metaNotifications.user_snoozed = metaNotifications.user_snoozed + 1;
		metaNotifications.updated_at = new Date();
		this.saveNotification(metaNotifications);
		return metaNotifications;
	};

	getDefaultRow = () => {
		let metaNotifications = new MetaNotifications();
		metaNotifications.user_id = this.user_id ? this.user_id : '';
		metaNotifications.notification_id = 0;
		metaNotifications.cron_snoozed = 0;
		metaNotifications.user_snoozed = 0;
		metaNotifications.updated_at = new Date();
		return metaNotifications;
	};

	saveOrUpdate = async (
		parameters: MetaNotificationParameters,
	): Promise<MetaNotificationsObject> => {
		const { id, user_id, notification_id, cron_snoozed, user_snoozed } = parameters;
		let query = await this.getByNotificationId(notification_id);
		let results = await query.getOne();
		let metaNotifications = new MetaNotifications();
		if (results) {
			metaNotifications = results;
		}
		metaNotifications.user_id = user_id;

		metaNotifications.notification_id = notification_id;
		metaNotifications.cron_snoozed = cron_snoozed;
		metaNotifications.user_snoozed = user_snoozed;

		metaNotifications.updated_at = new Date();
		this.saveNotification(metaNotifications);
		return metaNotifications;
	};

	getOne = async () => {
		if (!this.queryObject) {
			return false;
		}
		let results = await this.queryObject.getOne();
		this.queryObject = false;
		return results;
	};

	getByNotificationId = async (notification_id: number) => {
		let repository = await this.getRepository();
		let notificationsQuery = repository
			.createQueryBuilder('up')
			.where('up.notification_id >= :notification_id', { notification_id: notification_id });
		this.queryObject = notificationsQuery;
		return this;
	};

	saveNotification = async (metaNotification) => {
		let repository = await this.getRepository();
		const result = await repository.save(metaNotification);
		return result;
	};
}
export default MetaNotificationsClass;
