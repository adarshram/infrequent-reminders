import React, { useState, useEffect, useContext } from 'react';
import {
	Button,
	TextField,
	Box,
	Grid,
	Typography,
	Paper,
	Alert,
	List,
	ListItem,
	IconButton,
} from '@mui/material';

export default function LoopReminder() {
	const [reminders, setReminders] = useState([]);
	const [formValues, setFormValues] = useState({});

	const editReminder = (changed, key) => {
		const changedReminders = reminders;
		changedReminders[key] = changed;

		setReminders(changedReminders);
	};
	const handleChange = (e, index) => {
		const changedReminders = [...reminders];
		changedReminders[index][e.target.name] = e.target.value;
		setReminders(changedReminders);
	};
	const handleSimpleChange = (e) => {
		setFormValues({
			...formValues,
			[e.target.name]: e.target.value,
		});
	};
	const removeReminder = async (index) => {
		let filteredReminders = reminders.filter((reminder, key) => {
			return !(key === index);
		});
		setReminders(filteredReminders);
	};
	const addReminderSet = (e) => {
		setReminders([
			...reminders,
			{
				subject: 'Enter Subject',
				description: 'Short Description',
				notification_date: new Date(),
				days_after: 2,
				is_active: true,
			},
		]);
	};
	const removeReminderFromState = (index) => {};

	return (
		<>
			<TextField
				required
				fullWidth
				label="Subject"
				id="name"
				name={`name`}
				value={formValues.name ?? 'Enter Subject'}
				onChange={handleSimpleChange}
			/>
			<TextField
				required
				fullWidth
				label="description"
				id="description"
				name={`description`}
				value={formValues.description ?? 'Enter Subject'}
				onChange={handleSimpleChange}
			/>
			{reminders && reminders.length > 0 && (
				<Grid item xs={12}>
					<List>
						{reminders.map((reminder, key) => {
							return (
								<TextField
									required
									fullWidth
									label="Subject"
									id="subject"
									name={`subject`}
									key={key}
									value={reminder.subject ?? 'Enter Subject'}
									onChange={(e) => handleChange(e, key)}
								/>
							);
						})}
					</List>
				</Grid>
			)}
			<Grid item xs={12}>
				<Button fullWidth variant="text" onClick={addReminderSet}>
					Add New
				</Button>
			</Grid>
		</>
	);
}
