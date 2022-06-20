import React, { useState, useEffect, useContext, Fragment } from 'react';
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
	Card,
	CardContent,
	CardActions,
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SingleReminder from './SingleReminder';
import useServerCall from '../../hooks/useServerCall';

export default function Edit({ id }) {
	const [viewReminders, setViewReminders] = useState(false);
	const [reminderSet, , ,] = useServerCall(`/user/reminderSet/get/${id}`);
	const [reminderData, setReminderData] = useState({
		id: id,
		subject: 'Hello There',
		description: 'Hello There Description',
		reminders: [
			{
				unique_id: 1654180200133,
				subject: 'Reminder 1',
				description: 'Short Description',
				notification_date: '2022-06-02T14:30:00.133Z',
				days_after: 2,
			},
			{
				unique_id: 1654180200133,
				subject: 'Reminder 2',
				description: 'Short Description',
				notification_date: '2022-06-02T14:30:00.133Z',
				days_after: 2,
			},
		],
	});
	const [errors, setErrors] = useState([]);
	const [successMessage, setSuccessMessage] = useState(false);
	useEffect(() => {
		const retrieveReminders = async () => {
			try {
				setErrors([]);
				let results = await reminderSet.getAsync();
				if (results) {
					setReminderData(results.data);
					return;
				}
			} catch (e) {
				setSuccessMessage(false);
				if (e?.message) {
					setErrors((previous) => {
						let newState = [...previous, e.message];
						return newState;
					});
					return;
				}
			}
			setErrors((previous) => {
				let newState = [...previous, 'Unknown Error'];
				return newState;
			});
		};
		retrieveReminders();
	}, [reminderData]);

	const hasReminderData = reminderData.subject;
	const ReminderCardContent = () => {
		return (
			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom></Typography>
					<Typography variant="h5" component="div">
						{reminderData.subject}
					</Typography>

					<Typography variant="body2">{reminderData.description}</Typography>
				</CardContent>
				<CardActions>
					<Button size="small" onClick={() => setViewReminders(true)}>
						View Reminders
					</Button>
				</CardActions>
			</Card>
		);
	};
	const editReminder = (changed, key) => {
		//const changedReminders = reminders;
		//changedReminders[key] = changed;
		//setReminders(changedReminders);
	};
	const removeReminder = (index) => {
		/*let filteredReminders = reminders.filter((reminder, key) => {
			return !(key === index);
		});
		setReminders(filteredReminders);*/
	};
	const ViewReminderData = ({ reminders }) => {
		const itemIconStyle = { cursor: 'pointer' };
		return (
			<List>
				{reminders.map((reminder, key) => (
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
				))}
			</List>
		);
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
					width: 1,
				}}
			>
				<Typography component="h1" variant="h5">
					Edit Reminder
				</Typography>
				{errors.map((err, key) => {
					return (
						<Alert key={key} severity="error">
							{err}
						</Alert>
					);
				})}
				<ReminderCardContent />
				{viewReminders && (
					<>
						<ViewReminderData reminders={reminderData.reminders} />
						<Button size="small" onClick={() => setViewReminders(false)}>
							Hide
						</Button>
					</>
				)}
			</Paper>
		</Box>
	);
}
