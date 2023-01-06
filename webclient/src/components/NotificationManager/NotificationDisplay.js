import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, FormControlLabel, Switch, Divider, Box } from '@mui/material';
const deepCopy = (x) => {
	return JSON.parse(JSON.stringify(x));
};
const findEmailRow = (localList) => {
	let emailLookupRow = localList.find((current) => current?.isEmail === true);

	return emailLookupRow;
};
export default function NotificationDisplay({ currentDevice, deviceList, onSave, personalEmail }) {
	const [localDeviceList, setLocalDeviceList] = useState([]);
	const [bossValue, setBossValue] = useState(false);
	const [hasUserChangedValue, setHasUserChangedValue] = useState(false);
	const [emailPreference, setEmailPreference] = useState({});

	useEffect(() => {
		let localList = deepCopy(deviceList);
		let emailLookupRow = findEmailRow(localList);
		if (emailLookupRow) {
			setEmailPreference(emailLookupRow);
		}
		if (!emailLookupRow) {
			const defaultEmailPreference = {
				name: 'UserEmail',
				enabled: true,
				email: personalEmail,
				isEmail: true,
			};
			setEmailPreference(defaultEmailPreference);
		}

		let localListWithoutEmail = localList.filter((current) => !current.isEmail);
		setLocalDeviceList(localListWithoutEmail);
	}, [deviceList, personalEmail]);

	const enableDisableNotification = (event, notificationIndex) => {
		setHasUserChangedValue(true);
		let updatedDeviceList = deepCopy(localDeviceList);
		updatedDeviceList[notificationIndex].enabled = event.target.checked;
		setLocalDeviceList(updatedDeviceList);
	};

	const onSubmit = () => {
		onSave([...localDeviceList, emailPreference]);
	};

	const onCancel = () => {
		setLocalDeviceList(deviceList);
	};

	const handleNameChange = (event, notificationIndex) => {
		setHasUserChangedValue(true);
		let updatedDeviceList = deepCopy(localDeviceList);
		updatedDeviceList[notificationIndex].customName = event.target.value;
		setLocalDeviceList(updatedDeviceList);
	};

	const listenTotheDamnBoss = (e) => {
		const halleluah = e.target.checked;
		setBossValue(halleluah);
		let updatedDeviceList = localDeviceList.map((each) => {
			each.enabled = halleluah;
			return each;
		});
		setLocalDeviceList(updatedDeviceList);
	};
	const handleEmailNotificationSwitch = (e) => {
		setEmailPreference({
			...emailPreference,
			enabled: !emailPreference.enabled,
		});
	};
	const handleEmailChange = (e) => {
		setEmailPreference({
			...emailPreference,
			email: e.target.value,
		});
	};

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Box
					sx={{
						paddingBottom: 2,
					}}
				>
					{' '}
					<FormControlLabel
						control={
							<Switch
								checked={bossValue}
								name="allNotifications"
								onChange={(e) => {
									listenTotheDamnBoss(e);
								}}
							/>
						}
						label={`All Notifications`}
					/>
					<Divider />
				</Box>
			</Grid>
			<Grid item xs={12}>
				<FormControlLabel
					control={
						<Switch
							checked={emailPreference.enabled ? emailPreference.enabled : false}
							name="notificationPreference"
							onChange={(e) => {
								handleEmailNotificationSwitch(e);
							}}
						/>
					}
					label={`Email`}
				/>
				<TextField
					label={`Email`}
					name={'email'}
					value={emailPreference.email ? emailPreference.email : ''}
					onChange={(e) => {
						handleEmailChange(e);
					}}
				/>
			</Grid>
			{localDeviceList &&
				localDeviceList.length > 0 &&
				localDeviceList.map((notification, key) => {
					return (
						<Grid item xs={12} key={key}>
							<FormControlLabel
								control={
									<Switch
										checked={notification.enabled ? true : false}
										name="notificationPreference"
										onChange={(e) => {
											enableDisableNotification(e, key);
										}}
										inputProps={{ 'data-testid': 'device-switch' }}
									/>
								}
								label={``}
							/>
							<TextField
								label={`Device Name ${notification.vapidKey === currentDevice ? '(current*)' : ''}`}
								name={`${key}`}
								value={notification.customName ? notification.customName : notification.name}
								onChange={(e) => {
									handleNameChange(e, key);
								}}
								autoFocus
							/>
						</Grid>
					);
				})}
			<Grid item xs={12}>
				{hasUserChangedValue && (
					<Button variant="text" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button variant="text" onClick={onSubmit}>
					Save
				</Button>
			</Grid>
		</Grid>
	);
}
