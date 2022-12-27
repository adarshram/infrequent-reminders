import React, { useContext, useEffect } from 'react';

import { AppBar, IconButton, Badge, Typography, Toolbar, Button } from '@mui/material';
import {
	Person as PersonIcon,
	Notifications as NotificationsIcon,
	NextWeek as NextWeekIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom'; // version 5.2.0

import { PendingReminderContext } from '../models/PendingReminderContext';

export default function Header({ text, onClose, onConfirm }) {
	let navigate = useNavigate();

	const pendingReminderObject = useContext(PendingReminderContext);
	const pendingCounter = pendingReminderObject.count;
	useEffect(() => {
		document.title = 'Infrequent Scheduler';
	}, []);
	const userProfile = '/userProfile';
	const dashBoard = '/';
	const pending = '/pending';
	const upcoming = '/upcoming';

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
						<Button variant="text" color="neutral" onClick={() => navigate('/set/list')}>
							Sets
						</Button>
					</Typography>
					<Typography
						component="h3"
						variant="h6"
						color="inherit"
						noWrap
						sx={{ flexGrow: 1 }}
					></Typography>
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
					<IconButton color="inherit">
						<NextWeekIcon
							onClick={() => {
								navigate(upcoming);
							}}
						/>
					</IconButton>
					<IconButton color="inherit">
						<PersonIcon
							onClick={() => {
								navigate(userProfile);
							}}
						/>
					</IconButton>
				</Toolbar>
			</AppBar>
		</>
	);
}
