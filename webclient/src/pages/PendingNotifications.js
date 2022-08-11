import React, { useState, useEffect, useContext } from 'react';

import { Box, Paper, Alert, List, ListItem, ListItemText, Snackbar } from '@mui/material';
//Snooze

import { useNavigate } from 'react-router-dom'; // version 5.2.0
import useServerCall from '../hooks/useServerCall';
import ShowSchedule from '../components/Schedules/ShowSchedule';
import { PendingReminderContext } from '../models/PendingReminderContext';

export default function PendingNotifications(props) {
	let navigate = useNavigate();

	const pendingReminderObject = useContext(PendingReminderContext);

	const [notificationList, setNotificationList] = useState(false);
	const [currentSchedule, setCurrentSchedule] = useState(false);
	const [snackMessage, setSnackMessage] = useState(false);
	const [
		pendingNotification,
		pendingNotificationResponse,
		pendingNotificationError,
		pendingNotificationLoading,
	] = useServerCall('/user/notifications/pending');
	const [deleteNotifications, ,] = useServerCall(`/user/notifications/delete`);

	const [snoozeNotification, , ,] = useServerCall('/user/notifications/snooze/');
	const [completeNotification, , ,] = useServerCall('/user/notifications/complete/');

	useEffect(() => {
		if (!pendingNotificationError) {
			if (pendingNotificationLoading === false && pendingNotificationResponse === false) {
				pendingNotification.get();
			}
			if (pendingNotificationLoading === false && pendingNotificationResponse !== false) {
				setNotificationList(
					pendingNotificationResponse.data ? pendingNotificationResponse.data : [],
				);
			}
		}
		if (pendingNotificationError) {
			setNotificationList([]);
		}
	}, [
		pendingNotification,
		pendingNotificationResponse,
		pendingNotificationLoading,
		pendingNotificationError,
	]);

	const handleDone = async (currentNotification) => {
		let completed = await completeNotification.get(currentNotification.id);
		if (completed.data) {
			if (completed.data.days) {
				setSnackMessage(
					`Completed for ${completed.data.days} days. Next Notification: ${completed.data.date}`,
				);
			}
			pendingNotification.get();
			pendingReminderObject.load();
		}
	};
	const handleSnooze = async (currentNotification) => {
		let snoozed = await snoozeNotification.get(currentNotification.id);
		if (snoozed.data && snoozed.data.days) {
			setSnackMessage(`Snoozed for ${snoozed.data.days} days`);
			pendingNotification.get();
			pendingReminderObject.load();
		}
	};

	const handleEdit = (data) => {
		if (data.id) {
			navigate(`/create/${data.id}`);
		}
	};

	const handleDelete = async (data) => {
		await deleteNotifications.post({ id: data.id });
		pendingNotification.get();
		return true;
	};

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Paper
				variant="outlined"
				sx={{
					width: [300, 500, '90%'],
					bgcolor: 'grey.50',
				}}
			>
				<List>
					{!pendingNotificationLoading &&
						notificationList &&
						notificationList.length > 0 &&
						notificationList.map((notification, key) => (
							<ShowSchedule
								schedule={notification}
								key={key}
								editHandler={handleEdit}
								snoozeOrCompleteHandler={handleSnooze}
								deleteHandler={handleDelete}
								doneHandler={handleDone}
								setCurrentSchedule={setCurrentSchedule}
								currentSchedule={currentSchedule}
							/>
						))}
					{!pendingNotificationLoading && (!notificationList || notificationList.length === 0) && (
						<ListItem>
							<ListItemText>No Pending Notifications Found</ListItemText>
						</ListItem>
					)}
					{pendingNotificationLoading && (
						<ListItem>
							<ListItemText>Loading Pending Notifications Found</ListItemText>
						</ListItem>
					)}
				</List>
				{snackMessage && (
					<Snackbar
						open={snackMessage !== false}
						autoHideDuration={3000}
						onClose={() => setSnackMessage(false)}
						message={snackMessage}
					>
						<Alert onClose={() => setSnackMessage(false)} severity="success" sx={{ width: '100%' }}>
							{snackMessage}
						</Alert>
					</Snackbar>
				)}
			</Paper>
		</Box>
	);
}
