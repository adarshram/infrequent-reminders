import React, { useContext } from 'react';
import { Paper, Grid, Alert } from '@mui/material';

import { UserContext } from '../models/UserContext';
import { PendingReminderContext } from '../models/PendingReminderContext';
import { Link } from 'react-router-dom';

import CalendarList from '../components/Schedules/CalendarList';

export default function DashBoard() {
	const signedInUser = useContext(UserContext);
	const { count: pendingCount, load: reloadPending } = useContext(PendingReminderContext);

	const user_id = signedInUser?.user?.uid;

	if (!user_id) {
		return 'Loading';
	}

	const PendingCountDisplay = () => {
		if (pendingCount === null) {
			return '';
		}
		return (
			<Grid
				item
				xs={12}
				sx={{
					textAlign: 'center',
					justifyContent: 'center',
				}}
			>
				<Paper
					elevation={3}
					sx={{
						mt: 3,
						padding: 3,
						width: '90%',
					}}
				>
					{pendingCount > 0 ? (
						<Alert severity="warning">
							You have <Link to="/pending">{pendingCount} pending</Link> reminder
							{pendingCount > 1 ? 's' : ''}
						</Alert>
					) : (
						<Alert severity="success">You are all caught up !</Alert>
					)}
				</Paper>
			</Grid>
		);
	};
	return (
		<Grid container direction="row" justifyContent="center" spacing={1} alignItems="stretch">
			<PendingCountDisplay />
			<Grid
				item
				xs={12}
				sx={{
					textAlign: 'center',
					justifyContent: 'center',
				}}
			>
				<Paper
					elevation={3}
					sx={{
						mt: 3,
						padding: 3,
						width: '90%',
					}}
				>
					<>
						<CalendarList onAction={() => reloadPending()} />
					</>
				</Paper>
			</Grid>
		</Grid>
	);
}
