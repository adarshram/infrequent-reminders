import React, { useState, useEffect, useContext } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { format, add } from 'date-fns';

import { useNavigate, useParams } from 'react-router-dom'; // version 5.2.0
import { UserContext } from '../models/UserContext';
import useServerCall from '../hooks/useServerCall';
import { PendingReminderContext } from '../models/PendingReminderContext';
import CreateUpdateForm from '../components/Schedules/CreateUpdateForm';

export default function CreateSchedule(props) {
	let navigate = useNavigate();
	let params = useParams();
	const userObject = useContext(UserContext);
	const pendingReminderObject = useContext(PendingReminderContext);

	const [saveNotification, , , ,] = useServerCall('/user/notifications/save');

	const [showNotification, showNotificationResponse, , ,] =
		useServerCall(`/user/notifications/show/`);
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
		is_active: true,
	});

	const [errors, setErrors] = useState([]);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (params.id && user_id) {
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
					<CreateUpdateForm
						formValues={formValues}
						errors={errors}
						messages={messages}
						setFormValues={setFormValues}
					/>
					<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
						{pageCtas.submit}
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}
