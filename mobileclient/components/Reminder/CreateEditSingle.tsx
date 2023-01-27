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

import { TextInput, Button, Snackbar, HelperText } from "react-native-paper";
import { SegmentedButtons } from "react-native-paper";

export const CreateEditSingle = ({}) => {
	return (
		<>
			<TextInput
				label="Title"
				value={``}
				onChangeText={(text) => {}}
				testID="title"
			/>
			<TextInput
				label="Description"
				value={``}
				onChangeText={(text) => {}}
				testID="description"
			/>
			<Text>Repeats</Text>
			<ReminderOptions />
			<TextInput
				label="First Reminder"
				value={``}
				onChangeText={(text) => {}}
				testID="firstReminder"
			/>
		</>
	);
};

const ReminderOptions = () => {
	const [value, setValue] = useState("");

	return (
		<SegmentedButtons
			value={value}
			onValueChange={setValue}
			buttons={[
				{
					value: "weekly",
					label: "Weekly",
				},
				{
					value: "monthly",
					label: "Monthly",
				},
				{ value: "Custom", label: "Custom" },
			]}
		/>
	);
};
