import { Request, Response } from 'express';
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
  getNotificationInMonthForUser,
  getNotificationsForUserByDate,
  getNotificationsForToday,
  getMostSnoozedNotification as getMostSnoozedNotificationModel, // Aliased to avoid name clash if any
} from '../models/UserNotifications';
import { getNotificationLogForId } from '../models/NotificationLog';
import MetaNotificationsClass from '../models/MetaNotifications';
import { successResponse, errorResponse } from '../responses';

export const list = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  let results = await getNotificationsForUser(fBaseUser.uid);
  successResponse(res, results);
};

export const listNotificationsForMonth = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { month } = req.body;
  let results = await getNotificationInMonthForUser(fBaseUser.uid, month);
  successResponse(res, results);
};
export const listNotificationsForDate = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { date } = req.body;

  let results = await getNotificationsForUserByDate(fBaseUser.uid, new Date(date));
  //let results = [];
  successResponse(res, results);
};

export const showLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const fBaseUser = res.locals.user;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
    return;
  }

  try {
    const notificationLogDetails = await getNotificationLogForId(numericId, fBaseUser.uid);
    if (!notificationLogDetails) {
      errorResponse(res, 'No Log Details Found');
      return;
    }

    let response = {
      ...notificationLogDetails,
    };
    successResponse(res, response);
  } catch (err) {
    console.error('Error in showLog:', err);
    errorResponse(res, `Failed to retrieve notification log: ${err.message || 'Internal server error'}`);
  }
};
export const show = async (req: Request, res: Response) => {
  const { id } = req.params;
  const fBaseUser = res.locals.user;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
    return;
  }

  try {
    const notificationDetails = await getNotificationById(numericId, fBaseUser.uid);
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
    console.error('Error in show:', err);
    errorResponse(res, `Failed to retrieve notification details: ${err.message || 'Internal server error'}`);
  }
};

export const save = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const {
    subject,
    description,
    frequency_type,
    frequency,
    notification_date,
    id,
    is_active,
    is_anchored,
    anchor_number,
  } = req.body;

  let processedId: number | false;
  if (id === null || id === undefined || String(id).trim() === '') {
    processedId = false;
  } else {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      errorResponse(res, 'Invalid ID: Must be a number.', 400);
      return;
    }
    processedId = numericId;
  }

  const result = await createNotificationsForUser({
    id: processedId,
    user_id: fBaseUser.uid,
    subject: subject,
    description: description,
    frequency_type: frequency_type,
    frequency: frequency,
    notification_date: notification_date,
    is_active: is_active ? is_active : true,
    is_anchored: is_anchored ? is_anchored : false,
    anchor_number: anchor_number ? anchor_number : 0,
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
  const hasResults = results && results.length; // True if results has items. False if results is an empty array.
  const isEmpty = results && results.length === 0; // True if results is an empty array.
  const hasError = !results; // True if results is null or undefined.

  // This condition is true if results is an array (empty or with items).
  // If results is an empty array: `results` is truthy, `hasResults` is falsy, `isEmpty` is truthy. (F || T) is True.
  // If results has items: `results` is truthy, `hasResults` is truthy, `isEmpty` is falsy. (T || F) is True.
  // If results is null/undefined: `results` is falsy, making the whole condition false.
  if (results && (hasResults || isEmpty)) {
    successResponse(res, results);
    return;
  }

  errorResponse(res, 'Error fetching pending notifications');
};

export const upcomingNotifications = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  let results = await getNotificationsForThisWeek(fBaseUser.uid);
  const hasResults = results && results.length; // True if results has items. False if results is an empty array.
  const isEmpty = results && results.length === 0; // True if results is an empty array.
  const hasError = !results; // True if results is null or undefined.

  // This condition is true if results is an array (empty or with items).
  if (results && (hasResults || isEmpty)) {
    successResponse(res, results);
    return;
  }

  errorResponse(res, 'Error fetching upcoming notifications');
};
export const todaysNotifications = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  let results = await getNotificationsForToday(fBaseUser.uid);
  const hasResults = results && results.length;
  const isEmpty = results && results.length === 0;
  const hasError = !results; //This means results is null or undefined

  if (results && (hasResults || isEmpty)) { // check if results is an array
    successResponse(res, results);
    return;
  }

  errorResponse(res, 'Error fetching today\'s notifications'); // Or a more specific error from the model if available
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
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
    return;
  }
  const snoozeResult = await snoozeNotification(numericId, fBaseUser.uid);
  if (snoozeResult) {
    successResponse(res, snoozeResult);
    return;
  }
  errorResponse(res, 'Unable to snooze');
};

export const markNotificationComplete = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { id } = req.params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    errorResponse(res, 'Invalid ID parameter: Must be a number.', 400);
    return;
  }
  const nextNotificationResult = await completeNotification(numericId, fBaseUser.uid);
  if (nextNotificationResult) {
    successResponse(res, nextNotificationResult);
    return;
  }
  errorResponse(res, 'Unable to mark complete');
};

export const getMostSnoozed = async (req: Request, res: Response): Promise<void> => {
  const fBaseUser = res.locals.user;
  if (!fBaseUser || !fBaseUser.uid) {
    // This case should ideally be handled by auth middleware, but as a safeguard:
    errorResponse(res, 'User not authenticated.'); 
    return;
  }

  try {
    const result = await getMostSnoozedNotificationModel(fBaseUser.uid);

    // If result is null (no snoozed notifications or none found), 
    // respond with success and null data as per requirement.
    successResponse(res, result); 
  } catch (err) {
    console.error('Error in getMostSnoozed controller:', err);
    errorResponse(res, 'An error occurred while fetching the most snoozed notification.');
  }
};
