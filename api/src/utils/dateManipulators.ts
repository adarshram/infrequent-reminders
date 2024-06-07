import {
  format,
  differenceInCalendarDays,
  addWeeks,
  addMonths,
  addDays,
  setDate,
  lastDayOfMonth,
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
  let calculatedSnoozeDays = Math.ceil(daysToNextNotification * (snoozePercent / 100));
  const minSnoozeDays = 2;
  let snoozeDays = calculatedSnoozeDays < minSnoozeDays ? minSnoozeDays : calculatedSnoozeDays;
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

export const calculateNextNotificationForAnchor = (
  inputDate: Date,
  frequency: number,
  frequencyType: string,
  anchor_number: number,
): DateReturn => {
  let nextNotificationDate = new Date();
  if (frequencyType == 'm') {
    nextNotificationDate = calculateNextDateWithAnchor(inputDate, frequency, anchor_number);
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
export const calculateNextDateWithAnchor = (
  currentDate: Date,
  frequency: number,
  anchor_number: number,
): Date => {
  const nextNotification = addMonths(currentDate, frequency);
  const lastDay = (format(lastDayOfMonth(nextNotification), 'dd') as unknown as number) * 1;
  const dateDay = anchor_number > lastDay ? lastDay : anchor_number;
  const nextNotificationDate = setDate(nextNotification, dateDay);
  return nextNotificationDate;
};
