import React from 'react';
import {
	TextField,
	Select,
	MenuItem,
	ListItem,
	ListItemIcon,
	IconButton,
	Checkbox,
	FormGroup,
	FormControlLabel,
} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DateAdapter from '@mui/lab/AdapterDateFns';

import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
export default function SingleReminder({
	reminderData,
	onChange,
	isFirst,
	handleRemove,
	toggleComplete,
	reminderIndex,
	isCurrentReminder,
}) {
	const daysOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const handleDateChange = (key, value) => {};

	const handleChange = (e) => {
		onChange(e);
	};
	const handleRemoveClick = () => {
		if (handleRemove) {
			handleRemove(reminderData);
		}
	};

	const completeChangeHandler = (e) => {
		if (toggleComplete) {
			toggleComplete(e.target.checked);
		}
	};

	const isComplete = reminderData.link && reminderData.link.complete;

	const CompletedReminder = () => {
		return (
			<ListItem alignItems="flex-start" disablePadding style={{ textDecoration: 'line-through' }}>
				<FormGroup>
					<FormControlLabel
						control={<Checkbox defaultChecked onChange={completeChangeHandler} />}
						label={reminderData.subject}
					/>
				</FormGroup>
			</ListItem>
		);
	};
	if (isComplete) {
		return <CompletedReminder />;
	}
	return (
		<ListItem alignItems="flex-start" disablePadding>
			<TextField
				required
				fullWidth
				label="Subject"
				id="subject"
				name={`subject`}
				value={reminderData.subject ?? 'Enter Subject'}
				onChange={handleChange}
			/>
			{isFirst ? (
				<LocalizationProvider dateAdapter={DateAdapter}>
					<DatePicker
						label="Enter First Recurring date"
						value={reminderData.notification_date ?? new Date()}
						onChange={(value) => handleDateChange('notification_date', value)}
						name={`notification_date`}
						renderInput={(params) => <TextField {...params} />}
						required
					/>
				</LocalizationProvider>
			) : (
				<Select
					labelId="demo-simple-select-label"
					id="days_after"
					value={reminderData?.link?.days_after ?? 1}
					label="Remind After"
					name={`days_after`}
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
			<ListItemIcon
				onClick={(e) => {
					handleRemoveClick();
				}}
			>
				<IconButton>
					<RemoveCircleIcon alt="snooze" />
				</IconButton>
			</ListItemIcon>
		</ListItem>
	);
}
