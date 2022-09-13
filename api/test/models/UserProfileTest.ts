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
import { UserProfile } from './../../src/entity/UserProfile';
import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
//npm test test\models\UserProfileTest.ts -- --grep "gets users with preferences"
before(async () => {
  await establishDatabaseConnection();
  await initializeFireBase();
});

describe('send notification handlers', () => {
  const deleteNotificationsForUser = async (user_id: String) => {
    let notificationListToClear = await getNotificationsForUser(user_id);
    let idsToDelete = notificationListToClear.results.map(async (record) => {
      if (record.id) {
        await deleteNotification(record.id);
      }
    });
  };
  let notificationParameters = {
    user_id: '123',
    subject: '12312312',
    description: 'scdsacsac',
    frequency_type: 'w',
    frequency: 1,
    notification_date: new Date(),
    is_active: true,
  };

  it('sends notification to the first user for testing ', async () => {
    const db = getFireStoreDbObject();

    const vapidKeyObject = db.collection('UserVapidKeys');
    const snapshot = await vapidKeyObject.limit(1).get();
    let vapidKeys = [];
    snapshot.forEach((doc) => {
      let data = doc.data();
      vapidKeys = [...vapidKeys, ...data.vapidKeys];
    });

    let notification = await createNotificationsForUser(notificationParameters);
    let { success, errors } = await sendNotificationToVapidKey(vapidKeys[0], notification);
    expect(success).to.be.equal(true);
    //cleanup
    await deleteNotificationsForUser(notificationParameters.user_id);
  }).timeout(10000);
  it('sends invalid notification ', async () => {
    const db = getFireStoreDbObject();

    let notification = await createNotificationsForUser(notificationParameters);
    let invalidVapidKey = '234234232342324';
    let { success, errors } = await sendNotificationToVapidKey(invalidVapidKey, notification);
    expect(success).to.be.equal(false);

    //cleanup
    await deleteNotificationsForUser(notificationParameters.user_id);
  }).timeout(10000);

  it('saves vapid key for user ', async () => {
    const db = getFireStoreDbObject();
    let dummyVapidKey = '234234232342324';
    let success = await saveVapidKeyForUser(notificationParameters.user_id, dummyVapidKey);
    expect(success).to.be.equal(true);
    let notificationPreference = await getNotificationPreferenceForUser(
      notificationParameters.user_id,
    );
    expect(notificationPreference.user_id).to.be.equal(notificationParameters.user_id);

    //cleanup
    await deleteVapidKeyForUser(notificationParameters.user_id, dummyVapidKey);

    notificationPreference = await getNotificationPreferenceForUser(notificationParameters.user_id);
    expect(notificationPreference).to.be.equal(undefined);
  }).timeout(10000);
  it('gets users with preferences', async () => {
    let dummyVapidKey = '234234232342324';
    await saveVapidKeyForUser(notificationParameters.user_id, dummyVapidKey);

    await saveVapidKeyForUser('12345', dummyVapidKey);

    let users = await getUsersWithNotificationPreference();
    let newLength = users.length;
    expect(users.length).to.be.least(2);
    //cleanup
    await deleteVapidKeyForUser(notificationParameters.user_id, dummyVapidKey);
    await deleteVapidKeyForUser('12345', dummyVapidKey);

    users = await getUsersWithNotificationPreference();
    expect(users.length).to.be.below(newLength);
  }).timeout(10000);

  it('gets user email', async () => {
    let randomUserProfile = await getRepository(UserProfile).findOne();
    console.log(randomUserProfile);
  }).timeout(10000);
});
