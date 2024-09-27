import { getRepository, getManager } from 'typeorm';

import 'mocha';
import { createConnection } from 'typeorm';
import { establishDatabaseConnection } from './../../src/utils/dataBase';
import {
  sendNotificationToMobileDevice,
  sendNotificationEmail,
} from './../../src/utils/notification';
import {
  getMessagingObject,
  addToCollection,
  getFireStoreDbObject,
  initializeFireBase,
} from './../../src/utils/firebase';

import {
  deleteNotification,
  createNotificationsForUser,
} from './../../src/models/UserNotifications';
//npm test test/utils/notifications.ts -- --grep "first test"

describe('notification data handler', () => {
  it('first test', async () => {
    await establishDatabaseConnection();
    await initializeFireBase();

    let notificationSubject = 'Test From node server';
    let notificationParameters = {
      user_id: '12345',
      subject: '12312312',
      description: 'scdsacsac',
      frequency_type: 'w',
      frequency: 1,
      notification_date: new Date(),
      is_active: true,
    };

    let createdNotification = await createNotificationsForUser(notificationParameters);
    let vapidKey = '';
    let { success, errors } = await sendNotificationToMobileDevice(vapidKey, createdNotification);
    await deleteNotification(createdNotification.id);

    console.log({ success, errors });
  });
});
