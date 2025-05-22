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
	deleteRemovedRemindersIfExists,
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
	const numericId = parseInt(user_notification_id, 10);

	if (isNaN(numericId)) {
		errorResponse(res, 'Invalid user_notification_id parameter: Must be a number.', 400);
		return; // Return void
	}

	let deleted = await deleteNotificationFromSet(numericId);
	if (!deleted) {
		errorResponse(res, 'Unable to delete');
		return; // Return void
	}
	successResponse(res, deleted);
	// return true; // Original return, but void is more common after http response
};
export const deleteNotificationSetById = async (req: Request, res: Response) => {
	const fBaseUser = res.locals.user;
	const { id } = req.params;
	const numericId = parseInt(id, 10);

	if (isNaN(numericId)) {
		errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
		return; // Return void
	}

	let deleted = await deleteNotificationSet(numericId);
	if (!deleted) {
		errorResponse(res, 'Unable to delete');
		return; // Return void
	}
	successResponse(res, deleted);
	// return deleted; // Original return, but void is more common
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
	if (formValues.id) {
		let linkedReminders = await getLinkedReminders(formValues.id);
		if (linkedReminders.length !== reminders.length) {
			await deleteRemovedRemindersIfExists(linkedReminders, reminders);
		}
	}

	if (typeof notificationResult !== 'boolean') {
		try {
			const reminderPromises = reminders.map(async (params, index) => {
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
				if (!notificationLinkResult) {
					// Assuming saveSingleNotificationForSet returns a falsy value on error
					throw new Error('Failed to save a reminder notification.');
				}
				return notificationLinkResult;
			});

			await Promise.all(reminderPromises);
			successResponse(res, notificationResult);
		} catch (error) {
			console.error('Error saving reminders:', error);
			errorResponse(res, 'An error occurred while saving reminders.');
		}
	}
	return;
};
export const getFullSet = async (req: Request, res: Response) => {
	const fBaseUser = res.locals.user;
	const { id } = req.params;
	const numericId = parseInt(id, 10);

	if (isNaN(numericId)) {
		errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
		return;
	}

	let notificationSet = await getSetById(numericId);
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
		return; // Return void
	}
	successResponse(res, setList);
	// return setList; // Original return, but void is more common
};
