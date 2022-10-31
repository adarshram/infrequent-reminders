import {
  format,
  differenceInCalendarDays,
  addWeeks,
  addMonths,
  addDays,
  subDays,
  compareAsc,
} from 'date-fns';
interface DateReturn {
  date: Date;
  days: number;
  shouldReset?: boolean;
}

export const calculateSnoozeDate = (
  inputDate: Date,
  frequency: number,
  frequencyType: string,
  pastSnoozeCount?: number,
): DateReturn => {
  let nextNotificationDate = new Date();
  let alreadySnoozedTimes = pastSnoozeCount ? pastSnoozeCount : 0;
  if (frequencyType == 'm') {
    nextNotificationDate = addMonths(inputDate, frequency);
  }
  if (frequencyType == 'w') {
    nextNotificationDate = addWeeks(inputDate, frequency);
  }

  let daysToNextNotification = differenceInCalendarDays(nextNotificationDate, inputDate);
  let snoozePercentConfig = {
    1: 10,
    3: 30,
    5: 50,
  };
  let shouldReset = false;

  let snoozePercent = snoozePercentConfig[1];
  if (alreadySnoozedTimes >= 3) {
    snoozePercent = snoozePercentConfig[3];
  }
  if (alreadySnoozedTimes >= 5) {
    snoozePercent = snoozePercentConfig[5];
  }
  if (alreadySnoozedTimes > 7) {
    snoozePercent = 100;
    shouldReset = true;
  }
  let snoozeDays = Math.ceil(daysToNextNotification * (snoozePercent / 100));
  let snoozeDate = addDays(new Date(), snoozeDays);
  return {
    date: snoozeDate,
    days: snoozeDays,
    shouldReset: shouldReset,
  };
};

export const calculateNextNotification = (
  inputDate: Date,
  frequency: number,
  frequencyType: string,
): DateReturn => {
  let nextNotificationDate = new Date();
  if (frequencyType == 'm') {
    nextNotificationDate = addMonths(inputDate, frequency);
  }
  if (frequencyType == 'w') {
    nextNotificationDate = addWeeks(inputDate, frequency);
  }

  let daysToNextNotification = differenceInCalendarDays(nextNotificationDate, inputDate);
  return {
    date: nextNotificationDate,
    days: daysToNextNotification,
  };
};
