import { getRepository, getManager } from 'typeorm';
import {
  getById,
  deleteById,
  deleteByColumn,
  whereByColumns,
} from './../../src/models/genericModel';
import { UserNotifications } from './../../src/entity/UserNotifications';
import { NotificationSet } from './../../src/entity/NotificationSet';
import {
  getMessagingObject,
  addToCollection,
  getFireStoreDbObject,
  initializeFireBase,
} from './../../src/utils/firebase';
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
  getPendingNotifications,
} from './../../src/models/UserNotifications';

import {
  saveVapidKeyForUser,
  deleteVapidKeyForUser,
  getUsersWithNotificationPreference,
  getVapidKeysForUser,
} from './../../src/models/UserProfile';
import { sendNotificationToVapidKey, runDailyCron } from './../../src/scripts/dailyUpdates';

import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
//npm test test\scripts\dailyUpdatesTest.ts -- --grep "runs the daily cron"
before(async () => {
  await createConnection();
  await initializeFireBase();
});

let reminderData = {
  user_id: '123123123',
  subject: 'Test Me subject',
  description: 'Test Me description',
  reminders: [
    {
      unique_id: new Date().getTime(),
      subject: 'Enter Sub1ject',
      description: 'Short Desc1ription',
      notification_date: new Date(),
      days_after: 2,
    },
    {
      unique_id: new Date().getTime(),
      subject: 'Enter Sub2ject',
      description: 'Short Des2cription',
      notification_date: new Date(),
      days_after: 2,
    },
  ],
};
describe('notification data handler', () => {
  it('saves and deletes notification docment from collection ', async () => {
    const db = getFireStoreDbObject();
    await saveVapidKeyForUser('dgdfgfdg', 'assdfsdf');
    await deleteVapidKeyForUser('dgdfgfdg', 'assdfsdf');
    const vapidKeyObject = db.collection('UserVapidKeys');
    const createdObject = await vapidKeyObject.doc('dgdfgfdg').get();
    expect(createdObject.data()).to.be.equal(undefined);
  });
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

  it('runs the daily cron', async () => {
    await runDailyCron();
  }).timeout(20000);

  it('sends notification to the first user for testing ', async () => {
    const db = getFireStoreDbObject();

    const vapidKeyObject = db.collection('UserVapidKeys');
    const snapshot = await vapidKeyObject.limit(1).get();
    let vapidKeys = [];
    snapshot.forEach((doc) => {
      let data = doc.data();
      vapidKeys = [...vapidKeys, ...data.vapidKeys];
    });
    let notificationParameters = {
      user_id: '123',
      subject: '12312312',
      description: 'scdsacsac',
      frequency_type: 'w',
      frequency: 1,
      notification_date: new Date(),
      is_active: true,
    };

    let notification = await createNotificationsForUser(notificationParameters);
    await sendNotificationToVapidKey(vapidKeys[0], notification);
    //cleanup
    await deleteNotificationsForUser(notificationParameters.user_id);
  });
});
