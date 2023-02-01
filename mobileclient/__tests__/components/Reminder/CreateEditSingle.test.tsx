import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { format, add } from "date-fns";

import { CreateEditSingle } from "../../../components/Reminder/CreateEditSingle";
//npm test __tests__/components/Reminder/CreateEditSingle.test.tsx -- --t "custom"

/**
 * {
  "user_id": "83zkNxe3BtSpXsFgxrDgw49ktWj2",
  "subject": "sdsdvds",
  "description": "sdfsd",
  "frequency_type": "w",
  "frequency": 1,
  "notification_date": "02/03/2023",
  "meta_notifications": {
    "user_id": "83zkNxe3BtSpXsFgxrDgw49ktWj2",
    "cron_snoozed": 0,
    "user_snoozed": 0,
    "done_count": 0,
    "updated_at": "2023-01-27T11:40:29.539Z",
    "id": 321
  },
  "is_active": true,
  "created_at": "2023-01-27T11:40:29.539Z",
  "updated_at": "2023-01-27T11:40:29.539Z",
  "id": "66"
}
 */
jest.mock("react-native-paper-dropdown", () => {
  return "";
});
test("renders correctly", async () => {
  const saveFn = jest.fn();
  await render(<CreateEditSingle onSave={saveFn} />);
  fireEvent.changeText(screen.getByTestId("title"), "Hello");
  fireEvent.changeText(screen.getByTestId("description"), "Desc");
  fireEvent.press(screen.getByTestId("weekly"));

  fireEvent.press(screen.getByTestId("submit_form"));
  expect(saveFn).toHaveBeenCalled();
});
test("renders custom date correctly", async () => {
  const saveFn = jest.fn();
  await render(<CreateEditSingle onSave={saveFn} />);

  fireEvent.changeText(screen.getByTestId("title"), "Hello");
  fireEvent.changeText(screen.getByTestId("description"), "Desc");
  expect(screen.queryByTestId("reminder_frequency")).toBe(null);
  fireEvent.press(screen.getByTestId("custom"));
  expect(screen.queryByTestId("reminder_frequency")).not.toBe(null);
  fireEvent.changeText(screen.getByTestId("reminder_frequency"), "2");

  fireEvent.press(screen.queryByTestId("reminder_frequency_type"));
  act(() => {
    screen.queryByTestId("reminder_frequency_type").props.setValue("d");
  });
  fireEvent.press(screen.getByTestId("submit_form"));
  expect(saveFn).not.toHaveBeenCalled();

  act(() => {
    screen.queryByTestId("reminder_frequency_type").props.setValue("d");
  });
  act(() => {
    fireEvent.changeText(screen.getByTestId("reminder_frequency"), "8");
  });

  //next date should be 8 days after
  let calculatedNotificationDate = format(
    add(new Date(), { days: 8 }),
    "MM/dd/yyyy"
  );
  expect(screen.getByTestId("firstReminder").props.value).toBe(
    calculatedNotificationDate
  );

  fireEvent.press(screen.getByTestId("submit_form"));
  expect(saveFn).toHaveBeenCalled();

  //turns weekly on
  act(() => {
    screen.queryByTestId("reminder_frequency_type").props.setValue("w");
  });
  act(() => {
    fireEvent.changeText(screen.getByTestId("reminder_frequency"), "1");
  });

  //should be a week after
  calculatedNotificationDate = format(
    add(new Date(), { weeks: 1 }),
    "MM/dd/yyyy"
  );
  expect(screen.getByTestId("firstReminder").props.value).toBe(
    calculatedNotificationDate
  );
});
