import React, { useEffect, useState, useContext } from "react";
import { CreateEditSingle } from "../components/Reminder/CreateEditSingle";
import { UserContext } from "../models/UserContext";
import useServerCall from "../hooks/useServerCall";
import useSecureCall from "../hooks/useSecureCall";

export interface SaveReminder {
	subject: string;
	description: string;
	frequency: number;
	frequency_type: string;
	notification_date: date;
	id?: number;
}
export const CreateEditSingleReminder = ({ navigation, route }) => {
	const signedInUser = useContext(UserContext);
	const [serverReminderData, isLoading, error, requester] = useServerCall();
	const [saveData, saveLoading, saveError, saveRequest] = useServerCall();
	const { user } = signedInUser;

	const reminderData = serverReminderData?.data
		? serverReminderData.data
		: {};

	const hasReminderId = route.params?.reminderId ? true : false;

	if (hasReminderId && !reminderData.id && !isLoading) {
		requester.get(`user/notifications/show/${route.params.reminderId}`);
	}

	const saveSchedule = async (saveBody: SaveReminder) => {
		await saveRequest.post("user/notifications/save", saveBody);
		if (hasReminderId) {
			requester.get(`user/notifications/show/${route.params.reminderId}`);
		}
	};
	useEffect(() => {
		if (saveData && saveData.success) {
			navigation.goBack({ name: "Home" });
		}
	}, [saveData, navigation]);

	return (
		<CreateEditSingle
			onSave={saveSchedule}
			prefilledReminderData={reminderData}
		/>
	);
};
