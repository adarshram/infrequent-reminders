import React, { useState, useEffect } from 'react';
import SingleReminder from './SingleReminder';

import { Button, Grid, List } from '@mui/material';
export default function ReminderSet({ reminders, setReminders, showSave }) {
	const [dateKey, setDateKey] = useState(0);

	const editReminder = (key, changedKey, changedValue) => {
		const changedReminders = [...reminders];
		changedReminders[key][changedKey] = changedValue;
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
				subject: '',
				description: '',
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
	const handleMove = (direction, key) => {
		if (direction === 'Up' && key > 0) {
			let swappedReminders = reminders;
			let swap = swappedReminders[key];
			swappedReminders[key] = swappedReminders[key - 1];
			swappedReminders[key - 1] = swap;
			setReminders(swappedReminders);
			return;
		}
		let hasNextReminder = reminders[key + 1];
		if (direction === 'Down' && hasNextReminder) {
			let swappedReminders = reminders;
			let swap = swappedReminders[key + 1];
			swappedReminders[key + 1] = swappedReminders[key];
			swappedReminders[key] = swap;
			setReminders(swappedReminders);
			return;
		}
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
										onChange={(changedKey, changedValue) => {
											editReminder(key, changedKey, changedValue);
										}}
										isFirst={key === dateKey}
										handleRemove={(reminder) => removeReminder(key)}
										handleMove={(direction) => handleMove(direction, key)}
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
				<Button variant="text" onClick={addReminderSet}>
					Add New
				</Button>
			</Grid>
		</>
	);
}
