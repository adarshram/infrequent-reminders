import { Request, Response } from 'express';
import {
  getNotificationsForUser,
  createNotificationsForUser,
  getNotificationById,
  deleteNotification,
  getPendingNotifications,
  snoozeNotification,
  getPendingNotificationCount,
  completeNotification,
} from '../models/UserNotifications';
import MetaNotificationsClass from '../models/MetaNotifications';
import { successResponse, errorResponse } from '../responses';

export const list = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  let results = await getNotificationsForUser(fBaseUser.uid);
  successResponse(res, results);
};
export const show = async (req: Request, res: Response) => {
  const { id } = req.params;
  const fBaseUser = res.locals.user;
  try {
    const notificationDetails = await getNotificationById(parseInt(id), fBaseUser.uid);
    if (!notificationDetails) {
      errorResponse(res, 'No Details Found');
      return;
    }
    let metaObject = new MetaNotificationsClass();
    metaObject.setUserId(notificationDetails.user_id);
    let snoozeCompleteDetails = await metaObject.getSnoozeAndCompletedCount(notificationDetails.id);
    let response = {
      ...notificationDetails,
      ...snoozeCompleteDetails,
    };
    successResponse(res, response);
  } catch (err) {
    errorResponse(res, 'Something Went Wrong');
  }
};

export const save = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { subject, description, frequency_type, frequency, notification_date, id, is_active } =
    req.body;
  const result = await createNotificationsForUser({
    id: id ? id * 1 : false,
    user_id: fBaseUser.uid,
    subject: subject,
    description: description,
    frequency_type: frequency_type,
    frequency: frequency,
    notification_date: notification_date,
    is_active: is_active ? is_active : true,
  });
  if (result) {
    successResponse(res, result);
    return;
  }
  errorResponse(res, 'Unable to insert');
};

export const deleteRow = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { id } = req.body;
  const result = await deleteNotification(id);
  if (result) {
    successResponse(res, result);
    return;
  }
  errorResponse(res, 'Unable to delete');
};

export const pendingNotifications = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  let results = await getPendingNotifications(fBaseUser.uid);
  if (results.length) {
    successResponse(res, results);
    return;
  }
  errorResponse(res, 'No Pending Notifications');
};

export const pendingNotificationCount = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const count = await getPendingNotificationCount(fBaseUser.uid);
  if (count) {
    successResponse(res, count);
    return;
  }
  errorResponse(res, 'No Pending Notifications');
};

export const snoozeNotifications = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { id } = req.params;
  const snoozeResult = await snoozeNotification(parseInt(id), fBaseUser.uid);
  if (snoozeResult) {
    successResponse(res, snoozeResult);
    return;
  }
  errorResponse(res, 'Unable to snooze');
};

export const markNotificationComplete = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { id } = req.params;
  const nextNotificationResult = await completeNotification(parseInt(id), fBaseUser.uid);
  if (nextNotificationResult) {
    successResponse(res, nextNotificationResult);
    return;
  }
  errorResponse(res, 'Unable to mark complete');
};
