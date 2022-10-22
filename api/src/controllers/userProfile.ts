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
    successResponse(res, userKeys[0]);
    return;
  }
  errorResponse(res, ['No Keys']);
  return;
};

export const saveNotificationDevice = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { deviceId, switchStatus, deviceName } = req.body;
  if (deviceId == '') {
    errorResponse(res, ['No Vapid Key']);
    return;
  }
  const fireBaseRefId = fBaseUser.uid;

  const saveResponse = await userVapidKeys.saveDevicePreference(
    fireBaseRefId,
    deviceId,
    deviceName,
    switchStatus,
  );

  if (saveResponse) {
    successResponse(res, saveResponse);
    return;
  }
  errorResponse(res, ['Unknown Error']);
  return;
};

export const saveNotificationPreference = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const { vapidKey } = req.body;
  if (vapidKey == '') {
    errorResponse(res, ['No Vapid Key']);
    return;
  }
  const fireBaseRefId = fBaseUser.uid;
  const result = await saveVapidKeyForUser(fireBaseRefId, vapidKey);
  if (result) {
    successResponse(res, result);
    return;
  }
  errorResponse(res, ['Unknown Error']);
  return;
};

export const getNotificationPreference = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const fireBaseRefId = fBaseUser.uid;
  const { vapidKey } = req.body;
  const vapidKeys = await searchVapidKeyForUser(fireBaseRefId, vapidKey);
  if (vapidKeys) {
    successResponse(res, vapidKeys);
    return;
  }
  errorResponse(res, ['No Keys Found']);
};

export const deleteNotificationPreference = async (req: Request, res: Response) => {
  const fBaseUser = res.locals.user;
  const fireBaseRefId = fBaseUser.uid;
  const { vapidKey } = req.body;
  const vapidKeys = await searchVapidKeyForUser(fireBaseRefId, vapidKey);
  if (!vapidKeys) {
    errorResponse(res, ['No Keys Found']);
    return;
  }
  const result = await deleteVapidKeyForUser(fireBaseRefId, vapidKey);
  if (result) {
    successResponse(res, result);
    return;
  }
  errorResponse(res, ['Unknown Error']);
  return;
};
