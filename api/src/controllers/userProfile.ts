import { Request, Response } from 'express';
import { createConnection, getRepository, getManager } from 'typeorm';

import { UserProfile } from '../entity/UserProfile';
import {
  saveVapidKeyForUser,
  searchVapidKeyForUser,
  deleteVapidKeyForUser,
} from '../models/UserProfile';

import * as userVapidKeys from '../models/UserVapidKeys';

import { successResponse, errorResponse } from '../responses';

export const view = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
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
  }
};

export const save = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { first_name, last_name, email, id } = req.body;
  const fireBaseRefId = fBaseUser.uid;
  let userProfile = new UserProfile();
  if (id !== '') {
    userProfile.id = id;
  }
  userProfile.first_name = first_name;
  userProfile.last_name = last_name;
  userProfile.email = email;
  userProfile.fireBaseRefId = fireBaseRefId;
  userProfile.created_at = new Date();
  userProfile.updated_at = new Date();

  const userProfileRepository = await getRepository(UserProfile);
  const result = await userProfileRepository.save(userProfile);
  successResponse(res, result);
};

export const notificationList = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const fireBaseRefId = fBaseUser.uid;
  const userKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
  if (userKeys && userKeys[0]) {
    successResponse(res, userKeys[0]); // Assuming userKeys[0] is the desired single key object
    return;
  }
  // If no keys, return success with empty array
  successResponse(res, []);
  return;
};

export const saveNotificationDevices = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { deviceList } = req.body;
  if (!deviceList || !Array.isArray(deviceList) || deviceList.length === 0) {
    errorResponse(res, 'No devices provided to save.'); // Defaults to 400
    return;
  }
  const fireBaseRefId = fBaseUser.uid;

  try {
    const saveResponse = await userVapidKeys.saveDeviceList(fireBaseRefId, deviceList);
    if (saveResponse) {
      successResponse(res, saveResponse);
      return;
    }
    // If saveResponse is falsy, it indicates a failure in the model.
    console.error('Error in saveNotificationDevices: saveDeviceList returned falsy for user:', fireBaseRefId);
    errorResponse(res, 'Failed to save notification devices.');
  } catch (err) {
    console.error('Exception in saveNotificationDevices for user:', fireBaseRefId, err);
    errorResponse(res, 'An unexpected error occurred while saving notification devices.');
  }
  return;
};

export const saveNotificationPreference = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { vapidKey } = req.body;
  if (!vapidKey || typeof vapidKey !== 'string' || vapidKey.trim() === '') {
    errorResponse(res, 'No Vapid Key provided.'); // Defaults to 400
    return;
  }
  const fireBaseRefId = fBaseUser.uid;
  try {
    const result = await saveVapidKeyForUser(fireBaseRefId, vapidKey);
    if (result) {
      successResponse(res, result);
      return;
    }
    // If result is falsy, it indicates a failure in the model.
    console.error('Error in saveNotificationPreference: saveVapidKeyForUser returned falsy for user:', fireBaseRefId, 'vapidKey:', vapidKey);
    errorResponse(res, 'Failed to save notification preference.');
  } catch (err) {
    console.error('Exception in saveNotificationPreference for user:', fireBaseRefId, 'vapidKey:', vapidKey, err);
    errorResponse(res, 'An unexpected error occurred while saving notification preference.');
  }
  return;
};

export const getNotificationPreference = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const fireBaseRefId = fBaseUser.uid;
  const { vapidKey } = req.body; // Assuming vapidKey is expected in body for search
  try {
    const vapidKeys = await searchVapidKeyForUser(fireBaseRefId, vapidKey);
    // searchVapidKeyForUser is expected to return an array or the found key, or null/empty if not found.
    // If it returns an empty array or null for "not found", successResponse with that value is appropriate.
    successResponse(res, vapidKeys || []); // Send empty array if null/undefined
  } catch (err) {
    console.error('Error in getNotificationPreference for user:', fireBaseRefId, 'vapidKey:', vapidKey, err);
    errorResponse(res, 'An unexpected error occurred while fetching notification preferences.');
  }
};

export const deleteNotificationPreference = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const fireBaseRefId = fBaseUser.uid;
  const { vapidKey } = req.body;

  if (!vapidKey || typeof vapidKey !== 'string' || vapidKey.trim() === '') {
    errorResponse(res, 'No Vapid Key provided for deletion.'); // Defaults to 400
    return;
  }

  try {
    // First, check if the key exists to provide a 404 if it doesn't.
    const existingKeys = await searchVapidKeyForUser(fireBaseRefId, vapidKey);
    if (!existingKeys || (Array.isArray(existingKeys) && existingKeys.length === 0)) {
      // Using res.status directly for 404 as errorResponse defaults to 400
      res.status(404).json({ error: true, message: 'Notification preference not found to delete.' });
      return;
    }

    const result = await deleteVapidKeyForUser(fireBaseRefId, vapidKey);
    if (result) { // Assuming result indicates success (e.g., true or affectedRows > 0)
      successResponse(res, { message: 'Notification preference deleted successfully.' }); // Or send back the result
      return;
    }
    // If result is falsy, it indicates a failure in the model not covered by key not existing.
    console.error('Error in deleteNotificationPreference: deleteVapidKeyForUser returned falsy for user:', fireBaseRefId, 'vapidKey:', vapidKey);
    errorResponse(res, 'Failed to delete notification preference.');
  } catch (err) {
    console.error('Exception in deleteNotificationPreference for user:', fireBaseRefId, 'vapidKey:', vapidKey, err);
    errorResponse(res, 'An unexpected error occurred while deleting notification preference.');
  }
  return;
};
