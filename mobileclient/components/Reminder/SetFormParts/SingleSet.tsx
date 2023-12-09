import React, { useState, useRef } from "react";
import {
	Surface,
	TextInput,
	Divider,
	Button,
	Banner,
	Chip,
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import CalendarModal from "../SingleFormParts/CalendarModal";
import { format, add } from "date-fns";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	textDivider: {
		padding: 1,
	},
	formInputSurface: {
		padding: 1,
		flex: 1,
		alignItems: "center",
	},
});

export interface SubSingleReminderSetType {
	subject: string;
	description: string;
	days_after: number;
	notification_date?: date;
	frequency?: number;
	frequency_type?: string;
	id?: number;
}

const SingleSet = ({
	onSave,
	onCancel,
	serverErrors,
	prefillData,
	isFirst,
}) => {
	const [subject, setSubject] = useState(prefillData?.subject ?? ""); // Initialize with prefillData if available
	const [description, setDescription] = useState(
		prefillData?.description ?? "",
	); // Initialize with prefillData if available

	const [openCalendarModal, setOpenCalendarModal] = useState<bool>(false);
	const [currentDate, setCurrentDate] = useState<Date>(
		prefillData?.notification_date
			? prefillData.notification_date
			: new Date(),
	);
	const [daysAfter, setDaysAfter] = useState<number>(
		prefillData?.days_after ?? 0,
	);

	//days_after
	const [errors, setErrors] = useState<Array<string>>(
		serverErrors ? serverErrors : [],
	);

	const validateAndSave = () => {
		setErrors([]);
		if (subject === "") {
			setErrors((p) => {
				p.push("Subject should be filled");
				return p;
			});
			return false;
		}
		if (description === "") {
			setErrors((p) => {
				p.push("Description should be filled");
				return p;
			});
			return false;
		}
		if (!isFirst) {
			if (daysAfter === 0) {
				setErrors((p) => {
					p.push("Has to be Atleast a day After");
					return p;
				});
				return false;
			}
		}

		onSave({
			subject: subject,
			description: description,
			notification_date: currentDate,
			days_after: daysAfter,
		});
	};
	const handleSave = () => {
		// Handle the save action and pass the subject and description to onSave
		onSave({ subject, description });
	};

	console.log(typeof daysAfter);
	return (
		<>
			<Banner visible={true} style={{}}>
				<Text
					style={{
						fontSize: 20,
						fontWeight: "bold",
						color: "black",
					}}
				>
					Create or edit a Single Reminder
				</Text>
			</Banner>
			<Surface elevation={1} style={styles.formInputSurface}>
				{errors.length > 0 && (
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

				<TextInput
					label="Subject"
					testID="Subject"
					mode="outlined"
					value={subject}
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
					testID="Description"
					mode="outlined"
					value={description}
					style={{ width: "95%", padding: 1, marginLeft: "2%" }}
					onChangeText={(text) => setDescription(text)}
				/>

				<Divider style={styles.textDivider} />
				<View
					style={{
						flex: 0,
						display: "flex",
						flexDirection: "row",
					}}
				>
					{isFirst && (
						<>
							<Chip
								testID="Chip"
								icon={() => (
									<MaterialCommunityIcons name="calendar" />
								)}
								onPress={() => setOpenCalendarModal(true)}
								style={{
									margin: 5,
									borderRadius: 30,
									padding: 5,
									width: "50%",
								}}
							>
								{format(currentDate, "yyyy-MM-dd")}
							</Chip>
							{openCalendarModal && (
								<CalendarModal
									testID="CalendarModal"
									onClose={() => setOpenCalendarModal(false)}
									onSelect={() => {}}
									initialDate={currentDate}
								/>
							)}
						</>
					)}
					{!isFirst && (
						<Picker
							selectedValue={daysAfter}
							style={{
								margin: 5,
								borderRadius: 30,
								padding: 5,
								width: "50%",
							}}
							testID="daysAfter"
							onValueChange={(itemValue, itemIndex) => {
								setDaysAfter(itemValue);
							}}
						>
							<Picker.Item label="Day After" value={0} />
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
								(current, key) => {
									return (
										<Picker.Item
											key={key}
											label={`${current} ${
												current > 1 ? `Days` : "Day"
											} After`}
											value={current}
										/>
									);
								},
							)}
						</Picker>
					)}
				</View>

				<View
					style={{
						padding: 20,
						justifyContent: "center",
						width: "100%",
						display: "flex",
						flexDirection: "row",
					}}
				>
					<Button
						testID="SaveButton"
						onPress={() => {
							validateAndSave();
						}}
						mode="contained"
					>
						Save
					</Button>
					<Button
						testID="CancelButton"
						onPress={() => (onCancel ? onCancel() : "")}
					>
						Cancel
					</Button>
				</View>
			</Surface>
		</>
	);
};

export default SingleSet;
