import { Request, Response } from 'express';
import {
  getRepository,
  getManager,
  MoreThan,
  LessThan,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
  FindOperator,
} from 'typeorm';
import {
  getNotificationsForUser,
  createNotificationsForUser,
  getNotificationById,
  deleteNotification,
  getPendingNotifications,
  getNotificationsForThisWeek,
  snoozeNotification,
  getPendingNotificationCount,
  completeNotification,
} from '../models/UserNotifications';
import { UserNotifications } from '../entity/UserNotifications';

import { successResponse, errorResponse } from '../responses';

export const snoozeNotifications = async (req: Request, res: Response) => {
  const params = req.params;
  const idParam = params.id;
  const numericId = parseInt(idParam, 10);

  if (isNaN(numericId)) {
    errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
    return;
  }

  let notification: UserNotifications | undefined;
  try {
    notification = await getRepository(UserNotifications).findOne({
      where: { id: numericId },
    });
  } catch (dbError) {
    console.error('Error fetching notification in snoozeNotifications:', dbError);
    errorResponse(res, 'Database error while fetching notification.');
    return;
  }

  if (!notification) {
    errorResponse(res, 'Notification not found with the provided ID.');
    return;
  }

  try {
    // Assumes snoozeNotification in model now accepts UserNotifications object.
    const snoozeResult = await snoozeNotification(notification);

    if (snoozeResult) {
      successResponse(res, snoozeResult);
    } else {
      errorResponse(res, 'Unable to snooze notification.');
    }
  } catch (snoozeError) {
    console.error('Error during snooze operation:', snoozeError);
    errorResponse(res, 'An error occurred while snoozing the notification.');
  }
};

export const complete = async (req: Request, res: Response): Promise<void> => {
  const params = req.params;
  const idParam = params.id;
  const numericId = parseInt(idParam, 10);

  if (isNaN(numericId)) {
    errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
    return;
  }

  let notification: UserNotifications | undefined;
  try {
    notification = await getRepository(UserNotifications).findOne({
      where: { id: numericId },
    });
  } catch (dbError) {
    console.error('Error fetching notification in complete:', dbError);
    errorResponse(res, 'Database error while fetching notification.');
    return;
  }

  if (!notification) {
    errorResponse(res, 'Notification not found with the provided ID.');
    return;
  }

  try {
    // Assumes completeNotification in model now accepts UserNotifications object.
    const completeResult = await completeNotification(notification);

    if (completeResult) {
      successResponse(res, completeResult);
    } else {
      errorResponse(res, 'Unable to complete notification.');
    }
  } catch (completeError) {
    console.error('Error during complete operation:', completeError);
    errorResponse(res, 'An error occurred while completing the notification.');
  }
};
