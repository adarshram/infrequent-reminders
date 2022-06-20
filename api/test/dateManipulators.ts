import { calculateSnoozeDate, calculateNextNotification } from './../src/utils/dateManipulators';

import { expect } from 'chai';
import 'mocha';

describe('should give snooze date', () => {
  it('week snooze date', () => {
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
