import { calculateSnoozeDate, calculateNextNotification } from './../src/utils/dateManipulators';
import { createConnection } from 'typeorm';
import { expect } from 'chai';
import 'mocha';
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
    console.log(process.env.DATABASE_URL);
    const result = calculateSnoozeDate(new Date(), 2, 'w');
    expect(result.days).to.equal(2);
  });
  it('month snooze date', () => {
    const result = calculateSnoozeDate(new Date(), 2, 'm');
    expect(result.days).to.equal(6);
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
