import { calculateSnoozeDate, calculateNextNotification } from './../src/utils/dateManipulators';
import { createConnection } from 'typeorm';
import { expect } from 'chai';
import 'mocha';
import {
  format,
  differenceInCalendarDays,
  addWeeks,
  addMonths,
  addDays,
  subDays,
  compareAsc,
} from 'date-fns';

//npm test test/dateManipulators.ts -- --grep "snoozes notifications depending on count"

describe('dbConnection', () => {
  it('dbConnection', async () => {
    let results = await createConnection({
      type: 'postgres',
      url: 'postgres://postgres:192.168.5.129@localhost:5432/infrequent-scheduler',
      entities: ['src/entity/*.ts'],
      ssl: false,
      connectTimeoutMS: 20,
    });
    console.log(results);
  }).timeout(10000);
});

describe('should give snooze date', () => {
  it('week snooze date', () => {
    const result = calculateSnoozeDate(new Date(), 2, 'w');
    expect(result.days).to.equal(2);
  });
  it('month snooze date', () => {
    const result = calculateSnoozeDate(new Date(), 2, 'm');
    expect(result.days).to.equal(6);
  });
  it('snoozes notifications depending on count', () => {
    //Min 2 days
    let result = calculateSnoozeDate(new Date(), 1, 'w');
    expect(result.days == 2).to.equal(true);
    //10 percent by default
    result = calculateSnoozeDate(new Date(), 1, 'm');
    expect(result.days >= 3 && result.days <= 4).to.equal(true);

    //30 percent
    result = calculateSnoozeDate(new Date(), 1, 'm', 4);
    expect(result.days >= 9 && result.days <= 11).to.equal(true);

    //50 percent
    result = calculateSnoozeDate(new Date(), 1, 'm', 5);
    expect(result.days >= 14 && result.days <= 18).to.equal(true);

    //100 percent
    result = calculateSnoozeDate(new Date(), 1, 'm', 8);
    expect(result.days >= 28 && result.days <= 31).to.equal(true);
  });
});

describe('should give complete date', () => {
  it('week complete date', () => {
    const result = calculateNextNotification(new Date(), 2, 'w');
    expect(result.days).to.equal(14);
  });
  it('month complete date', () => {
    const result = calculateNextNotification(new Date(), 2, 'm');
    expect(result.days > 55).to.equal(true);
  });
});
