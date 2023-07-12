import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { format, add } from "date-fns";

import { NotificationHandler } from "../../../components/HomeSections/NotificationHandler";
import { UserContext } from "../../../models/UserContext";

import useServerCall from "../../../hooks/useServerCall";

import messaging from "@react-native-firebase/messaging";
jest.mock("../../../hooks/useServerCall", () => jest.fn());
jest.mock("@react-native-firebase/messaging", () => () => {
  return {
    registerDeviceForRemoteMessages: () => {},
    getToken: () => "1234456",
  };
});

//npm test __tests__/components/HomeSections/NotificationHandler.test.tsx -- --t "renders prefill"
const wait = async () => {
  new Promise(function (resolve) {
    setTimeout(resolve, 100);
  });
};
let userContextObject = {
  user: {
    displayName: null,
    email: "adarsh@tester1.com",
    emailVerified: false,
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerId: "firebase",
    tenantId: null,
    uid: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
  },
};
test("renders prefill", async () => {
  let caller = {
    get: async (v) => {
      console.log(v);
    },
  };

  useServerCall.mockReturnValue([{ myData: "myData" }, false, false, caller]);
  await render(
    <UserContext.Provider value={userContextObject}>
      <NotificationHandler />
    </UserContext.Provider>
  );
  await wait();
  await wait();
  await wait();

  screen.debug();
});
test("renders correctly", async () => {
  const saveFn = jest.fn();
  await render(<CreateEditSingle onSave={saveFn} />);
  fireEvent.changeText(screen.getByTestId("subject"), "Hello");
  fireEvent.changeText(screen.getByTestId("description"), "Desc");
  //weekly should have been pressed by default
  expect(screen.getByTestId("weekly").props.accessibilityState.checked).toBe(
    true
  );
  expect(screen.getByTestId("monthly").props.accessibilityState.checked).toBe(
    false
  );
  fireEvent.press(screen.getByTestId("weekly"));

  fireEvent.press(screen.getByTestId("submit_form"));
  expect(saveFn).toHaveBeenCalled();
});
test("renders custom date correctly", async () => {
  const saveFn = jest.fn();
  await render(<CreateEditSingle onSave={saveFn} />);

  fireEvent.changeText(screen.getByTestId("subject"), "Hello");
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
