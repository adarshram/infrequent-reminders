import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../models/UserContext';
import useServerCall from '../hooks/useServerCall';
import { useParams } from 'react-router-dom'; // version 5.2.0
import { Grid, Typography } from '@mui/material';
import { format } from 'date-fns';
function RenderNoDataFound() {
	return (
		<Grid
			container
			direction="column"
			justifyContent="space-evenly"
			alignItems="center"
			style={{ minHeight: 100 }}
		>
			<Grid
				item
				xs={12}
				sx={{
					textAlign: 'center',
				}}
			>
				No Data found
			</Grid>
		</Grid>
	);
}

function RenderFrequency({ frequency_type, frequency }) {
	let repeatType = 'Day';
	if (frequency_type === 'w') {
		repeatType = 'Week';
	}
	if (frequency_type === 'm') {
		repeatType = 'Month';
	}
	if (frequency_type === 'Y') {
		repeatType = 'Year';
	}
	let text = `Repeats every ${frequency} ${repeatType}${frequency > 1 ? 's' : ''}`;

	return (
		<Grid
			item
			xs={12}
			sx={{
				textAlign: 'center',
			}}
		>
			<Typography variant="subtitle1" component="div" gutterBottom>
				{text}
			</Typography>
		</Grid>
	);
}

export default function ScheduleDetails() {
	const signedInUser = useContext(UserContext);
	const user_id = signedInUser?.user?.uid;
	const [scheduleId, setScheduleId] = useState(null);
	const [showNotification, showNotificationResponse, , ,] =
		useServerCall(`/user/notifications/show/`);
	const [notificationData, setNotificationData] = useState(null);
	let params = useParams();
	useEffect(() => {
		if (user_id) {
			setScheduleId(params.id ? params.id : false);
		}
	}, [params.id, user_id]);

	useEffect(() => {
		if (scheduleId) {
			showNotification.get(scheduleId);
		}
	}, [scheduleId, showNotification]);

	useEffect(() => {
		if (showNotificationResponse) {
			setNotificationData({
				...showNotificationResponse.data,
				created_at: format(new Date(showNotificationResponse.data.created_at), 'dd/MM/yyyy'),
			});
		}
		if (!showNotificationResponse) {
			setNotificationData(false);
		}
	}, [showNotificationResponse]);

	const pageLoading = scheduleId === null || notificationData === null;
	if (pageLoading) {
		return '';
	}

	if (scheduleId === false) {
		return 'Schedule Id Missing';
	}

	if (notificationData === false) {
		<RenderNoDataFound />;
	}
	return (
		<Grid
			container
			direction="column"
			justifyContent="space-evenly"
			alignItems="center"
			style={{ minHeight: 100 }}
		>
			<Grid
				item
				xs={12}
				sx={{
					textAlign: 'center',
				}}
			>
				<Typography variant="h3" component="div" gutterBottom>
					{notificationData.subject}
				</Typography>
			</Grid>
			<Grid
				item
				xs={12}
				sx={{
					textAlign: 'center',
				}}
			>
				<Typography variant="subtitle1" component="div" gutterBottom>
					{notificationData.description}
				</Typography>
			</Grid>

			<Grid
				item
				xs={12}
				sx={{
					textAlign: 'center',
				}}
			>
				<Typography variant="subtitle1" component="div" gutterBottom>
					Created on {notificationData.created_at}
				</Typography>
			</Grid>
			<Grid
				item
				xs={12}
				sx={{
					textAlign: 'center',
				}}
			>
				<Typography variant="subtitle1" component="div" gutterBottom>
					{notificationData.snoozedCount > 0 ? (
						<>
							Snoozed {notificationData.snoozedCount}
							{notificationData.snoozedCount > 1 ? ' times' : ' time'}
						</>
					) : (
						<>Not Snoozed</>
					)}
				</Typography>
			</Grid>
			{notificationData.doneCount > 0 && (
				<Grid
					item
					xs={12}
					sx={{
						textAlign: 'center',
					}}
				>
					<Typography variant="subtitle1" component="div" gutterBottom>
						COmpleted {notificationData.doneCount}
						{notificationData.doneCount > 1 ? ' times' : ' time'}
					</Typography>
				</Grid>
			)}
			<RenderFrequency {...notificationData} />
		</Grid>
	);
}
