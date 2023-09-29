import React, { useEffect, useState, useContext } from "react";
import { CreateEditSingle } from "../components/Reminder/CreateEditSingle";
import { UserContext } from "../models/UserContext";
import useServerCall from "../hooks/useServerCall";
import { Surface, Text, Card } from "react-native-paper";
import { format, add } from "date-fns";

export const ViewReminderDetails = ({ navigation, route }) => {
	const signedInUser = useContext(UserContext);
	const [viewLogData, isLogLoading, error, viewLog] = useServerCall();
	const [viewBasicData, saveLoading, saveError, viewBasic] = useServerCall();
	const { user } = signedInUser;
	if (viewBasicData === null && !saveLoading && route.params.reminderId) {
		viewBasic.get(`user/notifications/show/${route.params.reminderId}`);
	}
	if (viewLogData === null && !isLogLoading && route.params.reminderId) {
		viewLog.get(`user/notifications/showLog/${route.params.reminderId}`);
	}

	const basicData = viewBasicData?.data ? viewBasicData.data : false;
	if (basicData) {
		navigation.setOptions({
			title: `Details for  ${basicData.subject}`,
		});
	}

	return (
		<>
			{basicData !== false && (
				<Card>
					<Card.Content>
						<Text variant="titleLarge">{basicData.subject}</Text>
						<Text variant="bodyMedium">
							{basicData.description}
						</Text>
					</Card.Content>

					<Card.Title
						title={format(
							new Date(basicData.notification_date),
							"yyyy/MM/dd"
						)}
						subtitle={`Next Notification Date`}
					/>
					{basicData.snoozedCount > 0 && (
						<Card.Title
							title={basicData.snoozedCount}
							subtitle={`Snooze Count`}
						/>
					)}
					{basicData.meta_notifications &&
						basicData.meta_notifications.done_count > 0 && (
							<Card.Title
								title={basicData.meta_notifications.done_count}
								subtitle={`Done Count`}
							/>
						)}
				</Card>
			)}
		</>
	);
};

const mockData = {
	data: {
		created_at: "2023-05-15T18:30:00.000Z",
		description: "dsvsdvdsv",
		doneCount: 0,
		frequency: 1,
		frequency_type: "w",
		id: "269",
		isPending: true,
		is_active: true,
		meta_notifications: {
			cron_snoozed: 0,
			done_count: 0,
			id: 364,
			updated_at: "2023-05-15T18:30:00.000Z",
			user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
			user_snoozed: 0,
		},
		notification_date: "2023-05-08T18:30:00.000Z",
		snoozedCount: 0,
		subject: "sdvsdsd",
		updated_at: "2023-05-15T18:30:00.000Z",
		user_id: "VO6ioexwwmefvE8BhvwTAUi8eDq2",
	},
	success: true,
};
