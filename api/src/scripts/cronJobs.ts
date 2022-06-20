let cron = require('node-cron');
import DailyUpdate from './dailyUpdates';

var task = cron.schedule('* * * * *', async () => {
  let updater = new DailyUpdate();
  let runResults = await updater.run();
  console.log(runResults);
});
