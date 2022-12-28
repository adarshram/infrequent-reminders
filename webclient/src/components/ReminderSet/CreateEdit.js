import React, { useState, useEffect } from 'react';
import { Button, Box, Grid, Typography, Paper, Alert } from '@mui/material';

import ReminderSet from './ReminderSet';
import TitleDescription from './TitleDescription';
import useServerCall from '../../hooks/useServerCall';
import ConfirmDialog from '../ConfirmDialog';

export default function CreateEdit({ reminderData, onSave, successMessage, saveErrors, onCancel }) {
	const [title, setTitle] = useState('Create Reminder Set');
	const [deleteReminderSet, , ,] = useServerCall(`/user/reminderSet/deleteNotification/`);

	const [formValues, setFormValues] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [currentReminder, setCurrentReminder] = useState(false);
	const [errors, setErrors] = useState([]);

	useEffect(() => {
		if (reminderData) {
			setTitle(reminderData?.id ? 'Edit Reminder Set' : 'Create Reminder Set');
			setFormValues({
				subject: reminderData.subject ?? '',
				description: reminderData.description ?? '',
				id: reminderData.id ?? false,
				reminders: reminderData.reminders ?? [],
			});
		}

		if (saveErrors) {
			setErrors(saveErrors);
		}
	}, [reminderData, saveErrors]);

	const setReminders = (value) => {
		setFormValues((previous) => {
			let newState = {
				...previous,
				reminders: value,
			};
			return newState;
		});
	};

	const removeReminderFromDb = async (reminder) => {
		try {
			let deleted = await deleteReminderSet.getAsync(reminder.id);
			if (!deleted.data) {
				setErrors((previous) => {
					let newState = [...previous, 'Unable To Delete'];
					return newState;
				});
				return;
			}
		} catch (e) {
			setErrors((previous) => {
				let newState = [...previous, 'Unable To Delete'];
				return newState;
			});
			return;
		}
		let index = false;

		if (index !== false) {
			removeReminderFromState(index);
		}
		setConfirmDelete(false);
		setCurrentReminder(false);
	};

	const removeReminderFromState = (index) => {
		let filteredReminders = reminders.filter((reminder, key) => {
			return !(key === index);
		});
		setReminders(filteredReminders);
	};

	const onSubmit = async (e) => {
		if (!validatePage()) {
			return false;
		}
		//send ajax and save
		onSave({
			formValues,
			reminders,
		});
	};

	const validatePage = () => {
		let validate = true;
		setErrors([]);
		let hasRemindersInRange = reminders.length > 0 && reminders.length <= 10;
		if (!hasRemindersInRange) {
			setErrors((previous) => {
				let newState = [...previous, 'Should have reminders'];
				return newState;
			});

			validate = false;
		}
		if (formValues.subject === '') {
			setErrors((previous) => {
				let newState = [...previous, 'Should Have a Subject'];
				return newState;
			});

			validate = false;
		}
		if (formValues.description === '') {
			setErrors((previous) => {
				let newState = [...previous, 'Should Have a Description'];
				return newState;
			});
			validate = false;
		}
		return validate;
	};
	if (!formValues) {
		return '';
	}
	const { reminders } = formValues;

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
				}}
			>
				<Typography component="h1" variant="h5">
					{title}
				</Typography>
				{errors.map((err, key) => {
					return (
						<Alert key={key} severity="error">
							{err}
						</Alert>
					);
				})}
				{successMessage && <Alert severity="success">{successMessage}</Alert>}
				<Grid container spacing={2} alignItems="center">
					<TitleDescription formValues={formValues} setFormValues={setFormValues} />
					<ReminderSet reminders={formValues.reminders} setReminders={setReminders} />

					<Grid item xs={12}>
						<Button variant="text" onClick={onSubmit}>
							Save
						</Button>
						<Button variant="text" onClick={onCancel}>
							Cancel
						</Button>
					</Grid>
				</Grid>

				{confirmDelete && (
					<ConfirmDialog
						title={'Confirm Deletion'}
						text={'Are you sure you want to delete this Reminder?'}
						onClose={() => {
							setConfirmDelete(false);
							setCurrentReminder(false);
						}}
						onConfirm={() => {
							removeReminderFromDb(currentReminder);
							setConfirmDelete(false);
							setCurrentReminder(false);
						}}
					/>
				)}
			</Paper>
		</Box>
	);
}
