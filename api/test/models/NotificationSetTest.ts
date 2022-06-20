import { getRepository, getManager } from 'typeorm';
import {
  createNotificationSet,
  getNotificationSetById,
  matchNotificationSet,
  deleteNotificationSetById,
  linkNotificationToSet,
  deleteNotificationFromSet,
} from './../../src/models/notificationSet';
import { UserNotifications } from './../../src/entity/UserNotifications';

import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
before(async () => {
  await createConnection();
});

describe('First Test', () => {
  it('should link existing reminder and delete', async () => {
    const userNotificationsRepository = await getRepository(UserNotifications);
    const firstNotification = await userNotificationsRepository.createQueryBuilder('up').getOne();
    //create first
    let createdSet = await createNotificationSet('My Description', 'My Subject');
    expect(createdSet).to.not.equal(false);
    if (typeof createdSet !== 'boolean') {
      let linked = await linkNotificationToSet(firstNotification.id, createdSet.id);
      expect(linked.set_id).to.be.equal(createdSet.id);
      await deleteNotificationSetById(createdSet.id);
      await deleteNotificationFromSet(firstNotification.id);
    }
  });

  it('should match notification set', async () => {
    let createdSet = await createNotificationSet('My Description', 'My Subject');

    const results = await matchNotificationSet({
      subject: 'My Subject',
    });
    expect(results.length).to.be.greaterThan(0);
    if (typeof createdSet !== 'boolean') {
      await deleteNotificationSetById(createdSet.id);
    }
  });
  it('should create and get notification by id', async () => {
    let time = getTime(new Date());
    let testSubject = `sdfsdfs ${time}`;
    const createTestSet = await createNotificationSet('My Description', testSubject);
    if (typeof createTestSet !== 'boolean') {
      const result = await getNotificationSetById(createTestSet.id);
      expect(result.subject).to.be.equal(testSubject);
      let deleted = await deleteNotificationSetById(createTestSet.id);
      expect(deleted).to.equal(true);
    }
  });
  it('should not allow duplicate subject', async () => {
    //create first
    let createdSet = await createNotificationSet('My Description', 'My Subject');
    //try again . this should fail
    const result = await createNotificationSet('My Description', 'My Subject');
    expect(result).to.equal(false);

    if (typeof createdSet !== 'boolean') {
      await deleteNotificationSetById(createdSet.id);
    }
  });
});
