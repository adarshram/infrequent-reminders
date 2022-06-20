import { Request, Response } from 'express';
import { createConnection, getRepository, getManager } from 'typeorm';
import { successResponse, errorResponse } from '../responses';
import { createNotificationsForUser, NotificationObject } from '../models/UserNotifications';
import {
	saveSetFromRequest,
	deleteNotificationSet,
	saveSingleNotificationForSet,
	saveNotificationLink,
	deleteSetLinkByColumn,
	deleteSetLinkByPK,
	deleteSet,
	getSetById,
	getLinkedReminders,
	deleteNotificationFromSet,
	getSetList,
} from '../models/ReminderSet';

export const view = async (req: Request, res: Response) => {
	/*const fBaseUser = res.locals.user;
	let manager = await getManager();
	let userProfile = await manager.findOne(UserProfile, { fireBaseRefId: fBaseUser.uid });
	if (!userProfile) {
		successResponse(res, {
			first_name: fBaseUser.name,
			last_name: '',
			email: fBaseUser.email,
		});
	}
	if (userProfile && userProfile?.id) {
		successResponse(res, userProfile);
	}*/
};
export const deleteNotificationFromSetWithId = async (req: Request, res: Response) => {
	const fBaseUser = res.locals.user;
	const { user_notification_id } = req.params;
	let deleted = await deleteNotificationFromSet(parseInt(user_notification_id));
	if (!deleted) {
		errorResponse(res, 'Unable to delete');
		return;
	}
	successResponse(res, deleted);
	return true;
};
export const deleteNotificationSetById = async (req: Request, res: Response) => {
	const fBaseUser = res.locals.user;
	const { id } = req.params;
	let deleted = await deleteNotificationSet(parseInt(id));
	if (!deleted) {
		errorResponse(res, 'Unable to delete');
		return false;
	}
	successResponse(res, deleted);
	return deleted;
};

export const saveSet = async (req: Request, res: Response) => {
	const fBaseUser = res.locals.user;
	const { formValues, reminders } = req.body;
	const notificationResult = await saveSetFromRequest({
		user_id: fBaseUser.uid,
		subject: formValues.subject,
		description: formValues.description,
		id: formValues.id ?? false,
	});

	if (typeof notificationResult === 'boolean') {
		errorResponse(res, 'Unable to insert');
		return;
	}
	if (typeof notificationResult !== 'boolean') {
		reminders.map(async (params, index) => {
			const singleNotificationParams = {
				subject: params.subject,
				description: params.description,
				notification_date: new Date(params.notification_date),
				days_after: params.days_after ?? 0,
				set_id: notificationResult.id,
				user_id: fBaseUser.uid,
				id: params.id ? parseInt(params.id) : false,
			};
			const notificationLinkResult = await saveSingleNotificationForSet(
				singleNotificationParams,
				index,
			);
		});

		successResponse(res, notificationResult);
	}
	return;
};
export const getFullSet = async (req: Request, res: Response) => {
	const fBaseUser = res.locals.user;
	const { id } = req.params;
	let notificationSet = await getSetById(parseInt(id));
	if (!notificationSet) {
		errorResponse(res, 'No Set Found');
		return;
	}

	if (notificationSet) {
		let linkedReminders = await getLinkedReminders(notificationSet.id);
		let result = {
			id: notificationSet.id,
			subject: notificationSet.subject,
			description: notificationSet.description,
			reminders: linkedReminders,
		};
		successResponse(res, result);
		return;
	}
};

export const getReminderSetList = async (req: Request, res: Response) => {
	const fBaseUser = res.locals.user;
	let setList = await getSetList(fBaseUser.uid);
	if (!setList) {
		errorResponse(res, 'No Set Found');
		return false;
	}
	successResponse(res, setList);
	return setList;
};
