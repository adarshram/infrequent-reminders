import MetaNotificationsClass from './../src/models/MetaNotifications';
import { createConnection } from 'typeorm';

import { expect } from 'chai';
import 'mocha';

describe('First Test', () => {
  /*it('should have results', async () => {
    const result = await getNotificationsForUser('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    expect(result.total > 0).to.equal(true);
    expect(result.results.length > 0).to.equal(true);
  });
  it('create notification', async () => {
    const result = await createNotificationsForUser({
      id: false,
      user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
      subject: 'Test 1',
      description: 'Test 1',
      frequency_type: 'w',
      frequency: 1,
      notification_date: new Date('2021-01-01'),
    });
  });
  it('should have one result', async () => {
    const result = await getNotificationById(3, '83zkNxe3BtSpXsFgxrDgw49ktWj2');
    expect(result.id).to.equal('3');
  });
  it('should delete', async () => {
    const result = await deleteNotification(1);
    expect(result).to.equal(true);
  });
  it('should snooze notification', async () => {
    const results = await snoozeNotification(18, '83zkNxe3BtSpXsFgxrDgw49ktWj2');
    console.log(results);
  });
  it('should mark notification Done', async () => {
    const results = await completeNotification(18, '83zkNxe3BtSpXsFgxrDgw49ktWj2');
    console.log(results);
  });
  it('should pull notifications', async () => {
    const results = await getPendingNotifications('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    console.log(results);
  });
  it('should pull notifications', async () => {
    const results = await getPendingNotificationCount('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    console.log(results);
  });*/
  it('should create meta', async () => {
    await createConnection();
    let metaObject = new MetaNotificationsClass();
    metaObject.setUserId('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    let results = await metaObject.testRepositoryFunction(18);

    /*
    let metaNotificationParameter = {
      notification_id: 18,
      user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
      cron_snoozed: 0,
      user_snoozed: 0,
    };
    let metaObject = new MetaNotificationsClass();
    metaObject.setUserId(metaNotificationParameter.user_id);
    let results = await metaObject.updateUserSnooze(18);
    let results = await metaObject.updateCronSnooze(18);
    
    const results = await metaObject.saveOrUpdate(metaNotificationParameter);
    console.log(results);*/
  });
});
