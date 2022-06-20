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
	Snackbar,
	Alert,
	List,
	ListItem,
	IconButton,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import {
	Snooze as SnoozeIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Done as DoneIcon,
} from '@mui/icons-material';
import useReminderSetList from '../../hooks/useReminderSetList';
import useServerCall from '../../hooks/useServerCall';
import ConfirmDialog from '../ConfirmDialog';

import { useNavigate } from 'react-router-dom';

export default function ListSet() {
	const [title] = useState('Reminder Sets');
	const [currentSet, setCurrentSet] = useState(false);
	const [snackMessage, setSnackMessage] = useState(false);
	const [deleteListSet, setDeleteListSet] = useState(false);
	const [parameters, setParameters] = useState(null);
	const [listData, loading, listErrors] = useReminderSetList(parameters);
	const [deleteCall, , , ,] = useServerCall('/user/reminderSet/deleteSet/');

	const navigate = useNavigate();
	useEffect(() => {
		if (parameters === null) {
			setParameters({
				something: '',
			});
		}
	}, [parameters]);
	const deleteSet = async () => {
		if (!currentSet) {
			return;
		}
		try {
			setCurrentSet(false);
			setDeleteListSet(false);
			let res = await deleteCall.getAsync(currentSet.id);
			if (res.success) {
				setParameters(null);
			}

			if (res.error) {
				throw res;
			}
		} catch (e) {
			setCurrentSet(false);
			setDeleteListSet(false);
			setSnackMessage(e?.response?.data?.message ? e.response.data.message : e.message);
		}
	};
	const ShowSet = ({ reminder }) => {
		const handleEdit = () => {
			navigate(`/set/edit/${reminder.id}`);
		};
		const handleDelete = () => {
			setDeleteListSet(true);
			setCurrentSet(reminder);
		};

		return (
			<ListItem>
				<ListItemButton>
					<ListItemIcon onClick={() => handleEdit(reminder)} data-testid={`edit-${reminder.id}`}>
						<EditIcon />
					</ListItemIcon>

					<ListItemText
						onClick={() => console.log('yo')}
						primary={reminder.subject}
						secondary={
							<Typography
								sx={{ display: 'flex' }}
								component="span"
								variant="body2"
								color="text.primary"
							>
								{`${reminder.description} ${reminder.no_sets} `}
								{reminder.no_sets > 1 ? ' reminders' : ' reminder'} in set
							</Typography>
						}
					/>
				</ListItemButton>
				<ListItemIcon onClick={() => handleDelete(reminder)} data-testid={`delete-${reminder.id}`}>
					<DeleteIcon />
				</ListItemIcon>
			</ListItem>
		);
	};

	if (!listData) {
		return 'loading';
	}

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
					{title}
				</Typography>

				<Grid container spacing={2} alignItems="center">
					{listData && listData.data.length > 0 && (
						<Grid item xs={12}>
							<List>
								{listData.data.map((reminder, key) => (
									<ShowSet reminder={reminder} key={key} />
								))}
							</List>
						</Grid>
					)}
					{listData.total === 0 && (
						<Grid item xs={12}>
							No Reminder Sets
							<Button fullWidth variant="text">
								Create New Set
							</Button>
						</Grid>
					)}
				</Grid>
				{deleteListSet && (
					<ConfirmDialog
						title={'Confirm Deletion'}
						text={'Are you sure you want to Delete This Set?'}
						onClose={() => {
							setCurrentSet(false);
							setDeleteListSet(false);
						}}
						onConfirm={() => deleteSet()}
					/>
				)}
				{snackMessage && (
					<Snackbar
						open={snackMessage !== false}
						autoHideDuration={3000}
						onClose={() => setSnackMessage(false)}
						message={snackMessage}
					>
						<Alert onClose={() => setSnackMessage(false)} severity="error" sx={{ width: '100%' }}>
							{snackMessage}
						</Alert>
					</Snackbar>
				)}
			</Paper>
		</Box>
	);
}
