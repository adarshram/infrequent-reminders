import { getRepository, getManager, createConnection } from 'typeorm';

import { initializeFireBase } from './../../src/utils/firebase';

import { establishDatabaseConnection } from './../../src/utils/dataBase';

import { PendingNotification } from './../../src/service/PendingNotification';
import { UserNotifications } from './../../src/entity/UserNotifications';

import { expect } from 'chai';
import 'mocha';
//npm test test/scripts/runDailyCronTest.ts -- --grep "runs the daily cron"
//npm test test/scripts/runDailyCronTest.ts -- --grep "runs live script"

describe('notification data handler', () => {
  it('runs live script', async () => {
    await establishDatabaseConnection();
    await initializeFireBase();
    let notifications = await getRepository(UserNotifications).find({
      relations: ['meta_notifications'],

      where: {
        is_active: 1,
      },
    });
    await Promise.all(
      notifications.map(async (currentNotification) => {
        if (!currentNotification.meta_notifications) {
          console.log(currentNotification);
        }
      }),
    );
  }).timeout(20000);

  it('runs the daily cron', async () => {
    await establishDatabaseConnection();
    await initializeFireBase();
    let pendingNotification = new PendingNotification();
    let users = await pendingNotification.getUsersWithNotification();

    const snoozeResults = await pendingNotification.snoozeEarlierNotifications();
  }).timeout(20000);
});
