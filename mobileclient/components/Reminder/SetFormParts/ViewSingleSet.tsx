import React, { useState, useRef } from "react";
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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { format, add } from "date-fns";

export const ViewSingleSet = ({ reminderData, onEdit, onDelete, isFirst }) => {
	const [isSelected, setIsSelected] = useState<boolean>(false);
	return (
		<TouchableRipple
			onPress={() => setIsSelected(!isSelected)}
			rippleColor="rgba(0, 0, 0, .32)"
			underlayColor="rgba(0, 0, 0, .32)"
		>
			<Card style={{ marginTop: 2, marginBottom: 2 }} elevation={3}>
				<Card.Title
					title={reminderData.subject}
					subtitle={reminderData.description}
				/>
				<Card.Content>
					<Text style={{ alignItems: "center", width: "100%" }}>
						{isFirst && reminderData.notification_date
							? format(
									reminderData.notification_date,
									"yyyy-MM-dd",
							  )
							: ""}
						{!isFirst && reminderData.days_after
							? `${reminderData.days_after} ${
									reminderData.days_after > 1 ? "days" : "day"
							  } after`
							: ""}
					</Text>
				</Card.Content>
				<Card.Actions style={{ justifyContent: "space-around" }}>
					{isSelected && (
						<ExtraOptions onEdit={onEdit} onDelete={onDelete} />
					)}
				</Card.Actions>
			</Card>
		</TouchableRipple>
	);
};
export default ViewSingleSet;
const ExtraOptions = ({ onEdit, onDelete }) => {
	return (
		<View
			style={{
				justifyContent: "flex-start",
				flexDirection: "row",
				width: "100%",
			}}
		>
			<Button
				icon={() => <MaterialCommunityIcons name="calendar-edit" />}
				mode="Outlined"
				compact={true}
				onPress={() => onEdit()}
			></Button>

			<Button
				icon={() => <MaterialCommunityIcons name="delete-circle" />}
				mode="Outlined"
				compact={true}
				onPress={() => onDelete()}
			></Button>
		</View>
	);
};
