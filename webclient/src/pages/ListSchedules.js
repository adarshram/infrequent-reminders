import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, List, ListItem, ListItemText } from '@mui/material';

import { useNavigate } from 'react-router-dom'; // version 5.2.0

import { UserContext } from '../models/UserContext';
import useServerCall from '../hooks/useServerCall';
import ShowSchedule from '../components/Schedules/ShowSchedule';
export default function ListSchedules() {
	const signedInUser = useContext(UserContext);
	const user_id = signedInUser?.user?.uid;

	const [listNotifications, listNotificationsResponse, listNotificationsError] =
		useServerCall(`/user/notifications/list`);

	const [deleteNotifications, ,] = useServerCall(`/user/notifications/delete`);
	const [snoozeNotification, , ,] = useServerCall('/user/notifications/snooze/');
	const [completeNotification, , ,] = useServerCall('/user/notifications/complete/');

	const [scheduleLists, setScheduleLists] = useState([]);
	const [loadScheduleLists, setLoadScheduleList] = useState(true);
	const [currentSchedule, setCurrentSchedule] = useState(false);

	const navigate = useNavigate();
	useEffect(() => {
		if (loadScheduleLists && user_id) {
			listNotifications.post({
				keyword: 'Test',
				limit: {
					start: 0,
					end: 10,
				},
				sort: {
					sort_by: 'notification_date',
					sort_type: 'DESC',
				},
			});
		}
	}, [loadScheduleLists, listNotifications, user_id]);
	useEffect(() => {
		setLoadScheduleList(false);
		if (listNotificationsResponse) {
			setScheduleLists(listNotificationsResponse.data.results);
			//listNotificationsResponse.data.total,
		}
		if (listNotificationsError) {
			console.log(listNotificationsError);
		}
	}, [listNotificationsResponse, listNotificationsError]);

	const handleDelete = async (data) => {
		await deleteNotifications.post({ id: data.id });
		setLoadScheduleList(true);
		return true;
	};

	const handleSnoozeOrComplete = async (currentNotification) => {
		if (currentNotification.is_pending) {
			let snoozed = await snoozeNotification.get(currentNotification.id);
			if (snoozed.data && snoozed.data.days) {
				setLoadScheduleList(true);
			}
			return;
		}
		let completed = await completeNotification.get(currentNotification.id);
		if (completed.data && completed.data.days !== false) {
			setLoadScheduleList(true);
		}
	};

	const handleDone = async (currentNotification) => {
		let completed = await completeNotification.get(currentNotification.id);
		if (completed.data && completed.data.days !== false) {
			setLoadScheduleList(true);
		}
	};

	const handleEdit = (data) => {
		if (data.id) {
			navigate(`/create/${data.id}`);
		}
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
				<>
					<List>
						{scheduleLists.length > 0 &&
							scheduleLists.map((value, key) => (
								<ShowSchedule
									schedule={value}
									key={key}
									editHandler={handleEdit}
									snoozeOrCompleteHandler={handleSnoozeOrComplete}
									deleteHandler={handleDelete}
									doneHandler={handleDone}
									setCurrentSchedule={setCurrentSchedule}
									currentSchedule={currentSchedule}
								/>
							))}
						{scheduleLists.length === 0 && (
							<ListItem>
								<ListItemText>No Schedules Found</ListItemText>
							</ListItem>
						)}
					</List>
				</>
			</Paper>
		</Box>
	);
}
