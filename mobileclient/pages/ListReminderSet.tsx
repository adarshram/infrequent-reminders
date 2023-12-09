import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../models/UserContext";
import useServerCall from "../hooks/useServerCall";
import useSecureCall from "../hooks/useSecureCall";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { TextInput, SegmentedButtons, Divider } from "react-native-paper";
import { Button, Dialog, Portal, Surface } from "react-native-paper";
import ShowSingleSet from "../components/Reminder/SetDisplayParts/ShowSingleSet";

import { useIsFocused } from "@react-navigation/native";

import { List } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
//import { Dialog } from "react-native-paper";

export type ReminderSet = {
	created_at: string;
	description: string;
	id: number;
	no_sets: number;
	subject: string;
	updated_at: string;
	user_id: string;
};
export type total = string;

export const ListReminderSet = ({ navigation, route }) => {
	const signedInUser = useContext(UserContext);
	const isFocused = useIsFocused();
	const [listData, listLoading, listError, listRequest] = useServerCall();
	const [deleteData, , , deleteSetCall] = useServerCall();

	const [reminderSet, setReminderSet] = useState<Array<ReminderSet>>([]);
	const [totalSets, setTotalSets] = useState<total>(0);

	const { user } = signedInUser;

	useEffect(() => {
		if (user && user.email) {
			listRequest.get("user/reminderSet/list");
		}
	}, []);
	useEffect(() => {
		if (isFocused) {
			listRequest.get("user/reminderSet/list");
		}
	}, [isFocused]);
	useEffect(() => {
		if (listData) {
			setReminderSet(listData.data.data);
			setTotalSets(listData.data.total);
		}
	}, [listData]);
	const deleteReminder = async (reminder: ReminderSet) => {
		await deleteSetCall.get(`user/reminderSet/deleteSet/${reminder.id}`);
		listRequest.get("user/reminderSet/list");
	};

	const editReminder = (reminder: ReminderSet) => {
		navigation.navigate("SingleReminderSet", {
			reminderId: reminder.id,
		});
	};
	const openNewReminder = () => {
		navigation.navigate("SingleReminderSet");
	};
	return (
		<>
			{totalSets > 0 &&
				reminderSet.map((current) => (
					<ShowSingleSet
						reminderSet={current}
						onDelete={(reminder: ReminderSet) =>
							deleteReminder(reminder)
						}
						onEdit={(reminder: ReminderSet) =>
							editReminder(reminder)
						}
					/>
				))}
			<Button
				variant="text"
				testID="add_new"
				onPress={() => {
					openNewReminder();
				}}
				title="Add New"
			>
				Add New
			</Button>
		</>
	);
};
