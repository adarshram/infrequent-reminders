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
//npm test test\models\UserVapidKeysTest.ts -- --grep "save user device key"
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
  it('gets user with vapid key', async () => {
    const db = getFireStoreDbObject();
    const vapidKeyObject = db.collection('UserVapidKeys');
    //'83zkNxe3BtSpXsFgxrDgw49ktWj2'
    const userKeys = await userVapidKeys.getKeysForUser('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    console.log(userKeys);
    //await userVapidKeys.convertAllKeysToDevices();
    /*return;
    let fireBaseRefId = '1231231234';
    let res = await addToCollection(
      'UserVapidKeys',
      {
        created_at: new Date().getDate(),
        fireBaseRefId: '1231231234',
        vapidKeys: '1233',
        devices: [{ vapidKey: '12312', name: 'abc' }],
      },
      false,
    );

    //console.log(await userVapidKeys.getKeysForUser(fireBaseRefId));
    //const docToDelete = await vapidKeyObject.doc(id).get();
    //await docToDelete.ref.delete();

    /*const snapshot = await vapidKeyObject.limit(1).get();
    let vapidKeys = [];

    snapshot.forEach((doc) => {
      let data = doc.data();
      vapidKeys = [...vapidKeys, ...data.vapidKeys];
    });*/

    //let results = await userVapidKeys.deleteForUser(fireBaseRefId);
  }).timeout(10000);
});
