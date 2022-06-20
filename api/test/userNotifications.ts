import {
  getNotificationsForUser,
  createNotificationsForUser,
  getNotificationById,
  deleteNotification,
  getPendingNotifications,
  snoozeNotification,
  completeNotification,
  getPendingNotificationCount,
} from './../src/models/userNotifications';

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
  it('should pull notifications', async () => {
    const results = await getPendingNotificationCount('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    console.log(results);
  });
});
