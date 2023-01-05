import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Box, Grid, Typography, Paper, Alert, Hidden } from '@mui/material';

import { UserContext } from '../models/UserContext';
import useServerCall from '../hooks/useServerCall';
import useFbaseAuthUser from '../hooks/useFbaseAuthUser';
import ProfileSideBar from '../components/ProfileSideBar';

const defaultFormValues = {
	first_name: '',
	last_name: '',
	email: '',
	id: '',
};
export default function UserProfile() {
	const signedInUser = useContext(UserContext);
	const [{ logOut }] = useFbaseAuthUser(signedInUser.user);
	const profileData = signedInUser.profile;

	const [saveProfile, , ,] = useServerCall('/user/profile/save');

	const [formValues, setFormValues] = useState(profileData ? profileData : defaultFormValues);

	const [errors, setErrors] = useState([]);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (profileData && profileData.email && formValues.email === '') {
			let userValues = profileData;
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
	}, [profileData, formValues]);

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
			signedInUser.fetchProfile(true);
		}
	};

	const handleChange = (e) => {
		setFormValues({
			...formValues,
			[e.target.name]: e.target.value,
		});
	};

	const logUserOut = async () => {
		await logOut();
		signedInUser.fetchProfile(true);
	};

	const { first_name, last_name, email } = formValues;
	if (!signedInUser.user) {
		return 'User Logged Out';
	}
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} lg={3} md={3}>
				<Hidden mdDown>
					<ProfileSideBar />
				</Hidden>
			</Grid>
			<Grid item xs={9} md={4}>
				<Box
					sx={{
						justifyContent: 'center',
					}}
				>
					<Paper
						elevation={3}
						sx={{
							mt: 3,
							padding: 3,
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

							{messages.map((message, key) => {
								return (
									<Alert key={key} severity="info">
										{message}
									</Alert>
								);
							})}

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
							</Grid>
							<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
								Save
							</Button>
							{logOut && (
								<Button fullWidth variant="text" sx={{ mt: 3, mb: 2 }} onClick={logUserOut}>
									Logout
								</Button>
							)}
						</Box>
					</Paper>
				</Box>
			</Grid>
		</Grid>
	);
}
