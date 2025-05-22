import React, { useContext, useEffect, useState } from 'react';
import { Paper, Grid, Alert, Typography, CircularProgress, Box } from '@mui/material';

import { UserContext } from '../models/UserContext';
import useServerCall from '../hooks/useServerCall'; // Import useServerCall
import { PendingReminderContext } from '../models/PendingReminderContext';

import { Link } from 'react-router-dom';

import CalendarList from '../components/Schedules/CalendarList';
import NotificationPrompter from '../components/NotificationPrompter';

export default function DashBoard() {
	const signedInUser = useContext(UserContext);
	const { count: pendingCount, load: reloadPending } = useContext(PendingReminderContext);
	
	const [mostSnoozedCaller, mostSnoozedData, mostSnoozedError, mostSnoozedLoading] = useServerCall('/user/notifications/most-snoozed');
    // The mostSnoozedData from useServerCall will be response.data which is the task object or null
    // So, no need for a separate mostSnoozedTask state, can use mostSnoozedData directly.

	const user_id = signedInUser?.user?.uid;

	useEffect(() => {
		if (user_id) { // Ensure user_id is available before fetching
			mostSnoozedCaller.get();
		}
	}, [user_id]); // Re-run if user_id changes, though typically it won't on this page. Or remove dependency if auth is implicit.

	if (!user_id && !signedInUser) { // Check if signedInUser itself is null before accessing uid
		return 'Loading User...'; // Or some other appropriate loading/auth check
	}


	const PendingCountDisplay = () => {
		if (pendingCount === null) {
			return '';
		}
		return (
			<>
				{pendingCount > 0 ? (
					<Alert severity="warning">
						You have <Link to="/pending">{pendingCount} pending</Link> reminder
						{pendingCount > 1 ? 's' : ''}
					</Alert>
				) : (
					<Alert severity="success">You are all caught up !</Alert>
				)}
			</>
		);
	};

	const MostSnoozedDisplay = () => {
		if (mostSnoozedLoading) {
			return (
				<Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
					<CircularProgress />
					<Typography sx={{ ml: 1 }}>Loading most snoozed task...</Typography>
				</Box>
			);
		}
		if (mostSnoozedError) {
			// More user-friendly error message, still logging details if needed elsewhere or via network tab
			return <Alert severity="error" sx={{ my: 2 }}>Could not load the most snoozed reminder. Please try again later.</Alert>;
		}
		// Check if data is present and success is true
		if (mostSnoozedData && mostSnoozedData.success) {
      const task = mostSnoozedData.data; // This is the actual notification object or null
      if (task && task.id) { // Check if task is not null and has an id
        return (
          <Paper sx={{ p: 2, my: 2, mx: 'auto', maxWidth: 'sm', backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>Most Snoozed Reminder</Typography>
            <Typography><strong>Task:</strong> {task.subject || task.description || 'N/A'}</Typography>
            <Typography><strong>Snoozed:</strong> {task.snooze_count} times</Typography>
          </Paper>
        );
      }
		}
		// This handles:
		// 1. mostSnoozedData is null/undefined initially (before loading finishes without error)
		// 2. mostSnoozedData.success is false (API indicated failure but didn't throw an error caught by useServerCall's error state)
		// 3. mostSnoozedData.data is null (API success, but no task found)
		return <Alert severity="info" sx={{ my: 2 }}>No snoozed reminders found, or none with a snooze count greater than zero.</Alert>;
	};

	return (
		<>
			<Grid container direction="row" justifyContent="center" spacing={1} alignItems="center">
				<Grid
					item
					xs={12}
					sx={{
						textAlign: 'center',
						justifyContent: 'center',
					}}
				>
					<Paper
						sx={{
							mt: 3,
							width: '100%',
						}}
					>
						<PendingCountDisplay />
						<NotificationPrompter />
						<MostSnoozedDisplay /> 
					</Paper>
				</Grid>
			</Grid>
			<Paper
				elevation={3}
				sx={{
					mt: 3,
					padding: 3,
					width: '100%',
				}}
			>
				<Grid container>
					<CalendarList onAction={() => reloadPending()} />
				</Grid>
			</Paper>
		</>
	);
}
