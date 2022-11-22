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
} from './../../src/models/NotificationLog';
//npm test test\models\NotificationLogTest.ts -- --grep "get one from log"
//npm test test\models\NotificationLogTest.ts -- --grep "save one to log"

before(async () => {
  await establishDatabaseConnection();
  await initializeFireBase();
});

describe('send notification handlers', () => {
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
    let created = await createRecordFromNotification(oneNotification, 'device notification');
    expect(created.send_type).to.equal('device notification');
    expect(created.user_notifications.subject).to.equal(oneNotification.subject);

    //cleanup
    await deleteNotificationLog(created);
  }).timeout(10000);
});
