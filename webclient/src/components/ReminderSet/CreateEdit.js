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
import SingleReminder from './SingleReminder';
import useServerCall from '../../hooks/useServerCall';
import ConfirmDialog from '../ConfirmDialog';

export default function CreateEdit({ reminderData, onSave, successMessage, saveErrors }) {
	const [title, setTitle] = useState('Create Reminder Set');
	const [deleteReminderSet, , ,] = useServerCall(`/user/reminderSet/deleteNotification/`);
	const itemIconStyle = { cursor: 'pointer' };
	const [formValues, setFormValues] = useState({
		subject: '',
		description: '',
		id: false,
	});
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [currentReminder, setCurrentReminder] = useState(false);

	const [reminders, setReminders] = useState([]);
	const [errors, setErrors] = useState([]);

	useEffect(() => {
		if (reminderData) {
			setTitle(reminderData?.id ? 'Edit Reminder Set' : 'Create Reminder Set');
			setFormValues({
				subject: reminderData.subject ?? '',
				description: reminderData.description ?? '',
				id: reminderData.id ?? false,
			});
			setReminders(reminderData.reminders ?? []);
		}
		if (saveErrors) {
			setErrors(saveErrors);
		}
	}, [reminderData, saveErrors]);

	const editReminder = (changed, key) => {
		const changedReminders = reminders;
		changedReminders[key] = changed;
		setReminders(changedReminders);
	};
	const handleChange = (e) => {
		setFormValues((previous) => {
			let newState = {
				...previous,
				[e.target.name]: e.target.value,
			};
			return newState;
		});
	};

	const removeReminder = async (index) => {
		let chosenReminder = reminders.filter((reminder, key) => {
			return key === index;
		});
		if (chosenReminder.length && chosenReminder[0].id) {
			setConfirmDelete(true);
			setCurrentReminder(chosenReminder[0]);
			return;
		}
		removeReminderFromState(index);
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
		let filteredReminders = reminders.filter((currentReminder, key) => {
			if (currentReminder.id === reminder.id) {
				index = key;
				return key;
			}
		});

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

	const addReminderSet = (e) => {
		setReminders([
			...reminders,
			{
				subject: 'Enter Subject',
				description: 'Short Description',
				notification_date: new Date(),
				days_after: 2,
			},
		]);
	};

	const saveAllVariables = async (e) => {
		if (!validatePage()) {
			return false;
		}
		//send ajax and save
		onSave({
			formValues,
			reminders,
		});
	};

	let hasRemindersInRange = reminders.length > 0 && reminders.length <= 10;

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
					<Grid item xs={12}>
						<TextField
							required
							fullWidth
							id="subject"
							label="Set Name"
							name="subject"
							value={formValues.subject}
							onChange={handleChange}
							autoFocus
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							id="content"
							label="Set Description"
							name="description"
							multiline
							rows={5}
							value={formValues.description}
							onChange={handleChange}
						/>
					</Grid>
					{reminders && reminders.length > 0 && (
						<Grid item xs={12}>
							<List>
								{reminders.map((reminder, key) => {
									return (
										<ListItem
											key={key}
											alignItems="flex-start"
											secondaryAction={
												<IconButton
													edge="end"
													aria-label={`actions-${key}`}
													style={itemIconStyle}
													onClick={(e) => {
														removeReminder(key);
													}}
												>
													<RemoveCircleIcon />
												</IconButton>
											}
											disablePadding
										>
											<SingleReminder
												reminder={reminder}
												onChange={(changed) => editReminder(changed, key)}
												isFirst={key === 0}
											/>
										</ListItem>
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
					{hasRemindersInRange && (
						<Grid item xs={12}>
							<Button fullWidth variant="text" onClick={saveAllVariables}>
								Save
							</Button>
						</Grid>
					)}
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
