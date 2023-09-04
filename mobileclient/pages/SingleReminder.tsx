import React, { useEffect, useState, useContext } from "react";
import { CreateEditSingle } from "../components/Reminder/CreateEditSingle";
import { UserContext } from "../models/UserContext";
import useServerCall from "../hooks/useServerCall";
import useSecureCall from "../hooks/useSecureCall";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { TextInput, SegmentedButtons, Divider } from "react-native-paper";
import { Button, Dialog, Portal, Surface } from "react-native-paper";
import ReminderForm from "../components/Reminder/SingleFormParts/ReminderForm";
export interface SaveReminder {
	subject: string;
	description: string;
	frequency: number;
	frequency_type: string;
	notification_date: date;
	id?: number;
}
export const SingleReminder = ({ navigation, route }) => {
	const signedInUser = useContext(UserContext);
	const [serverReminderData, isLoading, error, requester] = useServerCall();
	const [saveData, saveLoading, saveError, saveRequest] = useServerCall();
	const [reminderData, setReminderData] = useState<boolean | SaveReminder>({
		id: false,
	});
	const { user } = signedInUser;
	const hasReminderId = route.params?.reminderId ? true : false;
	const prefilledDate = route.params?.prefilledDate
		? route.params.prefilledDate
		: "";
	const hasPrefilledDate = prefilledDate !== "";

	useEffect(() => {
		if (hasReminderId) {
			requester.get(`user/notifications/show/${route.params.reminderId}`);
		}
		const createForDate = !hasReminderId && prefilledDate;
		if (!hasReminderId && hasPrefilledDate) {
			setReminderData((current) => {
				return {
					...current,
					notification_date: new Date(prefilledDate),
				};
			});
		}
	}, [
		hasReminderId,
		route.params?.reminderId,
		prefilledDate,
		hasPrefilledDate,
	]);

	useEffect(() => {
		if (serverReminderData?.data) {
			navigation.setOptions({ title: "Edit Reminder" });
			setReminderData(serverReminderData.data);
		}
		if (!serverReminderData) {
			setReminderData((current) => {
				return {
					...current,
					id: false,
				};
			});
		}
	}, [serverReminderData, navigation]);
	const saveSchedule = async (saveBody: SaveReminder) => {
		if (hasReminderId) {
			saveBody = {
				...saveBody,
				id: route.params.reminderId,
			};
		}
		await saveRequest.post("user/notifications/save", saveBody);
		navigation.goBack({ name: "Home" });
	};
	return (
		<>
			<Text>{user.email}</Text>
			<ReminderForm
				onSave={(v) => saveSchedule(v)}
				prefillData={
					reminderData.id || reminderData.notification_date
						? reminderData
						: false
				}
				onCancel={() => navigation.goBack({ name: "Home" })}
			/>
		</>
	);
};
