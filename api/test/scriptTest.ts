import DailyUpdate from './../src/scripts/dailyUpdates';

import { expect } from 'chai';
import 'mocha';

describe('First Test', () => {
  /*it('first Script test', async () => {
    const result = await updateWeeklyNotifications();
    console.log(result);
  });
  it('first Script test', async () => {
    const result = await sendTestNotifications();
    console.log(result);
  });*/
  it('daily update cron', async () => {
    let updater = new DailyUpdate();
    let runResults = await updater.run();
    console.log(run);
  });
});
