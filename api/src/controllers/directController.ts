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
  let notification = await getRepository(UserNotifications).findOne({
    where: { id: params.id },
  });
  if (!notification) {
    errorResponse(res, 'Wrong id');
    return false;
  }
  const snoozeResult = await snoozeNotification(notification.id, notification.user_id);
  if (snoozeResult) {
    successResponse(res, snoozeResult);
    return true;
  }
  errorResponse(res, 'Unable to snooze');
  return false;
};

export const complete = async (req: Request, res: Response) => {
  const params = req.params;
  let notification = await getRepository(UserNotifications).findOne({
    where: { id: params.id },
  });

  if (!notification) {
    errorResponse(res, 'Wrong id');
    return false;
  }
  const completeResult = await completeNotification(notification.id, notification.user_id);
  if (completeResult) {
    successResponse(res, completeResult);
    return true;
  }
  errorResponse(res, 'Unable to complete');
  return false;
};
