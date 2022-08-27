import React, { useState, useEffect, useContext } from 'react';
import {
	Button,
	TextField,
	Box,
	Grid,
	Typography,
	Paper,
	Alert,
	FormControlLabel,
	Switch,
} from '@mui/material';

import { UserContext } from '../models/UserContext';
import useServerCall from '../hooks/useServerCall';
import useNotificationPreference from '../hooks/useNotificationPreference';

export default function UserProfile() {
	const signedInUser = useContext(UserContext);
	const [profileCaller, profileData, profileError, profileLoading] = useServerCall('/user/profile');
	const [saveProfile, , ,] = useServerCall('/user/profile/save');
	const [
		currentStatus,
		enableNotification,
		disableNofitication,
		notificationLoading,
		notificationErrors,
	] = useNotificationPreference(signedInUser.user);
	const [formValues, setFormValues] = useState({
		first_name: '',
		last_name: '',
		email: '',
		id: '',
	});
	const [errors, setErrors] = useState([]);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (signedInUser.user) {
			if (!profileLoading && profileData === false && profileError === false) {
				profileCaller.get();
			}
		}
	}, [profileCaller, profileData, profileLoading, signedInUser.user, profileError]);

	useEffect(() => {
		if (profileData) {
			let userValues = profileData.data;
			setFormValues((values) => {
				let appendedValues = {
					...values,
					email: userValues.email,
					first_name: userValues.first_name,
					last_name: userValues.last_name,
					id: userValues.id ? userValues.id : '',
				};
				return appendedValues;
			});
		}
		if (profileError) {
			console.log(profileError);
		}
	}, [profileData, profileError]);

	const validate = () => {
		const validateEmail = (email) => {
			return String(email)
				.toLowerCase()
				.match(
					/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				);
		};
		let validate = true;
		let errs = [];
		if (formValues.first_name === '') {
			errs.push('First Name is required');
			validate = false;
		}
		if (formValues.last_name === '') {
			errs.push('Last Name required');
			validate = false;
		}
		if (formValues.email === '') {
			errs.push('Email is required');
			validate = false;
		}
		if (formValues.email !== '') {
			if (!validateEmail(formValues.email)) {
				errs.push('Invalid email');
				validate = false;
			}
		}
		setErrors(errs);
		return validate;
	};

	const handleSubmit = async (event) => {
		setMessages([]);
		event.preventDefault();
		if (!validate()) {
			return;
		}

		let allFormValues = {
			...formValues,
		};
		let success = await saveProfile.post(allFormValues);
		if (success) {
			setMessages(['Sucessfully Saved User']);
			await profileCaller.get();
		}
	};

	const handleChange = (e) => {
		setFormValues({
			...formValues,
			[e.target.name]: e.target.value,
		});
	};

	const handleNotificationStatus = async (e) => {
		const switchedOn = e.target.checked;
		if (switchedOn) {
			await enableNotification();
			return;
		}
		if (!switchedOn) {
			await disableNofitication();
		}
	};

	const { first_name, last_name, email } = formValues;

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Paper
				elevation={3}
				sx={{
					mt: 3,
					padding: 3,
					width: 400,
				}}
			>
				<Typography component="h1" variant="h5">
					Create/Edit User
				</Typography>

				<Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
					{errors.map((err, key) => {
						return (
							<Alert key={key} severity="error">
								{err}
							</Alert>
						);
					})}
					{notificationErrors.map((err, key) => {
						return (
							<Alert key={key} severity="error">
								{err}
							</Alert>
						);
					})}

					{messages.map((message, key) => {
						return (
							<Alert key={key} severity="info">
								{message}
							</Alert>
						);
					})}
					{!currentStatus && <Alert severity="info">Notifications Not Enabled</Alert>}

					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								id="first_name"
								label="User First Name"
								name="first_name"
								value={first_name}
								onChange={handleChange}
								autoFocus
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								id="last_name"
								label="User Last Name"
								name="last_name"
								value={last_name}
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								id="email"
								label="User Name"
								name="email"
								value={email}
								onChange={handleChange}
								required
							/>
						</Grid>
						<Grid item xs={12}>
							{notificationLoading ? (
								'Loading'
							) : (
								<FormControlLabel
									control={
										<Switch
											checked={currentStatus}
											onChange={handleNotificationStatus}
											name="notificationPreference"
										/>
									}
									label="Notifications"
								/>
							)}
						</Grid>
					</Grid>
					<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
						Save
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}
