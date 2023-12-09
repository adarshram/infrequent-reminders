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
import { SegmentedButtons, Surface, Modal, Portal } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { format, add } from "date-fns";
import "intl";
import "intl/locale-data/jsonp/en";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";

const CalendarModal = ({ onClose, onSelect }) => {
	const [modalVisible, setModalVisible] = useState(true);
	let today = new Date();
	const firstCalendarDate = add(today, { month: -2 });
	const lastCalendarDate = add(today, { years: 2 });
	const [currentMonth, setCurrentMonth] = useState(today);

	const subtractMonth = () => {};
	const tomorrow = add(today, { days: 1 });

	const addMonth = () => {};
	const MonthHeader = ({ month }) => {
		const monthText = format(month, "MMMM - yyyy");
		return <Text>{monthText}</Text>;
	};
	const onDayPress = (day) => {
		const calculatedNotificationDate = format(
			new Date(day.timestamp),
			"MM/dd/yyyy"
		);
		onSelect ? onSelect(calculatedNotificationDate) : "";
		onClose();
	};
	return (
		<Portal>
			<Modal
				props={{ transparent: false, animationType: "slide" }}
				animationType="slide"
				transparent={false}
				visible={modalVisible}
				onDismiss={() => {
					onClose();
				}}
			>
				<View>
					<Calendar
						// Initially visible month. Default = now
						// Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
						//minDate={format(firstCalendarDate, "yyyy-MM-dd")}
						// Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
						maxDate={format(lastCalendarDate, "yyyy-MM-dd")}
						// Handler which gets executed on day press. Default = undefined
						onDayPress={(day) => {
							onDayPress(day);
						}}
						// Handler which gets executed on day long press. Default = undefined
						onDayLongPress={(day) => {
							console.log("selected daylong press", day);
						}}
						// Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
						monthFormat={"yyyy MM"}
						// Handler which gets executed when visible month changes in calendar. Default = undefined
						onMonthChange={(month) => {
							setCurrentMonth(new Date(month.timestamp));
						}}
						// Hide month navigation arrows. Default = false
						// Replace default arrows with custom ones (direction can be 'left' or 'right')
						// Do not show days of other months in month page. Default = false
						hideExtraDays={false}
						// If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
						// day from another month that is visible in calendar page. Default = false
						disableMonthChange={false}
						// If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
						firstDay={1}
						// Handler which gets executed when press arrow icon left. It receive a callback can go back month
						onPressArrowLeft={(subtractMonth) => subtractMonth()}
						// Handler which gets executed when press arrow icon right. It receive a callback can go next month
						onPressArrowRight={(addMonth) => addMonth()}
						// Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
						disableAllTouchEventsForDisabledDays={false}
						// Replace default month and year title with custom one. the function receive a date as parameter
						renderHeader={() => {
							return <MonthHeader month={currentMonth} />;
						}}
						// Enable the option to swipe between months. Default = false
						enableSwipeMonths={true}
					/>
				</View>
			</Modal>
		</Portal>
	);
};

