import React, { useState, useEffect } from 'react';

import {
	Box,
	Paper,
	Alert,
	List,
	ListItem,
	ListItemText,
	Snackbar,
	Typography,
} from '@mui/material';
//Snooze

import { useNavigate } from 'react-router-dom'; // version 5.2.0
import useServerCall from '../hooks/useServerCall';
import useTodaysNotifications from '../hooks/useTodaysNotifications';

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
	const [todaysNotifications, loadingTodaysNotifications, , fetchTodaysNotifications] =
		useTodaysNotifications();
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
	useEffect(() => {
		if (todaysNotifications === null) {
			fetchTodaysNotifications();
		}
	});

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

	const ShowTodaysNotification = ({ notifications, loadingNotifications }) => {
		const hasNotifications = notifications && notifications.length > 0;
		const hasNoNotifications = notifications && notifications.length === 0;

		const HeaderBar = () => (
			<Typography variant="h4" gutterBottom>
				Todays Notifications
			</Typography>
		);

		if (loadingNotifications || hasNoNotifications) {
			return (
				<>
					<HeaderBar />
					<List>
						<ListItem>
							{loadingNotifications && <ListItemText>Loading todays notifications</ListItemText>}
							{hasNoNotifications && <ListItemText>No Notifications Found For Today</ListItemText>}
						</ListItem>
					</List>
				</>
			);
		}

		if (hasNotifications) {
			return (
				<>
					<List>
						<HeaderBar />
						{notifications.map((notification, key) => (
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
					</List>
				</>
			);
		}

		return <HeaderBar />;
	};

	return (
		<Box
			sx={{
				justifyContent: 'center',
			}}
		>
			<Paper
				variant="outlined"
				sx={{
					width: '90%',
					bgcolor: 'grey.50',
					margin: 1,
					padding: 1,
				}}
			>
				<ShowTodaysNotification
					notifications={todaysNotifications}
					loadingNotifications={loadingTodaysNotifications}
				/>
			</Paper>
			<Paper
				variant="outlined"
				sx={{
					width: '90%',
					bgcolor: 'grey.50',
					margin: 1,
					padding: 1,
				}}
			>
				<List>
					<Typography variant="h4" gutterBottom>
						Upcoming Notifications
					</Typography>
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
