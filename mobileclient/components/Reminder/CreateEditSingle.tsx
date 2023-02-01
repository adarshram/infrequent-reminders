import React, { useEffect, useState } from "react";
import {
	Image,
	Platform,
	ScrollView,
	Text,
	View,
	ActivityIndicator,
	StyleSheet,
	Pressable,
} from "react-native";

export interface Reminderdata {
	frequency: number;
	frequency_type: string;
}
import { TextInput, Button, Snackbar, HelperText } from "react-native-paper";
import { SegmentedButtons, Surface } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { format, add } from "date-fns";
import { DatePickerInput } from "react-native-paper-dates";
import "intl";
import "intl/locale-data/jsonp/en";

export const CreateEditSingle = ({ onSave }) => {
	const [formData, setFormData] = useState({});
	const [reminderData, setReminderData] = useState({});
	const [errors, setErrors] = useState([]);
	const [reminderDate, setReminderDate] = useState("");
	const [nextReminderDate, setNextReminderDate] = useState("");
	const onChange = (key, value) => {
		setFormData({
			...formData,
			[key]: value,
		});
	};
	const handleSubmit = () => {
		if (!reminderData.frequency_type) {
			console.log("invalid");
			return;
		}

		if (
			reminderData.frequency_type === "d" &&
			reminderData.frequency <= 7
		) {
			console.log("minimum 7 days");
			return;
		}
		onSave();
		/*console.log(formData);
		console.log(reminderData);
		console.log(reminderDate);
		console.log(nextReminderDate);*/
	};
	useEffect(() => {
		if (reminderData) {
			let addSetting = { weeks: 1 };

			if (reminderData.frequency_type === "w") {
				addSetting = { weeks: reminderData.frequency };
			}
			if (reminderData.frequency_type === "d") {
				addSetting = { days: reminderData.frequency };
			}
			if (reminderData.frequency_type === "m") {
				addSetting = { months: reminderData.frequency };
			}

			if (reminderData.frequency_type === "y") {
				addSetting = { years: reminderData.frequency };
			}
			let addDateObject = add(new Date(), addSetting);
			const calculatedNotificationDate = format(
				addDateObject,
				"MM/dd/yyyy"
			);

			setReminderDate(calculatedNotificationDate);
			let nextDate = add(addDateObject, addSetting);
			setNextReminderDate(format(nextDate, "MM/dd/yyyy"));
		}
	}, [reminderData]);

	return (
		<>
			<TextInput
				label="Title"
				value={formData.title}
				onChangeText={(text) => {
					onChange("title", text);
				}}
				testID="title"
			/>
			<TextInput
				label="Description"
				value={formData.description}
				onChangeText={(text) => {
					onChange("description", text);
				}}
				testID="description"
			/>
			<Text>Repeats</Text>
			<ReminderOptions
				reminderData={reminderData}
				setReminderData={setReminderData}
			/>
			<TextInput
				label="First Reminder Date"
				value={reminderDate}
				onChangeText={(text) => {}}
				testID="firstReminder"
			/>

			<Text>
				Next Reminder Date:
				<Text testID="next_reminder_date">
					{nextReminderDate ? nextReminderDate : ""}
				</Text>
			</Text>

			<Button
				mode="contained"
				onPress={handleSubmit}
				testID="submit_form"
			>
				Submit
			</Button>
		</>
	);
};

const CustomRemiderOptions = ({ frequencyType, setFrequencyType }) => {
	const [showDropDown, setShowDropDown] = useState(true);

	const customReminderList = [
		{
			label: "Days",
			value: "d",
		},
		{
			label: "Weeks",
			value: "w",
		},
		{
			label: "Months",
			value: "m",
		},
		{
			label: "Years",
			value: "y",
		},
	];

	return (
		<Surface>
			<DropDown
				label={"Repeat Duration"}
				mode={"flat"}
				visible={showDropDown}
				showDropDown={() => setShowDropDown(true)}
				onDismiss={() => setShowDropDown(false)}
				value={frequencyType}
				setValue={setFrequencyType}
				list={customReminderList}
				testID={`reminder_frequency_type`}
			/>
		</Surface>
	);
};

const DatePicker = () => {
	const [inputDate, setInputDate] = useState("");

	return (
		<DatePickerInput
			locale="en"
			label="Reminder Date"
			value={inputDate}
			onChange={(d) => setInputDate(d)}
			inputMode="start"
		/>
	);
};

const ReminderOptions = ({ reminderData, setReminderData }) => {
	const [value, setValue] = useState("");
	const [custom, setCustom] = useState<boolean>(false);
	const [reminderInfo, setReminderInfo] = useState<Reminderdata>(
		reminderData.frequency
			? {
					frequency: reminderData.frequency ?? "1",
					frequency_type: reminderData.frequency_type ?? "w",
			  }
			: {
					frequency: "1",
					frequency_type: "w",
			  }
	);

	const onChange = (key, value) => {
		setReminderInfo({
			...reminderInfo,
			[key]: value,
		});
	};
	useEffect(() => {
		if (value === "weekly") {
			setCustom(false);
			setReminderInfo({
				frequency_type: "w",
				frequency: "1",
			});
		}
		if (value === "monthly") {
			setCustom(false);
			setReminderInfo({
				frequency_type: "m",
				frequency: "1",
			});
		}

		if (value === "custom") {
			setCustom(true);
		}
	}, [value]);

	useEffect(() => {
		if (reminderInfo.frequency === "1" && reminderInfo.frequency === 1) {
			if (reminderInfo.frequency_type === "w") {
				setValue("weekly");
			}
			if (reminderInfo.frequency_type === "m") {
				setValue("monthly");
			}
		}
		setReminderData(reminderInfo);
	}, [reminderInfo]);

	return (
		<>
			<SegmentedButtons
				value={value}
				onValueChange={setValue}
				buttons={[
					{
						value: "weekly",
						label: "Weekly",
						testID: "weekly",
					},
					{
						value: "monthly",
						label: "Monthly",
						testID: "monthly",
					},
					{ value: "custom", label: "Custom", testID: "custom" },
				]}
			/>
			{custom && (
				<>
					<TextInput
						label="Frequency"
						value={reminderInfo.frequency}
						onChangeText={(text) => {
							onChange("frequency", text);
						}}
						testID="reminder_frequency"
					/>
					<CustomRemiderOptions
						setFrequencyType={(v) => {
							onChange("frequency_type", v);
						}}
						frequencyType={reminderInfo.frequency_type}
					/>
				</>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	containerStyle: {
		flex: 1,
	},
	spacerStyle: {
		marginBottom: 15,
	},
	safeContainerStyle: {
		flex: 1,
		margin: 20,
		justifyContent: "center",
	},
});
