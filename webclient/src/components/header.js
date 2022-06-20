import React, { useContext } from 'react';

import { AppBar, IconButton, Badge, Typography, Toolbar, Button } from '@mui/material';
import { Person as PersonIcon, Notifications as NotificationsIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom'; // version 5.2.0

import { PendingReminderContext } from '../models/PendingReminderContext';

export default function Header({ text, onClose, onConfirm }) {
	let navigate = useNavigate();

	const pendingReminderObject = useContext(PendingReminderContext);
	const pendingCounter = pendingReminderObject.count;

	const userProfile = '/userProfile';
	const dashBoard = '/list';
	const pending = '/pending';

	return (
		<>
			<AppBar position="static" open={true}>
				<Toolbar
					sx={{
						pr: '25px', // keep right padding when drawer closed
					}}
				>
					<Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
						<Button variant="text" color="neutral" onClick={() => navigate(dashBoard)}>
							Dashboard
						</Button>
					</Typography>
					<IconButton color="inherit">
						{pendingCounter !== false && (
							<Badge badgeContent={pendingCounter ? pendingCounter : null} color="secondary">
								<NotificationsIcon
									onClick={() => {
										navigate(pending);
									}}
								/>
							</Badge>
						)}
					</IconButton>
					<PersonIcon
						onClick={() => {
							navigate(userProfile);
						}}
					/>
				</Toolbar>
			</AppBar>
		</>
	);
}
