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
	List,
	ListItem,
	IconButton,
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SaveIcon from '@mui/icons-material/Save';

import DateAdapter from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import { format, add } from 'date-fns';

export default function SingleReminder({ reminder, onChange, isFirst }) {
	const [reminderData, setReminderData] = useState({});
	const daysOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	useEffect(() => {
		if (onChange && Object.keys(reminderData).length > 0) {
			onChange(reminderData);
		}
	}, [reminderData, onChange]);
	useEffect(() => {
		if (reminder) {
			setReminderData(reminder);
		}
	}, [reminder]);

	const handleDateChange = (key, value) => {
		setReminderData((previous) => {
			let newState = {
				...previous,
				[key]: value,
			};
			return newState;
		});
	};

	const handleChange = (e) => {
		setReminderData((previous) => {
			let newState = {
				...previous,
				[e.target.name]: e.target.value,
			};
			return newState;
		});
	};

	return (
		<>
			<TextField
				required
				fullWidth
				label="Subject"
				name="subject"
				value={reminderData.subject ?? 'Enter Subject'}
				onChange={handleChange}
				autoFocus
			/>
			{isFirst ? (
				<LocalizationProvider dateAdapter={DateAdapter}>
					<DatePicker
						label="Enter First Recurring date"
						value={reminderData.notification_date ?? new Date()}
						onChange={(value) => handleDateChange('notification_date', value)}
						name="notification_date"
						renderInput={(params) => <TextField {...params} />}
						required
					/>
				</LocalizationProvider>
			) : (
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={reminderData.days_after ?? 0}
					label="Remind After"
					name="days_after"
					onChange={handleChange}
				>
					<MenuItem value={0}>After</MenuItem>
					{daysOptions.map((day, k) => (
						<MenuItem value={day} key={k}>
							{day} {day > 1 ? 'days' : 'day'}
						</MenuItem>
					))}
				</Select>
			)}
		</>
	);
}
