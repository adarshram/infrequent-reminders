import React, { useState, useEffect } from 'react';

import { Box, Paper, Alert, List, ListItem, ListItemText, Snackbar } from '@mui/material';
//Snooze

import { useNavigate } from 'react-router-dom'; // version 5.2.0
import useServerCall from '../hooks/useServerCall';
import ShowSchedule from '../components/Schedules/ShowSchedule';
export default function UpcomingNotifications(props) {
	let navigate = useNavigate();

	const [notificationList, setNotificationList] = useState(false);
	const [currentSchedule, setCurrentSchedule] = useState(false);
	const [snackMessage, setSnackMessage] = useState(false);
	const [
		upcomingNotification,
		upcomingNotificationResponse,
		upcomingNotificationError,
		upcomingNotificationLoading,
	] = useServerCall('/user/notifications/upcoming');
	const [deleteNotifications, ,] = useServerCall(`/user/notifications/delete`);

	const [snoozeNotification, , ,] = useServerCall('/user/notifications/snooze/');
	const [completeNotification, , ,] = useServerCall('/user/notifications/complete/');

	useEffect(() => {
		if (!upcomingNotificationError) {
			if (upcomingNotificationLoading === false && upcomingNotificationResponse === false) {
				upcomingNotification.get();
			}
			if (upcomingNotificationLoading === false && upcomingNotificationResponse !== false) {
				setNotificationList(
					upcomingNotificationResponse.data ? upcomingNotificationResponse.data : [],
				);
			}
		}
		if (upcomingNotificationError) {
			setNotificationList([]);
		}
	}, [
		upcomingNotification,
		upcomingNotificationResponse,
		upcomingNotificationLoading,
		upcomingNotificationError,
	]);

	const handleDone = async (currentNotification) => {
		let completed = await completeNotification.get(currentNotification.id);
		if (completed.data) {
			if (completed.data.days) {
				setSnackMessage(
					`Completed for ${completed.data.days} days. Next Notification: ${completed.data.date}`,
				);
			}
			upcomingNotification.get();
		}
	};
	const handleSnooze = async (currentNotification) => {
		let snoozed = await snoozeNotification.get(currentNotification.id);
		if (snoozed.data && snoozed.data.days) {
			setSnackMessage(`Snoozed for ${snoozed.data.days} days`);
			upcomingNotification.get();
		}
	};

	const handleEdit = (data) => {
		if (data.id) {
			navigate(`/create/${data.id}`);
		}
	};

	const handleDelete = async (data) => {
		await deleteNotifications.post({ id: data.id });
		upcomingNotification.get();
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
					{!upcomingNotificationLoading &&
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
					{!upcomingNotificationLoading && (!notificationList || notificationList.length === 0) && (
						<ListItem>
							<ListItemText>No upcoming Notifications Found</ListItemText>
						</ListItem>
					)}
					{upcomingNotificationLoading && (
						<ListItem>
							<ListItemText>Loading upcoming Notifications Found</ListItemText>
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
