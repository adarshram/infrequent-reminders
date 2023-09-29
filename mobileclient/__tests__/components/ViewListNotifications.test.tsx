import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { format, add } from "date-fns";

import { ViewListNotifications } from "../../components/ViewListNotifications";
import { UserContext } from "../../models/UserContext";
import { ViewSingle } from "../../components/Reminder/ViewSingle";
import { TextInput, Button, Snackbar, HelperText } from "react-native-paper";

import useServerCall from "../../hooks/useServerCall";
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

const DummyViewSingle = ({
	reminder,
	onEdit,
	onSnooze,
	onComplete,
	onDelete,
	onView,
}) => {
	return (
		<>
			<Button
				mode="Outlined"
				compact={true}
				onPress={() => onEdit()}
				onLongPress={() => onView()}
				testID={`edit-${reminder.id}`}
			></Button>
		</>
	);
};

jest.mock("../../hooks/useServerCall", () => jest.fn());
jest.mock("../../components/Reminder/ViewSingle", () => {
	return {
		ViewSingle: DummyViewSingle,
	};
});
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};

//npm test __tests__/components/ViewListNotifications.test.tsx -- --t "renders prefill"

test("clicks edit", async () => {
	let caller = {
		get: async (v) => {
			console.log(v);
		},
	};
	useServerCall.mockReturnValue([{ myData: "myData" }, false, false, caller]);

	let navigation = { navigate: jest.fn() };

	await render(
		<UserContext.Provider value={userContextObject}>
			<ViewListNotifications
				notifications={mockData}
				navigation={navigation}
			/>
		</UserContext.Provider>
	);
	const editFirst = `edit-${mockData[0]["id"]}`;

	fireEvent.press(screen.getByTestId(editFirst));
	expect(navigation.navigate).toHaveBeenCalled();

	//fireEvent.changeText(screen.getByTestId("description"), "Desc");

	//screen.debug();
});

const mockData = [
	{
		created_at: "2023-02-07T18:30:00.000Z",
		description: "Hello1",
		frequency: 1,
		frequency_type: "w",
		id: "265",
		is_active: true,
		meta_notifications: {
			cron_snoozed: 0,
			done_count: 3,
			id: 337,
			updated_at: "2023-02-07T18:30:00.000Z",
			user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
			user_snoozed: 0,
		},
		notification_date: "2023-02-14T18:30:00.000Z",
		subject: "Hello",
		updated_at: "2023-02-07T18:30:00.000Z",
		user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
	},
	{
		created_at: "2023-02-07T18:30:00.000Z",
		description: "Test Me",
		frequency: 1,
		frequency_type: "w",
		id: "266",
		is_active: true,
		meta_notifications: {
			cron_snoozed: 0,
			done_count: 1,
			id: 338,
			updated_at: "2023-02-07T18:30:00.000Z",
			user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
			user_snoozed: 0,
		},
		notification_date: "2023-02-14T18:30:00.000Z",
		subject: "First Test",
		updated_at: "2023-02-07T18:30:00.000Z",
		user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
	},
	{
		created_at: "2023-04-05T18:30:00.000Z",
		description: "Something!",
		frequency: 1,
		frequency_type: "w",
		id: "268",
		is_active: true,
		meta_notifications: {
			cron_snoozed: 0,
			done_count: 5,
			id: 362,
			updated_at: "2023-04-19T18:30:00.000Z",
			user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
			user_snoozed: 2,
		},
		notification_date: "2023-04-20T18:30:00.000Z",
		subject: "Test me here",
		updated_at: "2023-04-19T18:30:00.000Z",
		user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
	},
	{
		created_at: "2023-05-15T18:30:00.000Z",
		description: "dsvsdvdsv",
		frequency: 1,
		frequency_type: "m",
		id: "269",
		is_active: true,
		meta_notifications: {
			cron_snoozed: 0,
			done_count: 0,
			id: 364,
			updated_at: "2023-05-15T18:30:00.000Z",
			user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
			user_snoozed: 1,
		},
		notification_date: "2023-05-16T18:30:00.000Z",
		subject: "sdvsdsd",
		updated_at: "2023-05-22T18:30:00.000Z",
		user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
	},
];
