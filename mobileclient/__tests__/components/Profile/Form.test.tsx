import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Form } from "../../../components/Profile/Form";

/**
 * A good place to start is having a tests that your component renders correctly.
 */
test("renders correctly", async () => {
  const saveFn = jest.fn();
  await render(<Form onSave={saveFn} />);

  fireEvent.changeText(screen.getByTestId("email"), "adarshram@gmail.com");
  fireEvent.changeText(screen.getByTestId("first_name"), "adarsh");
  fireEvent.changeText(screen.getByTestId("last_name"), "aadarsh");
  fireEvent.press(screen.getByTestId("submit_form"));
  expect(saveFn).toHaveBeenCalled();

  //screen.debug();
});
