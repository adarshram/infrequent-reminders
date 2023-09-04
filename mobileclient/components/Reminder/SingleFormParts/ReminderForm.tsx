import React, { useEffect, useState, useContext } from "react";

import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { TextInput, SegmentedButtons, Divider } from "react-native-paper";
import {
	Button,
	Dialog,
	Portal,
	Surface,
	Chip,
	Banner,
	Snackbar,
} from "react-native-paper";
import { CustomDateDialog, BaseOptions } from "./FrequencyOptions";
import CalendarModal from "./CalendarModal";
import { format, add } from "date-fns";

import SmallText from "./SmallText";
import RepeatDescription from "./RepeatDescription";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	textDivider: {
		padding: 1,
	},
	formInputSurface: {
		padding: 1,
		width: "95%",
		alignItems: "flex-start",
	},
});
const calculateNextDate = (
	currentDateObject: Date,
	frequency: number,
	frequencyType: string
): Date => {
	interface addSettingType {
		weeks?: number;
		days?: number;
		months?: number;
		years?: number;
	}
	let addSetting: addSettingType = { weeks: 1 };

	if (frequencyType === "w") {
		addSetting = { weeks: frequency };
	}
	if (frequencyType === "d") {
		addSetting = { days: frequency };
	}
	if (frequencyType === "m") {
		addSetting = { months: frequency };
	}

	if (frequencyType === "y") {
		addSetting = { years: frequency };
	}
	let nextDate = add(currentDateObject, addSetting);
	return nextDate;
};

const ErrorBanner = ({ errors, onClose }) => {
	return (
		<>
			<Snackbar
				visible={true}
				onDismiss={() => {
					onClose ? onClose() : "";
				}}
				action={{
					label: "OK",

					onPress: () => {
						onClose ? onClose() : "";
					},
				}}
			>
				{errors.map((currentError: string) => {
					return (
						<Text style={{ color: "white" }}>*{currentError}</Text>
					);
				})}
			</Snackbar>
		</>
	);
};
const ReminderForm = ({ onSave, onCancel, serverErrors, prefillData }) => {
	const [frequencyType, setFrequencyType] = useState<string>("w");
	const [frequency, setFrequency] = useState<number>(1);
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [errors, setErrors] = useState([]);
	const [nextDate, setNextDate] = useState(
		calculateNextDate(currentDate, frequency, frequencyType)
	);

	useEffect(() => {
		if (prefillData) {
			setSubject(prefillData.subject);
			setDescription(prefillData.description);
			setCurrentDate(new Date(prefillData.notification_date));
			setFrequencyType(prefillData.frequency_type);
			setFrequency(prefillData.frequency);
		}
	}, [prefillData]);
	const [openCalendarModal, setOpenCalendarModal] = useState<bool>(false);

	const onBaseOptionChange = (p) => {
		if (p.frequency) {
			setFrequency(p.frequency);
		}
		if (p.frequencyType) {
			setFrequencyType(p.frequencyType);
		}
		setNextDate(
			calculateNextDate(currentDate, p.frequency, p.frequencyType)
		);
	};
	const onUserSelectDate = (currentDateObject: Date) => {
		setCurrentDate(new Date(currentDateObject));
		setNextDate(
			calculateNextDate(currentDateObject, frequency, frequencyType)
		);
	};
	const validateAndSave = (): bool => {
		setErrors([]);
		const [validated, validationErrors] = validateSubmit();
		if (!validated) {
			setErrors(validationErrors);
			return false;
		}
		setErrors([]);
		onSave
			? onSave({
					subject: subject,
					description: description,
					frequency: frequency,
					frequency_type: frequencyType,
					notification_date: currentDate,
			  })
			: "";
	};

	const validateSubmit = (): Array<boolean, Array<string>> => {
		let validate = true;
		let errorMessages = [];
		if (subject === "") {
			validate = false;
			errorMessages.push("Subject Is required");
		}
		if (description === "") {
			validate = false;
			errorMessages.push("Description Is required");
		}
		if (!frequencyType) {
			validate = false;
			errorMessages.push("Frequency TypeIs required");
		}
		if (!frequency || frequency < 1) {
			validate = false;
			errorMessages.push("Frequency Is required");
		}

		return [validate, errorMessages];
	};
	const showErrors = errors.length >= 1;
	return (
		<SafeAreaView style={styles.container}>
			{showErrors && (
				<ErrorBanner errors={errors} onClose={() => setErrors([])} />
			)}
			{openCalendarModal && (
				<CalendarModal
					onClose={() => setOpenCalendarModal(false)}
					onSelect={onUserSelectDate}
					initialDate={currentDate}
				/>
			)}
			<Surface elevation="1" style={styles.formInputSurface}>
				<TextInput
					label="Subject"
					mode="outlined"
					value={subject}
					onChangeText={(text) => setSubject(text)}
					style={{ width: "95%", padding: 1, marginLeft: "2%" }}
					right={<TextInput.Icon icon="asterisk" />}
				/>
				<Divider style={styles.textDivider} />
				<TextInput
					label="Description"
					mode="outlined"
					value={description}
					style={{ width: "95%", padding: 1, marginLeft: "2%" }}
					onChangeText={(text) => setDescription(text)}
				/>
				<Divider style={styles.textDivider} />
				<BaseOptions
					frequencyType={frequencyType}
					frequency={frequency}
					onChange={(change) => onBaseOptionChange(change)}
				/>
				<Divider style={styles.textDivider} />

				<RepeatDescription
					frequencyType={frequencyType}
					frequency={frequency}
				/>
				<View
					style={{
						padding: 1,
						justifyContent: "center",

						display: "flex",
						flexDirection: "row",
					}}
				>
					<Button
						icon="calendar"
						mode="contained"
						onPress={() => setOpenCalendarModal(true)}
						style={{ margin: 5 }}
					>
						{format(currentDate, "yyyy-MM-dd")}
					</Button>

					<Chip
						icon="calendar"
						onPress={() => setOpenCalendarModal(true)}
						style={{ margin: 5, borderRadius: 30, padding: 5 }}
					>
						Next:{format(nextDate, "yyyy-MM-dd")}
					</Chip>
				</View>
				<View
					style={{
						padding: 1,
						justifyContent: "center",
						width: "100%",
						display: "flex",
						flexDirection: "row",
					}}
				>
					<Button
						onPress={() => {
							validateAndSave();
						}}
						mode="contained"
					>
						Save
					</Button>
					<Button onPress={() => (onCancel ? onCancel() : "")}>
						Cancel
					</Button>
				</View>
			</Surface>
		</SafeAreaView>
	);
};
export default ReminderForm;
