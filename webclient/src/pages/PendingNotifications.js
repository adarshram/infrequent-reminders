import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';

import {
	Box,
	Typography,
	Paper,
	Alert,
	List,
	ListItem,
	ListItemText,
	IconButton,
	ListItemIcon,
	Snackbar,
} from '@mui/material';
//Snooze
import { Snooze as SnoozeIcon, Done as DoneIcon, Edit as EditIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom'; // version 5.2.0
import useServerCall from '../hooks/useServerCall';
import { PendingReminderContext } from '../models/PendingReminderContext';

export default function PendingNotifications(props) {
	let navigate = useNavigate();

	const pendingReminderObject = useContext(PendingReminderContext);

	const [notificationList, setNotificationList] = useState(false);
	const [snackMessage, setSnackMessage] = useState(false);
	const [
		pendingNotification,
		pendingNotificationResponse,
		pendingNotificationError,
		pendingNotificationLoading,
	] = useServerCall('/user/notifications/pending');

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
	const handlePendingSelect = (notification) => {
		console.log(notification);
	};

	const itemIconStyle = { cursor: 'pointer' };
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
							<ListItem
								key={key}
								button
								onClick={(e) => handlePendingSelect(notification)}
								alignItems="flex-start"
								secondaryAction={
									<IconButton
										edge="end"
										aria-label={`actions-${notification.id}`}
										style={itemIconStyle}
										onClick={(e) => {
											handleDone(notification);
										}}
									>
										<DoneIcon />
									</IconButton>
								}
								disablePadding
							>
								<ListItemIcon
									style={itemIconStyle}
									aria-label={`actions-${notification.id}`}
									onClick={(e) => {
										handleSnooze(notification);
									}}
								>
									<SnoozeIcon />
								</ListItemIcon>
								<ListItemIcon
									style={itemIconStyle}
									onClick={(e) => {
										navigate(`/create/${notification.id}`);
									}}
								>
									<EditIcon />
								</ListItemIcon>
								<ListItemText
									primary={notification.subject}
									secondary={
										<React.Fragment>
											<Typography
												sx={{ display: 'flex' }}
												component="span"
												variant="body2"
												color="text.primary"
											>
												{notification.description}
											</Typography>
											{notification.notification_date
												? format(new Date(notification.notification_date), 'MM/dd/yyyy')
												: ''}
										</React.Fragment>
									}
								/>
							</ListItem>
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
