import { getRepository, getManager } from 'typeorm';
import {
  getById,
  deleteById,
  deleteByColumn,
  whereByColumns,
} from './../../src/models/GenericModel';

import {
  getMessagingObject,
  addToCollection,
  getFireStoreDbObject,
  initializeFireBase,
} from './../../src/utils/firebase';
import { establishDatabaseConnection } from './../../src/utils/dataBase';

import { NotificationLog } from './../../src/entity/NotificationLog';
import { UserNotifications } from './../../src/entity/UserNotifications';
import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
import {
  createRecordFromNotification,
  deleteNotificationLog,
  getNotificationLogForUser,
  getNotificationsByDate,
  getNotificationsForToday,
} from './../../src/models/NotificationLog';
//npm test test\models\NotificationLogTest.ts -- --grep "get one from log"
//npm test test\models\NotificationLogTest.ts -- --grep "get notification log for date"

before(async () => {
  await establishDatabaseConnection();
  //await initializeFireBase();
});

describe('send notification handlers', () => {
  it('get notification log for date', async () => {
    //    await establishDatabaseConnection();
    let oneNotification = await getRepository(UserNotifications).findOne();

    let created = await createRecordFromNotification(oneNotification, 'device notification');
    let notifications = await getNotificationsForToday(oneNotification.user_id);
    let hasOneNoticationInResults = false;
    notifications.map((currentNotification) => {
      if (currentNotification.id === oneNotification.id) {
        hasOneNoticationInResults = true;
      }
    });
    expect(hasOneNoticationInResults).to.equal(true);
    //cleanup
    await deleteNotificationLog(created);

    //cleanup
  }).timeout(10000);
  it('save one to log', async () => {
    let oneNotification = await getRepository(UserNotifications).findOne();
    let created = await createRecordFromNotification(oneNotification, 'device notification');
    expect(created.send_type).to.equal('device notification');
    expect(created.user_notifications.subject).to.equal(oneNotification.subject);
    //cleanup
    await deleteNotificationLog(created);
  }).timeout(10000);
  it('get one from log', async () => {
    let oneNotification = await getRepository(UserNotifications).findOne();
    let notificationLogs = [];

    for (let i = 0; i < 5; i++) {
      notificationLogs.push(
        await createRecordFromNotification(oneNotification, `device notification ${i}`),
      );
    }
    let retrievedLogs = await getNotificationLogForUser(oneNotification.user_id);
    let [results, count] = retrievedLogs;
    expect(results[0].send_type.indexOf('device notification') > -1).to.equal(true);
    expect(count > 4).to.equal(true);

    await Promise.all(
      notificationLogs.map(async (current) => {
        await deleteNotificationLog(current);
        return true;
      }),
    );
  }).timeout(10000);
});
