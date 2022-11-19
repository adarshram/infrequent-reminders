import React, { useState, useEffect } from 'react';
import { Alert, Button } from '@mui/material';

import { useNotificationDeviceList } from '../../hooks/notificationDevices';

export default function NotificationPrompter() {
	const [deviceList, currentDevice, , , refreshNotificationList, notificationsLoaded] =
		useNotificationDeviceList();
	const [enabledDevices, setEnabledDevices] = useState(null);
	const [currentDeviceEnabled, setCurrentDeviceEnabled] = useState(null);
	useEffect(() => {
		if (!notificationsLoaded) {
			refreshNotificationList();
		}
	}, [refreshNotificationList, notificationsLoaded]);

	useEffect(() => {
		if (notificationsLoaded) {
			let enabledDevices = deviceList.filter((device) => device.enabled);
			setEnabledDevices(enabledDevices);
		}
	}, [notificationsLoaded, deviceList]);

	useEffect(() => {
		if (notificationsLoaded && enabledDevices) {
			let found = enabledDevices.find(
				(device) => device.enabled && device.vapidKey === currentDevice,
			);
			setCurrentDeviceEnabled(found ? true : false);
		}
	}, [notificationsLoaded, enabledDevices, currentDevice]);

	const UserProfileLink = () => {
		return <Button href="/userProfile">Manage</Button>;
	};

	if (!notificationsLoaded) {
		return '';
	}
	let atleastOneNotification = enabledDevices && enabledDevices.length;
	if (!atleastOneNotification) {
		return (
			<Alert severity="error">
				No Notifications are enabled . Notifications will fall back to email.
				<UserProfileLink />
			</Alert>
		);
	}
	if (!currentDeviceEnabled) {
		return (
			<Alert severity="warning">
				Notifications for current device not enabled . You will not recieve notifications here .
				<UserProfileLink />
			</Alert>
		);
	}

	return '';
}
