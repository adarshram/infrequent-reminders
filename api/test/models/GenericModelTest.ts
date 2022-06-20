import { getRepository, getManager } from 'typeorm';
import {
  getById,
  deleteById,
  deleteByColumn,
  whereByColumns,
} from './../../src/models/genericModel';
import { UserNotifications } from './../../src/entity/UserNotifications';
import { NotificationSet } from './../../src/entity/NotificationSet';

import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
before(async () => {
  await createConnection();
});

describe('First Test', () => {
  xit('get notification by id', async () => {
    const data = await getById(UserNotifications, 21);
    expect(data.id).to.be.equal('21');
  });
  xit('delete set by id', async () => {
    const data = await deleteById(NotificationSet, 67);
    expect(data).to.be.equal(true);
  });
  xit('delete by column', async () => {
    const data = await deleteByColumn(NotificationSet, {
      column: 'subject',
      value: 'Hello There 1654421308905',
    });
    expect(data).to.be.equal(true);
  });
  it('where by columns', async () => {
    const data = await whereByColumns(UserNotifications, [
      {
        column: 'subject',
        value: 'Bathe Sparky',
      },
      {
        column: 'frequency_type',
        value: 'w',
      },
    ]);
    console.log(data);
    //expect(data[0].subject).to.be.equal('Bathe Sparky');
  });
});
