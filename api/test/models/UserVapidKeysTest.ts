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
//npm test test/models/UserVapidKeysTest.ts -- --grep "saves device list for user"
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
  it('saves device list for user', async () => {
    let fireBaseRefId = '123';
    await userVapidKeys.deleteForUser(fireBaseRefId);
    await userVapidKeys.saveDeviceList(fireBaseRefId, mockDeviceList);
    let userKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
    let compareId = userKeys[0].id;
    await userVapidKeys.saveDeviceList(fireBaseRefId, mockDeviceList);
    let updatedUserKeys = await userVapidKeys.getKeysForUser(fireBaseRefId);
    expect(compareId).to.be.equal(updatedUserKeys[0].id);
    await userVapidKeys.deleteForUser(fireBaseRefId);
  }).timeout(10000);
});

const mockDeviceList = [
  {
    email: '1adarshr1am@gmail.com',
    isEmail: true,
    enabled: false,
    name: 'UserEmail',
  },
  {
    name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    enabled: true,
    vapidKey:
      'ekcV9eoppsrD4xxaXho4_Z:APA91bFdIPPPMQzFkGzmdHDqSZMKUBWiV7ek7PJoT0WGpesy1u_5B9Y2ekclOTdmDhgTbUNUoG7tS477O-5Im-YqLvgRQpWgvCXew8gP74yNY4KRVQMvFz0l-0rrIIfhgirbtJ8seQDv',
  },
  {
    enabled: false,
    vapidKey:
      'd2I4IfjgamTPUKQ6TlHKoh:APA91bHl25K4DavKEfranjM0xIRUugb6vt7A2HMqSufinD4INXSIbNeWwTK5b6gZkEg7dAHHPWQ0zxHgZ4a8g3auQQC7lIPfLChQ5ejuWacAHcuP3XA0qkDYYJCEqJM799Iv_-Kc8sTj',
    name: 'Unknown Device',
  },
  {
    enabled: true,
    vapidKey:
      'd6yWfc4c1kCNF3bqwwyQOo:APA91bGgWPTkEpT5BH7-GpwLzHSh9jeP5aKhnp4tMvEZxofw8DUR8xJ64SwnAs7Z4Ljgj9I4j7qEEkcbIgslKSVocxI0jfi1q3fAtRfChZAFwoFRUhG096PuEm-fA7VKRZhcANyTvFXY',
    name: 'Unknown',
  },
  {
    name: 'Mozilla/5.0 (Linux; Android 13; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    enabled: false,
    vapidKey:
      'd6yWfc4c1kCNF3bqwwyQOo:APA91bFeSQbVit6A2RotZDfcpFTtzwZOKc-qGVZEb9Rx8EA_Mt_QKiHlBpVvt7ZLsGO_qNloQZgKFgWvE31IKtrO-VOm0CpGBHrtE4UcuRyLoReKdL4kQy4u4YOq_QJ_DQ9HW9HqZJVn',
  },
  {
    name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    vapidKey:
      'ebfbSX1ybAhpEwjLf483e7:APA91bGnE-rbZ6Ff5sn1dWrNinP79Zm7F6C5fAskAZCSrT4FtgxZTgLMO-14WLVG5CJQYyPvxZoy-u3lRRf98SONH-1AbrbKtl4pKlbPpJpB2YxSUkTN8AF-194fFlaeqrF8YBAZoiuc',
    enabled: true,
  },
  {
    vapidKey:
      'e_Md-Cn1XAhkvArxm9hx5K:APA91bEcdvSmpVjmBzn6GD0HfH8rcSUAMtOxcde1lQTiJbtrW6EfvWvaZSff57VEDlQFEqANZFsolADy0JLv8HTuvMeuiCVP1GbrkvjQZSG9DSO3r2rDjy2Hw1HdJYL6yhTxTfJPyTvU',
    enabled: true,
    name: 'Mozilla/5.0 (Linux; Android 13; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
  },
  {
    enabled: true,
    vapidKey:
      'cBNG0afIer0tpE1fuQonB4:APA91bG-0gsSaVSsXfqaFwE6-wcuE6wSWVH7HRgV0AkmUGr2oQewxgRecg_h-kNdy9HfbhQD8wOr5WTWajz9r1Ysn5B-TC_TBRfTQDfkUTVOBT9cJaNg3MA27q-ygT97Eu3ey89g1FsU',
    name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  },
  {
    vapidKey:
      'dciUOXXdRviz-9WizhBGHZ:APA91bEwATnkv4zBpmu9bZSdJ-l7aMK1qiZfbQ8HaZGX4AiYaMxJQksCqXHad7BElY4v1e8bGVrYJCTO18HrDOr6SvVeF0sJnKc8wkBaq5-GMSrCZMX2GzbfflUXIMBv9aTTjopuzdlw',
    name: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    enabled: false,
    customName: 'Ubuntu',
  },
];
