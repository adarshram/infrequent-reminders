import React from 'react';
import {
	TextField,
	Select,
	MenuItem,
	ListItem,
	IconButton,
	Checkbox,
	FormGroup,
	FormControlLabel,
	Menu,
} from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DateAdapter from '@mui/lab/AdapterDateFns';

export default function SingleReminder({
	reminderData,
	onChange,
	isFirst,
	handleRemove,
	toggleComplete,
	reminderIndex,
	isCurrentReminder,
	handleMove,
}) {
	const daysOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const handleDateChange = (key, value) => {
		onChange(key, value);
	};

	const handleChange = (e) => {
		onChange(e.target.id, e.target.value);
	};
	const handleSelectChange = (e) => {
		onChange(e.target.name, e.target.value);
	};

	const onLongMenuClick = (option) => {
		if (option === 'Remove' && handleRemove) {
			handleRemove(reminderData);
		}
		if (option === 'Up' && handleMove) {
			handleMove(option);
		}
		if (option === 'Down' && handleMove) {
			handleMove(option);
		}
	};

	const completeChangeHandler = (e) => {
		if (toggleComplete) {
			toggleComplete(e.target.checked);
		}
	};

	const isComplete = reminderData.link && reminderData.link.complete;

	const CompletedReminder = () => {
		return (
			<ListItem alignItems="flex-start" disablePadding style={{ textDecoration: 'line-through' }}>
				<FormGroup>
					<FormControlLabel
						control={<Checkbox defaultChecked onChange={completeChangeHandler} />}
						label={reminderData.subject}
					/>
				</FormGroup>
			</ListItem>
		);
	};
	if (isComplete) {
		return <CompletedReminder />;
	}
	return (
		<ListItem alignItems="flex-start" disablePadding>
			<TextField
				required
				fullWidth
				label="Subject"
				id="subject"
				name={`subject`}
				value={reminderData.subject ?? 'Enter Subject'}
				onChange={handleChange}
			/>
			{isFirst ? (
				<LocalizationProvider dateAdapter={DateAdapter}>
					<DatePicker
						label="Enter First Recurring date"
						value={reminderData.notification_date ?? new Date()}
						onChange={(value) => handleDateChange('notification_date', value)}
						name={`notification_date`}
						renderInput={(params) => <TextField {...params} />}
						required
					/>
				</LocalizationProvider>
			) : (
				<Select
					labelId="demo-simple-select-label"
					id="days_after"
					value={reminderData?.days_after ?? 1}
					label="Remind After"
					name={`days_after`}
					onChange={handleSelectChange}
				>
					<MenuItem value={0}>After</MenuItem>
					{daysOptions.map((day, k) => (
						<MenuItem value={day} key={k}>
							{day} {day > 1 ? 'days' : 'day'}
						</MenuItem>
					))}
				</Select>
			)}

			<LongMenu onClick={onLongMenuClick} />
		</ListItem>
	);
}

function LongMenu({ onClick }) {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const options = ['Remove', 'Up', 'Down'];

	const ITEM_HEIGHT = 48;
	const open = Boolean(anchorEl);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = (option) => {
		if (onClick) {
			onClick(option);
		}
		setAnchorEl(null);
	};

	return (
		<div>
			<IconButton
				aria-label="more"
				id="long-button"
				aria-controls={open ? 'long-menu' : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-haspopup="true"
				onClick={handleClick}
			>
				<MoreVertIcon />
			</IconButton>
			<Menu
				id="long-menu"
				MenuListProps={{
					'aria-labelledby': 'long-button',
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				PaperProps={{
					style: {
						maxHeight: ITEM_HEIGHT * 4.5,
						width: '20ch',
					},
				}}
			>
				{options.map((option) => (
					<MenuItem
						key={option}
						selected={option === 'Pyxis'}
						onClick={() => {
							handleClose(option);
						}}
					>
						{option}
					</MenuItem>
				))}
			</Menu>
		</div>
	);
}
