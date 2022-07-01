import React, { useState, useEffect } from 'react';
import {
	ListItem,
	ListItemText,
	ListItemButton,
	Typography,
	ListItemIcon,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	DialogContentText,
} from '@mui/material';
import {
	Snooze as SnoozeIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	Done as DoneIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
export default function ShowSchedule({
	schedule,
	key,
	editHandler,
	snoozeOrCompleteHandler,
	deleteHandler,
	doneHandler,
	setCurrentSchedule,
	currentSchedule,
}) {
	const handleSnoozeOrComplete = (e) => {
		e.preventDefault();
		snoozeOrCompleteHandler(schedule);
	};
	const handleEdit = (e) => {
		e.preventDefault();
		editHandler(schedule);
	};
	const handleDelete = (e) => {
		e.preventDefault();
		setConfirmDelete(false);
		deleteHandler(schedule);
	};
	const handleDone = (e) => {
		if (doneHandler) {
			doneHandler(schedule);
		}
	};
	const [expand, setExpand] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	useEffect(() => {
		let expanded = currentSchedule && schedule && currentSchedule.id === schedule.id;
		setExpand(expanded);
	}, [currentSchedule]);

	const ExpandedOptions = () => {
		return (
			<ListItem key={key} alignItems="flex-start" disablePadding>
				<ListItemIcon
					onClick={(e) => {
						handleEdit(e);
					}}
				>
					<EditIcon />
				</ListItemIcon>
				{schedule.is_pending && (
					<ListItemIcon
						onClick={(e) => {
							handleSnoozeOrComplete(e);
						}}
					>
						<SnoozeIcon alt="snooze" />
					</ListItemIcon>
				)}

				<ListItemIcon
					onClick={(e) => {
						handleDone(e);
					}}
				>
					<DoneIcon alt="done" />
				</ListItemIcon>

				<ListItemIcon
					onClick={(e) => {
						setConfirmDelete(true);
					}}
				>
					<DeleteIcon />
				</ListItemIcon>
			</ListItem>
		);
	};
	const ConfirmDelete = ({ open, handleConfirm, handleCancel }) => {
		return (
			<Dialog
				open={open}
				onClose={handleCancel}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure you want to Delete?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancel} role="cancel-confirm">
						Cancel
					</Button>

					<Button role="confirm-delete" onClick={handleConfirm} autoFocus>
						Yes,Delete
					</Button>
				</DialogActions>
			</Dialog>
		);
	};

	return (
		<>
			<ListItem
				key={key}
				alignItems="flex-start"
				onClick={() => {
					setCurrentSchedule(schedule);
				}}
				disablePadding
			>
				<ListItemButton
					selected={expand}
					onClick={(event) => {
						setCurrentSchedule(schedule);
					}}
				>
					<ListItemText
						primary={schedule.subject}
						secondary={
							<React.Fragment>
								<Typography
									sx={{ display: 'flex' }}
									component="span"
									variant="body2"
									color="text.primary"
								>
									{schedule.description}
								</Typography>
								{schedule.notification_date
									? format(new Date(schedule.notification_date), 'MM/dd/yyyy')
									: ''}
							</React.Fragment>
						}
					/>
				</ListItemButton>
			</ListItem>
			{expand && <ExpandedOptions />}
			{confirmDelete && (
				<ConfirmDelete
					open={confirmDelete}
					handleConfirm={handleDelete}
					handleCancel={() => {
						setConfirmDelete(false);
					}}
				/>
			)}
		</>
	);
}
