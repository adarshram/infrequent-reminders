import React, { useState, useEffect } from 'react';
import SingleReminder from './SingleReminder';

import { Button, Grid, List } from '@mui/material';
export default function ReminderSet({ reminders, setReminders, showSave }) {
	const [dateKey, setDateKey] = useState(0);

	const editReminder = (e, key) => {
		const changedReminders = [...reminders];
		changedReminders[key][e.target.id] = e.target.value;

		setReminders(changedReminders);
	};

	useEffect(() => {
		if (reminders) {
			let dateIndex = reminders.findIndex((current) => {
				return current.is_active;
			});
			if (dateIndex > -1) {
				setDateKey(dateIndex);
			}
		}
	}, [reminders]);

	const removeReminder = async (index) => {
		let chosenReminder = reminders.filter((reminder, key) => {
			return key === index;
		});
		if (chosenReminder.length && chosenReminder[0].id) {
			return;
		}

		removeReminderFromState(index);
	};
	const toggleComplete = (changedValue, key) => {
		if (!reminders[key]) {
			return;
		}

		let changedReminders = reminders;
		changedReminders[key].link = {
			...changedReminders[key].link,
			complete: changedValue,
		};
		console.log(changedReminders);
		if (changedValue === false) {
			changedReminders = reminders.map((current, currentKey) => {
				if (currentKey >= key) {
					current.is_active = true;
				}
				return current;
			});
			setReminders(changedReminders);
			setDateKey(key);
		}
		setReminders(changedReminders);
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
	const removeReminderFromState = (index) => {
		let filteredReminders = reminders.filter((reminder, key) => {
			return !(key === index);
		});
		setReminders(filteredReminders);
	};
	return (
		<>
			{reminders && reminders.length > 0 && (
				<Grid item xs={12}>
					<List>
						{reminders.map((reminder, key) => {
							return (
								<>
									<SingleReminder
										reminderData={reminder}
										onChange={(e) => editReminder(e, key)}
										isFirst={key === dateKey}
										handleRemove={(reminder) => removeReminder(key)}
										key={`${key}-something`}
										reminderIndex={key}
										toggleComplete={(changedValue) => toggleComplete(changedValue, key)}
									/>
								</>
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
