import React, { useEffect, useState } from "react";
import {
	Image,
	Platform,
	ScrollView,
	View,
	StyleSheet,
	Pressable,
} from "react-native";
import { Surface, Text, TouchableRipple, Card } from "react-native-paper";
import { TextInput, Button, Snackbar, HelperText } from "react-native-paper";
import { format, add } from "date-fns";

import { MaterialIcons } from "react-native-vector-icons";
export const ViewSingle = (props) => {
	let { reminder, onEdit, onSnooze, onComplete, onDelete, onView } = props;
	const [isSelected, setIsSelected] = useState<boolean>(false);

	const getFrequencyText = () => {
		let text;
		if (reminder.frequency_type === "w") {
			text = `${reminder.frequency} week${
				reminder.frequency > 1 ? "s" : ""
			}`;
		}
		if (reminder.frequency_type === "d") {
			text = `${reminder.frequency} day${
				reminder.frequency > 1 ? "s" : ""
			}`;
		}
		if (reminder.frequency_type === "m") {
			text = `${reminder.frequency} month${
				reminder.frequency > 1 ? "s" : ""
			}`;
		}
		if (reminder.frequency_type === "y") {
			text = `${reminder.frequency} year{
				reminder.frequency > 1 ? "s" : ""
			}`;
		}
		return text;
	};

	return (
		<TouchableRipple
			onPress={() => setIsSelected(!isSelected)}
			rippleColor="rgba(0, 0, 0, .32)"
			underlayColor="rgba(0, 0, 0, .32)"
		>
			<Card style={{ marginTop: 2, marginBottom: 2 }} elevation={3}>
				<Card.Title
					title={reminder.subject}
					subtitle={reminder.description}
				/>
				<Card.Content>
					<Text style={{ alignItems: "center", width: "100%" }}>
						<MaterialIcons name="repeat" />
						{getFrequencyText()}
					</Text>
				</Card.Content>
				<Card.Actions style={{ justifyContent: "space-around" }}>
					{isSelected && (
						<ExtraOptions
							onSnooze={() => onSnooze(reminder)}
							onComplete={() => onComplete(reminder)}
							onDelete={() => {
								onDelete(reminder);
							}}
							onEdit={() => {
								onEdit(reminder);
							}}
							onView={() => {
								onView(reminder);
							}}
						/>
					)}
				</Card.Actions>
			</Card>
		</TouchableRipple>
	);
};
const ExtraOptions = ({ onEdit, onSnooze, onComplete, onDelete, onView }) => {
	return (
		<View
			style={{
				justifyContent: "flex-start",
				flexDirection: "row",
				width: "100%",
			}}
		>
			<Button
				icon={"calendar-edit"}
				mode="Outlined"
				compact={true}
				onPress={() => onEdit()}
				onLongPress={() => onView()}
			></Button>

			<Button
				icon={() => <MaterialIcons name="snooze" />}
				mode="Outlined"
				compact={true}
				onPress={() => onSnooze()}
			></Button>
			<Button
				icon={() => <MaterialIcons name="delete" />}
				mode="Outlined"
				compact={true}
				onPress={() => onDelete()}
			></Button>
			<Button
				icon={() => <MaterialIcons name="done" />}
				mode="Outlined"
				compact={true}
				onPress={() => onComplete()}
			></Button>
		</View>
	);
};

const styles = StyleSheet.create({
	surface: {
		padding: 8,
		height: 80,
		width: "100%",
		alignItems: "flex-start",
		justifyContent: "center",
	},
});
let mockReminder = {
	created_at: "2023-02-06T18:30:00.000Z",
	description: "Desc",
	done_count: 0,
	frequency: 1,
	frequency_type: "w",
	id: "264",
	is_active: true,
	is_pending: false,
	meta: {
		cron_snoozed: 0,
		done_count: 0,
		id: 336,
		updated_at: "2023-02-06T18:30:00.000Z",
		user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
		user_snoozed: 0,
	},
	notification_date: "2023-02-13T18:30:00.000Z",
	set_link: null,
	snooze_count: 0,
	subject: "Second Reminder",
	updated_at: "2023-02-06T18:30:00.000Z",
	user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
};
