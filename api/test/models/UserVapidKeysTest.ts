import { getRepository, getManager } from 'typeorm';
import {
  getById,
  deleteById,
  deleteByColumn,
  whereByColumns,
} from './../../src/models/GenericModel';
import { UserNotifications } from './../../src/entity/UserNotifications';
import { NotificationSet } from './../../src/entity/NotificationSet';
import {
  getMessagingObject,
  addToCollection,
  getFireStoreDbObject,
  initializeFireBase,
} from './../../src/utils/firebase';
import { establishDatabaseConnection } from './../../src/utils/dataBase';
import {
  deleteNotification,
  getNotificationById,
  getNextNotificationFromSet,
  isNotificationInSet,
  createNotificationsForUser,
  completeNotification,
  snoozeNotification,
  getNotificationsForUser,
  uncompleteNotification,
  getNotificationInMonthForUser,
  getNotificationsForUserByDate,
} from './../../src/models/UserNotifications';

import {
  saveVapidKeyForUser,
  deleteVapidKeyForUser,
  sendNotificationToVapidKey,
  getNotificationPreferenceForUser,
  getUsersWithNotificationPreference,
} from './../../src/models/UserProfile';
import * as userVapidKeys from './../../src/models/UserVapidKeys';

import { UserProfile } from './../../src/entity/UserProfile';
import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
//npm test test\models\UserVapidKeysTest.ts -- --grep "deletes device for user"
//npm test test\models\UserVapidKeysTest.ts -- --grep "gets user email"

before(async () => {
  await establishDatabaseConnection();
  await initializeFireBase();
});

describe('send notification handlers', () => {
  it('save user device key', async () => {
    let fireBaseRefId = '123';
    await userVapidKeys.deleteForUser(fireBaseRefId);

    let deviceId = 'adsdsadasdsadsadsada';
    let deviceName = 'Chrome';
    let switchValue = true;
    await userVapidKeys.saveDevicePreference(fireBaseRefId, deviceId, deviceName, switchValue);
    let userKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
    let currentKey = userKeys[0];
    expect(currentKey.devices[0]['enabled']).to.be.equal(switchValue);
    expect(currentKey.devices[0]['vapidKey']).to.be.equal(deviceId);

    switchValue = false;
    await userVapidKeys.saveDevicePreference(fireBaseRefId, deviceId, deviceName, switchValue);
    userKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
    currentKey = userKeys[0];
    expect(currentKey.devices[0]['enabled']).to.be.equal(switchValue);

    deviceId = 'asdasd123456';
    deviceName = 'Chrome2';
    switchValue = true;
    await userVapidKeys.saveDevicePreference(fireBaseRefId, deviceId, deviceName, switchValue);
    userKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
    currentKey = userKeys[0];
    expect(currentKey.devices[1]['enabled']).to.be.equal(switchValue);
    expect(currentKey.devices[1]['vapidKey']).to.be.equal(deviceId);
  }).timeout(10000);
  it('deletes device for user', async () => {
    let fireBaseRefId = '123';
    await userVapidKeys.deleteForUser(fireBaseRefId);

    let deviceId = 'adsdsadasdsadsadsada';
    let deviceName = 'Chrome';
    let switchValue = true;
    await userVapidKeys.saveDevicePreference(fireBaseRefId, deviceId, deviceName, switchValue);
    let userKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
    let currentKey = userKeys[0];

    await userVapidKeys.deleteDeviceForUser(fireBaseRefId, deviceId);

    userKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
    currentKey = userKeys[0];
    expect(currentKey.devices.length).to.be.equal(0);
    expect(currentKey.vapidKeys.length).to.be.equal(0);

    await userVapidKeys.deleteForUser(fireBaseRefId);
  }).timeout(10000);
});
