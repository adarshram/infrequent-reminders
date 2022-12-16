import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Grid, Alert, TextField, MenuItem } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { format, add } from 'date-fns';

export default function CreateUpdateForm({ formValues, errors, messages, setFormValues }) {
	const { subject, description, frequency, frequency_type, notification_date } = formValues;
	const [hasUserChangedDate, setHasUserChangedDate] = useState(false);
	const handleFrequencyChange = (e) => {
		let updatedFormValues = {
			...formValues,
			[e.target.name]: e.target.value,
		};
		let notificationDate = hasUserChangedDate
			? formValues.notification_date
			: calculateUpdatedDate(updatedFormValues.frequency_type, updatedFormValues.frequency);

		setFormValues((previous) => {
			let newState = {
				...previous,
				[e.target.name]: e.target.value,
				notification_date: notificationDate,
			};
			return newState;
		});
	};

	const calculateUpdatedDate = (frequency_type, frequency) => {
		let inputFrequencyType = frequency_type ?? 'd';
		let inputFrequency = frequency ?? 1;
		let frequencyDateOptions = {
			d: {
				days: inputFrequency,
			},
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
		//add
		let addDateObject = add(new Date(), frequencyDateOptions[inputFrequencyType]);
		const calculatedNotificationDate = format(addDateObject, 'MM/dd/yyyy');
		return calculatedNotificationDate;
	};
	const handleChange = (e) => {
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
	const updateDateInForm = (newDate, secondValue) => {
		let newDateHasValue = newDate !== null;
		setHasUserChangedDate(newDateHasValue);
		try {
			updateFormValues('notification_date', format(newDate, 'MM/dd/yyyy'));
		} catch (e) {
			updateFormValues('notification_date', newDate);
		}
	};

	return (
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
					onChange={handleFrequencyChange}
				/>
			</Grid>
			<Grid item xs={6}>
				<TextField
					select
					id="demo-simple-select"
					value={frequency_type}
					label="Choose Frequency"
					fullWidth
					inputProps={{ id: 'frequency_type', 'data-testid': 'frequency_type' }}
					name="frequency_type"
					onChange={handleFrequencyChange}
					required
				>
					<MenuItem value={''}>Choose Frequency</MenuItem>
					<MenuItem value={'d'}>Days</MenuItem>
					<MenuItem value={'w'}>Weeks</MenuItem>
					<MenuItem value={'m'}>Months</MenuItem>
					<MenuItem value={'y'}>Years</MenuItem>
				</TextField>
			</Grid>

			<Grid item xs={12}>
				<LocalizationProvider dateAdapter={DateAdapter}>
					<DatePicker
						showDaysOutsideCurrentMonth
						label="Enter First Recurring date"
						value={notification_date}
						onChange={(value) => updateDateInForm(value)}
						name="notification_date"
						renderInput={(params) => <TextField {...params} />}
						required
					/>
				</LocalizationProvider>
			</Grid>
		</Grid>
	);
}
