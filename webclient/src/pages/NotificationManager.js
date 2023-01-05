import React, { useContext } from 'react';
import { Grid, Hidden, Paper } from '@mui/material';

import { UserContext } from '../models/UserContext';

import NotificationDisplay from '../components/NotificationManager/NotificationDisplay';

import ProfileSideBar from '../components/ProfileSideBar';

import {
	useNotificationDeviceList,
	useEditNotificationForUser,
} from '../hooks/notificationDevices';

export default function NotificationManager() {
	const [deviceList, currentDevice, , , refreshNotificationList] = useNotificationDeviceList();
	const signedInUser = useContext(UserContext);
	const [editNotificationCall] = useEditNotificationForUser();
	const saveDevice = async (updatedDeviceList) => {
		editNotificationCall(updatedDeviceList);
		refreshNotificationList();
	};

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} lg={3} md={3}>
				<Hidden mdDown>
					<ProfileSideBar />
				</Hidden>
			</Grid>
			<Grid item xs={9} md={4}>
				<Paper
					elevation={3}
					sx={{
						mt: 3,
						padding: 3,
					}}
				>
					<NotificationDisplay
						currentDevice={currentDevice}
						deviceList={deviceList}
						onSave={saveDevice}
						personalEmail={signedInUser.user.email}
					/>
				</Paper>
			</Grid>
		</Grid>
	);
}
