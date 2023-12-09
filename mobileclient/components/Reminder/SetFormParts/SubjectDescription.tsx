import React, { useEffect, useState, useContext, useRef } from "react";

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
import { format, add } from "date-fns";
import SingleSet, { SubSingleReminderSetType } from "./SingleSet";
import ViewSingleSet from "./ViewSingleSet";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	textDivider: {
		padding: 1,
	},
	formInputSurface: {
		padding: 1,

		alignItems: "flex-start",
	},
});
const calculateNextDate = (
	currentDateObject: Date,
	frequency: number,
	frequencyType: string,
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

const SubjectDescription = ({
	onSave,
	onCancel,
	serverErrors,
	prefillData,
}) => {
	const [frequencyType, setFrequencyType] = useState<string>("w");
	const [frequency, setFrequency] = useState<number>(1);
	const [subject, setSubject] = useState(prefillData?.subject ?? "");
	const [description, setDescription] = useState(
		prefillData?.description ?? "",
	);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [errors, setErrors] = useState([]);
	const [nextDate, setNextDate] = useState(
		calculateNextDate(currentDate, frequency, frequencyType),
	);

	const [reminderSetData, setReminderSetData] = useState<
		Array<SubSingleReminderSetType>
	>(prefillData?.reminders ?? []);
	const [addSingleSet, setAddSingleSet] = useState<bool>(false);
	const [singleSetIndex, setSingleSetIndex] = useState<number | bool>(false);

	useEffect(() => {
		if (prefillData) {
			setSubject(prefillData?.subject ?? "");
			setDescription(prefillData?.description ?? "");
			let reminderSets = [];
			if (prefillData?.reminders) {
				reminderSets = prefillData.reminders.map(
					(currentReminderSet) => {
						if (
							typeof currentReminderSet.notification_date !==
							"date"
						) {
							currentReminderSet.notification_date = new Date(
								currentReminderSet.notification_date,
							);
						}
						currentReminderSet.days_after =
							currentReminderSet.days_after * 1;
						return currentReminderSet;
					},
				);
			}

			setReminderSetData(reminderSets);
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
			calculateNextDate(currentDate, p.frequency, p.frequencyType),
		);
	};

	const onUserSelectDate = (currentDateObject: Date) => {
		setCurrentDate(new Date(currentDateObject));
		setNextDate(
			calculateNextDate(currentDateObject, frequency, frequencyType),
		);
	};

	const validateAndSave = (): bool => {
		setErrors([]);
		const [validated, validationErrors] = validateSubmit();
		if (!validated) {
			setErrors(validationErrors);
			setTimeout(() => setErrors([]), 5000);
			return false;
		}
		setErrors([]);
		const onSaveParams = {
			formValues: {
				id: false,
				subject: subject,
				description: description,
				reminders: reminderSetData,
			},
			reminders: reminderSetData,
		};

		onSave ? onSave(onSaveParams) : "";
	};

	const onAddSingleSet = (currentIndex: number | boolean) => {
		setAddSingleSet(true);
		setSingleSetIndex(currentIndex === false ? false : currentIndex);
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
		if (reminderSetData.length < 2) {
			validate = false;
			errorMessages.push("Atleast 2 reminders are required in set");
		}
		return [validate, errorMessages];
	};

	const onCancelSingleSet = () => {
		setAddSingleSet(false);
		setSingleSetIndex(false);
	};

	const saveSingleSet = (v) => {
		if (singleSetIndex === false) {
			return;
		}
		if (reminderSetData[singleSetIndex]) {
			const updatedReminderSet = reminderSetData.map((current, index) => {
				if (index === singleSetIndex) {
					return v;
				}
				return current;
			});
			setReminderSetData(updatedReminderSet);
		}
		if (!reminderSetData[singleSetIndex]) {
			const updatedReminderSet = reminderSetData;
			updatedReminderSet[singleSetIndex] = v;
			setReminderSetData(updatedReminderSet);
		}

		setAddSingleSet(false);
		setSingleSetIndex(false);
	};
	const showErrors = errors.length >= 1;

	return (
		<SafeAreaView style={styles.container}>
			{showErrors > 0 && (
				<View testID="errorDisplay">
					{errors.map((current, key) => {
						return (
							<Text
								key={key}
								style={{ color: "red", fontWeight: "bold" }}
							>
								*{current}
							</Text>
						);
					})}
				</View>
			)}
			{addSingleSet === false && (
				<Surface elevation="1" style={styles.formInputSurface}>
					<TextInput
						label="Subject"
						mode="outlined"
						value={subject}
						testID="mainSubject"
						onChangeText={(text) => setSubject(text)}
						style={{ width: "95%", padding: 1, marginLeft: "2%" }}
						right={
							<TextInput.Icon
								icon={() => (
									<MaterialCommunityIcons name="asterisk" />
								)}
							/>
						}
					/>
					<Divider style={styles.textDivider} />
					<TextInput
						label="Description"
						mode="outlined"
						testID="mainDescription"
						value={description}
						style={{ width: "95%", padding: 1, marginLeft: "2%" }}
						onChangeText={(text) => setDescription(text)}
					/>
					<Divider style={styles.textDivider} />

					<View
						style={{
							padding: 1,
							justifyContent: "center",
							width: "100%",
							display: "flex",
							flexDirection: "row",
						}}
					></View>
					<View
						style={{
							padding: 1,

							width: "100%",
							display: "flex",
							flexDirection: "column",
						}}
					>
						{reminderSetData &&
							reminderSetData.length > 0 &&
							reminderSetData.map((currentReminderSet, key) => {
								return (
									<ViewSingleSet
										key={key}
										isFirst={key === 0}
										isFirst={key === 0}
										reminderData={currentReminderSet}
										onEdit={() => {
											setAddSingleSet(true);
											setSingleSetIndex(key);
										}}
									/>
								);
							})}
						<Button
							variant="text"
							testID="add_new"
							onPress={() => {
								onAddSingleSet(reminderSetData.length);
							}}
							title="Add New"
						>
							Add New
						</Button>
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
			)}

			{addSingleSet === true && singleSetIndex !== false && (
				<SingleSet
					isFirst={singleSetIndex === 0}
					onCancel={() => {
						onCancelSingleSet();
					}}
					onSave={(v) => saveSingleSet(v)}
					prefillData={
						reminderSetData[singleSetIndex]
							? reminderSetData[singleSetIndex]
							: {}
					}
				/>
			)}
		</SafeAreaView>
	);
};
export default SubjectDescription;