export const CreateEditSingle = ({ onSave, prefilledReminderData }) => {
	const [formData, setFormData] = useState({});
	const [reminderData, setReminderData] = useState({
		frequency: "1",
		frequency_type: "w",
	});
	const [errors, setErrors] = useState([]);
	const [reminderDate, setReminderDate] = useState("");
	const [nextReminderDate, setNextReminderDate] = useState("");
	const [calendarModal, setCalendarModal] = useState(false);
	const [userSetDate, setUserSetDate] = useState<boolean>(false);
	const onChange = (key, value) => {
		setFormData({
			...formData,
			[key]: value,
		});
	};
	const hasPrefilledData =
		prefilledReminderData && prefilledReminderData.id ? true : false;
	useEffect(() => {
		const hasPrefilledData =
			prefilledReminderData && prefilledReminderData.id ? true : false;
		if (hasPrefilledData) {
			setReminderData({
				frequency: prefilledReminderData.frequency,
				frequency_type: prefilledReminderData.frequency_type,
				notification_date: prefilledReminderData.notification_date,
			});
			setReminderDate(
				format(
					new Date(prefilledReminderData.notification_date),
					"MM/dd/yyyy"
				)
			);
			setFormData({
				subject: prefilledReminderData.subject,
				description: prefilledReminderData.description,
				frequency_type: prefilledReminderData.frequency_type,
			});
		}
	}, [prefilledReminderData]);

	useEffect(() => {
		let notificationDateObject = new Date(reminderDate);
		let isValidDate = isNaN(notificationDateObject) ? false : true;
	}, [reminderDate]);

	const validateSubmit = () => {
		let validate = true;
		let errorMessages = [];
		if (!formData.subject || formData.subject === "") {
			validate = false;
			errorMessages.push("Subject Is required");
		}
		if (!formData.description || formData.description === "") {
			validate = false;
			errorMessages.push("Description Is required");
		}
		if (!formData.frequency_type) {
			validate = false;
			errorMessages.push("Frequency Is required");
		}

		setErrors(errorMessages);
		return validate;
	};
	const handleSubmit = () => {
		if (!validateSubmit()) {
			console.log(errors);
			return;
		}

		if (formData.frequency_type === "d" && formData.frequency <= 7) {
			console.log("minimum 7 days");
			return;
		}

		let saveParameters = {
			...reminderData,
			...formData,
			notification_date: reminderDate,
		};

		if (hasPrefilledData) {
			saveParameters = {
				...saveParameters,
				id: prefilledReminderData.id,
			};
		}

		onSave(saveParameters);
	};

	const onUserSelectDate = (formattedDate) => {
		let dateObject = new Date("Y-m-d", formattedDate);
		setReminderDate(formattedDate);
		setUserSetDate(true);
	};

	const onFrequencyChange = ({
		frequency,
		frequency_type,
		prefillDate = null,
	}) => {
		let currentReminderDate = prefillDate ? prefillDate : reminderDate;
		let addDateObject = new Date();
		if (!onUserSelectDate && !hasPrefilledData) {
			let notificationDateObject = new Date();
			if (reminderData.notification_date) {
				notificationDateObject = new Date(
					reminderData.notification_date
				);

				setReminderDate(format(notificationDateObject, "MM/dd/yyyy"));
				currentReminderDate = format(
					notificationDateObject,
					"MM/dd/yyyy"
				);
				addDateObject = notificationDateObject;
			}
		}

		let addSetting = { weeks: 1 };

		if (frequency_type === "w") {
			addSetting = { weeks: frequency };
		}
		if (frequency_type === "d") {
			addSetting = { days: frequency };
		}
		if (frequency_type === "m") {
			addSetting = { months: frequency };
		}

		if (frequency_type === "y") {
			addSetting = { years: frequency };
		}
		setFormData({
			...formData,
			frequency: frequency,
			frequency_type: frequency_type,
		});
		let nextDate = add(addDateObject, addSetting);
		setNextReminderDate(format(nextDate, "MM/dd/yyyy"));
	};

	return (
		<>
			{calendarModal && (
				<CalendarModal
					onClose={() => setCalendarModal(false)}
					onSelect={onUserSelectDate}
				/>
			)}
			<TextInput
				label="Subject"
				value={formData.subject}
				onChangeText={(text) => {
					onChange("subject", text);
				}}
				testID="subject"
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
				changeFrequency={(v) => onFrequencyChange(v)}
				{...reminderData}
			/>
			<TextInput
				label="First Reminder Date"
				value={reminderDate}
				onChangeText={(text) => {
					setCalendarModal(true);
				}}
				onFocus={() => setCalendarModal(true)}
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

const ReminderOptions = ({ frequency_type, frequency, changeFrequency }) => {
	const [value, setValue] = useState("");
	const [custom, setCustom] = useState<boolean>(false);

	const [reminderInfo, setReminderInfo] = useState<Reminderdata>({
		frequency: frequency ?? "1",
		frequency_type: frequency_type ?? "w",
	});

	const onChange = (key, value) => {
		let updatedValue = {
			...reminderInfo,
			[key]: value,
		};

		setReminderInfo(updatedValue);
		changeFrequency(updatedValue);
	};
	useEffect(() => {
		if (frequency && frequency_type) {
			setReminderInfo({
				frequency: frequency ?? "1",
				frequency_type: frequency_type ?? "w",
			});
		}
	}, [frequency, frequency_type]);

	useEffect(() => {
		let updatedFrequency = (updatedFrequency = {
			frequency: reminderInfo.frequency,
			frequency_type: reminderInfo.frequency_type,
		});
		if (reminderInfo.frequency === "1" || reminderInfo.frequency === 1) {
			if (reminderInfo.frequency_type === "w") {
				setValue("weekly");
			}
			if (reminderInfo.frequency_type === "m") {
				setValue("monthly");
			}
		}
	}, [reminderInfo, changeFrequency]);

	const setFrequencyTypeChange = (val) => {
		if (val === "weekly") {
			setCustom(false);
			let updatedValue = {
				frequency_type: "w",
				frequency: "1",
			};
			setReminderInfo(updatedValue);
			changeFrequency(updatedValue);
		}
		if (val === "monthly") {
			setCustom(false);
			let updatedValue = {
				frequency_type: "m",
				frequency: "1",
			};
			setReminderInfo(updatedValue);
			changeFrequency(updatedValue);
		}

		if (val === "custom") {
			setCustom(true);
		}

		setValue(val);
	};

	return (
		<>
			<SegmentedButtons
				value={value}
				onValueChange={setFrequencyTypeChange}
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
