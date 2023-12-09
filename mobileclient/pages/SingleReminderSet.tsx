import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../models/UserContext";
import useServerCall from "../hooks/useServerCall";
import useSecureCall from "../hooks/useSecureCall";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { TextInput, SegmentedButtons, Divider } from "react-native-paper";
import { Button, Dialog, Portal, Surface } from "react-native-paper";
import SubjectDescription from "../components/Reminder/SetFormParts/SubjectDescription";
export type SingleReminderSetType = {
	subject: string;
	description: string;
	reminders: Array<any>;
	id?: number | boolean;
};

export const SingleReminderSet = ({ navigation, route }) => {
	const signedInUser = useContext(UserContext);
	const [serverReminderData, isLoading, error, requester] = useServerCall();
	const [saveData, saveLoading, saveError, saveRequest] = useServerCall();
	const [listData, listLoading, listError, listRequest] = useServerCall();

	const [reminderData, setReminderData] = useState<
		boolean | SingleReminderSetType
	>(false);

	const { user } = signedInUser;
	const hasReminderId = route.params?.reminderId ? true : false;

	const prefilledDate = route.params?.prefilledDate
		? route.params.prefilledDate
		: "";
	const hasPrefilledDate = prefilledDate !== "";

	useEffect(() => {
		if (hasReminderId) {
			requester.get(`user/reminderSet/get/${route.params.reminderId}`);
			//listRequest.get("user/reminderSet/list");
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
			console.log(serverReminderData.data);
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
	const saveSchedule = async (saveBody: SingleReminderSetType) => {
		if (hasReminderId) {
			saveBody = {
				...saveBody,
				formValues: {
					...saveBody.formValues,
					id: route.params.reminderId,
				},
			};
		}

		const response = await saveRequest.post(
			"user/reminderSet/save",
			saveBody,
		);
		navigation.navigate("ListReminderSet");
	};
	return (
		<>
			<SubjectDescription
				onSave={(v) => saveSchedule(v)}
				prefillData={reminderData.id ? reminderData : {}}
				onCancel={() => navigation.goBack({ name: "Home" })}
			/>
		</>
	);
};
