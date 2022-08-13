import React, { useState, useEffect } from 'react';
import { Paper, List, ListItem, ListItemText } from '@mui/material';
import { TextField, Grid, Badge } from '@mui/material';

import ShowSchedule from './ShowSchedule';
import { LocalizationProvider, PickersDay, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

import useCalendarTasksForMonth from '../../hooks/useCalendarTasksForMonth';
import useCalendarTasksForDay from '../../hooks/useCalendarTasksForDay';

import useDeleteNotification from '../../hooks/useDeleteNotification';
import useSnoozeNotification from '../../hooks/useSnoozeNotification';
import useCompleteNotification from '../../hooks/useCompleteNotification';
import CreateIcon from '@mui/icons-material/Create';

import { useNavigate } from 'react-router-dom'; // version 5.2.0
import { Link } from 'react-router-dom';

function CalendarList({ notificationData, onAction }) {
	const [calendarData, setCalendarData] = useState([]);
	const [currentMonth, setCurrentMonth] = useState(null);
	const [currentDay, setCurrentDay] = useState(null);
	const [calendarDayResponse, dayLoading] = useCalendarTasksForDay(currentDay);
	const [calendarTaskResponse, ,] = useCalendarTasksForMonth(currentMonth);
	const [currentCalendarData, setCurrentCalendarData] = useState([]);

	const navigate = useNavigate();

	useEffect(() => {
		if (notificationData) {
			setCalendarData(notificationData);
		}
	}, [notificationData]);

	useEffect(() => {
		if (!currentMonth) {
			setCurrentMonth({ month: format(new Date(), 'yyyy-MM') });
		}
	}, [currentMonth]);
	useEffect(() => {
		let data = [];

		if (calendarTaskResponse) {
			data = calendarTaskResponse;
		}
		setCalendarData(data);
	}, [calendarTaskResponse]);

	useEffect(() => {
		setCurrentCalendarData([]);
		if (calendarDayResponse && calendarDayResponse.length > 0) {
			setCurrentCalendarData(calendarDayResponse);
		}
	}, [calendarDayResponse]);

	const fetchSchedulesForDate = (day) => {
		const currentConvertedDate = format(new Date(day), 'MM/dd/yyyy');
		const doesHaveTasks = calendarData.find((compareDate) => {
			const compareConvertedDate = format(new Date(compareDate.notification_date), 'MM/dd/yyyy');
			if (compareConvertedDate === currentConvertedDate) {
				return true;
			}
			return false;
		});
		if (doesHaveTasks) {
			setCurrentDay({ date: day });
			return;
		}
		setCurrentDay(null);
	};

	const dayRender = (day, selectedDate, dayComponentProps) => {
		const currentConvertedDate = format(new Date(day), 'MM/dd/yyyy');
		const isSelected = calendarData.find((compareDate) => {
			const compareConvertedDate = format(new Date(compareDate.notification_date), 'MM/dd/yyyy');
			if (compareConvertedDate === currentConvertedDate) {
				return true;
			}
			return false;
		});
		let testIdString = `badge-${format(new Date(day), 'yyyy-MM-dd')}`;
		return (
			<Badge
				key={`badge-date-${dayComponentProps.key}`}
				variant="dot"
				color="secondary"
				overlap="circular"
				invisible={!isSelected}
				data-testid={isSelected ? testIdString : 'badge'}
			>
				<PickersDay {...dayComponentProps} />
			</Badge>
		);
	};
	const onMonthChange = (day) => {
		let monthYear = `${format(new Date(day), 'yyyy-MM')}`;
		setCurrentMonth({ month: monthYear });
	};

	const DayDataDisplay = ({ currentCalendarData }) => {
		const [currentSchedule, setCurrentSchedule] = useState(false);
		const [deleteNotification] = useDeleteNotification();
		const [snoozeNotification] = useSnoozeNotification();
		const [completeNotification] = useCompleteNotification('/user/notifications/complete/');
		const handleSnoozeOrComplete = async (currentNotification) => {
			if (currentNotification.is_pending) {
				let snoozed = await snoozeNotification.getAsync(currentNotification.id);
				if (snoozed.data && snoozed.data.days) {
					await refreshPageData();
					if (onAction) {
						onAction();
					}
				}
				return;
			}
			let completed = await completeNotification.getAsync(currentNotification.id);
			if (completed.data && completed.data.days !== false) {
				await refreshPageData();
				if (onAction) {
					onAction();
				}
			}
		};
		const handleDone = async (currentNotification) => {
			let completed = await completeNotification.getAsync(currentNotification.id);
			if (completed.data && completed.data.days !== false) {
				await refreshPageData();
				if (onAction) {
					onAction();
				}
			}
		};

		const handleEdit = (data) => {
			if (data.id) {
				navigate(`/create/${data.id}`);
			}
		};
		const refreshPageData = async () => {
			let month = currentMonth;
			let day = currentDay;
			setCurrentMonth(null);
			setCurrentDay(null);
			const wait = async () => {
				new Promise(function (resolve) {
					setTimeout(resolve, 100);
				});
			};
			await wait();
			setCurrentMonth(month);
			setCurrentDay(day);
		};
		const handleDelete = async (data) => {
			await deleteNotification.postAsync({ id: data.id });
			await refreshPageData();
			if (onAction) {
				onAction();
			}
			return true;
		};
		if (dayLoading) {
			return (
				<ListItem>
					<ListItemText>Loading...</ListItemText>
				</ListItem>
			);
		}
		return (
			<List>
				{currentCalendarData.length > 0 &&
					currentCalendarData.map((value, key) => (
						<ShowSchedule
							schedule={value}
							key={key}
							setCurrentSchedule={setCurrentSchedule}
							currentSchedule={currentSchedule}
							editHandler={handleEdit}
							snoozeOrCompleteHandler={handleSnoozeOrComplete}
							deleteHandler={handleDelete}
							doneHandler={handleDone}
						/>
					))}
				{currentCalendarData.length === 0 && !dayLoading && (
					<>
						<ListItem>
							<ListItemText>No Schedules Found</ListItemText>
						</ListItem>
						<ListItem>
							<ListItemText>
								Add New
								<Link to="/create">
									<CreateIcon />
								</Link>
							</ListItemText>
						</ListItem>
					</>
				)}
			</List>
		);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Grid item xs={12} lg={6} md={6}>
				<StaticDatePicker
					orientation="landscape"
					openTo="day"
					displayStaticWrapperAs="desktop"
					value={() => new Date()}
					fullWidth
					onChange={(day) => {
						fetchSchedulesForDate(day);
					}}
					onMonthChange={(v) => {
						onMonthChange(v);
					}}
					toolbarTitle=""
					renderDay={dayRender}
					renderInput={(props) => (
						<TextField label="Date1" {...props}>
							Hello
						</TextField>
					)}
				/>
			</Grid>
			<Grid item xs={12} lg={6} md={6}>
				<Paper
					elevation={3}
					sx={{
						mt: 2,
						padding: 1,
						width: '100%',
						bgcolor: 'grey.50',
					}}
				>
					<DayDataDisplay currentCalendarData={currentCalendarData} />
				</Paper>
			</Grid>
		</LocalizationProvider>
	);
}
export default CalendarList;
