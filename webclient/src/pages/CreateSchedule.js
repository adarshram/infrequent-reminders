import React, { useState, useEffect, useContext } from 'react';
import {
	Button,
	TextField,
	Box,
	Grid,
	Typography,
	Select,
	MenuItem,
	Paper,
	Alert,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { format, add } from 'date-fns';

import { useNavigate, useParams } from 'react-router-dom'; // version 5.2.0
import { UserContext } from '../models/UserContext';
import useServerCall from '../hooks/useServerCall';
import { PendingReminderContext } from '../models/PendingReminderContext';

export default function CreateSchedule(props) {
	let navigate = useNavigate();
	let params = useParams();
	const userObject = useContext(UserContext);
	const pendingReminderObject = useContext(PendingReminderContext);

	const [saveNotification, , , ,] = useServerCall('/user/notifications/save');

	const [showNotification, showNotificationResponse, , ,] =
		useServerCall(`/user/notifications/show/`);
	const [modifyDate, setModifyDate] = useState(false);
	const [pageCtas, setPageCtas] = useState({
		title: 'Create a Schedule',
		submit: 'Create Schedule',
	});
	const user_id = userObject.user.uid;
	const [formValues, setFormValues] = useState({
		subject: '',
		description: '',
		frequency: 1,
		id: false,
		notification_date: format(add(new Date(), { weeks: 1 }), 'MM/dd/yyyy'),
		frequency_type: 'w',
	});

	const [errors, setErrors] = useState([]);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (params.id && user_id) {
			setModifyDate(false);
			showNotification.get(params.id);
			setPageCtas({
				title: 'Save Schedule',
				submit: 'Save Schedule',
			});
		}
	}, [params.id, user_id, showNotification]);

	useEffect(() => {
		if (showNotificationResponse) {
			setFormValues((values) => {
				let appendedValues = {
					...values,
					...showNotificationResponse.data,
				};
				return appendedValues;
			});
		}
	}, [showNotificationResponse]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!validate()) {
			return;
		}
		let allFormValues = {
			...formValues,
		};

		let results = await saveNotification.post(allFormValues);
		if (results) {
			setMessages([
				`Successfully Saved Notification ${results?.data?.subject ? results.data.subject : ''}`,
			]);
			pendingReminderObject.load();
			navigate(`/create/${results.data.id}`);
		}
	};

	const validate = () => {
		let validate = true;
		let errs = [];
		if (formValues.subject === '') {
			errs.push('Subject is required');

			validate = false;
		}
		if (formValues.frequency_type === '') {
			errs.push('Frequency is required');
			validate = false;
		}
		if (formValues.notification_date === '') {
			errs.push('Notification Date is required');
			validate = false;
		}
		setErrors(errs);
		return validate;
	};

	const handleChange = (e) => {
		setModifyDate(true);
		updateFormValues(e.target.name, e.target.value);
	};

	const updateFormValues = (k, v) => {
		setFormValues((previous) => {
			let newState = {
				...previous,
				[k]: v,
			};
			return newState;
		});
	};

	useEffect(() => {
		if (modifyDate) {
			let inputFrequencyType = formValues.frequency_type;
			let inputFrequency = formValues.frequency ? formValues.frequency : 1;
			if (inputFrequencyType !== '') {
				let frequencyDateOptions = {
					w: {
						weeks: inputFrequency,
					},
					m: {
						months: inputFrequency,
					},
					y: {
						years: inputFrequency,
					},
				};

				if (frequencyDateOptions[inputFrequencyType]) {
					let addDateObject = add(new Date(), frequencyDateOptions[inputFrequencyType]);
					const calculatedNotificationDate = format(addDateObject, 'MM/dd/yyyy');

					setFormValues((formValues) => {
						let newState = {
							...formValues,
							notification_date: calculatedNotificationDate,
						};
						return newState;
					});
				}
			}
		}
	}, [formValues.frequency_type, formValues.frequency, modifyDate]);
	const { subject, description, frequency, frequency_type, notification_date } = formValues;

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
					mt: 3,
					padding: 3,
					width: 400,
				}}
			>
				<Typography component="h1" variant="h5">
					{pageCtas.title}
				</Typography>

				<Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12}>
							{errors.map((err, k) => {
								return (
									<Alert key={k} severity="error">
										{err}
									</Alert>
								);
							})}
							{messages.map((message, k) => {
								return (
									<Alert key={k} severity="success">
										{message}
									</Alert>
								);
							})}
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								id="subject"
								label="Notification Subject"
								name="subject"
								value={subject}
								onChange={handleChange}
								autoFocus
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								id="content"
								label="Notification Description"
								name="description"
								multiline
								rows={5}
								value={description}
								onChange={handleChange}
							/>
						</Grid>

						<Grid item xs={3}>
							Repeat
						</Grid>
						<Grid item xs={3}>
							<TextField
								id="content"
								label="Every"
								name="frequency"
								value={frequency}
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={6}>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={frequency_type}
								label="Choose Frequency"
								fullWidth
								name="frequency_type"
								onChange={handleChange}
								required
							>
								<MenuItem value={''}>Choose Frequency</MenuItem>
								<MenuItem value={'w'}>Weeks</MenuItem>
								<MenuItem value={'m'}>Months</MenuItem>
								<MenuItem value={'y'}>Years</MenuItem>
							</Select>
						</Grid>

						<Grid item xs={12}>
							<LocalizationProvider dateAdapter={DateAdapter}>
								<DatePicker
									label="Enter First Recurring date"
									value={notification_date}
									onChange={(value) => updateFormValues('notification_date', value)}
									name="notification_date"
									renderInput={(params) => <TextField {...params} />}
									required
								/>
							</LocalizationProvider>
						</Grid>
					</Grid>
					<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
						{pageCtas.submit}
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}
