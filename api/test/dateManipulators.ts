import {
  calculateSnoozeDate,
  calculateNextNotification,
  calculateNextNotificationForAnchor,
} from './../src/utils/dateManipulators';
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
  setDate,
  lastDayOfMonth,
} from 'date-fns';

//npm test test/dateManipulators.ts -- --grep "should give complete date"

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
describe('should give next notification on anchor', () => {
  it('month anchor date', () => {
    const monthAnchorCases = [
      {
        currentDate: new Date('2024-01-31'),
        frequency: 1,
        anchor_number: 31,
        expectedDate: new Date('2024-02-29'),
      },
      {
        currentDate: new Date('2024-05-31'),
        frequency: 2,
        anchor_number: 31,
        expectedDate: new Date('2024-07-31'),
      },
      {
        currentDate: new Date('2024-05-31'),
        frequency: 2,
        anchor_number: 1,
        expectedDate: new Date('2024-07-01'),
      },
    ];
    monthAnchorCases.map((testCase) => {
      const nextNotificationDate = calculateNextNotificationForAnchor(
        testCase.currentDate,
        testCase.frequency,
        'm',
        testCase.anchor_number,
      );
      expect(format(nextNotificationDate.date, 'yyyy-MM-dd')).to.equal(
        format(testCase.expectedDate, 'yyyy-MM-dd'),
      );
    });
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
  it('days complete date', () => {
    const result = calculateNextNotification(new Date(), 35, 'd');
    expect(result.days >= 35).to.equal(true);
  });
});
