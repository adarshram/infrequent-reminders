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
}

export const calculateSnoozeDate = (
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
  //Get 10 percent to snooze
  let snoozeDays = Math.ceil(daysToNextNotification * (10 / 100));
  let snoozeDate = addDays(new Date(), snoozeDays);
  return {
    date: snoozeDate,
    days: snoozeDays,
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
