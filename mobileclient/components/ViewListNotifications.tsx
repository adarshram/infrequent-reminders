import React, { useEffect, useState, useContext } from "react";
import { CreateEditSingle } from "../components/Reminder/CreateEditSingle";
import { UserContext } from "../models/UserContext";
import useServerCall from "../hooks/useServerCall";
import { Surface, Text, Card } from "react-native-paper";
import { format, add } from "date-fns";
import { ViewSingle } from "./Reminder/ViewSingle";

export const ViewListNotifications = ({
	notifications,
	navigation,
	refresh,
}) => {
	const [, , , deleteNotification] = useServerCall();
	const [snoozeData, , , snoozeNotification] = useServerCall();
	const [completeData, , , completeNotification] = useServerCall();

	const onEdit = (reminder) => {
		navigation.navigate("SingleReminder", {
			reminderId: reminder.id,
		});
	};

	const onSnooze = async (reminder) => {
		await snoozeNotification.get(
			`user/notifications/snooze/${reminder.id}`
		);

		refresh ? refresh() : "";
	};

	const onComplete = async (reminder) => {
		await completeNotification.get(
			`user/notifications/complete/${reminder.id}`
		);
		refresh ? refresh() : "";
	};

	const onDelete = async (reminder) => {
		await deleteNotification.post("user/notifications/delete", {
			id: reminder.id,
		});
		refresh ? refresh() : "";
	};

	return (
		<>
			{notifications.length > 0 &&
				notifications.map((currentReminder, key) => {
					return (
						<ViewSingle
							key={key}
							reminder={currentReminder}
							onSnooze={() => onSnooze(currentReminder)}
							onComplete={() => onComplete(currentReminder)}
							onDelete={() => console.log(currentReminder)}
							onEdit={() => onEdit(currentReminder)}
							onView={() => console.log(currentReminder)}
						/>
					);
				})}
		</>
	);
};
