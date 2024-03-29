import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CreateEdit from './CreateEdit';
import SingleReminder from './SingleReminder';
import { Button } from '@mui/material';
import useServerCall from '../../hooks/useServerCall';
const setupDefault = async () => {
	const getAsync = jest.fn();
	useServerCall.mockReturnValue([
		{
			getAsync: getAsync,
		},
		false,
		false,
	]);
	getAsync.mockResolvedValue({
		data: true,
	});
	await act(async () => {
		render(<CreateEdit />);
	});
};

const tearDown = () => {
	jest.resetAllMocks();
};

jest.mock('../../hooks/useServerCall', () => {
	return jest.fn();
});
jest.mock('./SingleReminder', () => ({ toggleComplete, reminder, isFirst, handleRemove }) => {
	const toggleValue = () => {
		toggleComplete(false);
	};
	return (
		<div data-testid="single-reminder">
			{isFirst && <div data-testid={`is-first-${reminder.id}`}>is first</div>}
			{reminder.complete && (
				<a data-testid={`toggle-active-${reminder.id}`} onClick={toggleValue}>
					Click
				</a>
			)}
			<a data-testid={`RemoveCircleIcon`} onClick={() => handleRemove(reminder)}>
				Remove
			</a>
		</div>
	);
});

const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};
const mockServerCall = () => {
	const getAsync = jest.fn();
	useServerCall.mockReturnValue([
		{
			getAsync: getAsync,
		},
		false,
		false,
	]);
	getAsync.mockResolvedValue({
		data: true,
	});
};

const getFakeReminders = () => {
	return [
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub1ject',
			description: 'Short Desc1ription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
			id: 1234,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
			id: 1235,
		},
	];
};

const getFakeRemindersForToggle = () => {
	return [
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub1ject',
			description: 'Short Desc1ription',
			notification_date: new Date(),
			days_after: 2,
			is_active: false,
			id: 1234,
			complete: true,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: false,
			id: 1235,
			complete: true,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
			id: 1236,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
		},
	];
};

test('show title subject single reminder', async () => {});
